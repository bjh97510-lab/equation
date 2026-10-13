/**
 * 연립일차방정식 "단계별 풀이" 플래너
 *
 *  문제 객체의 guided 메타데이터(계수)를 바탕으로, 학생이 한 단계씩 빈칸을 채우거나
 *  질문에 답하며 풀 수 있도록 단계 목록을 만든다.
 *
 *  학생의 선택(decisions)에 따라 이후 단계가 달라진다.
 *    method  : 'subst' | 'elim'   (①이 y = … 꼴일 때만 묻는다)
 *    elimVar : 'x' | 'y'          (가감법에서 먼저 없앨 미지수)
 *    op      : 'add' | 'sub'      (계수를 맞춘 뒤 더할지 뺄지 — 정답이 정해져 있음)
 *    subInto : 0 | 1              (구한 값을 대입할 식)
 *
 *  planSimultaneous(problem, decisions) → { steps, complete }  (guided.js 의 planGuided 가 호출)
 *    - 아직 내리지 않은 선택을 만나면 그 선택 단계까지만 돌려준다 (complete=false).
 *    - 모든 선택이 끝나면 최종 정답 입력 단계까지 포함한다 (complete=true).
 *
 *  단계(step) 형식
 *    { key, kind:'choice', title, prompt, free, options:[{id,label,correct,feedback}] }
 *    { key, kind:'blanks', title, prompt, lines:[{label, latex(\square 포함), answers:number[], alt?:number[][], hint}], explain, summary:[{label, latex}] }
 *    { key, kind:'final', title, prompt }
 */
import { lcm } from './fraction.js';
import { term, joinTerms, numLatex, twoVarExpr, linearExpr } from './format.js';
import { blanksStep, finalStep } from './guidedCommon.js';

const LABEL = ['①', '②'];
const OTHER = { x: 'y', y: 'x' };
const IDX = { x: 0, y: 1 };

export function eqLatex([a, b, c]) {
  return `${twoVarExpr(a, b)} = ${numLatex(c)}`;
}

/** 계수 표시: 1 → '', -1 → '-', 그 외 숫자 */
function coefDisp(v) {
  if (v === 1) return '';
  if (v === -1) return '-';
  return String(v);
}

/** a·(X) 꼴 (값을 괄호에 넣은 항) */
function valTerm(coef, val) {
  if (coef === 0) return '';
  return `${coefDisp(coef)}(${numLatex(val)})`;
}

/** 가감법에서 어느 미지수를 없애는 것이 더 간단한지 (곱해야 하는 횟수 → 최소공배수 순) */
export function easierElimVar(eqs) {
  const score = (v) => {
    const i = IDX[v];
    const p1 = Math.abs(eqs[0][i]);
    const p2 = Math.abs(eqs[1][i]);
    if (p1 === 0 || p2 === 0) return -1; // 한 식에 아예 없는 미지수 → 바로 다른 미지수를 구할 수 있다
    const L = lcm(p1, p2);
    const scalings = (L / p1 !== 1 ? 1 : 0) + (L / p2 !== 1 ? 1 : 0);
    return scalings * 100 + L;
  };
  return score('x') <= score('y') ? 'x' : 'y';
}

