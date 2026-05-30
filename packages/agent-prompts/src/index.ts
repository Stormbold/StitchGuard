export {
  generateAgentPrompt,
  getAgentPromptFilename,
  getRulesForMode,
  formatFindingsList,
  getSuggestedFixDirections,
  CONSERVATIVE_RULES,
  type AgentTarget,
  type PromptMode,
  type PromptStack,
  type GeneratePromptOptions,
} from './shared.js';

export { generateCodexPrompt } from './codex.js';
export { generateCursorPrompt } from './cursor.js';
export { generateClaudePrompt } from './claude.js';

export {
  generateTailwindHints,
  generateShadcnHints,
  detectStackFromPackageJson,
  nearestPaddingClass,
  nearestRadiusClass,
  type TailwindHintInput,
} from './tailwind-hints.js';
