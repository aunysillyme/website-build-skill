import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { generated, owned } from '../src/bundle.mjs';

const root = process.cwd();
const output = generated(root);
// Preflight every target before creating any output directory.
const targets = Object.entries(output).map(([name, body]) => [name, owned(root, name, false), body]);
for (const [name, target, body] of targets) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, body);
  console.log(`GENERATED ${name}`);
}
