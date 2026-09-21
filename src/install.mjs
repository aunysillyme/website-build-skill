import fs from 'node:fs';
import { resolve, relative, dirname, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { CORE, files, owned, digest } from './bundle.mjs';
import { targets } from './catalog.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
export const packageInfo = (() => {
  const { name, version } = JSON.parse(fs.readFileSync(owned(packageRoot, 'package.json'), 'utf8'));
  return { name, version };
})();
export const choiceText = () => fs.readFileSync(owned(packageRoot, `${CORE}/templates/install-choice.txt`), 'utf8');
const stat = path => {
  try { return fs.lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};
const inside = (root, path) => path === root || path.startsWith(root.endsWith(sep) ? root : root + sep);

// A path the user typed is their own environment, so its own symlinks are resolved rather
// than refused: /tmp is a symlink on macOS, and a home or project can sit on a linked volume.
// Returns the real path of the nearest existing ancestor with the missing tail re-appended.
export function canonical(path) {
  let current = resolve(path);
  const tail = [];
  for (;;) {
    const entry = stat(current);
    if (entry) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) throw Error(`Not a directory: ${current}`);
      return resolve(fs.realpathSync(current), ...tail);
    }
    const parent = dirname(current);
    if (parent === current) throw Error(`No existing ancestor: ${path}`);
    tail.unshift(basename(current));
    current = parent;
  }
}

// Below a canonical, user-chosen root, a symlink is something a third party planted in the
// install target, so it is refused. lstat observes a dangling link, unlike existsSync.
export function safePath(root, name) {
  const base = resolve(root), path = resolve(base, name);
  if (!inside(base, path)) throw Error(`Path escapes destination root: ${path}`);
  let current = base;
  for (const segment of relative(base, path).split(sep).filter(Boolean)) {
    current = resolve(current, segment);
    const entry = stat(current);
    if (entry?.isSymbolicLink()) throw Error(`Symlink refused: ${current}`);
    if (entry && current !== path && !entry.isDirectory()) throw Error(`Not a directory: ${current}`);
  }
  return path;
}
// A path whose own root the user named: canonicalize the parent, then guard the last segment.
const safeUnder = path => { const full = resolve(path); return safePath(canonical(dirname(full)), basename(full)); };
const receiptName = '.website-build-skill-receipt.json';
const result = (code, message) => ({ code, message });

function validate(request) {
  if (!Object.hasOwn(targets, request.target)) throw Error('Unknown or missing target');
  if (!['solo', 'team'].includes(request.mode)) throw Error('Mode must be solo or team');
  if (!['project', 'user'].includes(request.scope ?? 'project')) throw Error('Scope must be project or user');
  if (request.bundleDir !== undefined && (request.mode !== 'team' || request.target !== 'hermes')) throw Error('--bundle-dir requires --team --target hermes');
}

function plan(request, destination) {
  const coreRoot = owned(packageRoot, CORE);
  const entries = files(coreRoot).map(name => ({ path: safePath(destination, name), bytes: fs.readFileSync(owned(coreRoot, name)) }));
  if (request.mode === 'team') {
    for (const name of files(packageRoot, 'docs/bundles').filter(name => /^docs\/bundles\/[^/]+\.md$/.test(name))) {
      const bytes = fs.readFileSync(owned(packageRoot, name));
      entries.push({ path: safePath(destination, `bundles/${basename(name)}`), bytes });
      if (request.bundleDir !== undefined) {
        const path = safePath(destination, resolve(destination, request.bundleDir, basename(name)));
        if (!entries.some(entry => entry.path === path)) entries.push({ path, bytes });
      }
    }
  }
  return entries;
}

