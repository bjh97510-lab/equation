/**
 * 중1 일차방정식 문제 생성기
 *
 * 설계 원칙
 *  - 먼저 해 x 를 정하고 식을 역으로 만든다 (해가 지저분해지지 않도록).
 *  - 문제 생성 / 정답 계산 / 풀이 생성 을 분리한다.
 *  - 모든 문제는 verify() 로 좌변 = 우변 검증을 통과해야 한다.
 */
import { Fraction, F } from './fraction.js';
import { randInt, randNonZero, pick, randSign, chance } from './random.js';
import { linearExpr, numLatex, wrapNeg, xPlus, decLatex, decTerm } from './format.js';
import { DIFFICULTY_REWARDS } from '../config/appConfig.js';

const UNIT = 'linear';
const GRADE = 1;

/** 좌변/우변이 (a x + b) 꼴인 일차방정식의 검증 함수 생성 */
function makeVerifier(L, R) {
  return (x) => {
    const X = Fraction.from(x);
    const lhs = Fraction.from(L.a).mul(X).add(L.b);
    const rhs = Fraction.from(R.a).mul(X).add(R.b);
    return lhs.eq(rhs);
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
    answerType: 'single',
  };
}

function finish(p, xVal, extra) {
  const X = Fraction.from(xVal);
  return {
    ...p,
    ...extra,
    answer: { value: X.toNumber(), display: X.toString() },
    answerDisplay: `x = ${X.toString()}`,
    acceptedAnswers: X.isInteger() ? [X.toString()] : [X.toString(), String(X.toNumber())],
    verify: extra.verify ?? (() => true),
  };
}

/* ───────────────────────── 기초 ───────────────────────── */

function genAdd() {
  const x = randInt(-5, 12);
  const a = randInt(1, 12);
  const b = x + a;
  const latex = `x + ${a} = ${b}`;
  return finish(base('add', 'basic', 'property', [a, b]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `x = ${b} - ${a}`, note: `양변에서 ${a}을(를) 빼기` },
      { expr: `x = ${x}`, note: '계산하기' },
    ],
    hints: [
      `x 혼자 남기려면 왼쪽의 +${a}을(를) 없애야 해요. 양변에 같은 수를 빼면 어떨까요?`,
      `양변에서 ${a}을(를) 빼면 x = ${b} - ${a} 가 돼요.`,
      `${b} - ${a} 를 계산해 보세요.`,
    ],
    verify: makeVerifier({ a: 1, b: a }, { a: 0, b }),
  });
}

function genSub() {
  const x = randInt(-4, 15);
  const a = randInt(1, 12);
  const b = x - a;
  const latex = `x - ${a} = ${numLatex(b)}`;
  return finish(base('sub', 'basic', 'property', [a, b]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `x = ${numLatex(b)} + ${a}`, note: `양변에 ${a}을(를) 더하기` },
      { expr: `x = ${x}`, note: '계산하기' },
    ],
    hints: [
      `왼쪽의 -${a}을(를) 없애려면 양변에 무엇을 더하면 될까요?`,
      `양변에 ${a}을(를) 더하면 x = ${numLatex(b)} + ${a} 가 돼요.`,
      `${numLatex(b)} + ${a} 를 계산해 보세요.`,
    ],
    verify: makeVerifier({ a: 1, b: -a }, { a: 0, b }),
  });
}

function genMul() {
  const x = randNonZero(-6, 9);
  const a = randInt(2, 9);
  const b = a * x;
  const latex = `${a}x = ${numLatex(b)}`;
  return finish(base('mul', 'basic', 'property', [a, b]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `x = ${numLatex(b)} \\div ${a}`, note: `양변을 ${a}으로 나누기` },
      { expr: `x = ${x}`, note: '계산하기' },
    ],
    hints: [
      `${a}x 는 x 를 ${a}번 더한 것이에요. x 하나의 값을 알려면 양변을 어떻게 하면 될까요?`,
      `양변을 ${a}으로 나누면 x = ${numLatex(b)} ÷ ${a} 가 돼요.`,
      `${numLatex(b)} ÷ ${a} 를 계산해 보세요. 부호에 주의!`,
    ],
    verify: makeVerifier({ a, b: 0 }, { a: 0, b }),
  });
}

/* ───────────────────────── 기본 ───────────────────────── */