/* ───────────────────────── 가감법 ───────────────────────── */
function elimSteps(problem, eqs, decisions, steps) {
  const { answer } = problem;
  const X = answer.x;
  const Y = answer.y;
  const easier = easierElimVar(eqs);

  steps.push({
    key: 'elimVar',
    kind: 'choice',
    title: '없앨 미지수 고르기',
    prompt: `가감법은 두 식을 더하거나 빼서 미지수 하나를 없애는 방법이에요. 두 식의 $x$ 의 계수(${eqs[0][0]}, ${eqs[1][0]})와 $y$ 의 계수(${eqs[0][1]}, ${eqs[1][1]})를 비교해 보세요. 어느 미지수를 먼저 없앨까요?`,
    free: true,
    options: ['x', 'y'].map((v) => ({
      id: v,
      label: `$${v}$ 를 없앤다`,
      correct: true,
      feedback:
        v === easier
          ? `좋은 선택이에요! $${v}$ 의 계수를 보면 더 간단하게 맞출 수 있어요.`
          : `그렇게도 풀 수 있어요! (참고: $${OTHER[v]}$ 를 없애면 곱하는 수가 더 작아요)`,
    })),
  });
  const v = decisions.elimVar;
  if (!v) return false;

  const vi = IDX[v];
  const o = OTHER[v];
  const oi = IDX[o];
  const p1 = eqs[0][vi];
  const p2 = eqs[1][vi];
  const oVal = o === 'x' ? X : Y;

  // 한 식에 v 가 아예 없으면 그 식에서 바로 o 를 구한다
  if (p1 === 0 || p2 === 0) {
    const z = p1 === 0 ? 0 : 1;
    const e = eqs[z];
    const lines = [];
    if (e[oi] !== 1) {
      lines.push({ label: `${LABEL[z]} :`, latex: `${term(e[oi], o)} = \\square`, answers: [e[2]], hint: `${LABEL[z]}은 $${eqLatex(e)}$ 이에요. $${v}$ 항이 없으니 그대로 써요.` });
    }
    lines.push({ label: '', latex: `${o} = \\square`, answers: [oVal], hint: e[oi] === 1 ? `${LABEL[z]}이 바로 $${o}$ 의 값을 알려줘요.` : `양변을 ${e[oi]}(으)로 나누세요.` });
    steps.push(
      blanksStep(
        'combine',
        `${o} 구하기`,
        `${LABEL[z]} $${eqLatex(e)}$ 에는 $${v}$ 가 없어요. 두 식을 더하거나 뺄 필요 없이 ${LABEL[z]}에서 바로 $${o}$ 를 구할 수 있어요.`,
        lines,
        `$${o} = ${numLatex(oVal)}$ 을 구했어요! 이제 이 값을 다른 식에 대입하면 $${v}$ 도 구할 수 있어요.`,
      ),
    );
    backSubSteps(problem, eqs, 1 - z, v, o, steps);
    return true;
  }

  const L = lcm(Math.abs(p1), Math.abs(p2));
  const k = [L / Math.abs(p1), L / Math.abs(p2)];
  const scaled = eqs.map((e, i) => e.map((c) => c * k[i]));
  const lab = k.map((kk, i) => (kk === 1 ? LABEL[i] : `(${LABEL[i]} × ${kk})`));

  // 1) 계수 맞추기
  if (k[0] !== 1 || k[1] !== 1) {
    const lines = [];
    const factorBlanks = [];
    k.forEach((kk, i) => {
      if (kk !== 1) factorBlanks.push(i);
    });
    lines.push({
      label: '',
      latex: factorBlanks.map((i) => `\\text{${LABEL[i]}} \\times \\square`).join(',\\quad '),
      answers: factorBlanks.map((i) => k[i]),
      hint: `$${v}$ 의 계수 ${Math.abs(p1)}, ${Math.abs(p2)} 의 최소공배수는 ${L}이에요. 각 계수에 몇을 곱해야 ${L}이 될까요?`,
    });
    factorBlanks.forEach((i) => {
      lines.push({
        label: `${LABEL[i]} × ${k[i]} :`,
        latex: `\\square x + \\square y = \\square`,
        answers: scaled[i],
        hint: `${LABEL[i]}의 모든 항(양변 모두!)에 ${k[i]}을(를) 곱하세요. $${eqLatex(eqs[i])}$ 의 각 수에 ${k[i]} 을 곱하면?`,
      });
    });
    steps.push(
      blanksStep(
        'scale',
        '계수의 절댓값 맞추기',
        `$${v}$ 를 없애려면 두 식에서 $${v}$ 의 계수의 절댓값이 같아야 해요. 지금은 ${p1}과 ${p2}이죠? 각 식의 양변에 알맞은 수를 곱해 보세요.`,
        lines,
        `이제 두 식에서 $${v}$ 의 계수는 ${scaled[0][vi]}과 ${scaled[1][vi]}이에요.`,
      ),
    );
  }

  // 2) 더할까 뺄까
  const q1 = scaled[0][vi];
  const q2 = scaled[1][vi];
  const shouldAdd = q1 + q2 === 0;
  steps.push({
    key: 'op',
    kind: 'choice',
    title: '더할까, 뺄까?',
    prompt: `두 식에서 $${v}$ 의 계수는 ${q1}과 ${q2}예요. $${v}$ 가 사라지게 하려면 두 식을 어떻게 해야 할까요?`,
    free: false,
    options: [
      {
        id: 'add',
        label: `더한다: ${lab[0]} + ${lab[1]}`,
        correct: shouldAdd,
        feedback: shouldAdd ? `맞아요! 계수의 부호가 다르면 더해야 $${v}$ 가 사라져요.` : `계수가 ${q1}, ${q2} 로 부호가 같아요. 더하면 $${v}$ 가 ${q1 + q2}${v} 로 남아요. 빼야 사라지겠죠?`,
      },
      {
        id: 'sub',
        label: `뺀다: ${lab[0]} − ${lab[1]}`,
        correct: !shouldAdd,
        feedback: !shouldAdd ? `맞아요! 계수의 부호가 같으면 빼야 $${v}$ 가 사라져요.` : `계수가 ${q1}, ${q2} 로 부호가 달라요. 빼면 $${v}$ 가 ${q1 - q2}${v} 로 남아요. 더해야 사라지겠죠?`,
      },
    ],
  });
  if (!decisions.op) return false;
  const op = shouldAdd ? 'add' : 'sub';

  // 3) 소거한 식 → 한 미지수의 값
  const sign = op === 'add' ? 1 : -1;
  const qo = scaled[0][oi] + sign * scaled[1][oi];
  const rc = scaled[0][2] + sign * scaled[1][2];
  const opLabel = op === 'add' ? `${lab[0]} + ${lab[1]}` : `${lab[0]} − ${lab[1]}`;
  const combineLines = [
    {
      label: `${opLabel} :`,
      latex: `\\square ${o} = \\square`,
      answers: [qo, rc],
      alt: op === 'sub' ? [[-qo, -rc]] : undefined,
      hint:
        op === 'add'
          ? `$${o}$ 의 계수끼리(${scaled[0][oi]} + ${scaled[1][oi]}), 상수항끼리(${scaled[0][2]} + ${scaled[1][2]}) 더하세요.`
          : `$${o}$ 의 계수끼리(${scaled[0][oi]} − (${scaled[1][oi]})), 상수항끼리(${scaled[0][2]} − (${scaled[1][2]})) 빼세요. 부호에 주의!`,
    },
  ];
  if (qo !== 1) {
    combineLines.push({
      label: '',
      latex: `${o} = \\square`,
      answers: [oVal],
      hint: `양변을 ${qo}(으)로 나누세요.`,
    });
  }
  steps.push(
    blanksStep(
      'combine',
      `${v} 없애기`,
      `${opLabel} 를 계산하면 $${v}$ 가 사라지고 $${o}$ 만 남아요. 남은 식을 완성하고 $${o}$ 의 값을 구하세요.`,
      combineLines,
      `$${o} = ${numLatex(oVal)}$ 을 구했어요! 이제 이 값을 원래 식에 대입하면 $${v}$ 도 구할 수 있어요.`,
    ),
  );

  // 4) 어느 식에 대입?
  steps.push({
    key: 'subInto',
    kind: 'choice',
    title: '대입할 식 고르기',
    prompt: `$${o} = ${numLatex(oVal)}$ 을 어느 식에 대입할까요? (어느 식이든 좋아요. 계수가 간단한 식이 계산하기 편해요.)`,
    free: true,
    options: eqs.map((e, i) => ({
      id: String(i),
      label: `${LABEL[i]} $${eqLatex(e)}$ 에 대입`,
      correct: true,
      feedback: `${LABEL[i]}의 $${o}$ 자리에 ${numLatex(oVal)}을(를) 넣어 봐요.`,
    })),
  });
  if (decisions.subInto === undefined || decisions.subInto === null) return false;
  const si = Number(decisions.subInto) === 1 ? 1 : 0;
  backSubSteps(problem, eqs, si, v, o, steps);
  return true;
}

