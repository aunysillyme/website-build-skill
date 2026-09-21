import { test } from 'node:test';
import assert from 'node:assert/strict';
import { privacyIssues } from '../src/validate.mjs';
import { fixture, change, candidateCheck as check } from './helpers.mjs';

test('RED01 private machine path in published text', () => fixture(r => {
  change(r, 'README.md', s => s + '\n' + ['/', 'Users', '/synthetic/project'].join('') + '\n');
  assert.ok(check(r).some(s => s.startsWith('PRIVACY:README.md:')));
}));

test('RED02 private issue URL and identifier, case insensitive', () => {
  for (const value of [['linear', '.app'].join(''), ['A', 'UN-', '123'].join('')]) fixture(r => {
    change(r, 'README.md', s => s + '\n' + value.toLowerCase() + '\n');
    assert.ok(check(r).some(s => s.startsWith('PRIVACY:README.md:')));
  });
});

test('Allowing a repository URL never exempts adjacent private text', () => {
  const url = 'https://github.com/' + ['au', 'ny', 'sillyme'].join('') + '/website-build-skill';
  assert.deepEqual(privacyIssues('README.md', url), []);
  assert.ok(privacyIssues('README.md', url + ' ' + ['/', 'Users', '/synthetic'].join('')).length);
});

test('The npm repository shorthand is exempt in one spelling only', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  assert.deepEqual(privacyIssues('README.md', `npx github:${owner}/website-build-skill --version`), []);
  assert.ok(privacyIssues('README.md', `npx github:${owner}/another-repo`).length, 'another repository under the same account must fail');
  assert.ok(privacyIssues('README.md', `npx github:${owner}-personal/website-build-skill`).length, 'a different account must fail');
  assert.ok(privacyIssues('README.md', `see ${owner} for details`).length, 'the bare handle still fails');
});

test('License exception is exact; arbitrary authorship elsewhere fails', () => {
  const line = 'Copyright (c) 2026 ' + ['Au', 'ny'].join('');
  assert.deepEqual(privacyIssues('LICENSE', line), []);
  assert.ok(privacyIssues('README.md', line).length);
});
