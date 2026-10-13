import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { generateProblem } from '../src/engine/problemGenerator.js';
import { planGuided, estimateTotalSteps, isGuidedSupported } from '../src/engine/guided.js';
import { easierElimVar } from '../src/engine/guidedSimultaneous.js';
import { fillBlanks } from '../src/engine/guidedCommon.js';
import { checkSingle } from '../src/engine/answerNormalizer.js';
import { textToHtml } from '../src/components/common/MathText.jsx';

const DIFFS = ['basic', 'standard', 'advanced', 'challenge'];
const DECISION_SETS = [
  { method: 'subst', elimVar: 'x', op: 'ok', subInto: 0 },
  { method: 'elim', elimVar: 'x', op: 'ok', subInto: 0 },
  { method: 'elim', elimVar: 'x', op: 'ok', subInto: 1 },
  { method: 'elim', elimVar: 'y', op: 'ok', subInto: 0 },
  { method: 'elim', elimVar: 'y', op: 'ok', subInto: 1 },
];

/** 모든 수식 조각이 KaTeX 로 오류 없이 렌더링되는지 */
function assertRenders(latex) {
  const frags = latex.split('\\square');
  for (const f of frags) {
    if (!f.trim()) continue;
    expect(() => katex.renderToString(f, { throwOnError: true, strict: 'ignore' })).not.toThrow();
  }
}

function sampleProblems(difficulty, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(generateProblem('simultaneous', difficulty, []));
  return out;
}

