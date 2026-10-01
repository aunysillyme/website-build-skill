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

test('Sponsors control allows the exact public funding URL and keeps adjacent text private', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  const url = ['https://github.com', 'sponsors', owner].join('/');
  assert.deepEqual(privacyIssues('package.json', JSON.stringify({ funding: url })), []);
  assert.deepEqual(privacyIssues('RELEASING.md', `Funding: ${url}`), []);
  assert.ok(privacyIssues('README.md', `${url} ${owner}`).length, 'adjacent private text must fail');
});

test('RED Sponsors allowance rejects a different handle or any extended URL', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  const other = ['someone', 'else'].join('');
  for (const handle of [other, `${owner}-personal`, `${owner}/private`, `${owner}?private`, `${owner}#private`]) {
    assert.ok(privacyIssues('package.json', JSON.stringify({ funding: ['https://github.com', 'sponsors', handle].join('/') })).length, handle);
  }
});

test('Sponsors allowance tolerates trailing sentence punctuation and nothing else', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  const url = ['https://github.com', 'sponsors', owner].join('/');
  for (const tail of ['.', ',', ';', ':', ']', '>', '*', '.*', '**']) {
    assert.deepEqual(privacyIssues('RELEASING.md', `Funding: ${url}${tail}`), [], `tail ${tail}`);
  }
  for (const bad of [`${url}-personal.`, `${url}/private.`, `${url}?private.`, `${url}#private.`, `${url}.private`, `${url}.`.replace(owner, 'someone' + 'else')]) {
    assert.ok(privacyIssues('RELEASING.md', bad).length, bad);
  }
  assert.ok(privacyIssues('RELEASING.md', `${url}. ${owner}`).length, 'adjacent private text after punctuation must fail');
});

test('Sibling links allow exactly the two related repositories and preserve privacy boundaries', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  for (const repo of ['agent-personalizer', 'model-orchestrator']) {
    for (const prefix of ['https://github.com/', 'https://raw.githubusercontent.com/', 'github:']) {
      assert.deepEqual(privacyIssues('README.md', `${prefix}${owner}/${repo}`), [], `${prefix}${repo}`);
      for (const suffix of ['-private', '_private', '.private']) {
        assert.ok(privacyIssues('README.md', `${prefix}${owner}/${repo}${suffix}`).length, suffix);
      }
      assert.ok(privacyIssues('README.md', `${prefix}${owner}/${repo} ${owner}`).length, 'adjacent private text');
    }
  }
  assert.ok(privacyIssues('README.md', `npx github:${owner}/another-repo`).length, 'third repository must fail');
  assert.ok(privacyIssues('README.md', `https://github.com/${owner}/another-repo`).length, 'third repository URL must fail');
});

test('Sibling exemption lookahead matches the self-repo one: a sentence-ending period is allowed', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  assert.deepEqual(privacyIssues('README.md', `See https://github.com/${owner}/agent-personalizer.`), []);
  assert.ok(privacyIssues('README.md', `See https://github.com/${owner}/another-repo.`).length, 'a third repository name must still fail with a trailing period');
});

test('License exception is exact; arbitrary authorship elsewhere fails', () => {
  const name = ['Au', 'ny'].join('');
  const line = `Copyright (c) 2026 ${name} LLC and contributors`;
  assert.deepEqual(privacyIssues('LICENSE', line), []);
  assert.ok(privacyIssues('README.md', line).length);
  assert.ok(privacyIssues('LICENSE', line.replace(`${name} LLC`, `${name} Other LLC`)).length);
  assert.ok(privacyIssues('LICENSE', `Copyright (c) 2026 ${name}`).length, 'old notice fails');
  assert.ok(privacyIssues('LICENSE', line + ' extra').length, 'extra text fails');
});

test('CLA legal names are exact and scoped to the agreement', () => {
  const name = ['Au', 'ny'].join('');
  for (const value of [name, `${name} LLC`, `${name}SillyMe`]) {
    assert.deepEqual(privacyIssues('CLA.md', `Names: "${value}".`), []);
    for (const file of ['README.md', 'docs/CLA.md', 'CONTRIBUTING.md', 'CHANGELOG.md']) {
      assert.ok(privacyIssues(file, value).length, `${file}: bare legal name fails`);
    }
    for (const suffix of ['Other', '-private', '_private']) {
      assert.ok(privacyIssues('CLA.md', value + suffix).length, 'longer name fails');
    }
  }
  assert.ok(privacyIssues('CLA.md', name.toLowerCase()).length, 'different case fails');
  assert.ok(privacyIssues('CLA.md', `${name} LLC ${['/', 'Users', '/private'].join('')}`).length, 'adjacent private data fails');
});

test('Contributor and changelog legal notices allow only the approved full line', () => {
  const company = ['Au', 'ny LLC'].join('');
  const notices = {
    'CONTRIBUTING.md': `You keep the copyright in what you wrote and grant ${company} the licenses in [CLA.md](CLA.md).`,
    'CHANGELOG.md': `- LICENSE names ${company} as copyright holder; outside contributions now require the CLA in CLA.md.`,
  };
  for (const [file, line] of Object.entries(notices)) {
    assert.deepEqual(privacyIssues(file, line), []);
    assert.ok(privacyIssues('README.md', line).length, 'different file fails');
    assert.ok(privacyIssues(file, line + ' extra').length, 'extra text fails');
    assert.ok(privacyIssues(file, line.replace(company, company + ' Other')).length, 'different name fails');
  }
});
