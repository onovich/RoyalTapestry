import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const host = '127.0.0.1';
const basePath = '/RoyalTapestry/';
const screenshotPath = process.env.SMOKE_SCREENSHOT
  || path.join(tmpdir(), 'royal-tapestry-smoke.png');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);

  const chromePath = candidates.find((candidate) => existsSync(candidate));
  if (!chromePath) {
    throw new Error('Chrome or Edge was not found. Set CHROME_PATH to run the UI smoke test.');
  }

  return chromePath;
}

async function waitForHttp(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep waiting until the dev server is ready.
    }
    await delay(300);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function findOpenPort(startPort = 5300) {
  for (let port = startPort; port < startPort + 100; port += 1) {
    try {
      const server = await import('node:net').then(({ createServer }) => createServer());
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, host, resolve);
      });
      await new Promise((resolve) => server.close(resolve));
      return port;
    } catch {
      // Try the next port.
    }
  }

  throw new Error('Could not find an open local port for Vite.');
}

function startProcess(command, args, options = {}) {
  return spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    ...options
  });
}

function stopProcess(child) {
  if (!child || child.killed) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  child.kill('SIGTERM');
}

async function connectToChrome(chromePort, appUrl) {
  if (typeof WebSocket !== 'function') {
    throw new Error('This smoke script needs a Node runtime with global WebSocket support.');
  }

  await waitForHttp(`http://${host}:${chromePort}/json/version`);
  const target = await fetch(`http://${host}:${chromePort}/json/new?${encodeURIComponent(appUrl)}`, {
    method: 'PUT'
  }).then((response) => response.json());
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let nextId = 1;

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id || !pending.has(message.id)) return;

    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  });

  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  function send(method, params = {}) {
    const id = nextId;
    nextId += 1;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  return { ws, send };
}

async function runBrowserSmoke(send) {
  async function evalValue(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }

  async function waitFor(predicate, label, timeoutMs = 8_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await predicate()) return;
      await delay(100);
    }
    throw new Error(`Timed out waiting for ${label}`);
  }

  async function appState() {
    return evalValue(`(() => ({
      hand: document.querySelectorAll('.hand-card .card').length,
      board: document.querySelectorAll('.board-cell .card').length,
      selected: document.querySelectorAll('.card-selected').length,
      ghost: document.querySelectorAll('.drag-ghost').length,
      appHeight: document.querySelector('.app-shell')?.getBoundingClientRect().height ?? 0,
      boardWidth: document.querySelector('.board-grid')?.getBoundingClientRect().width ?? 0
    }))()`);
  }

  async function click(expression) {
    await evalValue(`(() => {
      const element = ${expression};
      if (!element) throw new Error('missing click target');
      element.click();
      return true;
    })()`);
    await delay(140);
  }

  async function rect(expression) {
    return evalValue(`(() => {
      const element = ${expression};
      if (!element) throw new Error('missing rect target');
      const box = element.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    })()`);
  }

  async function drag(fromExpression, toExpression) {
    const from = await rect(fromExpression);
    const to = await rect(toExpression);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1 });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2,
      button: 'left',
      buttons: 1
    });
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: to.x, y: to.y, button: 'left', buttons: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0 });
    await delay(220);
  }

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 820,
    deviceScaleFactor: 1,
    mobile: false
  });

  await waitFor(async () => (await appState()).hand === 25, 'initial hand');
  let state = await appState();
  assert(state.board === 0 && state.appHeight > 700 && state.boardWidth > 400, `bad initial layout ${JSON.stringify(state)}`);

  await click("document.querySelector('.hand-card .card')");
  await click("document.querySelector('.board-cell')");
  state = await appState();
  assert(state.hand === 24 && state.board === 1, `tap place failed ${JSON.stringify(state)}`);

  await click("document.querySelectorAll('.toolbar button')[1]");
  state = await appState();
  assert(state.hand === 25 && state.board === 0, `undo failed ${JSON.stringify(state)}`);

  await drag("document.querySelector('.hand-card .card')", "document.querySelector('.board-cell')");
  state = await appState();
  assert(state.hand === 24 && state.board === 1 && state.ghost === 0, `drag place failed ${JSON.stringify(state)}`);

  return state;
}

const port = await findOpenPort();
const chromePort = await findOpenPort(9300);
const appUrl = `http://${host}:${port}${basePath}`;
const viteEntry = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const tempProfile = path.join(tmpdir(), `royal-tapestry-chrome-${chromePort}`);
let viteProcess;
let chromeProcess;

try {
  viteProcess = startProcess(process.execPath, [viteEntry, '--host', host, '--port', String(port), '--strictPort']);
  await waitForHttp(appUrl);

  mkdirSync(tempProfile, { recursive: true });
  chromeProcess = startProcess(findChrome(), [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${tempProfile}`,
    'about:blank'
  ]);

  const { ws, send } = await connectToChrome(chromePort, appUrl);
  const finalState = await runBrowserSmoke(send);
  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  ws.close();

  console.log(JSON.stringify({
    ok: true,
    url: appUrl,
    screenshot: screenshotPath,
    finalState
  }, null, 2));
} finally {
  stopProcess(chromeProcess);
  stopProcess(viteProcess);
  rmSync(tempProfile, { recursive: true, force: true });
}
