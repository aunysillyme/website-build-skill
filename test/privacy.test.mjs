import { test } from 'node:test';
import assert from 'node:assert/strict';
import { privacyIssues } from '../src/validate.mjs';
import { fixture, change, candidateCheck as check } from './helpers.mjs';

test('Public brand names, domains, repositories and profile handles pass in any public file', () => {
  const name = ['Au', 'ny'].join('');
  const owner = ['au', 'ny', 'sillyme'].join('');
  const brand = [
    name,
    name.toLowerCase(),
    owner,
    `@${owner}`,
    `https://website-build-skill.${owner}.dev/`,
    `https://model-orchestrator.${owner}.dev`,
    `${owner}.com`,
    `https://github.com/${owner}/another-repo`,
    `https://x.com/${owner}`,
    `https://instagram.com/${owner}`,
    `https://youtube.com/@${owner}`,
    `https://tiktok.com/@${owner}`,
    `https://npmjs.com/~${owner}`,
    `"homepage": "https://website-build-skill.${owner}.dev/",`,
  ];
  for (const file of ['README.md', 'CLA.md', 'package.json', 'docs/brand.md', '.github/CODEOWNERS']) {
    for (const value of brand) assert.deepEqual(privacyIssues(file, value), [], `${file}: ${value}`);
  }
  for (const value of [name, owner]) assert.deepEqual(privacyIssues(`docs/${value}.md`, 'public note'), []);
});

test('RED public brand allowance still rejects every private-stack class', () => {
  const name = ['Au', 'ny'].join('');
  const owner = ['au', 'ny', 'sillyme'].join('');
  const ticket = ['A', 'UN-', '1419'].join('');
  const linear = ['https://linear', '.app'].join('');
  const workspace = ['au', 'ny', 'space'].join('');
  const users = ['/', 'Users', '/'].join('');
  const vault = ['Vau', 'lts'].join('');
  const blocked = [
    ['vault folder word', vault],
    ['ticket identifier', ticket],
    ['issue domain', linear],
    ['issue URL', `${linear}/${workspace}/issue/${ticket}`],
    ['machine path', `${users}synthetic/project`],
    ['vault note path', `${users}${name.toLowerCase()}/${vault}/${name}/note.md`],
    ['personal mail marker', ['@', 'gmail'].join('')],
    ['personal mail address', ['personal', '@', 'gmail.com'].join('')],
    ['any email address', ['person', '@', 'example.test'].join('')],
    ['brand email address', `${owner}@${owner}.com`],
    ['local product path', ['~/', 'Claude', ' Code', '/website-build-skill'].join('')],
    ['retired package name', ['site', 'builder', 'skill'].join('-')],
  ];
  for (const [label, value] of blocked) {
    assert.deepEqual(privacyIssues('README.md', value), ['PRIVACY:README.md:1'], label);
    assert.deepEqual(privacyIssues('README.md', `@${owner} ${value}`), ['PRIVACY:README.md:1'], `${label} beside brand`);
  }
});

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

test('The npm repository shorthand allows public accounts and repositories', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  assert.deepEqual(privacyIssues('README.md', `npx github:${owner}/website-build-skill --version`), []);
  assert.deepEqual(privacyIssues('README.md', `npx github:${owner}/another-repo`), []);
  assert.deepEqual(privacyIssues('README.md', `npx github:${owner}-personal/website-build-skill`), []);
  assert.deepEqual(privacyIssues('README.md', `see ${owner} for details`), []);
});

test('Public funding URLs and adjacent brand text pass, adjacent private paths fail', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  const url = ['https://github.com', 'sponsors', owner].join('/');
  assert.deepEqual(privacyIssues('package.json', JSON.stringify({ funding: url })), []);
  assert.deepEqual(privacyIssues('RELEASING.md', `Funding: ${url}`), []);
  assert.deepEqual(privacyIssues('README.md', `${url} ${owner}`), []);
  assert.ok(privacyIssues('README.md', `${url} ${['/', 'Users', '/private'].join('')}`).length, 'adjacent private text must fail');
});

test('Public funding URLs allow other accounts, paths, queries and fragments', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  const other = ['someone', 'else'].join('');
  for (const handle of [other, `${owner}-personal`, `${owner}/private`, `${owner}?private`, `${owner}#private`]) {
    assert.deepEqual(privacyIssues('package.json', JSON.stringify({ funding: ['https://github.com', 'sponsors', handle].join('/') })), [], handle);
  }
});

