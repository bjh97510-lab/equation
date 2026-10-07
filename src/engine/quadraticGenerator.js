/**
 * 중3 이차방정식 문제 생성기
 *
 *  - 두 근 r1, r2 를 먼저 정하고 (x - r1)(x - r2) = 0 을 전개한다.
 *  - 식: a x² + b x + c = 0  (a, b, c 는 정수)
 *  - verify(): 각 근을 대입했을 때 0 이 되는지 확인 (유리근은 분수 연산, 무리근은 오차 검사)
 *  - answerType 'roots': 두 근의 순서는 상관없이 정답 처리. 중근은 같은 값 두 번.
 */
import { Fraction, F, gcd } from './fraction.js';
import { randInt, randNonZero, pick, chance } from './random.js';
import { quadExpr, numLatex, xPlus, rootLatex, rootDisplay, rootValue, linearExpr } from './format.js';
import { DIFFICULTY_REWARDS } from '../config/appConfig.js';

const UNIT = 'quadratic';
const GRADE = 3;

function base(type, difficulty, concept, idParts) {
  return {
    id: `${UNIT}-${difficulty}-${type}-${idParts.join('_')}`,
    grade: GRADE,
    unit: UNIT,
    concept,
    difficulty,
    type,
    reward: DIFFICULTY_REWARDS[difficulty],
    answerType: 'roots',
  };
}

/** 정수 계수 a x² + b x + c 에 대한 검증기 */
function makeVerifier(a, b, c) {
  return (r1, r2) =>
    [r1, r2].every((r) => {
      if (r instanceof Fraction) return Fraction.from(a).mul(r).mul(r).add(Fraction.from(b).mul(r)).add(c).isZero();
      const v = a * r * r + b * r + c;
      return Math.abs(v) < 1e-7 * Math.max(1, Math.abs(a), Math.abs(b), Math.abs(c));
    });
}

/** 두 근(Fraction 또는 root 객체)으로 문제 마무리 */
function finish(p, roots, extra) {
  const vals = roots.map(rootValue);
  const disp = roots.map(rootDisplay);
  const isDouble = Math.abs(vals[0] - vals[1]) < 1e-9;
  const answerDisplay = isDouble ? `x = ${disp[0]} (중근)` : `x = ${disp[0]} 또는 x = ${disp[1]}`;
  return {
    ...p,
    ...extra,
    answer: { roots: vals, display: disp, isDouble },
    answerDisplay: extra.answerDisplay || answerDisplay,
    acceptedAnswers: isDouble ? [disp[0]] : [`${disp[0]}, ${disp[1]}`, `${disp[1]}, ${disp[0]}`],
    rootsLatex: roots.map(rootLatex),
  };
}

/** 인수 (x - r) 표시: r 이 Fraction 이면 (qx - p) 형태로 */
function factorLatex(r) {
  if (r.isInteger()) return `(${xPlus(r.neg())})`;
  return `(${linearExpr(r.d, -r.n)})`;
}

/* ───────────── 기초: x² = a, (x+p)² = q (완전제곱 기반) ───────────── */
function genPureSquare() {
  const r = randInt(1, 12);
  const a = r * r;
  const latex = `x^2 = ${a}`;
  const roots = [F(r), F(-r)];
  return finish(base('pure', 'basic', 'sqrt', [a]), roots, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '제곱해서 ' + a + ' 이 되는 수를 찾아요' },
      { expr: `x = \\pm\\sqrt{${a}}`, note: '제곱근 이용' },
      { expr: `x = ${r} \\;\\text{또는}\\; x = -${r}`, note: '양수와 음수 두 개!' },
    ],
    hints: [
      `어떤 수를 제곱하면 ${a} 이 될까요? 양수뿐 아니라 음수도 생각해 보세요.`,
      `${r} × ${r} = ${a} 이고, (-${r}) × (-${r}) 도 ${a} 이에요.`,
      `답은 두 개예요: x = ±${r}`,
    ],
    verify: makeVerifier(1, 0, -a),
  });
}

