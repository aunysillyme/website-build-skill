const child = require('node:child_process');
const original = child.execFileSync;
child.execFileSync = (command, args, options) => command === 'npm' && args[0] === '--version'
  ? process.env.TEST_NPM_VERSION : original(command, args, options);
