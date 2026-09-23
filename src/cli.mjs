import { createInterface } from 'node:readline';
import { install, packageInfo, choiceText } from './install.mjs';
import { targets } from './catalog.mjs';
import { checkLibrary } from './library-check.mjs';

const help = `website-build-skill ${packageInfo.version}
check-library <site-work-dir> (read-only receipt validation)
--solo | --team  --target ${Object.keys(targets).join('|')}
--dir <path>  --scope project|user  --output-dir <path>
--yes  --dry-run  --receipt <path>  --uninstall  --help  --version
--bundle-dir <path> (Hermes TEAM only)
Headless installs require explicit mode, target and --dir.
Activation remains UNVERIFIED.`;

export function parseArgs(args) {
  const request = {};
  const values = { '--target': 'target', '--dir': 'dir', '--scope': 'scope', '--output-dir': 'outputDir', '--receipt': 'receipt', '--bundle-dir': 'bundleDir' };
  const switches = { '--yes': 'yes', '--dry-run': 'dryRun', '--uninstall': 'uninstall', '--help': 'help', '--version': 'version' };
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (seen.has(flag)) throw Error(`Duplicate flag: ${flag}`);
    seen.add(flag);
    if (flag === '--solo' || flag === '--team') {
      if (request.mode) throw Error('--solo and --team are mutually exclusive');
      request.mode = flag.slice(2);
    } else if (Object.hasOwn(values, flag)) {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw Error(`Missing value for ${flag}`);
      request[values[flag]] = value;
    } else if (Object.hasOwn(switches, flag)) request[switches[flag]] = true;
    else throw Error(`Unknown flag: ${flag}`);
  }
  if (request.target !== undefined && !Object.hasOwn(targets, request.target)) throw Error('Unknown target');
  if (request.scope !== undefined && !['project', 'user'].includes(request.scope)) throw Error('Invalid scope');
  if (request.bundleDir !== undefined && (request.mode !== 'team' || request.target !== 'hermes')) throw Error('--bundle-dir requires --team --target hermes');
  return request;
}

export async function main(args = process.argv.slice(2), { input = process.stdin, output = process.stdout } = {}) {
  let request;
  try {
    if (args[0] === 'check-library') {
      if (args.length !== 2 || !args[1] || args[1].startsWith('--')) throw Error('Usage: website-build-skill check-library <site-work-dir>');
      return checkLibrary(args[1]);
    }
    request = parseArgs(args);
    if (request.help) return { code: 0, message: help };
    if (request.version) return { code: 0, message: packageInfo.version };
    if (request.uninstall) {
      if (!request.receipt && (!request.target || !request.dir)) throw Error('Uninstall requires --receipt or --target and --dir');
      return install(request);
    }
    if (request.yes && (!request.mode || !request.target || !request.dir)) throw Error('--yes requires mode, target and --dir; it never prompts');
    if (!request.mode || !request.target) {
      const reader = createInterface({ input, crlfDelay: Infinity });
      const answers = reader[Symbol.asyncIterator]();
      const ask = async text => {
        output.write(text);
        const answer = await answers.next();
        if (answer.done) throw Error('Invalid input: stdin ended before an answer (EOF)');
        return answer.value.trim().toLowerCase();
      };
      try {
        if (!request.mode) {
          const answer = await ask(choiceText());
          request.mode = ({ '1': 'solo', solo: 'solo', '2': 'team', team: 'team' })[answer];
          if (!request.mode) throw Error('Invalid mode answer');
        }
        if (!request.target) {
          request.target = await ask(`Target (${Object.keys(targets).join(', ')}):\n`);
          if (!Object.hasOwn(targets, request.target)) throw Error('Invalid target answer');
        }
      } finally { reader.close(); }
    }
    return install(request);
  } catch (error) { return { code: 2, message: error.message }; }
}