function genAxPlusB() {
  const x = randNonZero(-8, 10);
  const a = randInt(2, 9);
  const b = randNonZero(-15, 15);
  const c = a * x + b;
  const latex = `${linearExpr(a, b)} = ${numLatex(c)}`;
  const ax = a * x;
  return finish(base('axb', 'standard', 'solve', [a, b, c]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      {
        expr: `${a}x = ${numLatex(c)} ${b > 0 ? '-' : '+'} ${Math.abs(b)}`,
        note: b > 0 ? `양변에서 ${b}을(를) 빼기` : `양변에 ${Math.abs(b)}을(를) 더하기`,
      },
      { expr: `${a}x = ${numLatex(ax)}`, note: '정리하기' },
      { expr: `x = ${x}`, note: `양변을 ${a}으로 나누기` },
    ],
    hints: [
      `먼저 상수항 ${b > 0 ? `+${b}` : b}을(를) 우변으로 옮겨 ${a}x 만 남겨 보세요.`,
      `${a}x = ${numLatex(c)} ${b > 0 ? '-' : '+'} ${Math.abs(b)} 가 돼요. 우변을 계산하면?`,
      `${a}x = ${numLatex(ax)} 이므로 양변을 ${a}으로 나누면 돼요.`,
    ],
    verify: makeVerifier({ a, b }, { a: 0, b: c }),
  });
}

function genCMinusAx() {
  // c - ax = d  꼴 (음수 계수 연습)
  const x = randNonZero(-6, 9);
  const a = randInt(2, 7);
  const c = randInt(1, 20);
  const d = c - a * x;
  const latex = `${c} - ${a}x = ${numLatex(d)}`;
  return finish(base('cax', 'standard', 'solve', [a, c, d]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `-${a}x = ${numLatex(d)} - ${c}`, note: `양변에서 ${c}을(를) 빼기` },
      { expr: `-${a}x = ${numLatex(d - c)}`, note: '정리하기' },
      { expr: `x = ${x}`, note: `양변을 -${a}으로 나누기` },
    ],
    hints: [
      `x 가 있는 항은 -${a}x 예요. 상수항 ${c}을(를) 우변으로 옮겨 보세요.`,
      `-${a}x = ${numLatex(d)} - ${c} = ${numLatex(d - c)}`,
      `양변을 -${a}으로 나누면 x 가 나와요. 음수 ÷ 음수는 양수!`,
    ],
    verify: makeVerifier({ a: -a, b: c }, { a: 0, b: d }),
  });
}

/* ───────────────────────── 발전 ───────────────────────── */

function genBracket() {
  const x = randNonZero(-6, 9);
  const a = randInt(2, 6);
  const b = randNonZero(-9, 9);
  const c = a * (x + b);
  const latex = `${a}(${xPlus(b)}) = ${numLatex(c)}`;
  const ab = a * b;
  return finish(base('bracket', 'advanced', 'bracket', [a, b, c]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `${linearExpr(a, ab)} = ${numLatex(c)}`, note: '분배법칙으로 괄호 풀기' },
      { expr: `${a}x = ${numLatex(c)} ${ab > 0 ? '-' : '+'} ${Math.abs(ab)}`, note: '상수항 이항' },
      { expr: `${a}x = ${numLatex(a * x)}`, note: '정리하기' },
      { expr: `x = ${x}`, note: `양변을 ${a}으로 나누기` },
    ],
    hints: [
      `분배법칙! ${a}을(를) 괄호 안의 두 항에 각각 곱해 보세요.`,
      `괄호를 풀면 ${linearExpr(a, ab)} = ${numLatex(c)} 가 돼요.`,
      `${a}x = ${numLatex(a * x)} 까지 정리한 뒤 양변을 ${a}으로 나누세요.`,
    ],
    verify: makeVerifier({ a, b: ab }, { a: 0, b: c }),
  });
}