function genSquareMinusConst() {
  const r = randInt(1, 10);
  const a = r * r;
  const latex = `x^2 - ${a} = 0`;
  const roots = [F(r), F(-r)];
  return finish(base('pure2', 'basic', 'sqrt', [a]), roots, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `x^2 = ${a}`, note: `${a}을(를) 우변으로 이항` },
      { expr: `x = \\pm ${r}`, note: '제곱근 이용' },
    ],
    hints: [
      `상수항을 우변으로 옮기면 x² = (어떤 수) 꼴이 돼요.`,
      `x² = ${a}. 제곱해서 ${a}이 되는 수는?`,
      `x = ${r} 와 x = -${r} 모두 답이에요.`,
    ],
    verify: makeVerifier(1, 0, -a),
  });
}

function genShiftedSquare() {
  // (x + p)² = q,  q 는 완전제곱수
  const p = randNonZero(-6, 6);
  const s = randInt(1, 6);
  const q = s * s;
  const latex = `(${xPlus(p)})^2 = ${q}`;
  const roots = [F(-p + s), F(-p - s)];
  return finish(base('shift', 'basic', 'sqrt', [p, q]), roots, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '괄호 전체를 하나의 수로 생각해요' },
      { expr: `${xPlus(p)} = \\pm ${s}`, note: '제곱근 이용' },
      { expr: `x = ${-p} \\pm ${s}`, note: `${p > 0 ? '-' : '+'}${Math.abs(p)} 이항` },
      { expr: `x = ${-p + s} \\;\\text{또는}\\; x = ${-p - s}`, note: '' },
    ],
    hints: [
      `괄호 안을 통째로 A 라 생각하면 A² = ${q} 예요.`,
      `${xPlus(p)} = ${s} 또는 ${xPlus(p)} = -${s}`,
      `각 경우에서 x 를 구하면 두 개의 답이 나와요.`,
    ],
    verify: makeVerifier(1, 2 * p, p * p - q),
  });
}

/* ───────────── 기본: 인수분해가 쉬운 x² + bx + c = 0 ───────────── */
function genFactorMonic() {
  let r1 = randNonZero(-7, 7);
  let r2 = randNonZero(-7, 7);
  const b = -(r1 + r2);
  const c = r1 * r2;
  const latex = `${quadExpr(1, b, c)} = 0`;
  const roots = [F(r1), F(r2)];
  return finish(base('monic', 'standard', 'factoring', [b, c]), roots, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: `곱해서 ${c}, 더해서 ${b} 이 되는 두 수를 찾아요` },
      { expr: `${factorLatex(F(r1))}${factorLatex(F(r2))} = 0`, note: `두 수: ${-r1}, ${-r2}` },
      { expr: `${xPlus(-r1)} = 0 \\;\\text{또는}\\; ${xPlus(-r2)} = 0`, note: 'AB = 0 이면 A = 0 또는 B = 0' },
      { expr: `x = ${r1} \\;\\text{또는}\\; x = ${r2}`, note: '' },
    ],
    hints: [
      `곱해서 ${c}, 더해서 ${b} 이 되는 두 정수를 찾아보세요.`,
      `그 두 수는 ${-r1} 과 ${-r2} 예요. (x + □)(x + △) = 0 꼴로 인수분해!`,
      `${factorLatex(F(r1))}${factorLatex(F(r2))} = 0 에서 각 괄호가 0 이 되는 x 를 구하세요.`,
    ],
    verify: makeVerifier(1, b, c),
  });
}

function genCommonFactor() {
  // x² + bx = 0  → x(x + b) = 0
  const b = randNonZero(-9, 9);
  const latex = `x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x = 0`;
  const roots = [F(0), F(-b)];
  return finish(base('common', 'standard', 'factoring', [b]), roots, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: '두 항에 공통으로 x 가 있어요' },
      { expr: `x(${xPlus(b)}) = 0`, note: '공통인수 x 로 묶기' },
      { expr: `x = 0 \\;\\text{또는}\\; x = ${-b}`, note: '' },
    ],
    hints: [
      `두 항 모두 x 를 포함하고 있어요. 공통인수로 묶어 보세요.`,
      `x(${xPlus(b)}) = 0`,
      `x = 0 도 답이라는 것을 잊지 마세요!`,
    ],
    verify: makeVerifier(1, b, 0),
  });
}