function integrationFor(project, destination, target) {
  const conventional = { 'claude-code': 'CLAUDE.md', codex: 'AGENTS.md', hermes: 'AGENTS.md', grok: 'GROK.md', antigravity: 'GEMINI.md' };
  const routers = [...new Set(['AGENTS.md', 'CLAUDE.md', conventional[target]].filter(Boolean))];
  const routerPath = routers.map(name => resolve(project, name)).find(path => stat(path)) ?? null;
  return {
    routerPath, merged: false,
    snippet: routerPath ? `<!-- website-build-skill integration -->\nRead ${resolve(destination, 'SKILL.md')} and begin with prompts/00-start.md. Activation: UNVERIFIED.` : null,
  };
}

function readReceipt(path, destination) {
  safeUnder(path);
  const info = stat(path);
  if (!info?.isFile() || info.nlink !== 1) throw Error(`Missing, shared or non-file receipt: ${path}`);
  const value = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (value.schemaVersion !== 1 || value.package?.name !== packageInfo.name || value.destination !== destination || !Array.isArray(value.files)) throw Error('Invalid receipt ownership');
  if (value.activation !== 'UNVERIFIED' || !['solo', 'team'].includes(value.mode) || !Object.hasOwn(targets, value.target) || !['project', 'user'].includes(value.scope)) throw Error('Invalid receipt metadata');
  const seen = new Set();
  for (const entry of value.files) {
    if (typeof entry.path !== 'string' || !entry.path || entry.path !== resolve(entry.path) || entry.path === destination || entry.path === path || !inside(destination, entry.path) || seen.has(entry.path) || !/^[a-f0-9]{64}$/.test(entry.sha256) || !['written', 'identical'].includes(entry.action)) throw Error('Invalid receipt file');
    safePath(destination, entry.path);
    seen.add(entry.path);
  }
  return value;
}

