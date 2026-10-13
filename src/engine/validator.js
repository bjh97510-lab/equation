/**
 * 문제 품질 검증
 *  - 생성된 문제의 정답을 원래 식에 대입하여 성립하는지 확인한다.
 *  - 각 생성기는 verify(...) 함수를 함께 제공한다.
 *  - 추가로 answer 구조, 힌트/풀이 유무도 점검한다.
 */
import { Fraction } from './fraction.js';

function isFiniteNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

export function verifyProblem(p) {
  try {
    if (!p || !p.id || !p.answerType || !p.answer) return false;
    if (!Array.isArray(p.hints) || p.hints.length < 3) return false;
    if (!Array.isArray(p.solutionSteps) || p.solutionSteps.length < 2) return false;
    if (!p.question || (!p.question.latex && !p.question.text)) return false;

    if (p.answerType === 'single') {
      if (!isFiniteNum(p.answer.value)) return false;
      if (typeof p.verify === 'function') {
        const v = p.answer.value;
        // 유리수면 분수로 정확히 검증 (정수가 아닌 경우도 포함)
        const asFrac = Number.isInteger(v) ? v : fracFromNumber(v);
        return !!p.verify(asFrac);
      }
      return true;
    }
    if (p.answerType === 'pair') {
      if (!isFiniteNum(p.answer.x) || !isFiniteNum(p.answer.y)) return false;
      // 단계별 풀이용 계수가 있으면 해가 하나뿐인지(행렬식 ≠ 0) 확인
      if (p.guided?.eqs) {
        const [[a1, b1], [a2, b2]] = p.guided.eqs;
        if (![a1, b1, a2, b2].every(isFiniteNum) || a1 * b2 - a2 * b1 === 0) return false;
      }
      if (typeof p.verify === 'function') return !!p.verify(p.answer.x, p.answer.y);
      return true;
    }
    if (p.answerType === 'roots') {
      const roots = p.answer.roots;
      if (!Array.isArray(roots) || roots.length !== 2 || !roots.every(isFiniteNum)) return false;
      if (typeof p.verify === 'function') {
        const args = roots.map((r) => (isRational(r) ? fracFromNumber(r) : r));
        return !!p.verify(args[0], args[1]);
      }
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function isRational(v) {
  // 분모 1..1000 의 유리수인지 (오차 기반)
  for (let d = 1; d <= 1000; d++) {
    const n = v * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) return true;
  }
  return false;
}

function fracFromNumber(v) {
  for (let d = 1; d <= 1000; d++) {
    const n = v * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) return new Fraction(Math.round(n), d);
  }
  return v;
}
