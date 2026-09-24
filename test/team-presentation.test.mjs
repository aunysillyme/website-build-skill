import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read } from '../src/bundle.mjs';
import { root } from './helpers.mjs';

function manualSessions(description) {
  assert.match(description, /you open each session yourself/, 'TEAM description must name who opens each session');
  assert.match(description, /handoffs/, 'TEAM description must name manual handoffs');
  assert.match(description, /[Rr]esearcher.*first/, 'Researcher goes first');
}

const descriptions = [
  ['README.md', /\| \*\*2 · Give me the team[^\n]+/],
  ['README.md', /\*\*Which AI tools[^\n]+/],
  ['README.md', /\*\*Can one AI[^\n]+/],
  ['llms.txt', /^TEAM:[^\n]+/m],
  ['docs/bundles/method.md', /^TEAM:[^\n]+/m],
  ['docs/bundles/prompts.md', /^TEAM:[^\n]+/gm],
  ['docs/bundles/team.md', /^TEAM:[^\n]+/m],
];
for (const [name, pattern] of descriptions) {
  test(`TEAM describes manual sessions and handoffs in ${name} (${pattern.source})`, () => {
    const matches = read(root, name).match(pattern);
    assert.ok(matches, `missing TEAM description in ${name}`);
    if (name === 'docs/bundles/prompts.md') assert.equal(matches.length, 2, 'both setup prompts retain the TEAM description');
    for (const description of matches) manualSessions(description);
  });
}

test('RED: a file-install sentence cannot borrow manual-session wording from another description', () => {
  const row = read(root, 'README.md').match(descriptions[0][1])[0];
  const incomplete = row.replace(/One command[^|]+/, 'One command installs their files. ');
  assert.throws(() => manualSessions(incomplete), /who opens each session/);
});