function genBothSides() {
  const x = randNonZero(-6, 9);
  let a = randInt(2, 9);
  let c = randInt(1, 8);
  if (c === a) c = a + 1;
  const b = randNonZero(-12, 12);
  const d = a * x + b - c * x;
  const latex = `${linearExpr(a, b)} = ${linearExpr(c, d)}`;
  const coef = a - c;
  const konst = d - b;
  return finish(base('both', 'advanced', 'solve', [a, b, c, d]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      {
        expr: `${a}x - ${c}x = ${numLatex(d)} ${b > 0 ? '-' : '+'} ${Math.abs(b)}`,
        note: 'x 항은 좌변으로, 상수항은 우변으로 이항',
      },
      { expr: `${linearExpr(coef, 0)} = ${numLatex(konst)}`, note: '동류항 정리' },
      { expr: `x = ${x}`, note: `양변을 ${coef}으로 나누기` },
    ],
    hints: [
      `양변에 모두 x 가 있어요. x 항은 한쪽(보통 좌변)으로, 숫자는 반대쪽으로 모아 보세요.`,
      `${a}x - ${c}x = ${numLatex(d)} ${b > 0 ? '-' : '+'} ${Math.abs(b)} 로 정리돼요.`,
      `${linearExpr(coef, 0)} = ${numLatex(konst)} 이므로 양변을 ${coef}으로 나누세요.`,
    ],
    verify: makeVerifier({ a, b }, { a: c, b: d }),
  });
}

function genFraction() {
  if (chance(0.5)) {
    // x/a + b = c  (x 는 a 의 배수)
    const a = randInt(2, 6);
    const k = randNonZero(-4, 6);
    const x = a * k;
    const b = randNonZero(-8, 8);
    const c = k + b;
    const latex = `\\frac{x}{${a}} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = ${numLatex(c)}`;
    return finish(base('fracx', 'advanced', 'fraction', [a, b, c]), x, {
      question: { kind: 'equation', latex },
      solutionSteps: [
        { expr: latex, note: '처음 식' },
        { expr: `\\frac{x}{${a}} = ${numLatex(c)} ${b > 0 ? '-' : '+'} ${Math.abs(b)}`, note: '상수항 이항' },
        { expr: `\\frac{x}{${a}} = ${numLatex(k)}`, note: '정리하기' },
        { expr: `x = ${numLatex(k)} \\times ${a} = ${x}`, note: `양변에 ${a}을(를) 곱하기` },
      ],
      hints: [
        `먼저 상수항을 우변으로 옮겨 x/${a} 만 남겨 보세요.`,
        `x/${a} = ${numLatex(k)} 가 돼요. 분모 ${a}을(를) 없애려면?`,
        `양변에 ${a}을(를) 곱하면 x = ${numLatex(k)} × ${a}`,
      ],
      verify: makeVerifier({ a: F(1, a), b }, { a: 0, b: c }),
    });
  }
  // (x + a)/b = c  → x = bc - a
  const b = randInt(2, 6);
  const c = randNonZero(-5, 7);
  const a = randNonZero(-9, 9);
  const x = b * c - a;
  const latex = `\\frac{${xPlus(a)}}{${b}} = ${numLatex(c)}`;
  return finish(base('fracp', 'advanced', 'fraction', [a, b, c]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `${xPlus(a)} = ${numLatex(c)} \\times ${b}`, note: `양변에 ${b}을(를) 곱하기` },
      { expr: `${xPlus(a)} = ${numLatex(b * c)}`, note: '정리하기' },
      { expr: `x = ${numLatex(b * c)} ${a > 0 ? '-' : '+'} ${Math.abs(a)} = ${x}`, note: '상수항 이항' },
    ],
    hints: [
      `분모 ${b}을(를) 없애기 위해 양변에 ${b}을(를) 곱해 보세요.`,
      `${xPlus(a)} = ${numLatex(b * c)} 가 돼요.`,
      `이제 ${a > 0 ? `+${a}` : a}을(를) 우변으로 이항하면 끝!`,
    ],
    verify: makeVerifier({ a: F(1, b), b: F(a, b) }, { a: 0, b: c }),
  });
}

function genDecimal() {
  // A/10 x + B/10 = C/10  → 정수 계수로 변환
  const A = pick([2, 3, 4, 5, 6]);
  const x = randNonZero(-6, 9);
  const B = randNonZero(-20, 20);
  const C = A * x + B;
  const a = A / 10;
  const b = B / 10;
  const c = C / 10;
  const latex = `${decTerm(a, 'x')} ${b > 0 ? '+' : '-'} ${decLatex(Math.abs(b))} = ${decLatex(c)}`;
  return finish(base('dec', 'advanced', 'fraction', [A, B, C]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `${linearExpr(A, B)} = ${numLatex(C)}`, note: '양변에 10을 곱해 정수로 만들기' },
      { expr: `${A}x = ${numLatex(C)} ${B > 0 ? '-' : '+'} ${Math.abs(B)} = ${numLatex(A * x)}`, note: '상수항 이항' },
      { expr: `x = ${x}`, note: `양변을 ${A}으로 나누기` },
    ],
    hints: [
      `소수가 불편하면 양변에 10을 곱해 정수 계수로 바꿔 보세요.`,
      `10을 곱하면 ${linearExpr(A, B)} = ${numLatex(C)} 가 돼요.`,
      `${A}x = ${numLatex(A * x)} 이므로 양변을 ${A}으로 나누세요.`,
    ],
    verify: makeVerifier({ a: F(A, 10), b: F(B, 10) }, { a: 0, b: F(C, 10) }),
  });
}

