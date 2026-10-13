/**
 * 단계별 풀이 통합 진입점
 *
 *  planGuided(problem, decisions) → { steps, complete }
 *   - 연립방정식: 학생의 선택(decisions)에 따라 단계가 달라진다 (guidedSimultaneous.js)
 *   - 일차·이차방정식 도전(활용) 문제: 유형별로 정해진 단계 (guidedLinear.js, guidedQuadratic.js)
 *
 *  isGuidedSupported(problem) : 문제에 guided 메타데이터가 있어 단계별 풀이가 가능한지
 *  estimateTotalSteps(problem, decisions) : 진행률 표시용 전체 단계 수 (아직 안 한 선택은 추천값으로 가정)
 */
import { planSimultaneous, defaultDecisionsSimultaneous } from './guidedSimultaneous.js';
import { buildLinearSteps } from './guidedLinear.js';
import { buildQuadraticSteps } from './guidedQuadratic.js';
import { finalStep } from './guidedCommon.js';

export function isGuidedSupported(problem) {
  const g = problem?.guided;
  if (!g) return false;
  if (problem.unit === 'simultaneous') return Array.isArray(g.eqs);
  if (problem.unit === 'linear') return g.form === 'linear-word' && !!g.type;
  if (problem.unit === 'quadratic') return g.form === 'quadratic-word' && !!g.type;
  return false;
}

export function planGuided(problem, decisions = {}) {
  if (!isGuidedSupported(problem)) throw new Error('단계별 풀이를 지원하지 않는 문제입니다.');
  if (problem.unit === 'simultaneous') return planSimultaneous(problem, decisions);
  const steps = problem.unit === 'linear' ? buildLinearSteps(problem) : buildQuadraticSteps(problem);
  return { steps: [...steps, finalStep()], complete: true };
}

export function estimateTotalSteps(problem, decisions = {}) {
  if (problem.unit === 'simultaneous') return planSimultaneous(problem, defaultDecisionsSimultaneous(problem, decisions)).steps.length;
  return planGuided(problem, decisions).steps.length;
}
