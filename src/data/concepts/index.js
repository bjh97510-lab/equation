import { LINEAR_STEPS, LINEAR_CARDS, LINEAR_CHECKS } from './linear.js';
import { SIMULTANEOUS_STEPS, SIMULTANEOUS_CARDS, SIMULTANEOUS_CHECKS } from './simultaneous.js';
import { QUADRATIC_STEPS, QUADRATIC_CARDS, QUADRATIC_CHECKS } from './quadratic.js';

export const CONCEPT_CONTENT = {
  linear: { steps: LINEAR_STEPS, cards: LINEAR_CARDS, checks: LINEAR_CHECKS },
  simultaneous: { steps: SIMULTANEOUS_STEPS, cards: SIMULTANEOUS_CARDS, checks: SIMULTANEOUS_CHECKS },
  quadratic: { steps: QUADRATIC_STEPS, cards: QUADRATIC_CARDS, checks: QUADRATIC_CHECKS },
};

export function getSteps(unit) {
  return CONCEPT_CONTENT[unit]?.steps || [];
}
export function getCards(unit) {
  return CONCEPT_CONTENT[unit]?.cards || [];
}
export function getChecks(unit) {
  return CONCEPT_CONTENT[unit]?.checks || [];
}
export function findCard(cardId) {
  for (const u of Object.values(CONCEPT_CONTENT)) {
    const c = u.cards.find((x) => x.id === cardId);
    if (c) return c;
  }
  return null;
}