function genFractionSolution() {
  // ax + b = c, 해가 분수 p/q
  const q = pick([2, 3, 4]);
  let p = randNonZero(-9, 9);
  while (p % q === 0) p = randNonZero(-9, 9);
  const x = F(p, q);
  const a = q * randInt(1, 3);
  const b = randNonZero(-10, 10);
  const cF = x.mul(a).add(b); // 정수
  const c = cF.toNumber();
  const latex = `${linearExpr(a, b)} = ${numLatex(c)}`;
  const ax = c - b;
  return finish(base('fsol', 'advanced', 'solve', [a, b, c]), x, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `${a}x = ${numLatex(c)} ${b > 0 ? '-' : '+'} ${Math.abs(b)} = ${numLatex(ax)}`, note: '상수항 이항' },
      { expr: `x = ${F(ax, a).toLatex()}`, note: `양변을 ${a}으로 나누기 (약분!)` },
    ],
    hints: [
      `상수항을 우변으로 옮기면 ${a}x = ${numLatex(ax)} 가 돼요.`,
      `양변을 ${a}으로 나누면 x = ${ax}/${a} 예요. 나누어떨어지지 않으면 분수로 답해요.`,
      `${ax}/${a} 를 기약분수로 약분해 보세요.`,
    ],
    verify: makeVerifier({ a, b }, { a: 0, b: c }),
  });
}

/* ───────────────────────── 도전 (활용) ───────────────────────── */

function wordBase(type, idParts) {
  return base(type, 'challenge', 'application', idParts);
}

function genWordConsecutive() {
  // 연속하는 세 자연수의 합
  const x = randInt(5, 40);
  const sum = 3 * x + 3;
  const text = `연속하는 세 자연수의 합이 ${sum}입니다. 세 수 중 가장 작은 수를 구하세요.`;
  return finish(wordBase('w-consec', [sum]), x, {
    question: { kind: 'word', text, latex: '', hintEq: 'x + (x+1) + (x+2) = ' + sum },
    guided: { form: 'linear-word', type: 'w-consec', params: { x, sum } },
    answerDisplay: `${x}`,
    solutionSteps: [
      { expr: `x + (x + 1) + (x + 2) = ${sum}`, note: '가장 작은 수를 x 로 놓고 식 세우기' },
      { expr: `3x + 3 = ${sum}`, note: '동류항 정리' },
      { expr: `3x = ${sum - 3}`, note: '상수항 이항' },
      { expr: `x = ${x}`, note: '양변을 3으로 나누기' },
    ],
    hints: [
      `가장 작은 수를 x 라 하면 나머지 두 수는 x+1, x+2 예요.`,
      `세 수의 합: x + (x+1) + (x+2) = ${sum}`,
      `3x + 3 = ${sum} 이므로 3x = ${sum - 3}`,
    ],
    verify: (v) => 3 * v + 3 === sum,
  });
}

