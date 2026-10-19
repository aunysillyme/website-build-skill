import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--root' || !args[1] || args[1].startsWith('--'))) {
    throw Error('Usage: node scripts/check-set.mjs [--root <dir>]');
  }
  const root = args.length ? resolve(args[1]) : fileURLToPath(new URL('..', import.meta.url));
  const inputs = new Map(['README.md', 'llms.txt', 'package.json', '.repo-build/render-set.mjs',
    '.repo-build/set.json', '.repo-build/set.lock.json'].map(file => [file, readFileSync(resolve(root, file))]));
  const lock = JSON.parse(inputs.get('.repo-build/set.lock.json').toString('utf8'));
  for (const key of ['renderer_sha256', 'vendored_sha256']) {
    if (!/^[a-f0-9]{64}$/.test(lock[key])) throw Error(`Invalid .repo-build/set.lock.json: ${key}`);
  }
  let rendered, renderError;
  try {
    const { renderSet } = await import('../.repo-build/render-set.mjs');
    rendered = renderSet({ root, check: true });
  } catch (error) { renderError = error; }
  const drift = new Set(rendered?.changed);
  for (const [file, key] of [['.repo-build/render-set.mjs', 'renderer_sha256'], ['.repo-build/set.json', 'vendored_sha256']]) {
    if (createHash('sha256').update(inputs.get(file)).digest('hex') !== lock[key]) drift.add(file);
  }
  if (renderError && !drift.size) throw renderError;
  if (drift.size) {
    for (const file of drift) console.error(`SET_DRIFT: ${file}: maintainer-run npx repo-build-skill@0.1.1 set sync outside CI, then commit the result.`);
    process.exitCode = 1;
  } else console.log('Set blocks and pinned hashes match.');
} catch (error) {
  console.error(`SET_ERROR: ${error.message}`);
  process.exitCode = 2;
}
