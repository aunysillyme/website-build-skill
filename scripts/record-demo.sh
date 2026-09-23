#!/usr/bin/env bash
# Run manually after release preparation. Requires network, npx, asciinema and agg.
# Records the published package in a temporary project and writes docs/demo.gif.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
for tool in node npx asciinema agg; do
  command -v "$tool" >/dev/null || { printf 'Required tool: %s\n' "$tool" >&2; exit 1; }
done
mkdir -p "$repo_root/.test-work"
demo_work="$(mktemp -d "$repo_root/.test-work/record-demo-XXXXXX")"
trap 'rm -rf "$demo_work"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
export WEBSITE_BUILD_DEMO_WORK="$demo_work"

cat > "$demo_work/session.sh" <<'SESSION'
#!/usr/bin/env bash
set -euo pipefail
cd "$WEBSITE_BUILD_DEMO_WORK"
mkdir project

run_install() {
  printf '\n$ npx --yes website-build-skill@latest'
  printf ' %s' "$@"
  printf '\n'
  local result=0
  npx --yes website-build-skill@latest "$@" > command.log 2>&1 || result=$?
  # Display real command output while keeping the recording portable.
  node --input-type=module - <<'DISPLAY'
import fs from 'node:fs';
const output = fs.readFileSync('command.log', 'utf8');
process.stdout.write(output.split(process.cwd()).join('<demo>'));
DISPLAY
  return "$result"
}

run_install --solo --target codex --dir ./project --dry-run --yes
run_install --solo --target codex --dir ./project --yes
printf '\n$ Read and verify the install receipt\n'
node --input-type=module - <<'RECEIPT'
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const name = 'project/.agents/skills/website-build-skill/.website-build-skill-receipt.json';
const receipt = JSON.parse(fs.readFileSync(name, 'utf8'));
const destination = path.resolve(path.dirname(name));
if (receipt.package?.name !== 'website-build-skill' || receipt.mode !== 'solo' || receipt.target !== 'codex' || receipt.scope !== 'project' || !Array.isArray(receipt.files) || !receipt.files.length) throw Error('Unexpected install receipt');
for (const file of receipt.files) {
  const relative = path.relative(destination, file.path);
  if (!relative || relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) throw Error('Receipt path leaves the demo project');
  const digest = createHash('sha256').update(fs.readFileSync(file.path)).digest('hex');
  if (digest !== file.sha256) throw Error(`Read-back differs: ${relative}`);
}
console.log(`Package: ${receipt.package.name}@${receipt.package.version}`);
console.log(`Mode: ${receipt.mode}; target: ${receipt.target}; scope: ${receipt.scope}`);
console.log(`Read-back verified: ${receipt.files.length} files`);
console.log(`Receipt: ${name}`);
RECEIPT
SESSION

asciinema rec --return --output-format asciicast-v2 --window-size 100x28 \
  --idle-time-limit 1 --title 'website-build-skill: preview, install, receipt' \
  --command 'bash "$WEBSITE_BUILD_DEMO_WORK/session.sh"' "$demo_work/demo.cast"
agg --theme github-dark --idle-time-limit 1 --last-frame-duration 4 \
  "$demo_work/demo.cast" "$demo_work/demo.gif"
mv "$demo_work/demo.gif" "$repo_root/docs/demo.gif"
printf 'Recorded docs/demo.gif\n'