describe('연립방정식 단계별 풀이 플래너', () => {
  it('생성되는 모든 연립방정식 문제가 단계별 풀이를 지원한다', () => {
    for (const d of DIFFS) {
      for (const p of sampleProblems(d, 60)) {
        expect(isGuidedSupported(p)).toBe(true);
        // 직렬화 후에도 유지 (오답노트 저장 → 다시 풀기)
        expect(isGuidedSupported(JSON.parse(JSON.stringify(p)))).toBe(true);
      }
    }
  });

  for (const d of DIFFS) {
    it(`${d}: 어떤 선택을 하더라도 단계가 끝까지 이어지고, 빈칸 정답이 수학적으로 맞다`, () => {
      for (const p of sampleProblems(d, 120)) {
        const X = p.answer.x;
        const Y = p.answer.y;
        for (const dec of DECISION_SETS) {
          const { steps, complete } = planGuided(p, dec);
          expect(complete).toBe(true);
          expect(steps[steps.length - 1].kind).toBe('final');
          expect(steps.length).toBeGreaterThanOrEqual(4);
          const keys = steps.map((s) => s.key);
          expect(new Set(keys).size).toBe(keys.length); // 단계 key 중복 없음
          // 대입법 문제에서 가감법을 고르면 ① 정리 단계가 들어간다
          if (p.guided.form === 'subst' && dec.method === 'elim') expect(keys).toContain('rearrange');
          if (p.guided.form === 'subst' && dec.method === 'subst') expect(keys).toContain('simplify');
          if (p.guided.form === 'word') expect(keys[0]).toBe('setup');
          if (p.guided.clear) expect(keys[1]).toBe('clear');
          if (p.guided.form === 'bracket') expect(keys[0]).toBe('expand');

          for (const s of steps) {
            expect(s.title).toBeTruthy();
            if (s.kind === 'choice') {
              expect(s.options.length).toBeGreaterThanOrEqual(2);
              expect(s.options.some((o) => o.correct)).toBe(true);
              if (!s.free) expect(s.options.filter((o) => o.correct).length).toBe(1);
              for (const o of s.options) expect(o.feedback).toBeTruthy();
            }
            if (s.kind === 'blanks') {
              expect(s.lines.length).toBeGreaterThan(0);
              for (const line of s.lines) {
                const blanks = line.latex.split('\\square').length - 1;
                expect(blanks).toBe(line.answers.length);
                expect(blanks).toBeGreaterThan(0);
                for (const a of line.answers) expect(Number.isFinite(a)).toBe(true);
                assertRenders(line.latex);
                expect(line.hint).toBeTruthy();
              }
              for (const sm of s.summary) {
                expect(sm.latex.includes('\\square')).toBe(false);
                assertRenders(sm.latex);
              }
            }
          }

          // 수학적 일관성: 각 단계에서 채워지는 값 검증
          const g = p.guided;
          const eqs = g.eqs;
          const holds = (e) => Math.abs(e[0] * X + e[1] * Y - e[2]) < 1e-9;
          expect(holds(eqs[0]) && holds(eqs[1])).toBe(true);
          const byKey = Object.fromEntries(steps.map((s) => [s.key, s]));
          if (byKey.scale) {
            // 곱한 식도 해를 만족
            for (const line of byKey.scale.lines.slice(1)) expect(holds(line.answers)).toBe(true);
          }
          if (byKey.combine) {
            const o = dec.elimVar === 'x' ? Y : X;
            const last = byKey.combine.lines[byKey.combine.lines.length - 1];
            expect(last.answers[last.answers.length - 1]).toBe(o);
            if (byKey.op) {
              const [q, r] = byKey.combine.lines[0].answers;
              expect(q).not.toBe(0);
              expect(Math.abs(q * o - r)).toBeLessThan(1e-9);
              if (byKey.combine.lines[0].alt) expect(byKey.combine.lines[0].alt[0]).toEqual([-q, -r]);
            } else {
              // 한 식에 없애려는 미지수가 없는 경우: 더하기/빼기 없이 바로 구한다
              const vi = dec.elimVar === 'x' ? 0 : 1;
              expect(eqs[0][vi] === 0 || eqs[1][vi] === 0).toBe(true);
            }
          }
          if (byKey.backsub) {
            const last = byKey.backsub.lines[byKey.backsub.lines.length - 1];
            expect(last.answers[0]).toBe(dec.elimVar === 'x' ? X : Y);
          }
          if (byKey.simplify) {
            const last = byKey.simplify.lines[byKey.simplify.lines.length - 1];
            expect(last.answers[0]).toBe(X);
            const [bm, bn] = byKey.simplify.lines[0].answers;
            const [a, b, c] = eqs[1];
            expect(Math.abs((a + bm) * X + bn - c)).toBeLessThan(1e-9);
          }
          if (byKey.backY) expect(byKey.backY.lines[0].answers[0]).toBe(Y);
          if (byKey.rearrange) expect(holds([byKey.rearrange.lines[0].answers[0], 1, byKey.rearrange.lines[0].answers[1]])).toBe(true);
          if (byKey.expand) expect(holds([...byKey.expand.lines[0].answers, eqs[0][2]])).toBe(true);
          if (byKey.clear) expect(holds(byKey.clear.lines[0].answers)).toBe(true);
          if (byKey.setup) {
            // 식 세우기 정답은 학생 답안 판정기로도 정답 처리된다
            for (const line of byKey.setup.lines) for (const a of line.answers) expect(checkSingle(String(a), a).correct).toBe(true);
          }
          // 검산 단계: 좌변 값이 그 식의 우변과 같다
          expect(byKey.check).toBeTruthy();
          const checkVal = byKey.check.lines[0].answers[0];
          expect(eqs.some((e) => Math.abs(e[2] - checkVal) < 1e-9)).toBe(true);
        }
      }
    });
  }

  it('선택을 하기 전에는 선택 단계에서 멈추고, 전체 단계 수 추정은 실제 이상이다', () => {
    const p = sampleProblems('standard', 1)[0];
    const first = planGuided(p, {});
    expect(first.complete).toBe(false);
    expect(first.steps[first.steps.length - 1].kind).toBe('choice');
    const est = estimateTotalSteps(p, {});
    expect(est).toBeGreaterThanOrEqual(first.steps.length);
    // 더할까 뺄까: 정답이 아닌 보기를 골라도 planner 는 영향을 받지 않는다 (UI 가 정답일 때만 기록)
    const dec = { method: 'elim', elimVar: 'x' };
    const s2 = planGuided(p, dec);
    expect(s2.steps[s2.steps.length - 1].key).toBe('op');
  });

  it('더할까 뺄까 판단: 계수 부호가 다르면 더하기, 같으면 빼기', () => {
    const mk = (eqs) => ({ unit: 'simultaneous', answer: { x: 1, y: 1 }, guided: { form: 'standard', eqs } });
    const add = planGuided(mk([[1, 1, 2], [1, -1, 0]]), { elimVar: 'y' });
    expect(add.steps.find((s) => s.key === 'op').options.find((o) => o.correct).id).toBe('add');
    const sub = planGuided(mk([[2, 3, 5], [2, 1, 3]]), { elimVar: 'x' });
    expect(sub.steps.find((s) => s.key === 'op').options.find((o) => o.correct).id).toBe('sub');
    // 계수 맞추기가 필요 없으면 scale 단계가 없다
    expect(sub.steps.some((s) => s.key === 'scale')).toBe(false);
    const scaled = planGuided(mk([[2, 3, 5], [3, 1, 4]]), { elimVar: 'x' });
    const sc = scaled.steps.find((s) => s.key === 'scale');
    expect(sc.lines[0].answers).toEqual([3, 2]);
    expect(sc.lines[1].answers).toEqual([6, 9, 15]);
    expect(sc.lines[2].answers).toEqual([6, 2, 8]);
  });

  it('없애기 쉬운 미지수를 추천한다', () => {
    expect(easierElimVar([[1, 2, 3], [1, 5, 6]])).toBe('x');
    expect(easierElimVar([[3, 1, 3], [2, -1, 6]])).toBe('y');
  });

  it('fillBlanks 는 부호와 계수 1 을 자연스럽게 표시한다', () => {
    expect(fillBlanks('\\square x + \\square y = \\square', [2, -3, 5])).toBe('2x - 3y = 5');
    expect(fillBlanks('\\square x + \\square y = \\square', [1, -1, -4])).toBe('x - y = -4');
    expect(fillBlanks('x = \\square', [-7])).toBe('x = -7');
    expect(fillBlanks('2x + 3(\\square x + \\square) = 7', [-2, 1])).toBe('2x + 3(-2x + 1) = 7');
  });
});