function mkdirFor(path) {
  safeUnder(path);
  fs.mkdirSync(dirname(path), { recursive: true });
  safeUnder(path);
}
function writeNew(path, bytes, landed) {
  mkdirFor(path);
  const fd = fs.openSync(path, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0), 0o644);
  landed.push(path);
  try { fs.writeFileSync(fd, bytes); } finally { fs.closeSync(fd); }
}
function writeReceipt(path, value, previous, state = {}) {
  mkdirFor(path);
  if (previous !== null) {
    if (!stat(path)?.isFile() || fs.readFileSync(path, 'utf8') !== previous) throw Error(`Receipt changed during install: ${path}`);
    const fd = fs.openSync(path, fs.constants.O_WRONLY | (fs.constants.O_NOFOLLOW ?? 0));
    state.started = true;
    try { fs.ftruncateSync(fd); fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n'); } finally { fs.closeSync(fd); }
  } else {
    const created = [];
    try { writeNew(path, JSON.stringify(value, null, 2) + '\n', created); }
    finally { state.started = created.includes(path); }
  }
}
function probe(root) {
  safeUnder(root);
  if (!stat(root)?.isDirectory()) throw Error(`Output root must be an existing writable directory: ${root}`);
  const path = resolve(root, `.website-build-skill-probe-${randomUUID()}`);
  let created = false;
  try {
    const fd = fs.openSync(path, 'wx', 0o600);
    created = true;
    try { fs.writeFileSync(fd, 'website-build-skill'); } finally { fs.closeSync(fd); }
    if (fs.readFileSync(path, 'utf8') !== 'website-build-skill') throw Error('Output root probe read-back failed');
  } finally { if (created) fs.unlinkSync(path); }
}

function uninstall(request, destination, receiptPath) {
  let receipt;
  try { receipt = readReceipt(receiptPath, destination); } catch (error) { return result(2, error.message); }
  const remove = [], kept = [], directories = new Set();
  try {
    for (const entry of receipt.files) {
      const info = stat(entry.path);
      if (!info) continue;
      if (info.isFile() && digest(fs.readFileSync(entry.path)) === entry.sha256) remove.push(entry);
      else kept.push(`Kept changed: ${entry.path}`);
    }
    const known = new Set([...receipt.files.map(entry => entry.path), receiptPath]);
    const visit = path => {
      const info = stat(path);
      if (info?.isDirectory()) for (const name of fs.readdirSync(path)) visit(resolve(path, name));
      else if (info && !known.has(path)) kept.push(`Kept unlisted: ${path}`);
    };
    visit(destination);
    if (request.dryRun) return result(0, [...remove.map(entry => `Would remove: ${entry.path}`), ...kept, `Would remove receipt: ${receiptPath}`].join('\n'));
    const removed = [];
    try {
      for (const entry of remove) {
        safePath(destination, entry.path);
        if (digest(fs.readFileSync(entry.path)) !== entry.sha256) { kept.push(`Kept changed: ${entry.path}`); continue; }
        fs.unlinkSync(entry.path);
        removed.push(entry.path);
        for (let dir = dirname(entry.path); inside(destination, dir); dir = dirname(dir)) {
          directories.add(dir);
          if (dir === destination) break;
        }
      }
      safeUnder(receiptPath);
      fs.unlinkSync(receiptPath);
      for (const dir of [...directories].sort((a, b) => b.length - a.length)) {
        safeUnder(dir);
        if (stat(dir)?.isDirectory() && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
      }
      return result(0, [...removed.map(path => `Removed: ${path}`), ...kept, 'Uninstall complete.'].join('\n'));
    } catch (error) { return result(4, `Uninstall interrupted: ${error.message}\n${removed.map(path => `Removed: ${path}`).join('\n')}\n${kept.join('\n')}`); }
  } catch (error) { return result(3, error.message); }
}

export function install(request = {}) {
  let destination, receiptPath, entries, integration, previous = null, oldReceipt, outputRoot, project;
  try {
    // Uninstall gets mode and target from its receipt when only --receipt is supplied.
    if (request.uninstall && request.receipt && (!request.target || !request.mode)) {
      safeUnder(request.receipt);
      const saved = JSON.parse(fs.readFileSync(request.receipt, 'utf8'));
      if (typeof saved.destination !== 'string' || saved.destination !== resolve(saved.destination)) throw Error('Invalid receipt destination');
      request = { ...request, mode: request.mode ?? saved.mode, target: request.target ?? saved.target };
      destination = canonical(saved.destination);
    }
    if (request.uninstall && !request.mode) request = { ...request, mode: 'solo' };
    validate(request);
    // The project root is the user's to name, so it is canonicalized here. The target suffix
    // is ours, and a symlink planted in it is a preflight refusal, not bad input, so that
    // walk happens in the preflight block below where the exit code is 3.
    project = canonical(request.dir ?? process.cwd());
    destination ??= resolve(project, targets[request.target]);
    receiptPath = resolve(request.receipt ?? resolve(destination, receiptName));
    outputRoot = request.outputDir === undefined ? null : canonical(request.outputDir);
  } catch (error) { return result(2, error.message); }
  if (request.uninstall) return uninstall(request, destination, receiptPath);
  try {
    safePath(project, targets[request.target]);
    if (request.receipt) safeUnder(request.receipt);
    if (inside(destination, receiptPath) && receiptPath === destination) throw Error('Receipt collides with destination');
    entries = plan(request, destination);
    for (const entry of entries) {
      if (entries.some(other => other !== entry && inside(entry.path, other.path))) throw Error(`Planned file/directory collision: ${entry.path}`);
    }
    if (entries.some(entry => entry.path === receiptPath || inside(entry.path, receiptPath) || inside(receiptPath, entry.path))) throw Error('Receipt collides with installed content');
    integration = integrationFor(resolve(request.dir ?? process.cwd()), destination, request.target);
    const conflicts = [];
    for (const entry of entries) {
      const info = stat(entry.path);
      entry.action = info?.isFile() && fs.readFileSync(entry.path).equals(entry.bytes) ? 'identical' : 'written';
      if (info && entry.action !== 'identical') conflicts.push(entry.path);
    }
    if (stat(receiptPath)) {
      try {
        oldReceipt = readReceipt(receiptPath, destination);
        previous = fs.readFileSync(receiptPath, 'utf8');
      } catch { conflicts.push(receiptPath); }
    }
    if (conflicts.length) return result(3, `Preflight conflicts; nothing written:\n${conflicts.join('\n')}`);
  } catch (error) { return result(3, `Preflight refused; nothing written: ${error.message}`); }
  const receipt = {
    schemaVersion: 1, package: packageInfo, date: new Date().toISOString(), mode: request.mode,
    target: request.target, scope: request.scope ?? 'project', destination, outputRoot,
    files: entries.map(entry => ({ path: entry.path, sha256: digest(entry.bytes), action: entry.action })),
    integration, activation: 'UNVERIFIED',
  };
  const sameReceipt = oldReceipt && ['mode', 'target', 'scope', 'outputRoot'].every(key => oldReceipt[key] === receipt[key]) && JSON.stringify(oldReceipt.package) === JSON.stringify(receipt.package) && JSON.stringify(oldReceipt.integration) === JSON.stringify(integration) && oldReceipt.files.length === receipt.files.length && receipt.files.every(entry => oldReceipt.files.some(old => old.path === entry.path && old.sha256 === entry.sha256));
  const noChanges = entries.every(entry => entry.action === 'identical') && sameReceipt;
  const lines = entries.map(entry => `${entry.action === 'identical' ? 'identical' : 'write'}: ${entry.path}`);
  lines.push(`${noChanges ? 'identical' : 'write'} receipt: ${receiptPath}`);
  if (request.mode === 'team') lines.push('TEAM uses manual relay: adapters/grok.md#manual-fallback. No native agent definitions were generated.');
  if (integration.snippet) lines.push(`Completed install with activation pending: unmerged integration snippet for ${integration.routerPath}\n${integration.snippet}`);
  if (request.dryRun) return result(0, `Dry run; no writes or probe.\n${outputRoot ? `Would probe: ${outputRoot}\n` : ''}${lines.join('\n')}`);
  if (noChanges) return result(integration.snippet ? 5 : 0, `Identical install; nothing written.\n${lines.join('\n')}`);
  try { if (outputRoot) probe(outputRoot); } catch (error) { return result(2, `Output root verification failed; no skill files written: ${error.message}`); }
  const landed = [], receiptWrite = {};
  try {
    for (const entry of entries) {
      safePath(destination, entry.path);
      if (entry.action === 'written') writeNew(entry.path, entry.bytes, landed);
      else if (digest(fs.readFileSync(entry.path)) !== digest(entry.bytes)) throw Error(`File changed during install: ${entry.path}`);
    }
    writeReceipt(receiptPath, receipt, previous, receiptWrite);
  } catch (error) {
    receipt.files = receipt.files.filter(entry => entry.action === 'identical' || landed.includes(entry.path));
    const notes = [];
    receipt.files = receipt.files.filter(entry => {
      try {
        safePath(destination, entry.path);
        const actual = digest(fs.readFileSync(entry.path));
        if (entry.action === 'identical' && actual !== entry.sha256) { notes.push(`Kept changed during install: ${entry.path}`); return false; }
        entry.sha256 = actual;
        return true;
      }
      catch { notes.push(`Could not verify: ${entry.path}`); return false; }
    });
    try {
      // Retry our own interrupted receipt, without clobbering an unrelated arrival.
      if (receiptWrite.started) { safeUnder(receiptPath); previous = fs.readFileSync(receiptPath, 'utf8'); }
      writeReceipt(receiptPath, receipt, previous);
    } catch (failure) { notes.push(`Receipt could not be saved: ${failure.message}`); }
    return result(4, `Write interrupted: ${error.message}\nPaths actually created:\n${landed.join('\n')}\n${notes.join('\n')}`);
  }
  return result(integration.snippet ? 5 : 0, `Install complete. Activation: UNVERIFIED.\n${lines.join('\n')}`);
}
