import { describe, it, expect } from 'vitest';
import { generateProblem } from '../src/engine/problemGenerator.js';
import { generateLinear } from '../src/engine/linearGenerator.js';
import { generateSimultaneous } from '../src/engine/simultaneousGenerator.js';
import { generateQuadratic } from '../src/engine/quadraticGenerator.js';
import { verifyProblem } from '../src/engine/validator.js';
import { judgeAnswer, checkRoots, evaluateAnswer, checkSingle } from '../src/engine/answerNormalizer.js';

const DIFFS = ['basic', 'standard', 'advanced', 'challenge'];

describe('문제 생성 엔진 - 검증 통과율', () => {
  const gens = { linear: generateLinear, simultaneous: generateSimultaneous, quadratic: generateQuadratic };
  for (const [unit, gen] of Object.entries(gens)) {
    for (const d of DIFFS) {
      it(`${unit}/${d}: 생성된 문제 300개가 모두 내부 검증을 통과한다`, () => {
        let fails = 0;
        for (let i = 0; i < 300; i++) {
          const p = gen(d);
          if (!verifyProblem(p)) {
            fails++;
            // eslint-disable-next-line no-console
            console.log('검증 실패', p.id, p.question);
          }
          expect(p.difficulty).toBe(d);
          expect(p.unit).toBe(unit);
          expect(p.hints.length).toBeGreaterThanOrEqual(3);
          expect(p.solutionSteps.length).toBeGreaterThanOrEqual(2);
        }
        expect(fails).toBe(0);
      });
    }
  }

  it('generateProblem 은 직렬화 가능한 객체를 돌려주고 최근 문제를 피한다', () => {
    const recent = [];
    for (let i = 0; i < 30; i++) {
      const p = generateProblem('linear', 'basic', recent);
      expect(typeof p.verify).toBe('undefined');
      expect(() => JSON.stringify(p)).not.toThrow();
      recent.push(p.id);
      if (recent.length > 10) recent.shift();
    }
  });

  it('정답을 생성기의 정답 판정 함수로 다시 판정하면 항상 정답이다', () => {
    for (const unit of ['linear', 'simultaneous', 'quadratic']) {
      for (const d of DIFFS) {
        for (let i = 0; i < 50; i++) {
          const p = generateProblem(unit, d, []);
          let inputs;
          if (p.answerType === 'single') inputs = [p.answer.display];
          else if (p.answerType === 'pair') inputs = [String(p.answer.x), String(p.answer.y)];
          else inputs = p.answer.display; // 'r1', 'r2' 문자열 (√ 포함 가능)
          const res = judgeAnswer(p, inputs);
          if (!res.correct) console.log('자기 정답 불일치', p.id, inputs, p.answer);
          expect(res.correct).toBe(true);
        }
      }
    }
  });
});

describe('답안 정규화/판정', () => {
  it('공백, +, 앞자리 0, x= 접두어를 처리한다', () => {
    expect(evaluateAnswer(' 4 ')).toBe(4);
    expect(evaluateAnswer('+4')).toBe(4);
    expect(evaluateAnswer('04')).toBe(4);
    expect(evaluateAnswer('x=4')).toBe(4);
    expect(evaluateAnswer('x = -3')).toBe(-3);
    expect(evaluateAnswer('−3')).toBe(-3); // 유니코드 마이너스
  });
  it('분수와 소수를 동치로 판정한다', () => {
    expect(checkSingle('1/2', 0.5).correct).toBe(true);
    expect(checkSingle('0.5', 0.5).correct).toBe(true);
    expect(checkSingle('-3/4', -0.75).correct).toBe(true);
    expect(checkSingle('2/4', 0.5).correct).toBe(true);
    expect(checkSingle('0.33', 1 / 3).correct).toBe(false);
  });
  it('음수 해를 판정한다', () => {
    expect(checkSingle('-7', -7).correct).toBe(true);
    expect(checkSingle('7', -7).correct).toBe(false);
  });
  it('근호 표현을 평가한다', () => {
    expect(evaluateAnswer('√5')).toBeCloseTo(Math.sqrt(5), 9);
    expect(evaluateAnswer('루트5')).toBeCloseTo(Math.sqrt(5), 9);
    expect(evaluateAnswer('sqrt(5)')).toBeCloseTo(Math.sqrt(5), 9);
    expect(evaluateAnswer('2√3')).toBeCloseTo(2 * Math.sqrt(3), 9);
    expect(evaluateAnswer('1+√2')).toBeCloseTo(1 + Math.sqrt(2), 9);
    expect(evaluateAnswer('(1-√5)/2')).toBeCloseTo((1 - Math.sqrt(5)) / 2, 9);
    expect(evaluateAnswer('abc')).toBeNull();
    expect(evaluateAnswer('')).toBeNull();
  });
  it('이차방정식 두 근: 순서 무관', () => {
    expect(checkRoots(['2', '3'], [2, 3]).correct).toBe(true);
    expect(checkRoots(['3', '2'], [2, 3]).correct).toBe(true);
    expect(checkRoots(['3', '3'], [2, 3]).correct).toBe(false);
    expect(checkRoots(['2', ''], [2, 3]).correct).toBe(false);
  });
  it('이차방정식 중근', () => {
    expect(checkRoots(['-4', '-4'], [-4, -4]).correct).toBe(true);
    expect(checkRoots(['-4', ''], [-4, -4]).correct).toBe(true);
    expect(checkRoots(['4', '-4'], [-4, -4]).correct).toBe(false);
  });
  it('± 표기와 쉼표 입력을 허용한다', () => {
    expect(checkRoots(['1±√2', ''], [1 + Math.SQRT2, 1 - Math.SQRT2]).correct).toBe(true);
    expect(checkRoots(['2, -5', ''], [-5, 2]).correct).toBe(true);
  });
  it('연립방정식 (x, y) 판정 - 음수 포함', () => {
    const p = { answerType: 'pair', answer: { x: -2, y: 5 } };
    expect(judgeAnswer(p, ['-2', '5']).correct).toBe(true);
    expect(judgeAnswer(p, ['5', '-2']).correct).toBe(false);
    expect(judgeAnswer(p, ['-2', '']).correct).toBe(false);
  });
});
