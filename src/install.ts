// Planned interface. No destination is read or written by this module.
// Required future implementation: complete preflight, symlink/traversal rejection,
// no-clobber and idempotent copies, dry-run, truthful receipts and shared ownership.
export function install(_request) {
  throw Error('UNAVAILABLE: installer is planned; use the documented manual copy path.');
}