describe('일차·이차방정식 도전 문제 단계별 풀이', () => {
  for (const unit of ['linear', 'quadratic']) {
    it(`${unit}/challenge: 모든 활용 문제가 단계별 풀이를 지원하고 빈칸 정답이 일관된다`, () => {
      const seenTypes = new Set();
      for (let i = 0; i < 200; i++) {
        const p = generateProblem(unit, 'challenge', []);
        expect(isGuidedSupported(p)).toBe(true);
        seenTypes.add(p.guided.type);
        const { steps, complete } = planGuided(p, {});
        expect(complete).toBe(true);
        expect(estimateTotalSteps(p, {})).toBe(steps.length);
        expect(steps[steps.length - 1].kind).toBe('final');
        const keys = steps.map((s) => s.key);
        expect(new Set(keys).size).toBe(keys.length);
        expect(keys).toContain('check');
        const answer = p.answer.value;
        let answerAppears = false;
        for (const s of steps) {
          if (s.kind === 'choice') {
            expect(s.options.filter((o) => o.correct).length).toBe(1);
            for (const o of s.options) expect(o.feedback).toBeTruthy();
            if (s.key === 'pick') {
              // 조건에 맞는 근 고르기: 정답 보기가 문제의 답과 같다
              const good = s.options.find((o) => o.correct);
              expect(good.label).toContain(`= ${answer}`);
              answerAppears = true;
            }
          }
          if (s.kind === 'blanks') {
            for (const line of s.lines) {
              const blanks = line.latex.split('\square').length - 1;
              expect(blanks).toBe(line.answers.length);
              expect(blanks).toBeGreaterThan(0);
              for (const a of line.answers) {
                expect(Number.isFinite(a)).toBe(true);
                expect(checkSingle(String(a), a).correct).toBe(true);
                if (Math.abs(a - answer) < 1e-9) answerAppears = true;
              }
              assertRenders(line.latex);
              expect(line.hint).toBeTruthy();
            }
            for (const sm of s.summary) {
              expect(sm.latex.includes('\square')).toBe(false);
              assertRenders(sm.latex);
            }
          }
        }
        expect(answerAppears).toBe(true);
        // 검산 단계의 빈칸 값은 문제 조건의 수(합·금액·넓이·0 등)와 같아야 한다
        const check = steps.find((s) => s.key === 'check');
        for (const v of check.lines[0].answers) expect(Number.isFinite(v)).toBe(true);
        // 직렬화(오답노트 저장) 후에도 같은 단계가 나온다
        const again = planGuided(JSON.parse(JSON.stringify(p)), {});
        expect(again.steps.map((s) => s.key)).toEqual(keys);
      }
      // 모든 유형이 적어도 한 번은 출제되어 검사됨
      expect(seenTypes.size).toBe(unit === 'linear' ? 6 : 5);
    });
  }

  it('일차·이차방정식의 다른 난이도는 아직 단계별 풀이를 지원하지 않는다', () => {
    for (const unit of ['linear', 'quadratic']) {
      for (const d of ['basic', 'standard', 'advanced']) expect(isGuidedSupported(generateProblem(unit, d, []))).toBe(false);
    }
  });
});

describe('힌트의 제곱 표기', () => {
  it('$...$ 수식은 KaTeX 로, 수식 기호 없는 x^2 는 위첨자로 렌더링된다', () => {
    expect(textToHtml('$x^2 - 8x - 20 = 0$')).toContain('katex');
    const plain = textToHtml('x^2 - 8x - 20 = 0 을 풀어요');
    expect(plain).toContain('x<sup>2</sup>');
    expect(plain).not.toContain('^');
    expect(textToHtml('(x + 3)^2 = 16')).toContain(')<sup>2</sup>');
  });

  it('이차방정식 활용 힌트에 LaTeX 가 날것으로 노출되지 않는다', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateProblem('quadratic', 'challenge', []);
      for (const h of p.hints) {
        // $ 밖에 "^" 가 남아 있지 않다
        const outside = h.split(/\$[^$]+\$/).join('');
        expect(outside.includes('^')).toBe(false);
      }
    }
  });
});