test('Public funding URLs allow sentence punctuation and extended account names', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  const url = ['https://github.com', 'sponsors', owner].join('/');
  for (const tail of ['.', ',', ';', ':', ']', '>', '*', '.*', '**']) {
    assert.deepEqual(privacyIssues('RELEASING.md', `Funding: ${url}${tail}`), [], `tail ${tail}`);
  }
  for (const value of [`${url}-personal.`, `${url}/private.`, `${url}?private.`, `${url}#private.`, `${url}.private`, `${url}.`.replace(owner, 'someone' + 'else')]) {
    assert.deepEqual(privacyIssues('RELEASING.md', value), [], value);
  }
  assert.deepEqual(privacyIssues('RELEASING.md', `${url}. ${owner}`), []);
  assert.ok(privacyIssues('RELEASING.md', `${url}. ${['/', 'Users', '/private'].join('')}`).length, 'adjacent private text after punctuation must fail');
});

test('Public repository links allow related and other repositories while blocking adjacent private paths', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  for (const repo of ['agent-personalizer', 'model-orchestrator']) {
    for (const prefix of ['https://github.com/', 'https://raw.githubusercontent.com/', 'github:']) {
      assert.deepEqual(privacyIssues('README.md', `${prefix}${owner}/${repo}`), [], `${prefix}${repo}`);
      for (const suffix of ['-private', '_private', '.private']) {
        assert.deepEqual(privacyIssues('README.md', `${prefix}${owner}/${repo}${suffix}`), [], suffix);
      }
      assert.deepEqual(privacyIssues('README.md', `${prefix}${owner}/${repo} ${owner}`), []);
      assert.ok(privacyIssues('README.md', `${prefix}${owner}/${repo} ${['/', 'Users', '/private'].join('')}`).length, 'adjacent private text');
    }
  }
  assert.deepEqual(privacyIssues('README.md', `npx github:${owner}/another-repo`), []);
  assert.deepEqual(privacyIssues('README.md', `https://github.com/${owner}/another-repo`), []);
});

test('Public repository links allow sentence-ending periods for any repository', () => {
  const owner = ['au', 'ny', 'sillyme'].join('');
  assert.deepEqual(privacyIssues('README.md', `See https://github.com/${owner}/agent-personalizer.`), []);
  assert.deepEqual(privacyIssues('README.md', `See https://github.com/${owner}/another-repo.`), []);
});

test('Public company and authorship names pass in any file', () => {
  const name = ['Au', 'ny'].join('');
  const line = `Copyright (c) 2026 ${name} LLC and contributors`;
  assert.deepEqual(privacyIssues('LICENSE', line), []);
  assert.deepEqual(privacyIssues('README.md', line), []);
  assert.deepEqual(privacyIssues('LICENSE', line.replace(`${name} LLC`, `${name} Other LLC`)), []);
  assert.deepEqual(privacyIssues('LICENSE', `Copyright (c) 2026 ${name}`), []);
  assert.deepEqual(privacyIssues('LICENSE', line + ' extra'), []);
  assert.ok(privacyIssues('LICENSE', `${line} ${['/', 'Users', '/private'].join('')}`).length, 'private data remains blocked');
});

test('Public legal names pass beyond the agreement while adjacent private data fails', () => {
  const name = ['Au', 'ny'].join('');
  for (const value of [name, `${name} LLC`, `${name}SillyMe`]) {
    assert.deepEqual(privacyIssues('CLA.md', `Names: "${value}".`), []);
    for (const file of ['README.md', 'docs/CLA.md', 'CONTRIBUTING.md', 'CHANGELOG.md']) {
      assert.deepEqual(privacyIssues(file, value), [], `${file}: public legal name`);
    }
    for (const suffix of ['Other', '-private', '_private']) {
      assert.deepEqual(privacyIssues('CLA.md', value + suffix), []);
    }
  }
  assert.deepEqual(privacyIssues('CLA.md', name.toLowerCase()), []);
  assert.ok(privacyIssues('CLA.md', `${name} LLC ${['/', 'Users', '/private'].join('')}`).length, 'adjacent private data fails');
});

test('Approved legal notices and public name variants pass without hiding private data', () => {
  const company = ['Au', 'ny LLC'].join('');
  const notices = {
    'CONTRIBUTING.md': `You keep the copyright in what you wrote and grant ${company} the licenses in [CLA.md](CLA.md).`,
    'CHANGELOG.md': `- LICENSE names ${company} as copyright holder; outside contributions now require the CLA in CLA.md.`,
  };
  for (const [file, line] of Object.entries(notices)) {
    assert.deepEqual(privacyIssues(file, line), []);
    assert.deepEqual(privacyIssues('README.md', line), []);
    assert.deepEqual(privacyIssues(file, line + ' extra'), []);
    assert.deepEqual(privacyIssues(file, line.replace(company, company + ' Other')), []);
    assert.ok(privacyIssues(file, `${line} ${['/', 'Users', '/private'].join('')}`).length, 'private data remains blocked');
  }
});