/** 구한 o 값을 eqs[si] 에 대입해 v 를 구하고, 나머지 식으로 검산하는 단계들 */
function backSubSteps(problem, eqs, si, v, o, steps) {
  const X = problem.answer.x;
  const Y = problem.answer.y;
  const vi = IDX[v];
  const oi = IDX[o];
  const oVal = o === 'x' ? X : Y;
  const e = eqs[si];
  const vCoef = e[vi];
  const oCoef = e[oi];
  const vVal = v === 'x' ? X : Y;

  // 5) 대입하여 나머지 미지수 구하기
  const substituted = `${joinTerms([term(vCoef, v), valTerm(oCoef, oVal)])} = ${numLatex(e[2])}`;
  const backLines = [];
  const rhs = e[2] - oCoef * oVal;
  if (vCoef === 1) {
    backLines.push({ label: '', latex: `${v} = \\square`, answers: [vVal], hint: `${oCoef}×(${numLatex(oVal)}) = ${oCoef * oVal} 을 우변으로 이항하면 ${e[2]} − (${oCoef * oVal}) 이에요.` });
  } else {
    backLines.push({
      label: '',
      latex: `${term(vCoef, v)} = \\square`,
      answers: [rhs],
      hint: `${oCoef}×(${numLatex(oVal)}) = ${oCoef * oVal} 을 계산한 뒤 우변으로 이항하세요.`,
    });
    backLines.push({ label: '', latex: `${v} = \\square`, answers: [vVal], hint: `양변을 ${vCoef}(으)로 나누세요.` });
  }
  steps.push(
    blanksStep(
      'backsub',
      `${v} 구하기`,
      `${LABEL[si]}에 $${o} = ${numLatex(oVal)}$ 을 대입하면 $${substituted}$ 이 돼요. 이 식을 풀어 $${v}$ 를 구하세요.`,
      backLines,
      `$${v} = ${numLatex(vVal)}$ 이에요. 두 미지수를 모두 구했어요!`,
    ),
  );

  // 6) 검산
  const ci = 1 - si;
  checkStep(steps, eqs[ci], ci, X, Y);
}