function genDoubleRoot() {
  const r = randNonZero(-7, 7);
  const b = -2 * r;
  const c = r * r;
  const latex = `${quadExpr(1, b, c)} = 0`;
  const roots = [F(r), F(r)];
  return finish(base('double', 'standard', 'complete-square', [b, c]), roots, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: `상수항 ${c} = (${-r})² 이고 x 의 계수가 2 × (${-r}) 이에요` },
      { expr: `(${xPlus(-r)})^2 = 0`, note: '완전제곱식' },
      { expr: `x = ${r}`, note: '중근' },
    ],
    hints: [
      `상수항이 어떤 수의 제곱인지 살펴보세요. x 의 계수와 어떤 관계가 있나요?`,
      `(x + □)² 꼴로 인수분해돼요. □ = ${-r}`,
      `(${xPlus(-r)})² = 0 이므로 근이 하나(중근)예요. 두 칸에 같은 값을 쓰세요.`,
    ],
    verify: makeVerifier(1, b, c),
  });
}

/* ───────────── 발전: a x² + b x + c = 0 (a ≠ 1), 무리근 ───────────── */
function genFactorNonMonic() {
  // (p x - r1)(q x - r2) = 0 → 근 r1/p, r2/q
  const p = randInt(1, 3);
  const q = randInt(2, 3);
  const r1 = randNonZero(-5, 5);
  const r2 = randNonZero(-5, 5);
  const a = p * q;
  const b = -(p * r2 + q * r1);
  const c = r1 * r2;
  const g = gcd(gcd(a, b), c);
  const A = a / g, B = b / g, C = c / g;
  const latex = `${quadExpr(A, B, C)} = 0`;
  const roots = [F(r1, p), F(r2, q)];
  const f1 = p === 1 ? `(${xPlus(-r1)})` : `(${linearExpr(p, -r1)})`;
  const f2 = `(${linearExpr(q, -r2)})`;
  return finish(base('nonmonic', 'advanced', 'factoring', [A, B, C]), roots, {
    question: { kind: 'equation', latex },
    solutionSteps: [
      { expr: latex, note: 'x² 의 계수가 1 이 아닌 이차방정식' },
      ...(g > 1 ? [{ expr: `${quadExpr(a, b, c)} = 0`, note: `참고: 양변에 ${g}을(를) 곱한 꼴로도 볼 수 있어요` }] : []),
      { expr: `${f1}${f2} = 0`, note: '인수분해 (곱이 ' + A + ', ' + C + ' 인 조합 찾기)' },
      { expr: `x = ${roots[0].toLatex()} \\;\\text{또는}\\; x = ${roots[1].toLatex()}`, note: '각 괄호 = 0' },
    ],
    hints: [
      `x² 의 계수 ${A}과 상수항 ${C}을(를) 각각 두 수의 곱으로 나누어 (□x + ○)(△x + ◇) 꼴을 찾아보세요.`,
      `${f1}${f2} = 0 으로 인수분해돼요. 전개해서 확인해 보세요.`,
      `각 괄호를 0 으로 놓고 x 를 구하세요. 분수가 나오면 분수 그대로 답해요.`,
    ],
    verify: makeVerifier(A, B, C),
  });
}

function genIrrationalShift() {
  // (x + p)² = q, q 는 완전제곱수가 아닌 2..15
  const nonSquares = [2, 3, 5, 6, 7, 10, 11, 13];
  const q = pick(nonSquares);
  const p = randNonZero(-5, 5);
  const latex = `(${xPlus(p)})^2 = ${q}`;
  const roots = [
    { p: -p, q, sign: 1, den: 1 },
    { p: -p, q, sign: -1, den: 1 },
  ];
  return finish(base('irr-shift', 'advanced', 'sqrt', [p, q]), roots, {
    question: { kind: 'equation', latex, note: '답은 √ 기호를 사용하여 입력하세요. 예: 1+√2, 1-√2' },
    solutionSteps: [
      { expr: latex, note: '제곱근 이용' },
      { expr: `${xPlus(p)} = \\pm\\sqrt{${q}}`, note: '' },
      { expr: `x = ${-p} \\pm \\sqrt{${q}}`, note: `${p > 0 ? '-' : '+'}${Math.abs(p)} 이항` },
    ],
    hints: [
      `${q}은(는) 완전제곱수가 아니에요. 그래도 제곱근을 이용할 수 있어요.`,
      `${xPlus(p)} = ±√${q}`,
      `양변에서 ${p}을(를) 빼면 x = ${-p} ± √${q}`,
    ],
    verify: makeVerifier(1, 2 * p, p * p - q),
  });
}

