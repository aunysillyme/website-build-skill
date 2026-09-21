import { check } from '../src/validate.mjs';

try {
  const issues = check(process.cwd());
  for (const issue of issues) console.error(`FAIL ${issue}`);
  if (issues.length) process.exitCode = 1;
  else console.log('PASS repository floor, manifest, links, source hashes, bundle drift, archive, privacy, install labels, workflow security and claim review');
} catch (error) {
  console.error(`FAIL CHECK_INPUT:${error.message}`);
  process.exitCode = 1;
}
