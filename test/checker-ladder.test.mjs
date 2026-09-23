import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { files, read } from '../src/bundle.mjs';

test('every skill file mentioning check-library includes the manifest-version npx rung', () => {
  const root = fileURLToPath(new URL('../skills/', import.meta.url));
  const sites = files(root).filter(path => read(root, path).includes('check-library'));
  assert.ok(sites.includes('website-build-skill/checklists/research.md'), 'research gate must be checked');
  const missing = sites.filter(path => !read(root, path).includes(
    'npx -y website-build-skill@<packageVersion> check-library'
  ));
  assert.deepEqual(missing, [], `Missing npx checker rung in:\n${missing.join('\n')}`);
});
