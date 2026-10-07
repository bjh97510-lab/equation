/**
 * 문제 생성 통합 엔진
 *
 *  generateProblem(unit, difficulty, recentIds)
 *   1. 단원별 생성기로 문제 생성
 *   2. 내부 검증 (정답을 원래 식에 대입)  → 실패하면 재생성
 *   3. 최근 출제 문제와 중복이면 재생성
 *   4. 저장 가능한(직렬화 가능한) 문제 객체 반환
 */
import { generateLinear, LINEAR_CONCEPTS } from './linearGenerator.js';
import { generateSimultaneous, SIMULTANEOUS_CONCEPTS } from './simultaneousGenerator.js';
import { generateQuadratic, QUADRATIC_CONCEPTS } from './quadraticGenerator.js';
import { verifyProblem } from './validator.js';

const GENERATORS = {
  linear: generateLinear,
  simultaneous: generateSimultaneous,
  quadratic: generateQuadratic,
};

export const CONCEPT_NAMES = {
  linear: LINEAR_CONCEPTS,
  simultaneous: SIMULTANEOUS_CONCEPTS,
  quadratic: QUADRATIC_CONCEPTS,
};

export function conceptName(unit, concept) {
  return CONCEPT_NAMES[unit]?.[concept] || concept;
}

/** 함수(verify)를 제거하여 저장 가능한 형태로 */
export function serializeProblem(p) {
  // eslint-disable-next-line no-unused-vars
  const { verify, ...rest } = p;
  return JSON.parse(JSON.stringify(rest));
}

/**
 * @param {'linear'|'simultaneous'|'quadratic'} unit
 * @param {'basic'|'standard'|'advanced'|'challenge'} difficulty
 * @param {string[]} recentIds 최근 출제 문제 id 목록
 */
export function generateProblem(unit, difficulty, recentIds = []) {
  const gen = GENERATORS[unit];
  if (!gen) throw new Error(`알 수 없는 단원: ${unit}`);
  let last = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const p = gen(difficulty);
    const ok = verifyProblem(p);
    if (!ok) {
      // 검증 실패 문제는 학생에게 보여주지 않고 재생성
      if (typeof console !== 'undefined') console.warn('[problem] 검증 실패, 재생성:', p.id);
      continue;
    }
    last = p;
    if (recentIds.includes(p.id) && attempt < 30) continue;
    return { ...serializeProblem(p), createdAt: Date.now() };
  }
  if (last) return { ...serializeProblem(last), createdAt: Date.now() };
  throw new Error('문제를 생성하지 못했습니다.');
}
