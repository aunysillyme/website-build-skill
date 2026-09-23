import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function demo(options = {}) {
  const source = path.join(root, 'scripts/record-demo.sh');
  assert.ok(fs.existsSync(source), 'record-demo.sh exists');
  fs.mkdirSync(path.join(root, '.test-work'), { recursive: true });
  const trial = fs.mkdtempSync(path.join(root, '.test-work/demo-test-'));
  try {
    for (const dir of ['scripts', 'docs', 'stubs']) fs.mkdirSync(path.join(trial, dir));
    fs.writeFileSync(path.join(trial, 'stubs/package.json'), JSON.stringify({ type: 'commonjs' }));
    fs.copyFileSync(source, path.join(trial, 'scripts/record-demo.sh'));
    const stub = (name, body) => fs.writeFileSync(path.join(trial, 'stubs', name), `#!${process.execPath}\n${body}`, { mode: 0o755 });
    stub('npx', `const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.DEMO_TEST_CALLS, JSON.stringify({ name: 'npx', args, cwd: process.cwd() }) + '\\n');
if (process.env.DEMO_TEST_INSTALL_FAIL && !args.includes('--dry-run')) process.exit(3);
const result = spawnSync(process.execPath, [process.env.DEMO_TEST_CLI, ...args.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);`);
    stub('asciinema', `const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.DEMO_TEST_CALLS, JSON.stringify({ name: 'asciinema', args }) + '\\n');
const result = spawnSync('/bin/sh', ['-c', args[args.indexOf('--command') + 1]], { encoding: 'utf8' });
fs.writeFileSync(args.at(-1), result.stdout);
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exit(args.includes('--return') ? result.status ?? 1 : 0);`);
    stub('agg', `const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.DEMO_TEST_CALLS, JSON.stringify({ name: 'agg', args }) + '\\n');
if (process.env.DEMO_TEST_RENDER_FAIL) process.exit(7);
fs.copyFileSync(args.at(-2), args.at(-1));`);
    const calls = path.join(trial, 'calls.jsonl');
    const result = spawnSync('bash', ['scripts/record-demo.sh'], {
      cwd: trial, encoding: 'utf8', env: {
        ...process.env, PATH: `${path.join(trial, 'stubs')}:${process.env.PATH}`,
        DEMO_TEST_CALLS: calls, DEMO_TEST_CLI: path.join(root, 'bin/website-build-skill.mjs'),
        DEMO_TEST_INSTALL_FAIL: options.installFail ? '1' : '',
        DEMO_TEST_RENDER_FAIL: options.renderFail ? '1' : '',
      },
    });
    return {
      ...result,
      calls: fs.existsSync(calls) ? fs.readFileSync(calls, 'utf8').trim().split('\n').map(JSON.parse) : [],
      scratch: fs.existsSync(path.join(trial, '.test-work')) ? fs.readdirSync(path.join(trial, '.test-work')) : [],
      rendered: fs.existsSync(path.join(trial, 'docs/demo.gif')) ? fs.readFileSync(path.join(trial, 'docs/demo.gif'), 'utf8') : null,
    };
  } finally { fs.rmSync(trial, { recursive: true, force: true }); }
}

test('Demo records the published package dry run, install and verified receipt, then cleans scratch', () => {
  const result = demo();
  assert.equal(result.status, 0, result.stderr);
  const installs = result.calls.filter(call => call.name === 'npx');
  assert.equal(installs.length, 2);
  assert.deepEqual(installs[0].args, ['--yes', 'website-build-skill@latest', '--solo', '--target', 'codex', '--dir', './project', '--dry-run', '--yes']);
  assert.deepEqual(installs[1].args, ['--yes', 'website-build-skill@latest', '--solo', '--target', 'codex', '--dir', './project', '--yes']);
  assert.match(installs[0].cwd, /\.test-work\/record-demo-/);
  assert.deepEqual(result.calls.map(call => call.name), ['asciinema', 'npx', 'npx', 'agg']);
  assert.match(result.rendered, /Receipt: project\/\.agents\/skills\/website-build-skill\/\.website-build-skill-receipt\.json/);
  assert.match(result.rendered, /Mode: solo; target: codex; scope: project/);
  assert.match(result.rendered, /Read-back verified: \d+ files/);
  assert.ok(!result.rendered.includes(root), 'recording omits the local checkout path');
  assert.deepEqual(result.scratch, []);
});

test('Demo propagates install failure, skips rendering and cleans scratch', () => {
  const result = demo({ installFail: true });
  assert.equal(result.status, 3, result.stderr);
  assert.deepEqual(result.calls.map(call => call.name), ['asciinema', 'npx', 'npx']);
  assert.equal(result.rendered, null);
  assert.deepEqual(result.scratch, []);
});

test('Demo propagates renderer failure and cleans scratch', () => {
  const result = demo({ renderFail: true });
  assert.equal(result.status, 7, result.stderr);
  assert.equal(result.rendered, null);
  assert.deepEqual(result.scratch, []);
});
