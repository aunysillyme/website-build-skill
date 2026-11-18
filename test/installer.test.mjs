import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { Readable, Writable } from 'node:stream';
import { install, safePath, packageInfo } from '../src/install.mjs';
import { main } from '../src/cli.mjs';
import { CORE, files, owned, digest } from '../src/bundle.mjs';
import * as catalog from '../src/catalog.mjs';
import { targets, userTargets, destinationFor, agentDirFor } from '../src/catalog.mjs';
import { generateAgents } from '../src/agents.mjs';
import { root } from './helpers.mjs';

async function workspace(run, parent = fs.realpathSync(tmpdir())) {
  fs.mkdirSync(parent, { recursive: true });
  const dir = fs.mkdtempSync(resolve(parent, 'installer-'));
  try { return await run(dir); } finally { mock.restoreAll(); fs.rmSync(dir, { recursive: true, force: true }); }
}
const request = dir => ({ mode: 'solo', target: 'codex', dir });
const destination = dir => resolve(dir, targets.codex);
const receiptPath = dir => resolve(destination(dir), '.website-build-skill-receipt.json');
const receipt = dir => JSON.parse(fs.readFileSync(receiptPath(dir), 'utf8'));
const cli = (args, input = '', cwd = root, env = process.env) => spawnSync(process.execPath, [resolve(root, 'bin/website-build-skill.mjs'), ...args], { cwd, input, encoding: 'utf8', env });
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

