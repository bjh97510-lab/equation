/**
 * 중2 연립일차방정식 문제 생성기
 *
 *  - 먼저 해 (x, y) 를 정한 뒤 두 식을 만든다.
 *  - 식: a1 x + b1 y = c1 , a2 x + b2 y = c2
 *  - verify(): 두 식 모두 성립하는지 확인
 */
import { Fraction, F, lcm } from './fraction.js';
import { randInt, randNonZero, pick, chance } from './random.js';
import { twoVarExpr, numLatex, linearExpr, wrapNeg } from './format.js';
import { DIFFICULTY_REWARDS } from '../config/appConfig.js';

const UNIT = 'simultaneous';
const GRADE = 2;

function makeVerifier(eqs) {
  return (x, y) => {
    const X = Fraction.from(x);
    const Y = Fraction.from(y);
    return eqs.every(([a, b, c]) => Fraction.from(a).mul(X).add(Fraction.from(b).mul(Y)).eq(c));
  };
}

function base(type, difficulty, concept, idParts) {
  return {
    id: `${UNIT}-${difficulty}-${type}-${idParts.join('_')}`,
    grade: GRADE,
    unit: UNIT,
    concept,
    difficulty,
    type,
    reward: DIFFICULTY_REWARDS[difficulty],
    answerType: 'pair',
  };
}

function finish(p, x, y, extra) {
  return {
    ...p,
    ...extra,
    answer: { x, y, display: `x = ${x}, y = ${y}` },
    answerDisplay: extra.answerDisplay || `x = ${x}, y = ${y}`,
    acceptedAnswers: [`x=${x}, y=${y}`],
  };
}

function eqLatex(a, b, c) {
  return `${twoVarExpr(a, b)} = ${numLatex(c)}`;
}

function systemQuestion(e1, e2) {
  return {
    kind: 'system',
    lines: [eqLatex(...e1), eqLatex(...e2)],
    latex: `\\begin{cases} ${eqLatex(...e1)} \\\\ ${eqLatex(...e2)} \\end{cases}`,
  };
}

/** y 를 구한 뒤 대입하는 마지막 단계 (공통) */
function backSubSteps(e, x, y, solvedVar) {
  const [a, b, c] = e;
  if (solvedVar === 'y') {
    // y 값을 알고 x 구하기
    return [
      { expr: `${twoVarExpr(a, b)} = ${numLatex(c)} \\;\\Rightarrow\\; ${linearExpr(a, b * y)} = ${numLatex(c)}`, note: `y = ${y} 를 대입` },
      { expr: `${a === 1 ? 'x' : a + 'x'} = ${numLatex(c - b * y)}`, note: '상수항 이항' },
      { expr: `x = ${x}`, note: a === 1 ? '' : `양변을 ${a}으로 나누기` },
    ];
  }
  return [
    { expr: `${twoVarExpr(a, b)} = ${numLatex(c)} \\;\\Rightarrow\\; ${linearExpr(b, a * x, 'y')} = ${numLatex(c)}`, note: `x = ${x} 를 대입` },
    { expr: `${b === 1 ? 'y' : b + 'y'} = ${numLatex(c - a * x)}`, note: '상수항 이항' },
    { expr: `y = ${y}`, note: b === 1 ? '' : `양변을 ${b}으로 나누기` },
  ];
}

