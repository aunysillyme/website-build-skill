import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { files, owned } from '../src/bundle.mjs';
import { check as strictCheck } from '../src/validate.mjs';

export const root = process.cwd();
// The public-identifier policy is resolved and is now the only policy.
// Kept as a named alias so the RED cases read the same as when it was a candidate.
export const candidateCheck = target => strictCheck(target);
export function fixture(run) {
  const target = mkdtempSync(resolve(realpathSync(tmpdir()), 'website-build-case-'));
  try {
    for (const name of files(root)) {
      const dest = resolve(target, name);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, readFileSync(owned(root, name)));
    }
    return run(target);
  } finally { rmSync(target, { recursive: true, force: true }); }
}
export function change(root, name, transform) {
  const path = owned(root, name);
  writeFileSync(path, transform(readFileSync(path, 'utf8')));
}
