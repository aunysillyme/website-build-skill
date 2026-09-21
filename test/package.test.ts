import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { CORE, ARCHIVE, ARCHIVE_SHA, read, digest, generated, manifest } from '../src/bundle.ts';
import { root } from './helpers.ts';

test('Maintainer package is private with no bin or lifecycle hook', () => {
  const p = JSON.parse(read(root, 'package.json'));
  assert.equal(p.private, true); assert.equal(p.bin, undefined);
  assert.equal(p.scripts.install, undefined); assert.equal(p.scripts.postinstall, undefined);
});

test('Unavailable distribution sentinel reports failure', () => {
  const result = spawnSync(process.execPath, ['bin/website-build-skill.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 2); assert.match(result.stderr, /UNAVAILABLE/);
});

// The runtime this repository actually runs on cannot reproduce the old failure, so the
// version is stubbed and the guard is executed for real. A guard nobody has seen go red
// is a guess about what an older Node would print.
test('Maintainer runtime guard refuses every runtime without the flag', () => {
  const stub = version => `Object.defineProperty(process, 'versions', { value: { ...process.versions, node: '${version}' }, configurable: true }); await import('./scripts/node-version.mjs');`;
  // 22.0 through 22.5 are the versions a major-only comparison waved through: the flag
  // landed in 22.6.0, so both boundary sides are asserted, not just Node 20.
  for (const version of ['20.19.2', '22.0.0', '22.5.9', 'not.a.version']) {
    const refused = spawnSync(process.execPath, ['--input-type=module', '-e', stub(version)], { cwd: root, encoding: 'utf8' });
    assert.equal(refused.status, 1, `expected ${version} to be refused`);
    assert.match(refused.stderr, /FAIL NODE_VERSION: maintainer scripts need Node 22\.6\.0 or newer/);
    assert.match(refused.stderr, new RegExp(`this is Node v${version.replaceAll('.', '\\.')}`));
  }
  for (const version of ['22.6.0', '23.4.1']) {
    const allowed = spawnSync(process.execPath, ['--input-type=module', '-e', stub(version)], { cwd: root, encoding: 'utf8' });
    assert.equal(allowed.status, 0, `expected ${version} to be accepted`);
    assert.equal(allowed.stderr, '');
  }
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

test.todo('Planned distribution: fresh npm tarball and ZIP installation on each claimed operating system and host');
