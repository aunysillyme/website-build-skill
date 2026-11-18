// Candidate destinations, not a verified host support registry.
export const targets = Object.freeze({
  'claude-code': '.claude/skills/website-build-skill',
  codex: '.agents/skills/website-build-skill',
  hermes: '.agents/skills/website-build-skill',
  'gemini-cli': '.gemini/skills/website-build-skill',
  antigravity: '.agents/skills/website-build-skill',
  grok: '.grok/skills/website-build-skill',
  agents: '.website-build-skill',
  portable: '.website-build-skill',
  chatgpt: 'website-build-skill-upload',
});

export const userTargets = Object.freeze({
  'claude-code': '.claude/skills/website-build-skill',
  codex: '.agents/skills/website-build-skill',
  hermes: '.hermes/skills/website-build-skill',
  'gemini-cli': '.gemini/skills/website-build-skill',
  antigravity: '.gemini/config/skills/website-build-skill',
  grok: '.grok/skills/website-build-skill',
  agents: '.website-build-skill',
  portable: '.website-build-skill',
  chatgpt: 'website-build-skill-upload',
});

/**
 * Return the relative skill destination directory for a target and scope.
 */
export function destinationFor(target, scope = 'project') {
  if (!['project', 'user'].includes(scope)) return null;
  const table = scope === 'user' ? userTargets : targets;
  return Object.hasOwn(table, target) ? table[target] : null;
}

/**
 * Return the relative native subagent directory for a target and scope, or null when unsupported.
 */
export function agentDirFor(target, scope = 'project') {
  if (!['project', 'user'].includes(scope)) return null;
  if (target === 'claude-code') return '.claude/agents';
  if (target === 'codex') return '.codex/agents';
  if (target === 'gemini-cli') return '.gemini/agents';
  if (target === 'antigravity') return scope === 'user' ? '.gemini/config/agents' : '.agents/agents';
  return null;
}