function checkStep(steps, e, label, X, Y) {
  const [a, b, c] = e;
  steps.push(
    blanksStep(
      'check',
      '검산하기',
      `구한 해가 맞는지 아직 사용하지 않은 식 ${LABEL[label]} $${eqLatex(e)}$ 에 $x = ${numLatex(X)}, y = ${numLatex(Y)}$ 을 대입해 확인해요.`,
      [
        {
          label: `${LABEL[label]}의 좌변 :`,
          latex: `${joinTerms([valTerm(a, X), valTerm(b, Y)])} = \\square`,
          answers: [a * X + b * Y],
          hint: `${a}×(${numLatex(X)}) = ${a * X}, ${b}×(${numLatex(Y)}) = ${b * Y}. 두 값을 더하세요.`,
        },
      ],
      `${LABEL[label]}의 우변 ${numLatex(c)}과 같으므로 두 식을 모두 만족해요. 해가 맞아요! ✅`,
    ),
  );
}

/* ───────────────────────── 대입법 ───────────────────────── */
function substSteps(problem, eqs, steps) {
  const { m, n } = problem.guided.subst;
  const [a, b, c] = eqs[1];
  const X = problem.answer.x;
  const Y = problem.answer.y;
  const inner = linearExpr(m, n);
  const bAbs = Math.abs(b);
  const bDisp = bAbs === 1 ? '' : String(bAbs);
  const bSign = b < 0 ? '-' : '+';

  steps.push(
    blanksStep(
      'substitute',
      '①을 ②에 대입하기',
      `①에서 $y = ${inner}$ 이에요. ②의 $y$ 자리에 $(${inner})$ 을 통째로 넣어 보세요.`,
      [
        {
          label: '②에 대입 :',
          latex: `${term(a, 'x')} ${bSign} ${bDisp}(\\square x + \\square) = ${numLatex(c)}`,
          answers: [m, n],
          hint: `①의 우변 $${inner}$ 을 그대로 괄호 안에 쓰면 돼요.`,
        },
      ],
      `$y$ 가 사라지고 $x$ 만 있는 일차방정식이 되었어요.`,
    ),
  );

  const coef = a + b * m;
  const konst = b * n;
  const simplifyLines = [
    {
      label: '괄호 풀기 :',
      latex: `${term(a, 'x')} + \\square x + \\square = ${numLatex(c)}`,
      answers: [b * m, b * n],
      hint: `분배법칙: ${b} × ${m}x = ${b * m}x, ${b} × (${n}) = ${b * n}`,
    },
  ];
  if (coef === 1) {
    simplifyLines.push({ label: '정리 :', latex: `x = \\square`, answers: [X], hint: `동류항을 정리하면 x 의 계수가 1이에요. 상수항 ${konst}을(를) 이항하세요.` });
  } else {
    simplifyLines.push({
      label: '정리 :',
      latex: `\\square x = \\square`,
      answers: [coef, c - konst],
      hint: `$x$ 의 계수끼리 더하고(${a} + ${b * m}), 상수항 ${konst}은(는) 우변으로 이항하세요(${c} − (${konst})).`,
    });
    simplifyLines.push({ label: '', latex: `x = \\square`, answers: [X], hint: `양변을 ${coef}(으)로 나누세요.` });
  }
  steps.push(blanksStep('simplify', 'x 구하기', `괄호를 풀고 동류항을 정리해서 $x$ 를 구하세요.`, simplifyLines, `$x = ${numLatex(X)}$ 을 구했어요!`));

  steps.push(
    blanksStep(
      'backY',
      'y 구하기',
      `$x = ${numLatex(X)}$ 을 ①에 대입하면 $y$ 를 바로 구할 수 있어요.`,
      [
        {
          label: '①에 대입 :',
          latex: `y = ${joinTerms([valTerm(m, X), n === 0 ? '' : numLatex(n)])} = \\square`,
          answers: [Y],
          hint: `${m}×(${numLatex(X)}) = ${m * X}, 여기에 ${n}을(를) 더하세요.`,
        },
      ],
      `$y = ${numLatex(Y)}$ 이에요. 두 미지수를 모두 구했어요!`,
    ),
  );

  checkStep(steps, eqs[1], 1, X, Y);
  return true;
}

