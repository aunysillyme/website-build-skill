import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { CORE, ARCHIVE, ARCHIVE_SHA, read, digest, generated, manifest, files } from '../src/bundle.mjs';
import { root, fixture, change } from './helpers.mjs';

const editedAsset = 'checklists/brand-and-mockups.md';
const run = (r, script, ...args) => spawnSync(process.execPath, [script, ...args], { cwd: r, encoding: 'utf8' });

test('Plain build preserves manifest bytes and the SOURCE_HASH tripwire', () => fixture(r => {
  const before = read(r, `${CORE}/manifest.json`);
  change(r, `${CORE}/${editedAsset}`, s => s + '\n');
  const build = run(r, 'scripts/build.mjs');
  assert.equal(build.status, 0, build.stderr);
  assert.equal(read(r, `${CORE}/manifest.json`), before);
  const check = run(r, 'scripts/check.mjs');
  assert.equal(check.status, 1);
  assert.equal(check.stderr.trim(), `FAIL SOURCE_HASH:${editedAsset}`);
}));

test('Explicit rehash repairs only the named digest and regenerates before check', () => fixture(r => {
  const before = manifest(r);
  change(r, `${CORE}/${editedAsset}`, s => s + '\n');
  const failing = run(r, 'scripts/check.mjs');
  assert.equal(failing.status, 1);
  assert.ok(failing.stderr.includes(`SOURCE_HASH:${editedAsset}`));
  const asset = before.assets.find(a => a.path === editedAsset);
  const old = asset.sha256;
  asset.sha256 = digest(read(r, `${CORE}/${editedAsset}`));
  const build = run(r, 'scripts/build.mjs', '--rehash', editedAsset);
  assert.equal(build.status, 0, build.stderr);
  assert.equal(build.stdout.split('\n')[0], `REHASHED ${editedAsset} ${old.slice(0, 12)} -> ${asset.sha256.slice(0, 12)}`);
  assert.equal(read(r, `${CORE}/manifest.json`), JSON.stringify(before, null, 2) + '\n');
  const check = run(r, 'scripts/check.mjs');
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /^PASS /);
  const unchanged = read(r, `${CORE}/manifest.json`);
  const repeat = run(r, 'scripts/build.mjs', '--rehash', editedAsset);
  assert.equal(repeat.status, 0, repeat.stderr);
  assert.equal(repeat.stdout.split('\n')[0], `UNCHANGED ${editedAsset}`);
  assert.equal(read(r, `${CORE}/manifest.json`), unchanged);
}));

test('Explicit rehash accepts multiple named assets and leaves other entries untouched', () => fixture(r => {
  const names = [editedAsset, 'checklists/build.md'];
  const expected = manifest(r);
  for (const name of names) {
    change(r, `${CORE}/${name}`, s => s + '\n');
    expected.assets.find(a => a.path === name).sha256 = digest(read(r, `${CORE}/${name}`));
  }
  const build = run(r, 'scripts/build.mjs', '--rehash', ...names);
  assert.equal(build.status, 0, build.stderr);
  assert.equal(build.stdout.split('\n').filter(s => s.startsWith('REHASHED ')).length, names.length);
  assert.equal(read(r, `${CORE}/manifest.json`), JSON.stringify(expected, null, 2) + '\n');
  const check = run(r, 'scripts/check.mjs');
  assert.equal(check.status, 0, check.stderr);
}));

for (const name of ['unknown.md', 'manifest.json', ARCHIVE, null]) {
  test(`Rehash refuses ${name ?? 'an empty list'} without writing`, () => fixture(r => {
    change(r, `${CORE}/${editedAsset}`, s => s + '\n');
    const snapshot = () => files(r).map(path => [path, read(r, path)]);
    const before = snapshot();
    // Also put a valid edited asset first to catch partial writes before refusal.
    for (const args of name === null ? [[]] : [[name], [editedAsset, name]]) {
      const build = run(r, 'scripts/build.mjs', '--rehash', ...args);
      assert.notEqual(build.status, null, build.error?.message);
      assert.notEqual(build.status, 0, build.stdout);
      assert.ok(build.stderr.includes(name ?? '--rehash'), build.stderr);
      assert.equal(build.stdout, '');
      assert.deepEqual(snapshot(), before);
    }
  }));
}

test('Published package ships runtime files and excludes only GIFs served by raw URLs, with no lifecycle hook', () => {
  const p = JSON.parse(read(root, 'package.json'));
  assert.equal(p.private, undefined);
  assert.equal(p.bin['website-build-skill'], 'bin/website-build-skill.mjs');
  assert.doesNotMatch(read(root, p.bin['website-build-skill']), /UNAVAILABLE/);
  // Four of these run on a stranger's machine before they have read anything; the other two
  // run at publish time and could change the bytes after the trial that approved them.
  for (const hook of ['preinstall', 'install', 'postinstall', 'prepare', 'prepublishOnly', 'prepack']) assert.equal(p.scripts[hook], undefined, hook);
  // The tarball carries runtime files; only the GIFs served by raw URLs are excluded.
  // Other negations can empty runtime paths even when those paths are still listed.
  const published = p.files.map(entry => entry.replace(/\/+$/, ''));
  assert.deepEqual(published.filter(entry => entry.startsWith('!')), ['!docs/*.gif']);
  for (const needed of ['bin', 'src', 'skills', 'docs', 'README.md', 'LICENSE']) assert.ok(published.includes(needed), needed);
  // The engine floor is a claim about runtimes, so it is one continuous integration runs.
  const floor = p.engines.node.match(/(\d+)/)[1];
  const matrix = JSON.parse(read(root, '.github/workflows/check.yml')).jobs.checks.strategy.matrix.node;
  assert.ok(matrix.some(version => String(version).split('.')[0] === floor), `node ${floor} is not in the check matrix`);
});

test('Installer entry point rejects EOF without writing', () => {
  const parent = resolve(root, '.test-work');
  mkdirSync(parent, { recursive: true });
  const dir = mkdtempSync(resolve(parent, 'entrypoint-'));
  try {
    const result = spawnSync(process.execPath, ['bin/website-build-skill.mjs', '--dir', dir], { cwd: root, input: '', encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /EOF/);
    assert.deepEqual(readdirSync(dir), []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Archive stays byte-identical and generated roles appear exactly once', () => {
  assert.equal(digest(read(root, `${CORE}/${ARCHIVE}`)), ARCHIVE_SHA);
  const first = generated(root), second = generated(root);
  assert.deepEqual(first, second);
  for (const role of manifest(root).roleOrder) {
    const marker = `<!-- BEGIN SOURCE: roles/${role}.md -->`;
    assert.equal(first['docs/bundles/team.md'].split(marker).length, 2);
  }
  assert.ok(!first['docs/bundles/prompts.md'].includes(`BEGIN SOURCE: ${ARCHIVE}`));
});

test('Planned distribution: fresh npm tarball and ZIP installation on each claimed operating system and host', { skip: 'needs a live host: manual gate in docs/evaluation/host-gate.md' }, () => {});