/* ───────────── 기초: 계수가 같아 바로 더하거나 빼면 소거 ───────────── */
function genBasicAddition() {
  const x = randInt(-5, 9);
  const y = randNonZero(-5, 9);
  // x + y = s, x - y = d
  const useSimple = chance(0.5);
  let e1, e2;
  if (useSimple) {
    e1 = [1, 1, x + y];
    e2 = [1, -1, x - y];
  } else {
    const a = randInt(2, 4);
    const b = randInt(1, 4);
    e1 = [a, b, a * x + b * y];
    e2 = [a, -b, a * x - b * y];
  }
  const sumEq = [e1[0] + e2[0], e1[1] + e2[1], e1[2] + e2[2]]; // y 소거
  const q = systemQuestion(e1, e2);
  return finish(base('add-elim', 'basic', 'addition', [e1.join('.'), e2.join('.')]), x, y, {
    question: q,
    solutionSteps: [
      { expr: q.latex, note: 'y 의 계수가 부호만 다르므로 두 식을 더하면 y 가 사라져요' },
      { expr: `${sumEq[0]}x = ${numLatex(sumEq[2])}`, note: '① + ②' },
      { expr: `x = ${x}`, note: `양변을 ${sumEq[0]}으로 나누기` },
      ...backSubSteps(e1, x, y, 'x'),
    ],
    hints: [
      `두 식에서 y 의 계수를 비교해 보세요. 부호만 다르죠? 두 식을 더하면 어떻게 될까요?`,
      `① + ② 를 하면 ${sumEq[0]}x = ${numLatex(sumEq[2])} 가 돼요.`,
      `x = ${x} 를 ①에 대입하면 y 를 구할 수 있어요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

function genBasicSubtraction() {
  const x = randInt(-5, 9);
  const y = randNonZero(-5, 9);
  const a = randInt(1, 4);
  const b1 = randInt(1, 5);
  let b2 = randInt(1, 5);
  if (b2 === b1) b2 = b1 + 1;
  const e1 = [a, b1, a * x + b1 * y];
  const e2 = [a, b2, a * x + b2 * y];
  const diff = [0, b1 - b2, e1[2] - e2[2]];
  const q = systemQuestion(e1, e2);
  return finish(base('sub-elim', 'basic', 'addition', [e1.join('.'), e2.join('.')]), x, y, {
    question: q,
    solutionSteps: [
      { expr: q.latex, note: 'x 의 계수가 같으므로 두 식을 빼면 x 가 사라져요' },
      { expr: `${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])}`, note: '① - ②' },
      { expr: `y = ${y}`, note: `양변을 ${diff[1]}으로 나누기` },
      ...backSubSteps(e1, x, y, 'y'),
    ],
    hints: [
      `두 식에서 x 의 계수가 같아요. 한 식에서 다른 식을 빼면 x 가 사라져요.`,
      `① - ② 를 하면 ${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])}`,
      `y = ${y} 를 ①에 대입해 x 를 구하세요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

