// The maintainer scripts run TypeScript directly through `node --experimental-strip-types`.
// That flag was added in Node 22.6.0; every earlier release, Node 20 and Node 22.0 through
// 22.5 alike, rejects it with `bad option`, which says nothing about the real requirement.
// The version is checked here first so the failure names the runtime the scripts need.
// Nothing a consumer of the method files does requires Node at all.
export const REQUIRED_NODE = '22.6.0';
const [wantMajor, wantMinor] = REQUIRED_NODE.split('.').map(Number);
const [major, minor] = process.versions.node.split('.').map(Number);
const supported = Number.isInteger(major) && Number.isInteger(minor)
  && (major > wantMajor || (major === wantMajor && minor >= wantMinor));
if (!supported) {
  console.error(`FAIL NODE_VERSION: maintainer scripts need Node ${REQUIRED_NODE} or newer, the release that added --experimental-strip-types; this is Node v${process.versions.node}.`);
  console.error('Install Node 22.6.0 or newer, then rerun. Continuous integration pins 22.22.3.');
  process.exit(1);
}
