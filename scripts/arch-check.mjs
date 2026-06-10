import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function relativePath(...parts) {
  return path.join(root, ...parts);
}

function exists(...parts) {
  return fs.existsSync(relativePath(...parts));
}

function readText(...parts) {
  return fs.readFileSync(relativePath(...parts), 'utf8');
}

function listFiles(dir, extensions) {
  const base = relativePath(dir);

  if (!fs.existsSync(base)) {
    return [];
  }

  const result = [];
  const stack = [base];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (extensions.some((extension) => entry.name.endsWith(extension))) {
        result.push(path.relative(root, fullPath).replaceAll(path.sep, '/'));
      }
    }
  }

  return result.sort();
}

function requirePath(label, ...parts) {
  if (!exists(...parts)) {
    errors.push(`${label} is missing: ${path.join(...parts)}`);
  }
}

function lineCount(text) {
  return text.split(/\r?\n/).length;
}

function assertMaxLines(file, maxLines) {
  if (!exists(file)) {
    return;
  }

  const count = lineCount(readText(file));

  if (count > maxLines) {
    errors.push(`${file} has ${count} lines; keep it below ${maxLines} by extracting logic.`);
  }
}

function assertNoPattern(file, pattern, message) {
  if (!exists(file)) {
    return;
  }

  const text = readText(file);

  if (pattern.test(text)) {
    errors.push(`${file}: ${message}`);
  }
}

const requiredPaths = [
  ['data layer', 'src/data'],
  ['pure engine layer', 'src/logic/engine'],
  ['React hook layer', 'src/logic/hooks'],
  ['screen layer', 'src/view/screens'],
  ['component layer', 'src/view/components'],
  ['style partials directory', 'src/styles'],
  ['style entry', 'src/styles.css'],
  ['movement tests', 'test/movement.test.js'],
  ['scoring tests', 'test/scoring.test.js'],
  ['refactor standard', 'docs/REFACTORING.md']
];

for (const [label, target] of requiredPaths) {
  requirePath(label, target);
}

if (exists('package.json')) {
  const packageJson = JSON.parse(readText('package.json'));
  const requiredScripts = ['arch-check', 'test', 'validate', 'smoke', 'build'];

  for (const script of requiredScripts) {
    if (!packageJson.scripts?.[script]) {
      errors.push(`package.json is missing scripts.${script}.`);
    }
  }

  if (packageJson.scripts?.validate && !packageJson.scripts.validate.includes('arch-check')) {
    errors.push('package.json scripts.validate must include npm run arch-check.');
  }
}

if (exists('src/styles.css')) {
  const styleLines = readText('src/styles.css')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const nonImportLine = styleLines.find((line) => !line.startsWith('@import '));

  if (nonImportLine) {
    errors.push(`src/styles.css must stay import-only; found "${nonImportLine}".`);
  }
}

const engineFiles = listFiles('src/logic/engine', ['.js', '.jsx', '.ts', '.tsx']);
const forbiddenEnginePatterns = [
  [/from\s+['"]react['"]/, 'engine files must not import React.'],
  [/\buse(State|Effect|Memo|Callback|Ref)\s*\(/, 'engine files must not use React hooks.'],
  [/\b(window|document)\./, 'engine files must not use browser globals.'],
  [/\bsetTimeout\s*\(|\bsetInterval\s*\(/, 'engine files must not own timers.']
];

for (const file of engineFiles) {
  for (const [pattern, message] of forbiddenEnginePatterns) {
    assertNoPattern(file, pattern, message);
  }
}

const screenFiles = listFiles('src/view/screens', ['.js', '.jsx', '.ts', '.tsx']);
const forbiddenScreenPatterns = [
  [/\.\.\/\.\.\/logic\/engine\//, 'screens should use hooks instead of importing engine rules directly.'],
  [/\bdocument\.elementFromPoint\b/, 'raw drop-target resolution belongs in src/logic/hooks/.'],
  [/\bsetPointerCapture\s*\(/, 'pointer capture belongs in drag/drop hooks.'],
  [/\bfunction\s+resolveDropTarget\b|\bconst\s+resolveDropTarget\b/, 'drop target helpers belong in drag/drop hooks.'],
  [/\bfunction\s+handlePointer(Move|Up|Cancel|Down)\b|\bconst\s+handlePointer(Move|Up|Cancel|Down)\b/, 'pointer handlers belong in drag/drop hooks.']
];

for (const file of screenFiles) {
  for (const [pattern, message] of forbiddenScreenPatterns) {
    assertNoPattern(file, pattern, message);
  }
}

const componentFiles = listFiles('src/view/components', ['.js', '.jsx', '.ts', '.tsx']);

for (const file of componentFiles) {
  assertNoPattern(file, /\.\.\/\.\.\/logic\/engine\//, 'components should receive rule-derived state through props.');
  assertNoPattern(file, /\.\.\/\.\.\/logic\/hooks\//, 'components should receive interaction callbacks through props.');
}

assertMaxLines('src/view/screens/RoyalTapestryScreen.jsx', 240);
assertMaxLines('src/logic/hooks/useRoyalTapestryGame.js', 280);

if (errors.length > 0) {
  console.error('Architecture check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Architecture check passed.');
