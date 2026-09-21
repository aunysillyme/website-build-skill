import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Readable, Writable } from 'node:stream';
import { install, safePath, packageInfo } from '../src/install.mjs';
import { main } from '../src/cli.mjs';
import { CORE, files, owned, digest } from '../src/bundle.mjs';
import { targets } from '../src/catalog.mjs';
import { root } from './helpers.mjs';

async function workspace(run) {
  const parent = resolve(root, '.test-work');
  fs.mkdirSync(parent, { recursive: true });
  const dir = fs.mkdtempSync(resolve(parent, 'installer-'));
  try { return await run(dir); } finally { mock.restoreAll(); fs.rmSync(dir, { recursive: true, force: true }); }
}
const request = dir => ({ mode: 'solo', target: 'codex', dir });
const destination = dir => resolve(dir, targets.codex);
const receiptPath = dir => resolve(destination(dir), '.website-build-skill-receipt.json');
const receipt = dir => JSON.parse(fs.readFileSync(receiptPath(dir), 'utf8'));
const cli = (args, input = '', cwd = root) => spawnSync(process.execPath, [resolve(root, 'bin/website-build-skill.mjs'), ...args], { cwd, input, encoding: 'utf8' });
const flags = dir => ['--solo', '--target', 'codex', '--dir', dir, '--yes'];
function snapshot(dir) {
  const result = {};
  const visit = path => {
    const info = fs.lstatSync(path);
    const name = relative(dir, path);
    result[name] = info.isDirectory() ? 'directory' : info.isSymbolicLink() ? `link:${fs.readlinkSync(path)}` : `${info.mtimeMs}:${fs.readFileSync(path).toString('base64')}`;
    if (info.isDirectory()) for (const child of fs.readdirSync(path)) visit(resolve(path, child));
  };
  visit(dir);
  return result;
}

test('1 Source resolution copies package bytes from an unrelated cwd and refuses unsafe sources', () => workspace(dir => {
  const result = cli(flags(dir), '', dirname(root));
  assert.equal(result.status, 0, result.stderr);
  for (const name of files(resolve(root, CORE))) assert.deepEqual(fs.readFileSync(resolve(destination(dir), name)), fs.readFileSync(owned(root, `${CORE}/${name}`)));
  const source = resolve(dir, 'source');
  fs.mkdirSync(source);
  fs.symlinkSync(resolve(dir, 'missing'), resolve(source, 'link'));
  assert.throws(() => files(source), /symlink/);
  assert.throws(() => owned(source, 'link'), /symlink/);
  assert.throws(() => owned(source, '../outside'), /escapes/);
  // Exercise the installer itself against a relocated package with a poisoned source.
  const copy = resolve(dir, 'package');
  for (const name of ['src', 'bin', 'skills', 'package.json']) fs.cpSync(resolve(root, name), resolve(copy, name), { recursive: true });
  const unsafeSource = resolve(copy, CORE, 'SKILL.md');
  fs.unlinkSync(unsafeSource);
  fs.symlinkSync(resolve(dir, 'missing-source'), unsafeSource);
  const project = resolve(dir, 'poisoned-source-target');
  const poisoned = spawnSync(process.execPath, [resolve(copy, 'bin/website-build-skill.mjs'), ...flags(project)], { cwd: root, input: '', encoding: 'utf8' });
  assert.equal(poisoned.status, 3);
  assert.match(poisoned.stderr, /symlink/);
  assert.throws(() => fs.lstatSync(project), { code: 'ENOENT' });
}));

test('2 Targets accept every catalog key and reject unknown values without writes', () => workspace(async dir => {
  assert.equal((await main(['--solo', '--target', 'unknown', '--dir', dir, '--yes'])).code, 2);
  assert.deepEqual(fs.readdirSync(dir), []);
  for (const target of Object.keys(targets)) {
    const project = resolve(dir, target);
    const result = install({ ...request(project), target });
    assert.equal(result.code, 0, result.message);
    assert.ok(fs.lstatSync(resolve(project, targets[target], 'SKILL.md')).isFile());
  }
  for (const target of ['constructor', '__proto__', '../codex']) assert.equal((await main(['--solo', '--target', target, '--dir', dir, '--yes'])).code, 2);
}));