function genFormula() {
  // x² + bx + c = 0 with b even, 판별식 D = b² - 4c > 0 and not perfect square
  const nonSquares = [2, 3, 5, 6, 7, 10, 11, 13];
  const q = pick(nonSquares);
  const h = randNonZero(-4, 4); // x² - 2h x + (h² - q) = 0 → x = h ± √q
  const b = -2 * h;
  const c = h * h - q;
  const latex = `${quadExpr(1, b, c)} = 0`;
  const D = b * b - 4 * c; // = 4q
  const roots = [
    { p: h, q, sign: 1, den: 1 },
    { p: h, q, sign: -1, den: 1 },
  ];
  return finish(base('formula', 'advanced', 'formula', [b, c]), roots, {
    question: { kind: 'equation', latex, note: '답은 √ 기호를 사용하여 입력하세요. 예: 2+√3, 2-√3' },
    solutionSteps: [
      { expr: latex, note: '인수분해가 되지 않으면 근의 공식!' },
      { expr: `x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`, note: `a = 1, b = ${b}, c = ${c}` },
      { expr: `x = \\dfrac{${-b} \\pm \\sqrt{${b * b} - ${4 * c < 0 ? `(${4 * c})` : 4 * c}}}{2} = \\dfrac{${-b} \\pm \\sqrt{${D}}}{2}`, note: '대입' },
      { expr: `x = \\dfrac{${-b} \\pm 2\\sqrt{${q}}}{2} = ${h} \\pm \\sqrt{${q}}`, note: `√${D} = 2√${q} 로 간단히` },
    ],
    hints: [
      `곱해서 ${c}, 더해서 ${b} 이 되는 정수가 없어요. 근의 공식을 써 보세요.`,
      `a = 1, b = ${b}, c = ${c} 를 근의 공식에 대입하면 분모는 2, 근호 안은 b² - 4ac = ${D}`,
      `√${D} = 2√${q} 이므로 약분하면 x = ${h} ± √${q}`,
    ],
    verify: makeVerifier(1, b, c),
  });
}

function genCompleteSquare() {
  // x² + bx + c = 0, b 짝수, 정수근 → 완전제곱식 이용
  let r1 = randNonZero(-6, 6);
  let r2 = randNonZero(-6, 6);
  if ((r1 + r2) % 2 !== 0) r2 += 1;
  if (r2 === 0) r2 = 2;
  const b = -(r1 + r2);
  const c = r1 * r2;
  const h = b / 2;
  const k = h * h - c; // (x + h)² = k
  const latex = `${quadExpr(1, b, c)} = 0`;
  const roots = [F(r1), F(r2)];
  const s = Math.round(Math.sqrt(k));
  return finish(base('complete', 'advanced', 'complete-square', [b, c]), roots, {
    question: { kind: 'equation', latex, note: '완전제곱식을 이용해 풀어 보세요.' },
    solutionSteps: [
      { expr: latex, note: '처음 식' },
      { expr: `x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x = ${-c}`, note: '상수항 이항' },
      { expr: `x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x + ${h * h} = ${-c} + ${h * h}`, note: `양변에 (${b}/2)² = ${h * h} 더하기` },
      { expr: `(${xPlus(h)})^2 = ${k}`, note: '완전제곱식' },
      { expr: `${xPlus(h)} = \\pm ${s}`, note: '제곱근' },
      { expr: `x = ${r1} \\;\\text{또는}\\; x = ${r2}`, note: '' },
    ],
    hints: [
      `상수항을 우변으로 옮기고, 양변에 (x의 계수 ÷ 2)² 을 더해 보세요.`,
      `(${b} ÷ 2)² = ${h * h}. 좌변이 (${xPlus(h)})² 이 돼요.`,
      `(${xPlus(h)})² = ${k} 이므로 ${xPlus(h)} = ±${s}`,
    ],
    verify: makeVerifier(1, b, c),
  });
}