/* ───────────── 기본: 한 식에만 수를 곱해 계수를 맞춤 ───────────── */
function genOneScale() {
  const x = randNonZero(-5, 8);
  const y = randNonZero(-5, 8);
  const a1 = randInt(1, 3);
  const k = randInt(2, 3);
  const a2 = a1 * k; // ① 에 k 를 곱하면 x 계수가 같아짐
  let b1 = randNonZero(-4, 5);
  let b2 = randNonZero(-5, 5);
  if (b1 * k === b2) b2 += 1;
  if (b2 === 0) b2 = 1;
  const e1 = [a1, b1, a1 * x + b1 * y];
  const e2 = [a2, b2, a2 * x + b2 * y];
  const scaled = [a1 * k, b1 * k, e1[2] * k];
  const diff = [0, scaled[1] - b2, scaled[2] - e2[2]];
  const q = systemQuestion(e1, e2);
  return finish(base('one-scale', 'standard', 'addition', [e1.join('.'), e2.join('.')]), x, y, {
    question: q,
    solutionSteps: [
      { expr: q.latex, note: `①에 ${k}을(를) 곱하면 x 의 계수가 ${a2}로 같아져요` },
      { expr: `${eqLatex(...scaled)}`, note: `① × ${k}` },
      { expr: `${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])}`, note: `(① × ${k}) - ②` },
      { expr: `y = ${y}`, note: `양변을 ${diff[1]}으로 나누기` },
      ...backSubSteps(e1, x, y, 'y'),
    ],
    hints: [
      `x 의 계수 ${a1}과 ${a2}를 비교해 보세요. ①에 몇 을 곱하면 같아질까요?`,
      `① × ${k}: ${eqLatex(...scaled)}. 이제 ②와 빼 보세요.`,
      `${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])} 이므로 y = ${y}. 이 값을 ①에 대입하세요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

/* ───────────── 기본/발전: 대입법 (y = ax + b 꼴) ───────────── */
function genSubstitution(difficulty = 'standard') {
  const x = randNonZero(-5, 7);
  const m = randNonZero(-3, 4);
  const n = randNonZero(-6, 6);
  const y = m * x + n; // y = m x + n
  const a = randInt(1, 4);
  const b = randNonZero(-4, 4);
  const c = a * x + b * y;
  const e1 = [-m, 1, n]; // y - m x = n  → 표시는 y = m x + n
  const e2 = [a, b, c];
  const line1 = `y = ${linearExpr(m, n)}`;
  const line2 = eqLatex(...e2);
  const q = {
    kind: 'system',
    lines: [line1, line2],
    latex: `\\begin{cases} ${line1} \\\\ ${line2} \\end{cases}`,
  };
  const coef = a + b * m;
  const konst = b * n;
  return finish(base('subst', difficulty, 'substitution', [m, n, a, b, c]), x, y, {
    question: q,
    solutionSteps: [
      { expr: q.latex, note: '①이 y = … 꼴이므로 대입법이 편해요' },
      { expr: `${a === 1 ? 'x' : a + 'x'} + ${b === 1 ? '' : wrapNeg(b)}(${linearExpr(m, n)}) = ${numLatex(c)}`, note: '①을 ②에 대입' },
      { expr: `${linearExpr(coef, konst)} = ${numLatex(c)}`, note: '괄호 풀고 동류항 정리' },
      { expr: `${coef === 1 ? 'x' : coef + 'x'} = ${numLatex(c - konst)}`, note: '상수항 이항' },
      { expr: `x = ${x}`, note: coef === 1 ? '' : `양변을 ${coef}으로 나누기` },
      { expr: `y = ${m === 1 ? '' : m === -1 ? '-' : m}(${x}) ${n > 0 ? '+' : '-'} ${Math.abs(n)} = ${y}`, note: 'x 값을 ①에 대입' },
    ],
    hints: [
      `①이 "y = …" 모양이에요. 이 식을 ②의 y 자리에 통째로 넣어 보세요.`,
      `②에 대입: ${a === 1 ? 'x' : a + 'x'} + ${wrapNeg(b)}(${linearExpr(m, n)}) = ${numLatex(c)}`,
      `정리하면 ${linearExpr(coef, konst)} = ${numLatex(c)}. x 를 구한 뒤 ①에 넣어 y 를 구하세요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

/* ───────────── 발전: 두 식 모두 곱해야 하는 가감법 ───────────── */
function genTwoScale() {
  const x = randNonZero(-5, 7);
  const y = randNonZero(-5, 7);
  const pairs = [
    [2, 3],
    [3, 4],
    [2, 5],
    [3, 5],
    [4, 6],
  ];
  const [a1, a2] = pick(pairs);
  let b1 = randNonZero(-5, 5);
  let b2 = randNonZero(-5, 5);
  // 행렬식이 0 이 되지 않게
  if (a1 * b2 - a2 * b1 === 0) b2 = b2 === 5 ? 4 : b2 + 1;
  if (b2 === 0) b2 = 1;
  const e1 = [a1, b1, a1 * x + b1 * y];
  const e2 = [a2, b2, a2 * x + b2 * y];
  const L = lcm(a1, a2);
  const k1 = L / a1;
  const k2 = L / a2;
  const s1 = [L, b1 * k1, e1[2] * k1];
  const s2 = [L, b2 * k2, e2[2] * k2];
  const diff = [0, s1[1] - s2[1], s1[2] - s2[2]];
  const q = systemQuestion(e1, e2);
  return finish(base('two-scale', 'advanced', 'addition', [e1.join('.'), e2.join('.')]), x, y, {
    question: q,
    solutionSteps: [
      { expr: q.latex, note: `x 의 계수 ${a1}, ${a2} 의 최소공배수 ${L} 로 맞춰요` },
      { expr: eqLatex(...s1), note: `① × ${k1}` },
      { expr: eqLatex(...s2), note: `② × ${k2}` },
      { expr: `${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])}`, note: '두 식을 빼서 x 소거' },
      { expr: `y = ${y}`, note: `양변을 ${diff[1]}으로 나누기` },
      ...backSubSteps(e1, x, y, 'y'),
    ],
    hints: [
      `x 의 계수 ${a1}과 ${a2}의 최소공배수는 ${L}이에요. 각 식에 알맞은 수를 곱해 보세요.`,
      `① × ${k1}, ② × ${k2} 를 하면 x 의 계수가 모두 ${L}이 돼요. 그다음 두 식을 빼세요.`,
      `${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])} → y = ${y}. ①에 대입해 x 를 구하세요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

/* ───────────── 발전: 괄호가 있는 연립방정식 ───────────── */
function genBracketSystem() {
  const x = randNonZero(-4, 6);
  const y = randNonZero(-4, 6);
  const p = randInt(2, 3);
  const r = randNonZero(-3, 3);
  // p(x + y) - r·y = c1 → p x + (p - r) y = c1  ;  두 번째 식은 간단히
  const e1 = [p, p - r, p * x + (p - r) * y];
  let b2 = randNonZero(-3, 3);
  if (p * b2 - (p - r) === 0) b2 += 1;
  if (b2 === 0) b2 = 1;
  const e2 = [1, b2, x + b2 * y];
  const line1 = `${p}(x + y) ${r > 0 ? '-' : '+'} ${Math.abs(r)}y = ${numLatex(e1[2])}`;
  const line2 = eqLatex(...e2);
  const q = { kind: 'system', lines: [line1, line2], latex: `\\begin{cases} ${line1} \\\\ ${line2} \\end{cases}` };
  const s2 = [p, p * b2, p * e2[2]];
  const diff = [0, e1[1] - s2[1], e1[2] - s2[2]];
  return finish(base('bracket', 'advanced', 'addition', [p, r, b2, x, y]), x, y, {
    question: q,
    solutionSteps: [
      { expr: q.latex, note: '먼저 ①의 괄호를 풀어 ax + by = c 꼴로 정리해요' },
      { expr: eqLatex(...e1), note: '① 정리' },
      { expr: eqLatex(...s2), note: `② × ${p}` },
      { expr: `${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])}`, note: '두 식을 빼서 x 소거' },
      { expr: `y = ${y}`, note: '' },
      ...backSubSteps(e2, x, y, 'y'),
    ],
    hints: [
      `①의 괄호를 분배법칙으로 풀고 동류항을 정리해 보세요.`,
      `① 은 ${eqLatex(...e1)} 가 돼요. ②에 ${p}을(를) 곱해 x 의 계수를 맞추세요.`,
      `두 식을 빼면 ${linearExpr(diff[1], 0, 'y')} = ${numLatex(diff[2])} 가 돼요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

/* ───────────── 도전: 활용 ───────────── */
function wordBase(type, idParts) {
  return base(type, 'challenge', 'application', idParts);
}

function genWordPrice() {
  const pa = pick([500, 800, 1000, 1200]);
  const pb = pick([300, 400, 600, 700]);
  const x = randInt(2, 7);
  const y = randInt(2, 7);
  const total = x + y;
  const money = pa * x + pb * y;
  const text = `한 개에 ${pa}원인 사과와 한 개에 ${pb}원인 귤을 합하여 ${total}개 샀더니 ${money.toLocaleString()}원이었습니다. 사과(x)와 귤(y)은 각각 몇 개일까요?`;
  const e1 = [1, 1, total];
  const e2 = [pa, pb, money];
  return finish(wordBase('w-fruit', [pa, pb, x, y]), x, y, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `사과 ${x}개, 귤 ${y}개`,
    solutionSteps: [
      { expr: `\\begin{cases} x + y = ${total} \\\\ ${pa}x + ${pb}y = ${money} \\end{cases}`, note: '개수와 금액으로 식 세우기' },
      { expr: `${pa}x + ${pa}y = ${pa * total}`, note: `① × ${pa}` },
      { expr: `${pa - pb}y = ${pa * total - money}`, note: '(① × ' + pa + ') - ②' },
      { expr: `y = ${y}`, note: '' },
      { expr: `x = ${total} - ${y} = ${x}`, note: '①에 대입' },
    ],
    hints: [
      `개수에 대한 식 하나, 금액에 대한 식 하나를 세워 보세요.`,
      `x + y = ${total}, ${pa}x + ${pb}y = ${money}`,
      `①에 ${pa}을(를) 곱한 뒤 ②와 빼면 y 만 남아요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

function genWordStudents() {
  const boys = randInt(10, 20);
  const girls = randInt(10, 20);
  const total = boys + girls;
  const diff = boys - girls;
  const text =
    diff >= 0
      ? `어느 반의 학생 수는 ${total}명이고, 남학생이 여학생보다 ${diff}명 더 많습니다. 남학생 수(x)와 여학생 수(y)를 구하세요.`
      : `어느 반의 학생 수는 ${total}명이고, 여학생이 남학생보다 ${-diff}명 더 많습니다. 남학생 수(x)와 여학생 수(y)를 구하세요.`;
  const e1 = [1, 1, total];
  const e2 = [1, -1, diff];
  return finish(wordBase('w-students', [boys, girls]), boys, girls, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `남학생 ${boys}명, 여학생 ${girls}명`,
    solutionSteps: [
      { expr: `\\begin{cases} x + y = ${total} \\\\ x - y = ${diff} \\end{cases}`, note: '합과 차로 식 세우기' },
      { expr: `2x = ${total + diff}`, note: '① + ②' },
      { expr: `x = ${boys}`, note: '' },
      { expr: `y = ${total} - ${boys} = ${girls}`, note: '①에 대입' },
    ],
    hints: [
      `남학생 x명, 여학생 y명. 전체 학생 수로 식 하나, 차이로 식 하나!`,
      `x + y = ${total}, x - y = ${diff}`,
      `두 식을 더하면 y 가 사라져요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

function genWordLegs() {
  const x = randInt(3, 12); // 닭
  const y = randInt(2, 10); // 토끼
  const heads = x + y;
  const legs = 2 * x + 4 * y;
  const text = `농장에 닭과 토끼가 모두 ${heads}마리 있고, 다리 수의 합은 ${legs}개입니다. 닭(x)과 토끼(y)는 각각 몇 마리일까요?`;
  const e1 = [1, 1, heads];
  const e2 = [2, 4, legs];
  return finish(wordBase('w-legs', [x, y]), x, y, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `닭 ${x}마리, 토끼 ${y}마리`,
    solutionSteps: [
      { expr: `\\begin{cases} x + y = ${heads} \\\\ 2x + 4y = ${legs} \\end{cases}`, note: '마리 수와 다리 수로 식 세우기' },
      { expr: `2x + 2y = ${2 * heads}`, note: '① × 2' },
      { expr: `2y = ${legs - 2 * heads}`, note: '② - (① × 2)' },
      { expr: `y = ${y}`, note: '' },
      { expr: `x = ${heads} - ${y} = ${x}`, note: '①에 대입' },
    ],
    hints: [
      `닭은 다리가 2개, 토끼는 4개예요. 마리 수 식과 다리 수 식을 세워 보세요.`,
      `x + y = ${heads}, 2x + 4y = ${legs}`,
      `①에 2를 곱해 ②에서 빼면 2y = ${legs - 2 * heads}`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

function genWordAge() {
  const y = randInt(10, 15); // 자녀
  const x = y + randInt(25, 32); // 부모
  const n = randInt(2, 6);
  // n년 후 부모 나이 = k × 자녀 나이 가 정수가 되도록 k 를 역산하지 않고,
  // "n년 전 부모 나이는 자녀 나이의 k배" 조건 대신 합·차 형태로 제시
  const sum = x + y;
  const text = `현재 아버지와 아들의 나이의 합은 ${sum}살이고, ${n}년 후에는 아버지의 나이가 아들 나이보다 ${x - y}살 많습니다. 현재 아버지(x)와 아들(y)의 나이를 구하세요.`;
  const e1 = [1, 1, sum];
  const e2 = [1, -1, x - y];
  return finish(wordBase('w-age', [x, y, n]), x, y, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `아버지 ${x}살, 아들 ${y}살`,
    solutionSteps: [
      { expr: `\\begin{cases} x + y = ${sum} \\\\ (x + ${n}) - (y + ${n}) = ${x - y} \\end{cases}`, note: '나이 차는 시간이 지나도 변하지 않아요' },
      { expr: `x - y = ${x - y}`, note: '② 정리' },
      { expr: `2x = ${sum + x - y}`, note: '① + ②' },
      { expr: `x = ${x}, \\; y = ${y}`, note: '' },
    ],
    hints: [
      `${n}년 후에도 두 사람의 나이 차이는 그대로예요.`,
      `x + y = ${sum}, x - y = ${x - y}`,
      `두 식을 더하면 2x = ${sum + x - y}`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

function genWordSpeed() {
  // 걸은 거리 x km (시속 a), 달린 거리 y km (시속 b), 총 거리 D, 총 시간 T
  const sets = [
    [4, 8],
    [3, 6],
    [4, 12],
    [2, 6],
  ];
  const [a, b] = pick(sets);
  const x = a * randInt(1, 3); // 걸은 거리: 시간이 정수가 되도록
  const y = b * randInt(1, 2);
  const D = x + y;
  const T = x / a + y / b;
  const text = `집에서 ${D}km 떨어진 도서관까지 가는데 처음에는 시속 ${a}km로 걷다가 도중에 시속 ${b}km로 달렸더니 총 ${T}시간이 걸렸습니다. 걸은 거리(x km)와 달린 거리(y km)를 구하세요.`;
  const e1 = [1, 1, D];
  const e2 = [F(1, a), F(1, b), T];
  const L = lcm(a, b);
  const s2 = [L / a, L / b, T * L];
  return finish(wordBase('w-speed', [a, b, x, y]), x, y, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `걸은 거리 ${x}km, 달린 거리 ${y}km`,
    solutionSteps: [
      { expr: `\\begin{cases} x + y = ${D} \\\\ \\dfrac{x}{${a}} + \\dfrac{y}{${b}} = ${T} \\end{cases}`, note: '거리 식과 시간 식 (시간 = 거리 ÷ 속력)' },
      { expr: eqLatex(...s2), note: `② × ${L}` },
      { expr: `${s2[0]}x + ${s2[0]}y = ${s2[0] * D}`, note: `① × ${s2[0]}` },
      { expr: `${s2[1] - s2[0]}y = ${s2[2] - s2[0] * D}`, note: '두 식을 빼서 x 소거' },
      { expr: `y = ${y}, \\; x = ${x}`, note: '' },
    ],
    hints: [
      `거리의 합으로 식 하나, 시간의 합으로 식 하나를 세워요. 시간 = 거리 ÷ 속력!`,
      `x + y = ${D}, x/${a} + y/${b} = ${T}`,
      `시간 식의 양변에 ${L}을(를) 곱해 분모를 없애 보세요.`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

function genWordConcentration() {
  // a% 소금물 x g + b% 소금물 y g = c% 소금물 (x+y) g
  const sets = [
    [5, 10, 200, 100],
    [4, 10, 300, 100],
    [6, 12, 200, 200],
    [3, 8, 300, 200],
    [5, 15, 100, 300],
  ];
  const [a, b, x, y] = pick(sets);
  const total = x + y;
  const salt = (a * x + b * y) / 100;
  const cF = F(a * x + b * y, total);
  const cText = cF.isInteger() ? cF.toString() : cF.toNumber().toString();
  const text = `${a}%의 소금물과 ${b}%의 소금물을 섞어서 ${cText}%의 소금물 ${total}g을 만들려고 합니다. ${a}%의 소금물(x g)과 ${b}%의 소금물(y g)을 각각 몇 g씩 섞어야 할까요?`;
  const e1 = [1, 1, total];
  const e2 = [F(a, 100), F(b, 100), salt];
  return finish(wordBase('w-salt', [a, b, x, y]), x, y, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `${a}% 소금물 ${x}g, ${b}% 소금물 ${y}g`,
    solutionSteps: [
      { expr: `\\begin{cases} x + y = ${total} \\\\ \\dfrac{${a}}{100}x + \\dfrac{${b}}{100}y = \\dfrac{${cText}}{100} \\times ${total} \\end{cases}`, note: '소금물 양 식과 소금 양 식' },
      { expr: `${a}x + ${b}y = ${salt * 100}`, note: '② × 100' },
      { expr: `${a}x + ${a}y = ${a * total}`, note: `① × ${a}` },
      { expr: `${b - a}y = ${salt * 100 - a * total}`, note: '두 식을 빼서 x 소거' },
      { expr: `y = ${y}, \\; x = ${x}`, note: '' },
    ],
    hints: [
      `소금물의 양에 대한 식과, 소금의 양에 대한 식을 세워요. 소금 양 = 농도/100 × 소금물 양`,
      `x + y = ${total}, ${a}x + ${b}y = ${salt * 100}`,
      `①에 ${a}을(를) 곱해 ②에서 빼면 ${b - a}y = ${salt * 100 - a * total}`,
    ],
    verify: makeVerifier([e1, e2]),
  });
}

const GENERATORS = {
  basic: [genBasicAddition, genBasicSubtraction],
  standard: [genOneScale, genOneScale, () => genSubstitution('standard')],
  advanced: [genTwoScale, genTwoScale, genBracketSystem, () => genSubstitution('advanced')],
  challenge: [genWordPrice, genWordStudents, genWordLegs, genWordAge, genWordSpeed, genWordConcentration],
};

export function generateSimultaneous(difficulty) {
  const list = GENERATORS[difficulty] || GENERATORS.basic;
  return pick(list)();
}

export const SIMULTANEOUS_CONCEPTS = {
  'two-var': '미지수가 두 개인 일차방정식',
  meaning: '연립방정식의 뜻과 해',
  addition: '가감법',
  substitution: '대입법',
  application: '연립방정식 활용',
};

void randInt;
