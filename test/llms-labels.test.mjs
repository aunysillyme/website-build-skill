import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, generated } from '../src/bundle.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const entries = readFileSync(new URL('../llms.txt', import.meta.url), 'utf8')
  .split('\n').filter(line => /^- \[.+\]\(.+\): /.test(line));

test('llms.txt labels name what each asset teaches', () => {
  assert.ok(entries.length > 10, 'catalog entries found');
  for (const line of entries) {
    const label = line.replace(/^- \[[^\]]+\]\([^)]+\): /, '');
    assert.doesNotMatch(label, /:\s*$/, `label ends in a colon: ${line}`);
    assert.doesNotMatch(label, /^(manifest|prompt|playbook|checklist|role|reference)$/, `bare asset kind as label: ${line}`);
  }
});

test('describe() gives the manifest a real label and drops a trailing colon', () => {
  const manifest = describe(root, { path: 'manifest.json', kind: 'manifest' });
  assert.notEqual(manifest, 'manifest');
  assert.match(manifest, /^Index of all \d+ skill assets/);
  const research = describe(root, { path: 'prompts/01-website-deep-research.md', kind: 'prompt' });
  assert.doesNotMatch(research, /:$/);
});

test('Generated sibling links keep the README descriptions and absolute URLs', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  const rows = [...readme.matchAll(/^\| \[(agent-personalizer|model-orchestrator)\]\((https:\/\/github\.com\/[^)]+)\) \| (.+) \|$/gm)];
  assert.equal(rows.length, 2, 'both sibling rows exist');
  const index = generated(root)['llms.txt'];
  assert.ok(index.includes('## Part of a set\n'));
  for (const [, name, url, description] of rows) {
    assert.ok(index.includes(`- [${name}](${url}): ${description}`), name);
  }
});