/* ───────────── 도전: 활용 (답이 하나인 경우 answerType 'single') ───────────── */
function wordBase(type, idParts) {
  return { ...base(type, 'challenge', 'application', idParts), answerType: 'single' };
}

function singleFinish(p, value, extra) {
  return {
    ...p,
    ...extra,
    answer: { value, display: String(value) },
    acceptedAnswers: [String(value)],
  };
}

function genWordConsecutive() {
  const n = randInt(3, 12);
  const prod = n * (n + 1);
  const text = `연속하는 두 자연수의 곱이 ${prod}입니다. 두 수 중 작은 수를 구하세요.`;
  return singleFinish(wordBase('w-consec', [n]), n, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `${n}`,
    solutionSteps: [
      { expr: `x(x + 1) = ${prod}`, note: '작은 수를 x 로 놓기' },
      { expr: `x^2 + x - ${prod} = 0`, note: '전개하여 정리' },
      { expr: `(${xPlus(n + 1)})(${xPlus(-n)}) = 0`, note: '인수분해' },
      { expr: `x = ${-(n + 1)} \\;\\text{또는}\\; x = ${n}`, note: '' },
      { expr: `x = ${n}`, note: 'x 는 자연수이므로' },
    ],
    hints: [
      `작은 수를 x 라 하면 큰 수는 x + 1 이에요.`,
      `x(x + 1) = ${prod} 를 전개해 = 0 꼴로 정리하세요.`,
      `x² + x - ${prod} = 0 을 인수분해하면 두 근이 나와요. 자연수인 것만 답!`,
    ],
    verify: (v) => v * (v + 1) === prod && v > 0,
  });
}

function genWordRectangle() {
  const w = randInt(3, 10);
  const d = randInt(2, 6);
  const area = w * (w + d);
  const text = `가로의 길이가 세로의 길이보다 ${d}cm 더 긴 직사각형의 넓이가 ${area}cm²입니다. 세로의 길이는 몇 cm일까요?`;
  return singleFinish(wordBase('w-rect', [w, d]), w, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `${w}cm`,
    solutionSteps: [
      { expr: `x(x + ${d}) = ${area}`, note: '세로를 x, 가로를 x + ' + d },
      { expr: `x^2 + ${d}x - ${area} = 0`, note: '정리' },
      { expr: `(${xPlus(w + d)})(${xPlus(-w)}) = 0`, note: '인수분해' },
      { expr: `x = ${w}`, note: '길이는 양수이므로' },
    ],
    hints: [
      `세로를 x cm 라 하면 가로는 (x + ${d}) cm. 넓이 = 가로 × 세로`,
      `x(x + ${d}) = ${area}`,
      `x² + ${d}x - ${area} = 0 을 인수분해. 음수 근은 길이가 될 수 없어요.`,
    ],
    verify: (v) => v * (v + d) === area && v > 0,
  });
}

function genWordSquareGrow() {
  const s = randInt(3, 10);
  const inc = randInt(2, 5);
  const area = (s + inc) * (s + inc);
  const text = `한 변의 길이가 x cm인 정사각형의 각 변을 ${inc}cm씩 늘였더니 넓이가 ${area}cm²가 되었습니다. 처음 정사각형의 한 변의 길이 x 를 구하세요.`;
  return singleFinish(wordBase('w-square', [s, inc]), s, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `${s}cm`,
    solutionSteps: [
      { expr: `(x + ${inc})^2 = ${area}`, note: '늘어난 한 변은 x + ' + inc },
      { expr: `x + ${inc} = \\pm ${s + inc}`, note: '제곱근 이용' },
      { expr: `x = ${s} \\;\\text{또는}\\; x = ${-s - 2 * inc}`, note: '' },
      { expr: `x = ${s}`, note: '길이는 양수이므로' },
    ],
    hints: [
      `늘어난 정사각형의 한 변은 (x + ${inc}) cm 예요.`,
      `(x + ${inc})² = ${area}. 제곱근을 이용해 보세요.`,
      `x + ${inc} = ±${s + inc}. 양수인 x 만 답이에요.`,
    ],
    verify: (v) => (v + inc) ** 2 === area && v > 0,
  });
}