function genWordAge() {
  const child = randInt(10, 16);
  const diff = randInt(26, 34);
  const years = randInt(3, 12);
  // (child + diff + years) = k (child + years) 가 정수 k 가 되도록 조정
  // 대신 "n년 후 어머니 나이가 자녀 나이의 2배" → child + diff + n = 2(child + n) → n = diff - child
  const n = diff - child;
  if (n <= 0) return genWordAge();
  const text = `현재 어머니의 나이는 ${child + diff}살, 자녀의 나이는 ${child}살입니다. 몇 년 후에 어머니의 나이가 자녀 나이의 2배가 될까요? (단, 답은 년 수)`;
  void years;
  return finish(wordBase('w-age', [child, diff]), n, {
    question: { kind: 'word', text, latex: '' },
    guided: { form: 'linear-word', type: 'w-age', params: { mother: child + diff, child, n } },
    answerDisplay: `${n}년 후`,
    solutionSteps: [
      { expr: `${child + diff} + x = 2(${child} + x)`, note: 'x년 후의 나이로 식 세우기' },
      { expr: `${child + diff} + x = ${2 * child} + 2x`, note: '괄호 풀기' },
      { expr: `${child + diff} - ${2 * child} = 2x - x`, note: '이항' },
      { expr: `x = ${n}`, note: '정리' },
    ],
    hints: [
      `x년 후 어머니는 (${child + diff} + x)살, 자녀는 (${child} + x)살이에요.`,
      `어머니 나이 = 2 × 자녀 나이 → ${child + diff} + x = 2(${child} + x)`,
      `괄호를 풀고 x 항을 한쪽으로 모아 보세요.`,
    ],
    verify: (v) => child + diff + v === 2 * (child + v),
  });
}

function genWordPrice() {
  const pen = pick([500, 700, 800, 1000, 1200]);
  const note = pick([1500, 2000, 2500]);
  const nNote = randInt(1, 3);
  const x = randInt(2, 9);
  const total = pen * x + note * nNote;
  const text = `한 자루에 ${pen}원인 연필 몇 자루와 한 권에 ${note}원인 공책 ${nNote}권을 사고 ${total.toLocaleString()}원을 냈습니다. 연필은 몇 자루 샀을까요?`;
  return finish(wordBase('w-price', [pen, note, nNote, x]), x, {
    question: { kind: 'word', text, latex: '' },
    guided: { form: 'linear-word', type: 'w-price', params: { pen, noteCost: note * nNote, total, x } },
    answerDisplay: `${x}자루`,
    solutionSteps: [
      { expr: `${pen}x + ${note * nNote} = ${total}`, note: '연필 수를 x 로 놓고 식 세우기' },
      { expr: `${pen}x = ${total - note * nNote}`, note: '상수항 이항' },
      { expr: `x = ${x}`, note: `양변을 ${pen}으로 나누기` },
    ],
    hints: [
      `연필 x자루의 값은 ${pen}x 원, 공책 값은 ${note} × ${nNote} = ${note * nNote} 원이에요.`,
      `${pen}x + ${note * nNote} = ${total}`,
      `${pen}x = ${total - note * nNote} 이므로 양변을 ${pen}으로 나누세요.`,
    ],
    verify: (v) => pen * v + note * nNote === total,
  });
}

function genWordDistance() {
  // 갈 때 속력 a, 올 때 속력 b, 총 시간 t → 거리 x: x/a + x/b = t
  const pairs = [
    [2, 3, 6],
    [3, 4, 12],
    [4, 6, 12],
    [2, 4, 4],
    [3, 6, 6],
  ];
  const [a, b, l] = pick(pairs);
  const k = randInt(1, 4);
  const x = l * k; // km
  const tF = F(x, a).add(F(x, b));
  const t = tF.toNumber();
  const tText = tF.isInteger() ? `${t}시간` : `${tF.toString()}시간`;
  const text = `집에서 공원까지 갈 때는 시속 ${a}km로 걷고, 올 때는 같은 길을 시속 ${b}km로 걸었더니 총 ${tText}이 걸렸습니다. 집에서 공원까지의 거리는 몇 km일까요?`;
  const l2 = a * b / (function g(p, q) { return q ? g(q, p % q) : p; })(a, b);
  return finish(wordBase('w-dist', [a, b, x]), x, {
    question: { kind: 'word', text, latex: '' },
    guided: { form: 'linear-word', type: 'w-dist', params: { a, b, t, L: l2, x } },
    answerDisplay: `${x}km`,
    solutionSteps: [
      { expr: `\\frac{x}{${a}} + \\frac{x}{${b}} = ${tF.toLatex()}`, note: '거리를 x km 로 놓고 (시간 = 거리 ÷ 속력)' },
      { expr: `${l2 / a}x + ${l2 / b}x = ${numLatex(tF.mul(l2).toNumber())}`, note: `양변에 ${l2}을(를) 곱하기` },
      { expr: `${l2 / a + l2 / b}x = ${numLatex(tF.mul(l2).toNumber())}`, note: '동류항 정리' },
      { expr: `x = ${x}`, note: '나누기' },
    ],
    hints: [
      `시간 = 거리 ÷ 속력. 거리를 x 라 하면 갈 때 x/${a}시간, 올 때 x/${b}시간이에요.`,
      `x/${a} + x/${b} = ${tF.toString()}`,
      `분모를 없애기 위해 양변에 ${l2}을(를) 곱해 보세요.`,
    ],
    verify: (v) => F(v, a).add(F(v, b)).eq(tF),
  });
}