test('3 Modes are exclusive and TEAM copies complete bundles with native agents or manual relay', () => workspace(async dir => {
  assert.equal((await main(['--solo', '--team', '--target', 'codex', '--dir', dir])).code, 2);
  assert.deepEqual(fs.readdirSync(dir), []);
  const solo = install(request(resolve(dir, 'solo')));
  assert.equal(solo.code, 0);
  assert.throws(() => fs.lstatSync(resolve(destination(resolve(dir, 'solo')), 'bundles')), { code: 'ENOENT' });

  const teamDir = resolve(dir, 'team');
  const team = install({ ...request(teamDir), mode: 'team' });
  assert.equal(team.code, 0);
  assert.match(team.message, /Generated 7 native subagent definitions for codex/);
  const codexReviewer = fs.readFileSync(resolve(teamDir, '.codex/agents/website-reviewer.toml'), 'utf8');
  assert.doesNotMatch(codexReviewer, /sandbox_mode/);
  assert.match(codexReviewer, /# Subagents inherit the parent turn's sandbox and approval settings in Codex\./);
  assert.match(codexReviewer, /developer_instructions = """/);
  const codexResearcher = fs.readFileSync(resolve(teamDir, '.codex/agents/website-researcher.toml'), 'utf8');
  assert.doesNotMatch(codexResearcher, /\.\.\/\.agents\//);
  assert.match(codexResearcher, /\.agents\/skills\/website-build-skill\/prompts\/01-website-deep-research\.md/);
  assert.match(codexResearcher, /\.agents\/skills\/website-build-skill\/archive\/graphics-design-original\.md/);
  const codexCoordinator = fs.readFileSync(resolve(teamDir, '.codex/agents/website-coordinator.toml'), 'utf8');
  assert.match(codexCoordinator, /\.agents\/skills\/website-build-skill\/SKILL\.md/);

  const pyToml = spawnSync('python3', ['-c', `
import sys, tomllib, pathlib
for p in pathlib.Path(sys.argv[1]).glob('*.toml'):
    d = tomllib.loads(p.read_text('utf-8'))
    assert d['name'].startswith('website-')
    assert 'sandbox_mode' not in d
    assert isinstance(d['developer_instructions'], str) and len(d['developer_instructions']) > 20
`, resolve(teamDir, '.codex/agents')], { encoding: 'utf8' });
  if (pyToml.error?.code !== 'ENOENT') assert.equal(pyToml.status, 0, pyToml.stderr);

  const claudeDir = resolve(dir, 'claude-team');
  const claudeTeam = install({ ...request(claudeDir), target: 'claude-code', mode: 'team' });
  assert.equal(claudeTeam.code, 0);
  assert.match(claudeTeam.message, /Generated 7 native subagent definitions for claude-code/);
  const claudeReviewer = fs.readFileSync(resolve(claudeDir, '.claude/agents/website-reviewer.md'), 'utf8');
  assert.match(claudeReviewer, /disallowedTools: Write, Edit, Bash/);
  assert.doesNotMatch(claudeReviewer, /^tools:/m);
  const claudeResearcher = fs.readFileSync(resolve(claudeDir, '.claude/agents/website-researcher.md'), 'utf8');
  assert.doesNotMatch(claudeResearcher, /^(?:tools|disallowedTools):/m);
  assert.doesNotMatch(claudeResearcher, /\.\.\/\.claude\//);
  assert.match(claudeResearcher, /\.claude\/skills\/website-build-skill\/prompts\/01-website-deep-research\.md/);
  assert.match(claudeResearcher, /\.claude\/skills\/website-build-skill\/playbooks\/research-and-memory\.md#ask-date-rule/);
  assert.match(claudeResearcher, /\.claude\/skills\/website-build-skill\/archive\/graphics-design-original\.md/);
  assert.match(fs.readFileSync(resolve(claudeDir, '.claude/agents/website-coordinator.md'), 'utf8'), /\.claude\/skills\/website-build-skill\/SKILL\.md/);

  const geminiDir = resolve(dir, 'gemini-team');
  const geminiTeam = install({ ...request(geminiDir), target: 'gemini-cli', mode: 'team' });
  assert.equal(geminiTeam.code, 0);
  assert.match(geminiTeam.message, /Generated 7 native subagent definitions for gemini-cli/);
  const geminiReviewer = fs.readFileSync(resolve(geminiDir, '.gemini/agents/website-reviewer.md'), 'utf8');
  for (const toolName of ['read_file', 'grep_search', 'glob', 'list_directory', 'google_web_search', 'web_fetch']) {
    assert.ok(geminiReviewer.includes(`  - ${toolName}`), `missing gemini tool ${toolName}`);
  }
  assert.doesNotMatch(fs.readFileSync(resolve(geminiDir, '.gemini/agents/website-builder.md'), 'utf8'), /^tools:/m);

  const agyDir = resolve(dir, 'antigravity-team');
  const agyTeam = install({ ...request(agyDir), target: 'antigravity', mode: 'team' });
  assert.equal(agyTeam.code, 0);
  assert.match(agyTeam.message, /Generated 7 native subagent definitions for antigravity/);
  const agyReviewer = fs.readFileSync(resolve(agyDir, '.agents/agents/website-reviewer.md'), 'utf8');
  assert.match(agyReviewer, /^subagent: true$/m);
  assert.match(agyReviewer, /^mainAgent: false$/m);
  assert.match(agyReviewer, /^commandExecutionPolicy: "off"$/m);
  assert.match(agyReviewer, /^tools: \[read_file, search_web\]$/m);
  const agyBuilder = fs.readFileSync(resolve(agyDir, '.agents/agents/website-builder.md'), 'utf8');
  assert.match(agyBuilder, /^subagent: true$/m);
  assert.match(agyBuilder, /^mainAgent: false$/m);
  assert.match(agyBuilder, /^commandExecutionPolicy: sandbox$/m);
  assert.doesNotMatch(agyBuilder, /^tools:/m);

  const hermesDir = resolve(dir, 'hermes-team');
  const hermesTeam = install({ ...request(hermesDir), target: 'hermes', mode: 'team' });
  assert.equal(hermesTeam.code, 0);
  assert.match(hermesTeam.message, /adapters\/grok.md#manual-fallback/);
  assert.match(hermesTeam.message, /No native agent definitions were generated/);
  for (const name of files(root, 'docs/bundles').filter(name => name.endsWith('.md'))) assert.deepEqual(fs.readFileSync(resolve(destination(teamDir), 'bundles', name.split('/').at(-1))), fs.readFileSync(resolve(root, name)));
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
  assert.equal((await main(['--team', '--target', 'hermes', '--dir', hermes, '--bundle-dir', 'team-aliases', '--yes'])).code, 0);
  for (const name of files(root, 'docs/bundles').filter(name => name.endsWith('.md'))) {
    assert.deepEqual(fs.readFileSync(resolve(hermes, targets.hermes, 'team-aliases', name.split('/').at(-1))), fs.readFileSync(resolve(root, name)));
  }
  assert.throws(() => fs.lstatSync(resolve(hermes, 'team-aliases')), { code: 'ENOENT' });
  const escape = await main(['--team', '--target', 'hermes', '--dir', resolve(dir, 'escape'), '--bundle-dir', '../../../../outside', '--yes']);
  assert.equal(escape.code, 3);
  assert.match(escape.message, /Path escapes destination root/);
  const collision = resolve(dir, 'collision');
  assert.equal((await main(['--team', '--target', 'hermes', '--dir', collision, '--bundle-dir', 'SKILL.md', '--yes'])).code, 3);
  assert.throws(() => fs.lstatSync(collision), { code: 'ENOENT' });
}));

test('Hermes --help names the bundle-dir resolution root', async () => {
  const help = await main(['--help']);
  assert.equal(help.code, 0);
  assert.match(help.message, /--bundle-dir <path> \(Hermes TEAM only; relative to the installed skill folder\)/);
});

test('5 Interactive questions preserve canonical text and EOF or incomplete --yes writes nothing', () => workspace(async dir => {
  for (const args of [ ['--target', 'codex', '--dir', dir, '--yes'], ['--solo', '--dir', dir, '--yes'], ['--solo', '--target', 'codex', '--yes'] ]) {
    const result = cli(args);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
  }
  for (const input of ['', 'nonsense\n', '1\n', '1\nunknown\n', '1\ncodex\n', '1\ncodex\n2\n', '1\ncodex\n9\n']) assert.equal(cli(['--dir', dir], input).status, 2);
  assert.deepEqual(fs.readdirSync(dir), []);
  let output = '';
  const result = await main(['--dir', dir], { input: Readable.from(['1\ncodex\n2\n\n']), output: new Writable({ write(chunk, encoding, done) { output += chunk; done(); } }) });
  assert.equal(result.code, 0);
  assert.ok(output.startsWith(fs.readFileSync(resolve(root, CORE, 'templates/install-choice.txt'), 'utf8')));
  assert.match(output, /Target \(/);
  assert.equal(receipt(dir).outputRoot, fs.realpathSync(dir));
  assert.deepEqual(receipt(dir).outputStorage, { kind: 'folder' });
}));

test('Interactive storage records each destination without changing path case or uploading', () => workspace(dir => {
  for (const [choice, kind] of [['1', 'obsidian'], ['2', 'folder'], ['3', 'notion'], ['4', 'other']]) {
    const project = resolve(dir, `project-${choice}`), output = resolve(dir, `My Work ${choice}`);
    fs.mkdirSync(project); fs.mkdirSync(output);
    const exportTarget = 'https://www.notion.so/ExamplePage';
    const input = `1\nCODEX\n${choice}\n${output}\n${choice === '3' ? exportTarget + '\n' : ''}`;
    const result = cli(['--dir', project], input);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(receipt(project).outputRoot, fs.realpathSync(output));
    assert.deepEqual(receipt(project).outputStorage, kind === 'notion' ? { kind, exportTarget } : { kind });
    assert.deepEqual(fs.readdirSync(output), [], 'installer only probes; the host writes the library');
  }
}));

test('Incomplete Notion selection and missing output directory fail before installation', () => workspace(dir => {
  for (const input of [`1\ncodex\n3\n${dir}\n`, `1\ncodex\n3\n${dir}\n\n`, `1\ncodex\n1\n\n`, `1\ncodex\n2\n${resolve(dir, 'absent')}\n`]) {
    assert.equal(cli(['--dir', dir], input).status, 2);
    assert.deepEqual(fs.readdirSync(dir), []);
  }
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

test('7e Receipt install and uninstall accept a symlinked parent', () => workspace(dir => {
  const real = resolve(dir, 'real'), link = resolve(dir, 'link');
  fs.mkdirSync(resolve(real, 'out'), { recursive: true });
  fs.symlinkSync(real, link, 'dir');
  for (const tail of ['r.json', 'missing/nested/r.json']) {
    const project = resolve(link, 'project'), output = resolve(link, 'out'), custom = resolve(output, tail);
    const result = cli([...flags(project), '--output-dir', output, '--receipt', custom]);
    assert.equal(result.status, 0, result.stderr);
    const canonicalReceipt = resolve(real, 'out', tail);
    const saved = JSON.parse(fs.readFileSync(canonicalReceipt, 'utf8'));
    assert.equal(saved.destination, destination(resolve(real, 'project')));
    assert.equal(saved.outputRoot, resolve(real, 'out'));
    assert.ok(result.stdout.includes(`write receipt: ${canonicalReceipt}`));
    const again = cli([...flags(project), '--output-dir', output, '--receipt', custom]);
    assert.equal(again.status, 0, again.stderr);
    assert.match(again.stdout, /Identical install/);
    const removal = cli(['--uninstall', '--target', 'codex', '--dir', project, '--output-dir', output, '--receipt', custom, '--yes']);
    assert.equal(removal.status, 0, removal.stderr);
    assert.ok(!fs.existsSync(canonicalReceipt));
    assert.ok(!fs.existsSync(resolve(saved.destination, 'SKILL.md')));
  }
  const project = resolve(link, 'receipt-only');
  assert.equal(cli(flags(project)).status, 0);
  const removal = cli(['--uninstall', '--receipt', receiptPath(project), '--yes']);
  assert.equal(removal.status, 0, removal.stderr);
  assert.ok(!fs.existsSync(receiptPath(project)));
}, fs.realpathSync(tmpdir())));

test('7f A receipt link escaping the output root is refused without writes', () => workspace(dir => {
  const output = resolve(dir, 'out'), outside = resolve(dir, 'outside');
  fs.mkdirSync(output); fs.mkdirSync(outside);
  fs.symlinkSync(outside, resolve(output, 'escape'), 'dir');
  fs.symlinkSync(output, resolve(dir, 'alias'), 'dir');
  const before = snapshot(dir);
  for (const base of [output, resolve(dir, 'alias')]) {
    const result = cli([...flags(resolve(dir, 'project')), '--output-dir', output, '--receipt', resolve(base, 'escape', 'r.json')]);
    assert.equal(result.status, 3, result.stderr);
    assert.match(result.stderr, /Preflight refused; nothing written: (?:Symlink refused|Path escapes destination root)/);
    assert.deepEqual(snapshot(dir), before);
  }
}, fs.realpathSync(tmpdir())));

test('7g A receipt link inside the output root is refused without writes', () => workspace(dir => {
  const output = resolve(dir, 'out');
  fs.mkdirSync(resolve(output, 'real'), { recursive: true });
  fs.symlinkSync(resolve(output, 'real'), resolve(output, 'planted'), 'dir');
  fs.symlinkSync(output, resolve(dir, 'alias'), 'dir');
  const before = snapshot(dir);
  for (const base of [output, resolve(dir, 'alias')]) {
    const result = cli([...flags(resolve(dir, 'project')), '--output-dir', output, '--receipt', resolve(base, 'planted', 'r.json')]);
    assert.equal(result.status, 3, result.stderr);
    assert.match(result.stderr, /Preflight refused; nothing written: Symlink refused/);
    assert.deepEqual(snapshot(dir), before);
  }
}, fs.realpathSync(tmpdir())));

test('7h A receipt reached through an alias to a subdirectory of the output root is refused at a planted link', () => workspace(dir => {
  const output = resolve(dir, 'out'), outside = resolve(dir, 'outside');
  fs.mkdirSync(resolve(output, 'sub'), { recursive: true });
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, resolve(output, 'sub', 'planted'), 'dir');
  fs.symlinkSync(resolve(output, 'sub'), resolve(dir, 'alias'), 'dir');
  const before = snapshot(dir);
  const result = cli([...flags(resolve(dir, 'project')), '--output-dir', output, '--receipt', resolve(dir, 'alias', 'planted', 'r.json')]);
  assert.equal(result.status, 3, result.stderr);
  assert.match(result.stderr, /Preflight refused; nothing written: Symlink refused/);
  assert.equal(fs.existsSync(resolve(outside, 'r.json')), false);
  assert.deepEqual(snapshot(dir), before);
}, fs.realpathSync(tmpdir())));

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
  for (const path of opened) assert.ok(path.startsWith(destination(project) + sep) || path.startsWith(resolve(output, '.website-build-skill-probe-')) || path === customReceipt, path);
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

test('25 Antigravity installs into its documented workspace skill folder and old installs uninstall by receipt', () => workspace(dir => {
  assert.equal(targets.antigravity, '.agents/skills/website-build-skill');
  const project = resolve(dir, 'antigravity');
  const result = install({ ...request(project), target: 'antigravity' });
  assert.equal(result.code, 0, result.message);
  assert.ok(fs.lstatSync(resolve(project, '.agents/skills/website-build-skill/SKILL.md')).isFile());
  assert.throws(() => fs.lstatSync(resolve(project, '.website-build-skill')), { code: 'ENOENT' });
  const removal = install({ uninstall: true, target: 'antigravity', dir: project });
  assert.equal(removal.code, 0, removal.message);
  assert.throws(() => fs.lstatSync(resolve(project, '.agents/skills/website-build-skill/SKILL.md')), { code: 'ENOENT' });
}));

test('26 Catalog exports userTargets, destinationFor, agentDirFor and drops unused status', () => {
  assert.equal('status' in catalog, false);
  assert.equal(targets['gemini-cli'], '.gemini/skills/website-build-skill');
  assert.equal(userTargets.hermes, '.hermes/skills/website-build-skill');
  assert.equal(userTargets.antigravity, '.gemini/config/skills/website-build-skill');
  assert.equal(destinationFor('antigravity', 'project'), '.agents/skills/website-build-skill');
  assert.equal(destinationFor('antigravity', 'user'), '.gemini/config/skills/website-build-skill');
  assert.equal(destinationFor('hermes', 'user'), '.hermes/skills/website-build-skill');
  assert.equal(destinationFor('gemini-cli', 'user'), '.gemini/skills/website-build-skill');
  assert.equal(agentDirFor('claude-code', 'project'), '.claude/agents');
  assert.equal(agentDirFor('codex', 'user'), '.codex/agents');
  assert.equal(agentDirFor('gemini-cli', 'project'), '.gemini/agents');
  assert.equal(agentDirFor('antigravity', 'project'), '.agents/agents');
  assert.equal(agentDirFor('antigravity', 'user'), '.gemini/config/agents');
  assert.equal(agentDirFor('hermes', 'project'), null);
});

test('27 Codex TOML escaping handles backslashes, quotes, triple-quotes and control characters', () => workspace(dir => {
  const rolesRoot = resolve(dir, 'roles');
  fs.mkdirSync(rolesRoot);
  const tricky = [
    'Line with \\backslash\\ and "single quotes" and \'\'\'single triple\'\'\'.',
    'Triple """quotes""" and quad """"quotes"""" inside prose.',
    'Controls:\t\b\f\x00\x07\x7f and bare CR:\r end.',
    'Trailing quote"',
  ].join('\n');
  for (const name of ['researcher', 'coordinator', 'designer', 'graphics', 'builder', 'optimizer', 'reviewer']) {
    fs.writeFileSync(resolve(rolesRoot, `${name}.md`), tricky, 'utf8');
  }
  const agents = generateAgents({
    target: 'codex',
    project: dir,
    destination: resolve(dir, targets.codex),
    rolesRoot,
  });
  assert.equal(agents.length, 7);
  const reviewer = agents.find(entry => entry.role === 'reviewer');
  const expected = tricky.trimEnd() + '\n';
  const py = spawnSync('python3', ['-c', `
import base64, sys, tomllib
doc = tomllib.loads(sys.stdin.read())
expected = base64.b64decode(sys.argv[1]).decode('utf-8')
assert doc['developer_instructions'] == expected, (repr(doc['developer_instructions']), repr(expected))
`, Buffer.from(expected, 'utf8').toString('base64')], { input: reviewer.bytes.toString('utf8'), encoding: 'utf8' });
  if (py.error?.code !== 'ENOENT') assert.equal(py.status, 0, py.stderr);
}));

test('28 Forged value.project escapes in receipts are refused without touching victim files (I1)', () => workspace(dir => {
  const soloProj = resolve(dir, 'solo-proj');
  assert.equal(install({ mode: 'solo', target: 'codex', dir: soloProj }).code, 0);
  const victim = resolve(dir, 'victim.txt');
  fs.writeFileSync(victim, 'untouched');
  const victimSha = digest(fs.readFileSync(victim));

  const soloReceiptFile = receiptPath(soloProj);
  const soloOriginal = fs.readFileSync(soloReceiptFile, 'utf8');
  const soloForged = JSON.parse(soloOriginal);
  soloForged.project = '/';
  soloForged.files.push({ path: victim, sha256: victimSha, action: 'written' });
  fs.writeFileSync(soloReceiptFile, JSON.stringify(soloForged, null, 2) + '\n');
  assert.equal(install({ uninstall: true, target: 'codex', dir: soloProj }).code, 2);
  assert.equal(install({ uninstall: true, receipt: soloReceiptFile }).code, 2);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'untouched');

  const teamProj = resolve(dir, 'team-proj');
  assert.equal(install({ mode: 'team', target: 'codex', dir: teamProj }).code, 0);
  const teamReceiptFile = receiptPath(teamProj);
  const teamForgedRoot = JSON.parse(fs.readFileSync(teamReceiptFile, 'utf8'));
  teamForgedRoot.project = '/';
  teamForgedRoot.files.push({ path: victim, sha256: victimSha, action: 'written' });
  fs.writeFileSync(teamReceiptFile, JSON.stringify(teamForgedRoot, null, 2) + '\n');
  assert.equal(install({ uninstall: true, target: 'codex', dir: teamProj }).code, 2);
  assert.equal(install({ uninstall: true, receipt: teamReceiptFile }).code, 2);
  assert.equal(fs.readFileSync(victim, 'utf8'), 'untouched');

  const innerVictim = resolve(teamProj, 'README-victim.txt');
  fs.writeFileSync(innerVictim, 'project file');
  const teamForgedInner = JSON.parse(fs.readFileSync(teamReceiptFile, 'utf8'));
  teamForgedInner.project = fs.realpathSync(teamProj);
  teamForgedInner.files.push({ path: innerVictim, sha256: digest(fs.readFileSync(innerVictim)), action: 'written' });
  fs.writeFileSync(teamReceiptFile, JSON.stringify(teamForgedInner, null, 2) + '\n');
  assert.equal(install({ uninstall: true, target: 'codex', dir: teamProj }).code, 2);
  assert.equal(fs.readFileSync(innerVictim, 'utf8'), 'project file');

  const teamForgedDir = JSON.parse(fs.readFileSync(teamReceiptFile, 'utf8'));
  teamForgedDir.project = fs.realpathSync(teamProj);
  teamForgedDir.directories.push(fs.realpathSync(teamProj));
  fs.writeFileSync(teamReceiptFile, JSON.stringify(teamForgedDir, null, 2) + '\n');
  assert.equal(install({ uninstall: true, target: 'codex', dir: teamProj }).code, 2);
}));

test('29 Interrupted TEAM install keeps landed agent files and dirs in recovery receipt for uninstall (I2)', () => workspace(dir => {
  const write = fs.writeFileSync;
  let agentWrites = 0;
  mock.method(fs, 'writeFileSync', (target, bytes, ...args) => {
    if (typeof target === 'number') {
      // Fail mid-way through writing native codex agent files after core and bundles land.
      const text = Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes);
      if (text.includes('Generated by website-build-skill for Codex') && ++agentWrites === 3) {
        write(target, Buffer.from('partial-agent'));
        throw Error('simulated agent write failure');
      }
    }
    return write(target, bytes, ...args);
  });
  const interrupted = install({ mode: 'team', target: 'codex', dir });
  mock.restoreAll();
  assert.equal(interrupted.code, 4);
  assert.match(interrupted.message, /simulated agent write failure/);

  const saved = receipt(dir);
  assert.equal(saved.project, fs.realpathSync(dir));
  const agentFiles = saved.files.filter(entry => entry.path.includes(`${sep}.codex${sep}agents${sep}`));
  assert.equal(agentFiles.length, 3);
  for (const entry of agentFiles) assert.equal(entry.sha256, digest(fs.readFileSync(entry.path)));
  assert.ok(saved.directories.includes(resolve(dir, '.codex')));
  assert.ok(saved.directories.includes(resolve(dir, '.codex/agents')));

  const removal = install({ uninstall: true, target: 'codex', dir });
  assert.equal(removal.code, 0, removal.message);
  assert.equal(fs.existsSync(resolve(dir, '.codex')), false);
  assert.equal(fs.existsSync(resolve(dir, '.agents')), false);
}));

test('30 Reinstalling SOLO over TEAM stays idempotent and uninstalls all agent files and dirs (I3)', () => workspace(dir => {
  for (const [target, agentFile] of [
    ['codex', '.codex/agents/website-researcher.toml'],
    ['antigravity', '.agents/agents/website-researcher.md'],
  ]) {
    const proj = resolve(dir, target);
    assert.equal(install({ mode: 'team', target, dir: proj }).code, 0);
    assert.ok(fs.existsSync(resolve(proj, agentFile)));
    assert.equal(install({ mode: 'solo', target, dir: proj }).code, 0);
    const repeat = install({ mode: 'solo', target, dir: proj });
    assert.equal(repeat.code, 0, repeat.message);
    assert.match(repeat.message, /Identical install; nothing written/);
    const removal = install({ uninstall: true, target, dir: proj });
    assert.equal(removal.code, 0, removal.message);
    assert.equal(fs.existsSync(resolve(proj, agentFile)), false);
    assert.equal(fs.existsSync(resolve(proj, '.agents')), false);
    assert.equal(fs.existsSync(resolve(proj, '.codex')), false);
  }
}));

test('31 User scope installs without --dir to HOME destinations and uninstalls with --target --scope user', () => workspace(dir => {
  const fakeHome = resolve(dir, 'home');
  fs.mkdirSync(fakeHome);
  const env = { ...process.env, HOME: fakeHome, USERPROFILE: fakeHome };
  const cases = [
    ['hermes', 'solo', '.hermes/skills/website-build-skill/SKILL.md', null],
    ['gemini-cli', 'team', '.gemini/skills/website-build-skill/SKILL.md', '.gemini/agents/website-reviewer.md'],
    ['antigravity', 'team', '.gemini/config/skills/website-build-skill/SKILL.md', '.gemini/config/agents/website-reviewer.md'],
    ['claude-code', 'team', '.claude/skills/website-build-skill/SKILL.md', '.claude/agents/website-reviewer.md'],
    ['codex', 'team', '.agents/skills/website-build-skill/SKILL.md', '.codex/agents/website-reviewer.toml'],
  ];
  for (const [target, mode, expectedSkill, expectedAgent] of cases) {
    const installed = cli([`--${mode}`, '--target', target, '--scope', 'user', '--yes'], '', dir, env);
    assert.equal(installed.status, 0, installed.stderr);
    assert.ok(fs.existsSync(resolve(fakeHome, expectedSkill)), `missing ${expectedSkill}`);
    if (expectedAgent) assert.ok(fs.existsSync(resolve(fakeHome, expectedAgent)), `missing ${expectedAgent}`);

    const removed = cli(['--uninstall', '--target', target, '--scope', 'user', '--yes'], '', dir, env);
    assert.equal(removed.status, 0, removed.stderr);
    assert.equal(fs.existsSync(resolve(fakeHome, expectedSkill)), false, `remaining ${expectedSkill}`);
    if (expectedAgent) assert.equal(fs.existsSync(resolve(fakeHome, expectedAgent)), false, `remaining ${expectedAgent}`);
  }
  assert.deepEqual(fs.readdirSync(fakeHome), []);
}));

test('32 pruneCreated preserves user empty subdirs, unlinks receipt last, and cleans nested custom receipt dirs', () => workspace(async dir => {
  const userDirsProj = resolve(dir, 'user-dirs');
  assert.equal(install({ mode: 'team', target: 'codex', dir: userDirsProj }).code, 0);
  const userEmptySkillDir = resolve(destination(userDirsProj), 'prompts', 'user-empty-dir');
  const userEmptyAgentDir = resolve(userDirsProj, '.codex', 'user-sessions-empty');
  fs.mkdirSync(userEmptySkillDir, { recursive: true });
  fs.mkdirSync(userEmptyAgentDir, { recursive: true });

  const unlinked = [];
  const origUnlink = fs.unlinkSync;
  mock.method(fs, 'unlinkSync', (path, ...args) => {
    unlinked.push(String(path));
    return origUnlink(path, ...args);
  });
  const removal = install({ uninstall: true, target: 'codex', dir: userDirsProj });
  mock.restoreAll();
  assert.equal(removal.code, 0, removal.message);
  assert.equal(unlinked.at(-1), receiptPath(userDirsProj));
  assert.ok(fs.existsSync(userEmptySkillDir), 'user empty subdir inside destination must stay');
  assert.ok(fs.existsSync(userEmptyAgentDir), 'user empty subdir inside .codex must stay');

  const preexistingProj = resolve(dir, 'preexisting-dest');
  fs.mkdirSync(destination(preexistingProj), { recursive: true });
  assert.equal(install({ mode: 'solo', target: 'codex', dir: preexistingProj }).code, 0);
  assert.equal(install({ uninstall: true, target: 'codex', dir: preexistingProj }).code, 0);
  assert.ok(fs.existsSync(destination(preexistingProj)), 'preexisting empty destination must remain');

  const customProj = resolve(dir, 'custom-proj');
  const out = resolve(dir, 'out');
  fs.mkdirSync(out);
  const customReceipt = resolve(out, 'missing/nested/r.json');
  assert.equal(install({ mode: 'solo', target: 'codex', dir: customProj, outputDir: out, receipt: customReceipt }).code, 0);
  assert.equal(install({ uninstall: true, receipt: customReceipt }).code, 2);
  assert.equal((await main(['--uninstall', '--receipt', customReceipt, '--target', 'codex', '--dir', customProj])).code, 0);
  assert.equal(fs.existsSync(resolve(out, 'missing')), false);
  assert.ok(fs.existsSync(out));
  assert.equal(fs.existsSync(resolve(customProj, '.agents')), false);
}));

test('33 Shared path installs refuse overwriting a different target receipt', () => workspace(dir => {
  assert.equal(install({ mode: 'solo', target: 'codex', dir }).code, 0);
  const before = snapshot(dir);
  const conflict = install({ mode: 'solo', target: 'hermes', dir });
  assert.equal(conflict.code, 3);
  assert.match(conflict.message, /owned by target codex/);
  assert.deepEqual(snapshot(dir), before);

  const sharedGeneric = resolve(dir, 'shared-generic');
  assert.equal(install({ mode: 'solo', target: 'agents', dir: sharedGeneric }).code, 0);
  const genericConflict = install({ mode: 'solo', target: 'portable', dir: sharedGeneric });
  assert.equal(genericConflict.code, 3);
  assert.match(genericConflict.message, /owned by target agents/);
}));

test('34 integrationFor prefers target convention, resolves canonical project, and requires regular files', () => workspace(dir => {
  const claudeProj = resolve(dir, 'claude');
  fs.mkdirSync(claudeProj);
  fs.writeFileSync(resolve(claudeProj, 'AGENTS.md'), 'agents\n');
  fs.writeFileSync(resolve(claudeProj, 'CLAUDE.md'), 'claude\n');
  const claudeResult = install({ mode: 'solo', target: 'claude-code', dir: claudeProj });
  assert.equal(claudeResult.code, 5);
  const claudeReceipt = JSON.parse(fs.readFileSync(resolve(claudeProj, targets['claude-code'], '.website-build-skill-receipt.json'), 'utf8'));
  assert.equal(claudeReceipt.integration.routerPath, resolve(claudeProj, 'CLAUDE.md'));

  for (const target of ['gemini-cli', 'antigravity']) {
    const gProj = resolve(dir, `${target}-both`);
    fs.mkdirSync(gProj);
    fs.writeFileSync(resolve(gProj, 'AGENTS.md'), 'agents\n');
    fs.writeFileSync(resolve(gProj, 'GEMINI.md'), 'gemini\n');
    const gResult = install({ mode: 'solo', target, dir: gProj });
    assert.equal(gResult.code, 5);
    const gReceipt = JSON.parse(fs.readFileSync(resolve(gProj, targets[target], '.website-build-skill-receipt.json'), 'utf8'));
    assert.equal(gReceipt.integration.routerPath, resolve(gProj, 'GEMINI.md'));
  }

  const fallbackProj = resolve(dir, 'gemini-fallback');
  fs.mkdirSync(fallbackProj);
  fs.writeFileSync(resolve(fallbackProj, 'AGENTS.md'), 'agents\n');
  const fallbackResult = install({ mode: 'solo', target: 'gemini-cli', dir: fallbackProj });
  assert.equal(fallbackResult.code, 5);
  assert.equal(JSON.parse(fs.readFileSync(resolve(fallbackProj, targets['gemini-cli'], '.website-build-skill-receipt.json'), 'utf8')).integration.routerPath, resolve(fallbackProj, 'AGENTS.md'));

  const danglingProj = resolve(dir, 'dangling-router');
  fs.mkdirSync(danglingProj);
  fs.symlinkSync(resolve(dir, 'missing-router.md'), resolve(danglingProj, 'GEMINI.md'));
  const danglingResult = install({ mode: 'solo', target: 'gemini-cli', dir: danglingProj });
  assert.equal(danglingResult.code, 0);
  assert.equal(JSON.parse(fs.readFileSync(resolve(danglingProj, targets['gemini-cli'], '.website-build-skill-receipt.json'), 'utf8')).integration.routerPath, null);

  const realProj = resolve(dir, 'real-router');
  fs.mkdirSync(realProj);
  fs.writeFileSync(resolve(realProj, 'GEMINI.md'), 'gemini\n');
  fs.symlinkSync(realProj, resolve(dir, 'link-router'));
  const linkResult = install({ mode: 'solo', target: 'gemini-cli', dir: resolve(dir, 'link-router') });
  assert.equal(linkResult.code, 5);
  assert.equal(JSON.parse(fs.readFileSync(resolve(realProj, targets['gemini-cli'], '.website-build-skill-receipt.json'), 'utf8')).integration.routerPath, resolve(realProj, 'GEMINI.md'));
}));