function genWordBall() {
  // h = v t - 5 t²  (초속 v m), 지면 도달 시각 → t = v/5
  const v = pick([10, 15, 20, 25, 30, 35, 40]);
  const t = v / 5;
  const text = `지면에서 초속 ${v}m로 똑바로 위로 던진 공의 t초 후 높이는 (${v}t - 5t²)m입니다. 공이 다시 지면에 떨어지는 것은 던진 지 몇 초 후일까요?`;
  return singleFinish(wordBase('w-ball', [v]), t, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `${t}초 후`,
    solutionSteps: [
      { expr: `${v}t - 5t^2 = 0`, note: '지면에 떨어지면 높이가 0' },
      { expr: `5t(${t} - t) = 0`, note: '공통인수 5t 로 묶기' },
      { expr: `t = 0 \\;\\text{또는}\\; t = ${t}`, note: '' },
      { expr: `t = ${t}`, note: 't = 0 은 던진 순간이므로 제외' },
    ],
    hints: [
      `지면에 떨어졌다는 것은 높이가 0 이라는 뜻이에요.`,
      `${v}t - 5t² = 0. 공통인수로 묶어 보세요.`,
      `5t(${t} - t) = 0 에서 t = 0 은 던진 순간이에요.`,
    ],
    verify: (x) => v * x - 5 * x * x === 0 && x > 0,
  });
}

function genWordSumSquare() {
  // 어떤 수 x: x² = kx + m  (x 양수)  → 두 근 r (양), -s (음)
  const r = randInt(3, 12);
  const s = randInt(1, 6);
  // (x - r)(x + s) = x² + (s - r)x - rs = 0  →  x² = (r - s)x + rs
  const k = r - s;
  const m = r * s;
  const kText = k === 0 ? '' : k === 1 ? '그 수' : `그 수의 ${k}배`;
  const text =
    k === 0
      ? `어떤 양수를 제곱하면 ${m}이 됩니다. 이 수를 구하세요.`
      : `어떤 양수를 제곱한 값은 ${kText}보다 ${m}만큼 큽니다. 이 수를 구하세요.`;
  return singleFinish(wordBase('w-num', [r, s]), r, {
    question: { kind: 'word', text, latex: '' },
    answerDisplay: `${r}`,
    solutionSteps: [
      { expr: k === 0 ? `x^2 = ${m}` : `x^2 = ${linearExpr(k, m)}`, note: '어떤 수를 x 로 놓기' },
      { expr: `${quadExpr(1, -k, -m)} = 0`, note: '= 0 꼴로 정리' },
      { expr: `(${xPlus(-r)})(${xPlus(s)}) = 0`, note: '인수분해' },
      { expr: `x = ${r}`, note: '양수이므로' },
    ],
    hints: [
      `구하는 수를 x 라 하고 문장을 식으로 옮겨 보세요.`,
      `${quadExpr(1, -k, -m)} = 0`,
      `인수분해하면 x = ${r} 또는 x = ${-s}. 양수인 것만!`,
    ],
    verify: (v) => v * v - k * v - m === 0 && v > 0,
  });
}

const GENERATORS = {
  basic: [genPureSquare, genSquareMinusConst, genShiftedSquare],
  standard: [genFactorMonic, genFactorMonic, genCommonFactor, genDoubleRoot],
  advanced: [genFactorNonMonic, genFactorNonMonic, genCompleteSquare, genIrrationalShift, genFormula],
  challenge: [genWordConsecutive, genWordRectangle, genWordSquareGrow, genWordBall, genWordSumSquare],
};

export function generateQuadratic(difficulty) {
  const list = GENERATORS[difficulty] || GENERATORS.basic;
  return pick(list)();
}

export const QUADRATIC_CONCEPTS = {
  meaning: '이차방정식의 뜻과 해',
  factoring: '인수분해를 이용한 풀이',
  sqrt: '제곱근을 이용한 풀이',
  'complete-square': '완전제곱식을 이용한 풀이',
  formula: '근의 공식',
  application: '이차방정식 활용',
};

void chance;
void numLatex;
