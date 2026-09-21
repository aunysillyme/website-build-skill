// Planned CLI contract: validate mode, target, scope and explicit destination before writes.
// This sentinel cannot install and is deliberately absent from package bin metadata.
export function main() {
  return { code: 2, message: 'UNAVAILABLE: npm installer is planned. Read docs/INSTALLER.md for manual setup.' };
}