/* ───────────────────────── 플래너 ───────────────────────── */
export function planSimultaneous(problem, decisions = {}) {
  const g = problem.guided;
  const steps = [];
  const eqs = g.eqs.map((e) => e.map(Number));

  if (g.form === 'word') {
    steps.push(blanksStep('setup', '식 세우기', g.setup.intro, g.setup.lines, g.setup.after));
    if (g.clear) {
      const { index, factor } = g.clear;
      steps.push(
        blanksStep(
          'clear',
          '분모 없애기',
          `${LABEL[index]}에 분수가 있어요. 양변에 ${factor}을(를) 곱하면 분모가 사라져 계산하기 쉬워져요.`,
          [
            {
              label: `${LABEL[index]} × ${factor} :`,
              latex: `\\square x + \\square y = \\square`,
              answers: eqs[index],
              hint: `모든 항에 ${factor}을(를) 곱하세요. 분수 × ${factor} 은 분자만 남아요.`,
            },
          ],
          `이제 두 식 모두 계수가 정수예요. 가감법으로 풀어 봐요.`,
        ),
      );
    }
  } else if (g.form === 'bracket') {
    const { p, r } = g.bracket;
    steps.push(
      blanksStep(
        'expand',
        '괄호 풀기',
        `①에 괄호가 있어요. 분배법칙으로 괄호를 풀고 동류항을 정리해 $ax + by = c$ 꼴로 만들어요.`,
        [
          {
            label: '① 정리 :',
            latex: `\\square x + \\square y = ${numLatex(eqs[0][2])}`,
            answers: [eqs[0][0], eqs[0][1]],
            hint: `${p}(x + y) = ${p}x + ${p}y 이고, 여기에 ${r > 0 ? `−${r}y` : `+${-r}y`} 를 더하면 y 의 계수는 ${p} ${r > 0 ? '−' : '+'} ${Math.abs(r)} 이에요.`,
          },
        ],
        `①이 $${eqLatex(eqs[0])}$ 으로 정리되었어요.`,
      ),
    );
  } else if (g.form === 'subst') {
    const { m, n } = g.subst;
    steps.push({
      key: 'method',
      kind: 'choice',
      title: '풀이 방법 고르기',
      prompt: `①이 $y = ${linearExpr(m, n)}$ 처럼 "$y$ = …" 꼴이에요. 어떤 방법으로 풀까요?`,
      free: true,
      options: [
        { id: 'subst', label: '대입법: ①의 $y$ 를 ②에 통째로 넣는다', correct: true, feedback: '좋아요! 한 식이 "y = …" 꼴이면 대입법이 가장 빨라요.' },
        { id: 'elim', label: '가감법: ①을 $ax + by = c$ 꼴로 고친 뒤 계수를 맞춘다', correct: true, feedback: '가감법으로도 풀 수 있어요. 먼저 ①을 정리해야 해요.' },
      ],
    });
    if (!decisions.method) return { steps, complete: false };
    if (decisions.method === 'subst') {
      substSteps(problem, eqs, steps);
      steps.push(finalStep('위에서 구한 해를 정리해서 적어 보세요.'));
      return { steps, complete: true };
    }
    steps.push(
      blanksStep(
        'rearrange',
        '① 정리하기',
        `가감법을 쓰려면 ①도 $ax + by = c$ 꼴이어야 해요. $y = ${linearExpr(m, n)}$ 에서 $x$ 항을 좌변으로 이항하세요.`,
        [
          {
            label: '① 정리 :',
            latex: `\\square x + y = \\square`,
            answers: [-m, n],
            hint: `${term(m, 'x')} 를 좌변으로 옮기면 부호가 바뀌어 ${term(-m, 'x')} 가 돼요. 상수항 ${n}은 그대로예요.`,
          },
        ],
        `①이 $${eqLatex(eqs[0])}$ 으로 정리되었어요.`,
      ),
    );
  }

  const done = elimSteps(problem, eqs, decisions, steps);
  if (!done) return { steps, complete: false };
  steps.push(finalStep('위에서 구한 해를 정리해서 적어 보세요.'));
  return { steps, complete: true };
}

/** 아직 내리지 않은 선택을 기본값(추천값)으로 채운 전체 계획 (단계 수 추정용) */
export function defaultDecisionsSimultaneous(problem, decisions = {}) {
  const filled = { method: 'subst', subInto: 0, op: 'x', ...decisions };
  if (!filled.elimVar) filled.elimVar = easierElimVar(problem.guided.eqs.map((e) => e.map(Number)));
  return filled;
}
