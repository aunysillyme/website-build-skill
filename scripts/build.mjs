import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { CORE, ARCHIVE, digest, manifest, generated, owned } from '../src/bundle.mjs';

const root = process.cwd();
const args = process.argv.slice(2);
if (args.length) {
  try {
    if (args[0] !== '--rehash' || args.length < 2) throw Error('usage: node scripts/build.mjs --rehash <asset-path> [<asset-path> ...]');
    const m = manifest(root);
    // Resolve and hash the whole request before changing any bytes.
    const updates = [...new Set(args.slice(1))].map(path => {
      if (path === 'manifest.json' || path === ARCHIVE) throw Error(`cannot rehash protected asset: ${path}`);
      const asset = m.assets.find(a => a.path === path);
      if (!asset) throw Error(`unknown manifest asset: ${path}`);
      return [asset, digest(readFileSync(owned(root, `${CORE}/${path}`)))];
    });
    const messages = updates.map(([asset, sha256]) => {
      if (asset.sha256 === sha256) return `UNCHANGED ${asset.path}`;
      const old = asset.sha256;
      asset.sha256 = sha256;
      return `REHASHED ${asset.path} ${old.slice(0, 12)} -> ${sha256.slice(0, 12)}`;
    });
    if (messages.some(line => line.startsWith('REHASHED '))) writeFileSync(owned(root, `${CORE}/manifest.json`), JSON.stringify(m, null, 2) + '\n');
    for (const message of messages) console.log(message);
  } catch (error) {
    console.error(`FAIL REHASH:${error.message}`);
    process.exit(1);
  }
}
const output = generated(root);
// Preflight every target before creating any output directory.
const targets = Object.entries(output).map(([name, body]) => [name, owned(root, name, false), body]);
for (const [name, target, body] of targets) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, body);
  console.log(`GENERATED ${name}`);
}
