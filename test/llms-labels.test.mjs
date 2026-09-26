import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe } from '../src/bundle.mjs';

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
