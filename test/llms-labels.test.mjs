import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, generated } from '../src/bundle.mjs';
import { renderBlocks, START, END } from '../.repo-build/render-set.mjs';

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
  const set = JSON.parse(readFileSync(new URL('../.repo-build/set.json', import.meta.url), 'utf8'));
  const blocks = renderBlocks(set, 'website-build-skill');
  const block = text => text.slice(text.indexOf(START), text.indexOf(END) + END.length);
  const index = generated(root)['llms.txt'];
  assert.equal(set.rows.length, 4, 'the shared set has four rows');
  assert.equal(block(index), blocks.llms);
  assert.equal(block(readme), blocks.readme);
  assert.ok(index.includes(blocks.llms + '\n\n## Active sources\n'));
});
