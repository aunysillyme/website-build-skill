import { CORE, read } from './bundle.ts';

// Content accessor only. Interactive installation is planned and unavailable.
export function installQuestion(root) {
  return read(root, `${CORE}/templates/install-choice.txt`);
}
