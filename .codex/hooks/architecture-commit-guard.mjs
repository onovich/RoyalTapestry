import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function readStdin() {
  return fs.readFileSync(0, 'utf8').trim();
}

function getToolCommand(event) {
  const toolInput = event?.tool_input;

  if (typeof toolInput === 'string') {
    return toolInput;
  }

  if (toolInput && typeof toolInput === 'object') {
    return toolInput.command ?? toolInput.cmd ?? '';
  }

  return '';
}

function isCommitCommand(command) {
  return /(^|[;&|]\s*)(git\s+commit\b|Commit(\.cmd)?\b|CommitAndPush(\.cmd)?\b)/i.test(command);
}

function findRepoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return process.cwd();
  }
}

function deny(reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  };

  process.stdout.write(`${JSON.stringify(output)}\n`);
}

let event;

try {
  const input = readStdin();
  event = input ? JSON.parse(input) : {};
} catch {
  process.exit(0);
}

const command = getToolCommand(event);

if (!isCommitCommand(command)) {
  process.exit(0);
}

const repoRoot = findRepoRoot();

try {
  execFileSync(process.execPath, ['scripts/arch-check.mjs'], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 20000,
    stdio: ['ignore', 'pipe', 'pipe']
  });
} catch (error) {
  const output = [error.stdout, error.stderr]
    .filter(Boolean)
    .join('\n')
    .trim();

  deny(`Architecture self-check failed before commit.\n\n${output}\n\nRun npm run arch-check, fix the listed boundary issues, then commit again.`);
}
