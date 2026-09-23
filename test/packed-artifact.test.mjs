import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { files, digest } from '../src/bundle.mjs';
import { linkIssues } from '../src/validate.mjs';

test('Actual npm tarball preserves documentation links and installs from its own bytes', () => {
  const parent = resolve('.test-work');
  mkdirSync(parent, { recursive: true });
  const trial = mkdtempSync(resolve(parent, 'packed-'));
  const run = (command, args, cwd = process.cwd()) => {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout);
    return result.stdout;
  };
  try {
    const [packed] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', trial]));
    run('tar', ['-xzf', resolve(trial, packed.filename), '-C', trial]);
    const artifact = resolve(trial, 'package');
    const issues = files(artifact).filter(name => name.endsWith('.md') || name === 'llms.txt')
      .flatMap(name => linkIssues(artifact, name, readFileSync(resolve(artifact, name), 'utf8')));
    assert.deepEqual(issues, [], 'links must resolve inside the distributed artifact');

    // A checkout-only link check would miss this defect. Exercise the packed tree itself.
    unlinkSync(resolve(artifact, 'CONTRIBUTING.md'));
    assert.ok(linkIssues(artifact, 'README.md', readFileSync(resolve(artifact, 'README.md'), 'utf8'))
      .some(issue => issue.includes('CONTRIBUTING.md')));

    const project = resolve(trial, 'consumer');
    mkdirSync(project);
    const bin = resolve(artifact, 'bin/website-build-skill.mjs');
    run(process.execPath, [bin, '--solo', '--target', 'codex', '--dir', project, '--yes'], project);
    const destination = resolve(project, '.agents/skills/website-build-skill');
    const receipt = JSON.parse(readFileSync(resolve(destination, '.website-build-skill-receipt.json')));
    for (const entry of receipt.files) assert.equal(digest(readFileSync(entry.path)), entry.sha256);
    run(process.execPath, [bin, '--uninstall', '--target', 'codex', '--dir', project], project);
    assert.deepEqual(files(destination), []);
  } finally {
    rmSync(trial, { recursive: true, force: true });
  }
});
