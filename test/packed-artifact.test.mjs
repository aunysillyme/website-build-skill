import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, existsSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { resolve, dirname, delimiter, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { files, digest } from '../src/bundle.mjs';
import { linkIssues } from '../src/validate.mjs';

test('Actual npm tarball preserves documentation links and installs from its own bytes', () => {
  const trial = realpathSync(mkdtempSync(resolve(tmpdir(), 'website-packed-')));
  const run = (command, args, cwd = process.cwd()) => {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 60000,
      env: { ...process.env, npm_config_cache: resolve(trial, 'npm-cache') } });
    assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout);
    return result.stdout;
  };
  try {
    // npm 10 and 11 print an array; npm 12 prints an object keyed by package name.
    // Invoke npm's JavaScript entrypoint so Windows needs no shell quoting or .cmd spawn.
    const npm = process.env.npm_execpath || (process.env.PATH || '').split(delimiter)
      .map(dir => process.platform === 'win32'
        ? resolve(dir, 'node_modules/npm/bin/npm-cli.js') : resolve(dir, 'npm'))
      .find(path => existsSync(path));
    assert.ok(npm, 'npm entrypoint must be available');
    const npmRun = (args, cwd) => run(process.execPath, [realpathSync(npm), ...args], cwd);
    const report = JSON.parse(npmRun(['pack', '--json', '--ignore-scripts', '--pack-destination', trial]));
    const [packed] = Array.isArray(report) ? report : Object.values(report);
    run('tar', ['-xzf', resolve(trial, packed.filename), '-C', trial]);
    const artifact = resolve(trial, 'package');
    const issues = files(artifact).filter(name => name.endsWith('.md') || name === 'llms.txt')
      .flatMap(name => linkIssues(artifact, name, readFileSync(resolve(artifact, name), 'utf8')));
    assert.deepEqual(issues, [], 'links must resolve inside the distributed artifact');

    // A checkout-only link check would miss this defect. Exercise the packed tree itself.
    unlinkSync(resolve(artifact, 'CONTRIBUTING.md'));
    assert.ok(linkIssues(artifact, 'README.md', readFileSync(resolve(artifact, 'README.md'), 'utf8'))
      .some(issue => issue.includes('CONTRIBUTING.md')));

    const consumer = resolve(trial, 'consumer');
    mkdirSync(consumer);
    writeFileSync(resolve(consumer, 'package.json'), '{"name":"packed-consumer","private":true}\n');
    npmRun(['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund',
      '--package-lock=false', resolve(trial, packed.filename)], consumer);
    const require = createRequire(resolve(consumer, 'package.json'));
    const installed = dirname(require.resolve('website-build-skill/package.json'));
    const metadata = JSON.parse(readFileSync(resolve(installed, 'package.json'), 'utf8'));
    const bin = realpathSync(resolve(installed, metadata.bin['website-build-skill']));
    const assertConsumerBin = candidate => {
      assert.ok(realpathSync(candidate).startsWith(realpathSync(resolve(consumer, 'node_modules')) + sep),
        'installed bin must resolve inside the consumer node_modules');
      assert.notEqual(realpathSync(candidate), realpathSync(resolve('bin/website-build-skill.mjs')),
        'installed bin must not resolve to the source checkout');
    };
    assert.throws(() => assertConsumerBin(resolve('bin/website-build-skill.mjs')), /consumer node_modules/);
    assertConsumerBin(bin);
    assert.ok(existsSync(resolve(consumer, 'node_modules/.bin',
      process.platform === 'win32' ? 'website-build-skill.cmd' : 'website-build-skill')));

    for (const mode of ['solo', 'team']) {
      const project = resolve(trial, mode);
      mkdirSync(project);
      run(process.execPath, [bin, `--${mode}`, '--target', 'codex', '--dir', project, '--yes'], consumer);
      const destination = resolve(project, '.agents/skills/website-build-skill');
      const expected = files(resolve('skills/website-build-skill'));
      if (mode === 'team') expected.push(...files(process.cwd(), 'docs/bundles')
        .filter(name => name.endsWith('.md')).map(name => name.replace('docs/', '')));
      expected.push('.website-build-skill-receipt.json');
      assert.deepEqual(files(destination).sort(), expected.sort(), `${mode} installed file tree`);
      const receipt = JSON.parse(readFileSync(resolve(destination, '.website-build-skill-receipt.json')));
      assert.equal(receipt.mode, mode);
      for (const entry of receipt.files) assert.equal(digest(readFileSync(entry.path)), entry.sha256);
      for (const name of expected.filter(name => name !== '.website-build-skill-receipt.json')) {
        const source = name.startsWith('bundles/') ? resolve(installed, 'docs', name)
          : resolve(installed, 'skills/website-build-skill', name);
        const checkout = name.startsWith('bundles/') ? resolve('docs', name)
          : resolve('skills/website-build-skill', name);
        assert.deepEqual(readFileSync(source), readFileSync(checkout), `packed ${name}`);
        assert.deepEqual(readFileSync(resolve(destination, name)), readFileSync(source), name);
      }
      run(process.execPath, [bin, '--uninstall', '--target', 'codex', '--dir', project], consumer);
      assert.deepEqual(files(destination), []);
    }
  } finally {
    rmSync(trial, { recursive: true, force: true });
  }
});