test('3 Modes are exclusive and TEAM copies complete bundles with manual relay', () => workspace(async dir => {
  assert.equal((await main(['--solo', '--team', '--target', 'codex', '--dir', dir])).code, 2);
  assert.deepEqual(fs.readdirSync(dir), []);
  const solo = install(request(resolve(dir, 'solo')));
  assert.equal(solo.code, 0);
  assert.throws(() => fs.lstatSync(resolve(destination(resolve(dir, 'solo')), 'bundles')), { code: 'ENOENT' });
  const teamDir = resolve(dir, 'team');
  const team = install({ ...request(teamDir), mode: 'team' });
  assert.equal(team.code, 0);
  assert.match(team.message, /adapters\/grok.md#manual-fallback/);
  assert.match(team.message, /No native agent definitions were generated/);
  for (const name of files(root, 'docs/bundles').filter(name => name.endsWith('.md'))) assert.deepEqual(fs.readFileSync(resolve(destination(teamDir), 'bundles', name.split('/').at(-1))), fs.readFileSync(resolve(root, name)));
  assert.doesNotMatch(fs.readFileSync(resolve(root, 'src/install.mjs'), 'utf8'), /generateAgents/);
}));

test('4 Flags validate scope, values, Hermes bundle-dir, help and package version', () => workspace(async dir => {
  for (const extra of [['--wat'], ['--scope', 'global'], ['--dir'], ['--bundle-dir', 'relay'], ['--target', 'codex']]) {
    assert.equal((await main([...flags(dir), ...extra])).code, 2);
  }
  assert.deepEqual(fs.readdirSync(dir), []);
  assert.equal((await main(['--version'])).message, packageInfo.version);
  assert.equal((await main(['--help'])).code, 0);
  const custom = resolve(dir, 'custom.json');
  assert.equal((await main([...flags(dir), '--scope', 'user', '--receipt', custom])).code, 0);
  assert.equal(JSON.parse(fs.readFileSync(custom)).scope, 'user');
  const hermes = resolve(dir, 'hermes');
  assert.equal((await main(['--team', '--target', 'hermes', '--dir', hermes, '--bundle-dir', 'relay', '--yes'])).code, 0);
  assert.ok(fs.lstatSync(resolve(hermes, targets.hermes, 'relay/team.md')).isFile());
  assert.equal((await main(['--team', '--target', 'hermes', '--dir', resolve(dir, 'escape'), '--bundle-dir', '../../../../outside', '--yes'])).code, 3);
  const collision = resolve(dir, 'collision');
  assert.equal((await main(['--team', '--target', 'hermes', '--dir', collision, '--bundle-dir', 'SKILL.md', '--yes'])).code, 3);
  assert.throws(() => fs.lstatSync(collision), { code: 'ENOENT' });
}));

test('5 Interactive questions preserve canonical text and EOF or incomplete --yes writes nothing', () => workspace(async dir => {
  for (const args of [ ['--target', 'codex', '--dir', dir, '--yes'], ['--solo', '--dir', dir, '--yes'], ['--solo', '--target', 'codex', '--yes'] ]) {
    const result = cli(args);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
  }
  for (const input of ['', 'nonsense\n', '1\n', '1\nunknown\n']) assert.equal(cli(['--dir', dir], input).status, 2);
  assert.deepEqual(fs.readdirSync(dir), []);
  let output = '';
  const result = await main(['--dir', dir], { input: Readable.from(['1\ncodex\n']), output: new Writable({ write(chunk, encoding, done) { output += chunk; done(); } }) });
  assert.equal(result.code, 0);
  assert.ok(output.startsWith(fs.readFileSync(resolve(root, CORE, 'templates/install-choice.txt'), 'utf8')));
  assert.match(output, /Target \(/);
}));

test('6 Output root probe is read back before writes and unwritable roots leave no partial install', () => workspace(dir => {
  const output = resolve(dir, 'output');
  fs.mkdirSync(output);
  const write = fs.writeFileSync, read = fs.readFileSync, open = fs.openSync;
  const events = [], descriptors = new Map();
  mock.method(fs, 'openSync', (path, ...args) => { const fd = open(path, ...args); descriptors.set(fd, String(path)); return fd; });
  mock.method(fs, 'writeFileSync', (path, ...args) => { events.push(`write:${descriptors.get(path) ?? path}`); return write(path, ...args); });
  mock.method(fs, 'readFileSync', (path, ...args) => { events.push(`read:${path}`); return read(path, ...args); });
  assert.equal(install({ ...request(dir), outputDir: output }).code, 0);
  const firstWrite = events.findIndex(event => event.startsWith('write:'));
  assert.match(events[firstWrite], /probe-/);
  const readBack = events.findIndex(event => event.startsWith('read:') && event.includes('probe-'));
  const skillWrite = events.findIndex(event => event.startsWith(`write:${destination(dir)}`));
  assert.ok(readBack > firstWrite && skillWrite > readBack);
  assert.deepEqual(fs.readdirSync(output), []);
  assert.equal(receipt(dir).outputRoot, output);
  mock.restoreAll();
  const blocked = resolve(dir, 'blocked');
  fs.mkdirSync(blocked);
  fs.chmodSync(blocked, 0o500);
  try {
    const project = resolve(dir, 'unwritable');
    assert.equal(install({ ...request(project), outputDir: blocked }).code, 2);
    assert.throws(() => fs.lstatSync(project), { code: 'ENOENT' });
  } finally { fs.chmodSync(blocked, 0o700); }
  assert.throws(() => fs.lstatSync(resolve(output, 'site-work')), { code: 'ENOENT' });
}));

test('7 Whole-set preflight rejects symlinks, dangling links, escapes and every conflict before writes', () => workspace(dir => {
  const outside = resolve(dir, 'outside');
  fs.mkdirSync(outside);
  for (const [name, target] of [['live', outside], ['dangling', resolve(dir, 'missing')]]) {
    const project = resolve(dir, name);
    fs.mkdirSync(project);
    fs.symlinkSync(target, resolve(project, '.agents'));
    const before = snapshot(dir);
    assert.equal(install(request(project)).code, 3);
    assert.deepEqual(snapshot(dir), before);
  }
  assert.throws(() => safePath(destination(dir), '../escape'), /escapes/);
  const conflictDir = resolve(dir, 'conflict');
  fs.mkdirSync(destination(conflictDir), { recursive: true });
  for (const name of ['SKILL.md', 'manifest.json']) fs.writeFileSync(resolve(destination(conflictDir), name), 'preserve');
  const before = snapshot(dir);
  const result = install(request(conflictDir));
  assert.equal(result.code, 3);
  assert.match(result.message, /SKILL.md/);
  assert.match(result.message, /manifest.json/);
  assert.deepEqual(snapshot(dir), before);
  fs.symlinkSync(resolve(dir, 'missing-receipt'), resolve(dir, 'receipt-link'));
  assert.equal(install({ ...request(resolve(dir, 'receipt-project')), receipt: resolve(dir, 'receipt-link') }).code, 3);
}));

// The first hand run of this installer failed on macOS for every project under /tmp, which
// is a symlink to /private/tmp, and would have failed the same way for any home or project
// on a linked volume. The rule is about what a third party can plant inside the target, not
// about how the user's own filesystem is laid out above it.
test('7b A symlinked ancestor of the project is resolved, while a link inside the target is refused', () => workspace(dir => {
  const real = resolve(dir, 'real');
  fs.mkdirSync(resolve(real, 'project'), { recursive: true });
  fs.symlinkSync(real, resolve(dir, 'link'));
  const through = resolve(dir, 'link', 'project');
  assert.equal(install(request(through)).code, 0);
  assert.equal(fs.readFileSync(resolve(real, 'project', targets.codex, 'SKILL.md'), 'utf8'), fs.readFileSync(owned(root, `${CORE}/SKILL.md`), 'utf8'));
  // The receipt records where the bytes actually landed, not the path the user typed.
  const saved = JSON.parse(fs.readFileSync(resolve(real, 'project', targets.codex, '.website-build-skill-receipt.json'), 'utf8'));
  assert.equal(saved.destination, resolve(fs.realpathSync(real), 'project', targets.codex));
  // Same run, one planted link below the destination: refused, and nothing leaks into it.
  const planted = resolve(dir, 'planted');
  fs.mkdirSync(resolve(planted, targets.codex), { recursive: true });
  const outside = resolve(dir, 'outside');
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, resolve(planted, targets.codex, 'playbooks'));
  const refused = install(request(planted));
  assert.equal(refused.code, 3);
  // By message, so the symlink branch stays the one that fires: a symlink to a directory is
  // also caught by the "not a directory" clause, which would leave this rule untested.
  assert.match(refused.message, /Symlink refused/);
  assert.deepEqual(fs.readdirSync(outside), []);
  // The walk starts AT the canonical root, so a link above it is never consulted.
  const base = resolve(dir, 'link', 'project');
  assert.equal(safePath(base, 'below'), resolve(base, 'below'));
}));

// Findings from the pre-publication review, each reproduced before it was fixed.
test('7c A receipt that names another destination is refused, and that destination is untouched', () => workspace(dir => {
  assert.equal(install(request(dir)).code, 0);
  const victim = resolve(dir, 'victim');
  fs.mkdirSync(victim);
  const personal = resolve(victim, 'personal.txt');
  fs.writeFileSync(personal, 'not ours');
  const forged = JSON.parse(fs.readFileSync(receiptPath(dir), 'utf8'));
  forged.destination = victim;
  forged.files = [{ path: personal, sha256: digest(fs.readFileSync(personal)), action: 'written' }];
  forged.directories = [];
  const forgedPath = resolve(dir, 'forged.json');
  fs.writeFileSync(forgedPath, JSON.stringify(forged, null, 2) + '\n');
  // Both shapes: with an explicit destination, and with the receipt alone.
  assert.equal(install({ uninstall: true, receipt: forgedPath, target: 'codex', dir }).code, 2);
  assert.equal(install({ uninstall: true, receipt: forgedPath }).code, 2);
  assert.equal(fs.readFileSync(personal, 'utf8'), 'not ours');
}));

test('7d A destination replaced by a symlink after the install is refused by uninstall', () => workspace(dir => {
  assert.equal(install(request(dir)).code, 0);
  const moved = resolve(dir, 'moved');
  fs.renameSync(destination(dir), moved);
  fs.symlinkSync(moved, destination(dir));
  const before = fs.readdirSync(moved).length;
  const result = install({ uninstall: true, target: 'codex', dir });
  assert.equal(result.code, 2);
  assert.match(result.message, /Symlink refused/);
  assert.equal(fs.readdirSync(moved).length, before);
}));

test('10b The receipt records the bytes on disk, not the bytes we meant to write', () => workspace(dir => {
  // A digest taken from the source is a record of the intention. Make one write land
  // different bytes and the run has to fail rather than sign for what it did not verify.
  const real = fs.writeFileSync;
  let swapped = false;
  mock.method(fs, 'writeFileSync', (target, bytes, ...rest) => {
    if (!swapped && typeof target === 'number') { swapped = true; return real(target, Buffer.from('tampered'), ...rest); }
    return real(target, bytes, ...rest);
  });
  const result = install(request(dir));
  mock.restoreAll();
  assert.equal(result.code, 4);
  assert.match(result.message, /Read-back mismatch/);
}));

test('13b Uninstall keeps a file and a directory that predate the install', () => workspace(dir => {
  const dest = destination(dir);
  fs.mkdirSync(resolve(dest, 'templates'), { recursive: true });
  fs.copyFileSync(resolve(root, CORE, 'SKILL.md'), resolve(dest, 'SKILL.md'));
  const mine = resolve(dest, 'templates', 'mine.txt');
  fs.writeFileSync(mine, 'mine');
  assert.equal(install(request(dir)).code, 0);
  assert.equal(receipt(dir).files.find(entry => entry.path === resolve(dest, 'SKILL.md')).action, 'identical');
  const removal = install({ uninstall: true, target: 'codex', dir });
  assert.equal(removal.code, 0);
  assert.match(removal.message, /Kept preexisting/);
  assert.ok(fs.existsSync(resolve(dest, 'SKILL.md')), 'a file that was already there is not ours to remove');
  assert.ok(fs.existsSync(mine), 'a file we never listed stays');
  assert.ok(!fs.existsSync(resolve(dest, 'prompts')), 'a directory this install created is removed');
}));

test('13c A smaller reinstall keeps owning what the larger one wrote', () => workspace(dir => {
  assert.equal(install({ mode: 'team', target: 'codex', dir }).code, 0);
  const bundles = resolve(destination(dir), 'bundles');
  assert.equal(fs.readdirSync(bundles).length, 5);
  assert.equal(install(request(dir)).code, 0);
  assert.equal(install({ uninstall: true, target: 'codex', dir }).code, 0);
  assert.ok(!fs.existsSync(bundles), 'the TEAM bundles stayed owned across the SOLO reinstall');
  // And the core files, which the SOLO run found already on disk and byte-identical, are
  // still ours: written by the TEAM run, not preexisting, so uninstall removes them too.
  assert.ok(!fs.existsSync(resolve(destination(dir), 'SKILL.md')), 'a file an earlier run wrote is still ours');
  assert.deepEqual(fs.existsSync(destination(dir)) ? fs.readdirSync(destination(dir)) : [], []);
}));

test('8 Idempotence preserves every byte and mtime, reports identical and records preexisting matches', () => workspace(dir => {
  const dest = destination(dir);
  fs.mkdirSync(dest, { recursive: true });
  fs.copyFileSync(resolve(root, CORE, 'SKILL.md'), resolve(dest, 'SKILL.md'));
  assert.equal(install(request(dir)).code, 0);
  assert.equal(receipt(dir).files.find(entry => entry.path.endsWith('/SKILL.md')).action, 'identical');
  const before = snapshot(dir);
  const result = install(request(dir));
  assert.equal(result.code, 0);
  assert.match(result.message, /nothing written/);
  assert.match(result.message, /identical:/);
  assert.deepEqual(snapshot(dir), before);
}));

test('9 Dry run prints intended files and receipt but makes no directories, files or probe', () => workspace(dir => {
  const before = snapshot(dir);
  const result = install({ ...request(dir), dryRun: true, outputDir: resolve(dir, 'does-not-exist') });
  assert.equal(result.code, 0);
  assert.match(result.message, /Would probe:/);
  assert.match(result.message, /write: .*SKILL.md/);
  assert.match(result.message, /write receipt:/);
  assert.deepEqual(snapshot(dir), before);
}));

test('10 Receipt has exactly the contracted fields and hashes read-back disk bytes', () => workspace(dir => {
  const start = new Date();
  assert.equal(install(request(dir)).code, 0);
  const saved = receipt(dir);
  assert.deepEqual(Object.keys(saved).sort(), ['schemaVersion', 'package', 'date', 'mode', 'target', 'scope', 'destination', 'outputRoot', 'files', 'directories', 'integration', 'activation'].sort());
  assert.deepEqual(saved.package, packageInfo);
  assert.equal(saved.schemaVersion, 1);
  assert.equal(saved.date, new Date(saved.date).toISOString());
  assert.ok(new Date(saved.date) >= start && new Date(saved.date) <= new Date());
  assert.equal(saved.mode, 'solo'); assert.equal(saved.target, 'codex'); assert.equal(saved.scope, 'project');
  assert.equal(saved.destination, destination(dir)); assert.equal(saved.outputRoot, null);
  assert.equal(saved.activation, 'UNVERIFIED');
  assert.deepEqual(saved.integration, { routerPath: null, merged: false, snippet: null });
  assert.equal(saved.files.length, files(resolve(root, CORE)).length);
  for (const entry of saved.files) {
    assert.deepEqual(Object.keys(entry).sort(), ['action', 'path', 'sha256']);
    assert.equal(entry.action, 'written');
    assert.equal(entry.sha256, digest(fs.readFileSync(entry.path)));
  }
}));

test('11 Existing routers stay untouched and exit 5 reports completed install with unmerged snippet', () => workspace(dir => {
  for (const [router, target] of [['AGENTS.md', 'codex'], ['CLAUDE.md', 'claude-code'], ['GROK.md', 'grok'], ['GEMINI.md', 'antigravity']]) {
    const project = resolve(dir, target);
    fs.mkdirSync(project);
    const path = resolve(project, router);
    fs.writeFileSync(path, 'original router\n');
    const before = fs.statSync(path).mtimeMs;
    const result = install({ ...request(project), target });
    assert.equal(result.code, 5);
    assert.match(result.message, /Completed install with activation pending/);
    assert.equal(fs.readFileSync(path, 'utf8'), 'original router\n');
    assert.equal(fs.statSync(path).mtimeMs, before);
    const saved = JSON.parse(fs.readFileSync(resolve(project, targets[target], '.website-build-skill-receipt.json')));
    assert.equal(saved.integration.routerPath, path);
    assert.equal(saved.integration.merged, false);
    assert.match(saved.integration.snippet, /website-build-skill integration/);
    assert.ok(result.message.includes(saved.integration.snippet));
  }
}));

test('12 Interrupted writes return 4 with truthful landed paths and actual partial-byte digests', () => workspace(dir => {
  const write = fs.writeFileSync;
  let count = 0;
  mock.method(fs, 'writeFileSync', (path, bytes, ...args) => {
    if (++count === 2) { write(path, Buffer.from('partial')); throw Error('simulated disk failure'); }
    return write(path, bytes, ...args);
  });
  const result = install(request(dir));
  assert.equal(result.code, 4);
  assert.match(result.message, /simulated disk failure/);
  const saved = receipt(dir);
  assert.equal(saved.files.length, 2);
  for (const entry of saved.files) {
    assert.ok(result.message.includes(entry.path));
    assert.equal(entry.sha256, digest(fs.readFileSync(entry.path)));
  }
  assert.equal(fs.readFileSync(saved.files[1].path, 'utf8'), 'partial');
  mock.restoreAll();
  const receiptFailure = resolve(dir, 'receipt-failure'), descriptors = new Map(), open = fs.openSync;
  let failed = false;
  mock.method(fs, 'openSync', (path, ...args) => { const fd = open(path, ...args); descriptors.set(fd, String(path)); return fd; });
  mock.method(fs, 'writeFileSync', (path, bytes, ...args) => {
    if (!failed && descriptors.get(path) === receiptPath(receiptFailure)) {
      failed = true; write(path, '{'); throw Error('receipt interrupted');
    }
    return write(path, bytes, ...args);
  });
  const interrupted = install(request(receiptFailure));
  assert.equal(interrupted.code, 4);
  assert.match(interrupted.message, /receipt interrupted/);
  const recovered = receipt(receiptFailure);
  assert.equal(recovered.files.length, files(resolve(root, CORE)).length);
  for (const entry of recovered.files) assert.equal(entry.sha256, digest(fs.readFileSync(entry.path)));
}));

test('13 Uninstall removes only receipt-matching files, preserves changed and unlisted files, rejects forged escapes', () => workspace(async dir => {
  assert.equal(install({ ...request(dir), uninstall: true }).code, 2);
  assert.equal(install(request(dir)).code, 0);
  const saved = receipt(dir), changed = saved.files[0].path, untouched = saved.files[1].path;
  fs.writeFileSync(changed, 'user edit');
  const unlisted = resolve(destination(dir), 'mine.txt');
  fs.writeFileSync(unlisted, 'user file');
  const before = snapshot(dir);
  assert.equal(install({ ...request(dir), uninstall: true, dryRun: true }).code, 0);
  assert.deepEqual(snapshot(dir), before);
  const outside = resolve(dir, 'outside.txt');
  fs.writeFileSync(outside, 'keep');
  const originalReceipt = fs.readFileSync(receiptPath(dir));
  saved.files.push({ path: outside, sha256: digest('keep'), action: 'written' });
  fs.writeFileSync(receiptPath(dir), JSON.stringify(saved));
  assert.equal(install({ ...request(dir), uninstall: true }).code, 2);
  assert.equal(fs.readFileSync(outside, 'utf8'), 'keep');
  fs.writeFileSync(receiptPath(dir), originalReceipt);
  const result = await main(['--uninstall', '--receipt', receiptPath(dir), '--yes']);
  assert.equal(result.code, 0);
  assert.match(result.message, /Kept changed:/); assert.match(result.message, /Kept unlisted:/);
  assert.ok(result.message.includes(changed)); assert.ok(result.message.includes(unlisted));
  assert.equal(fs.readFileSync(changed, 'utf8'), 'user edit');
  assert.equal(fs.readFileSync(unlisted, 'utf8'), 'user file');
  assert.throws(() => fs.lstatSync(untouched), { code: 'ENOENT' });
  assert.throws(() => fs.lstatSync(resolve(destination(dir), 'templates')), { code: 'ENOENT' });
}));

test('14 Entry point prints main results, sets exit status, and never exits the process directly', () => workspace(async dir => {
  const response = await main(['--version']);
  assert.deepEqual(response, { code: 0, message: packageInfo.version });
  assert.equal(cli(['--version']).stdout.trim(), packageInfo.version);
  assert.equal(cli(['--unknown']).status, 2);
  assert.equal(cli(flags(dir)).status, 0);
  fs.writeFileSync(resolve(destination(dir), 'SKILL.md'), 'conflict');
  assert.equal(cli(flags(dir)).status, 3);
  for (const name of ['src/install.mjs', 'src/cli.mjs', 'bin/website-build-skill.mjs']) assert.doesNotMatch(fs.readFileSync(resolve(root, name), 'utf8'), /process\.exit\s*\(/);
}));

test('15 Offline install writes only destination, output probe and receipt, with no ambient hooks', () => workspace(dir => {
  const project = resolve(dir, 'project'), output = resolve(dir, 'output'), customReceipt = resolve(dir, 'receipt.json');
  fs.mkdirSync(output);
  const opened = [], open = fs.openSync;
  mock.method(fs, 'openSync', (path, flags, ...args) => {
    if (typeof flags === 'number' && (flags & (fs.constants.O_WRONLY | fs.constants.O_RDWR)) || typeof flags === 'string' && /[wa+]/.test(flags)) opened.push(String(path));
    return open(path, flags, ...args);
  });
  assert.equal(install({ ...request(project), outputDir: output, receipt: customReceipt }).code, 0);
  for (const path of opened) assert.ok(path.startsWith(destination(project) + '/') || path.startsWith(output + '/.website-build-skill-probe-') || path === customReceipt, path);
  for (const name of ['src/install.mjs', 'src/cli.mjs', 'bin/website-build-skill.mjs']) assert.doesNotMatch(fs.readFileSync(resolve(root, name), 'utf8'), /\bfetch\s*\(|node:(?:https?|net|tls|child_process)|\bsetInterval\s*\(/);
  const metadata = JSON.parse(fs.readFileSync(resolve(root, 'package.json')));
  assert.equal(metadata.dependencies, undefined);
  assert.equal(metadata.scripts.install, undefined);
  assert.equal(metadata.scripts.postinstall, undefined);
}));

test('Local bundle path resolver rejects traversal', () => {
  assert.throws(() => owned(root, '../escape'));
  assert.throws(() => owned(root, '/escape'));
  assert.throws(() => owned(root, 'C:\\escape'));
});