function genWordRectangle() {
  const w = randInt(3, 12);
  const extra = randInt(2, 8);
  const h = w + extra;
  const peri = 2 * (w + h);
  const text = `가로의 길이가 세로의 길이보다 ${extra}cm 더 긴 직사각형의 둘레가 ${peri}cm입니다. 세로의 길이는 몇 cm일까요?`;
  return finish(wordBase('w-rect', [w, extra]), w, {
    question: { kind: 'word', text, latex: '' },
    guided: { form: 'linear-word', type: 'w-rect', params: { w, extra, peri } },
    answerDisplay: `${w}cm`,
    solutionSteps: [
      { expr: `2\\{x + (x + ${extra})\\} = ${peri}`, note: '세로를 x, 가로를 x + ' + extra + ' 로 놓기' },
      { expr: `2(2x + ${extra}) = ${peri}`, note: '괄호 안 정리' },
      { expr: `4x + ${2 * extra} = ${peri}`, note: '분배법칙' },
      { expr: `4x = ${peri - 2 * extra}`, note: '상수항 이항' },
      { expr: `x = ${w}`, note: '양변을 4로 나누기' },
    ],
    hints: [
      `세로를 x cm 라 하면 가로는 (x + ${extra}) cm 예요.`,
      `직사각형의 둘레 = 2 × (가로 + 세로) 이므로 2(x + x + ${extra}) = ${peri}`,
      `4x + ${2 * extra} = ${peri} 를 풀어 보세요.`,
    ],
    verify: (v) => 2 * (v + v + extra) === peri,
  });
}

function genWordCount() {
  // 500원 동전과 100원 동전 합쳐 n개, 총 금액 → 500원 동전 개수
  const total = randInt(8, 20);
  const x = randInt(2, total - 2);
  const money = 500 * x + 100 * (total - x);
  const text = `500원짜리 동전과 100원짜리 동전을 합하여 ${total}개를 가지고 있는데 총 금액이 ${money.toLocaleString()}원입니다. 500원짜리 동전은 몇 개일까요?`;
  return finish(wordBase('w-coin', [total, x]), x, {
    question: { kind: 'word', text, latex: '' },
    guided: { form: 'linear-word', type: 'w-coin', params: { total, money, x } },
    answerDisplay: `${x}개`,
    solutionSteps: [
      { expr: `500x + 100(${total} - x) = ${money}`, note: '500원 동전을 x개, 100원 동전을 (' + total + ' - x)개로 놓기' },
      { expr: `500x + ${100 * total} - 100x = ${money}`, note: '분배법칙' },
      { expr: `400x = ${money - 100 * total}`, note: '정리 및 이항' },
      { expr: `x = ${x}`, note: '양변을 400으로 나누기' },
    ],
    hints: [
      `500원 동전을 x개라 하면 100원 동전은 (${total} - x)개예요.`,
      `금액: 500x + 100(${total} - x) = ${money}`,
      `괄호를 풀면 400x + ${100 * total} = ${money}`,
    ],
    verify: (v) => 500 * v + 100 * (total - v) === money,
  });
}

/* ───────────────────────── 디스패치 ───────────────────────── */

const GENERATORS = {
  basic: [genAdd, genSub, genMul],
  standard: [genAxPlusB, genAxPlusB, genCMinusAx],
  advanced: [genBracket, genBothSides, genFraction, genDecimal, genFractionSolution],
  challenge: [genWordConsecutive, genWordAge, genWordPrice, genWordDistance, genWordRectangle, genWordCount],
};

export function generateLinear(difficulty) {
  const list = GENERATORS[difficulty] || GENERATORS.basic;
  const gen = pick(list);
  return gen();
}

export const LINEAR_CONCEPTS = {
  'equation-basics': '등식과 방정식',
  property: '등식의 성질과 이항',
  solve: '일차방정식 풀이',
  bracket: '괄호가 있는 방정식',
  fraction: '분수·소수가 있는 방정식',
  application: '일차방정식 활용',
};

// randSign 은 향후 변형 문제용으로 남겨 둠
void randSign;
void wrapNeg;
