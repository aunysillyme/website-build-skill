#!/usr/bin/env node
import { main } from '../src/cli.mjs';

const { code, message } = await main();
(code === 2 || code === 3 || code === 4 ? process.stderr : process.stdout).write(`${message}\n`);
process.exitCode = code;
