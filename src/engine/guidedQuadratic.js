/**
 * 이차방정식 도전(활용) 문제의 단계별 풀이 빌더
 *
 *  생성기가 problem.guided = { form: 'quadratic-word', type, params } 를 붙이면
 *  "식 세우기 → = 0 꼴 정리 → 인수분해/제곱근 → 두 근 → 조건에 맞는 근 고르기 → 검산" 단계를 만든다.
 */
import { blanksStep, choiceStep, line } from './guidedCommon.js';
import { numLatex, xPlus, quadExpr, linearExpr, joinTerms } from './format.js';
import { F, Fraction } from './fraction.js';

/** 두 근을 쓰는 줄 (순서를 바꿔 써도 정답) */
function rootsLine(v, r1, r2, hint) {
  return line('두 근 :', `${v} = \\square \\;\\text{또는}\\; ${v} = \\square`, [r1, r2], hint, [[r2, r1]]);
}

/** 조건에 맞는 근 고르기 */
function pickStep(v, good, bad, reasonGood, reasonBad) {
  return choiceStep('pick', '조건에 맞는 근 고르기', `두 근 $${v} = ${good}$, $${v} = ${bad}$ 중 문제의 답이 될 수 있는 것은?`, [
    { id: 'good', label: `$${v} = ${good}$`, correct: true, feedback: reasonGood },
    { id: 'bad', label: `$${v} = ${bad}$`, correct: false, feedback: reasonBad },
  ]);
}

const BUILDERS = {
  /* 연속하는 두 자연수의 곱 */
  'w-consec'({ n, prod }) {
    return [
      choiceStep('setup-choice', '미지수 정하기', `작은 수를 $x$ 라 하면 큰 수는?`, [
        { id: 'a', label: '$x + 1$', correct: true, feedback: '맞아요! 연속하는 자연수는 1 차이예요.' },
        { id: 'b', label: '$x - 1$', correct: false, feedback: '큰 수는 작은 수보다 1 커야 해요.' },
        { id: 'c', label: '$2x$', correct: false, feedback: '2배가 아니라 1만큼 큰 수예요.' },
      ]),
      blanksStep('setup', '식 세우기', `두 수의 곱이 ${prod} 이라는 조건을 식으로 써 보세요.`, [line('곱 :', `x(x + 1) = \\square`, [prod], '두 수를 곱한 값이에요.')], '식을 세웠어요.'),
      blanksStep('arrange', '= 0 꼴로 정리', `좌변을 전개하고 우변의 수를 이항해 $x^2 + \\cdots = 0$ 꼴로 만들어요.`, [line('정리 :', `x^2 + \\square x + \\square = 0`, [1, -prod], `x · x = x², x · 1 = x, ${prod} 을 이항하면 −${prod}`)], `$x^2 + x - ${prod} = 0$ 이 되었어요.`),
      blanksStep('factor', '인수분해', `곱해서 $-${prod}$, 더해서 $1$ 이 되는 두 수를 찾아 인수분해하세요.`, [line('인수분해 :', `(x + \\square)(x - \\square) = 0`, [n + 1, n], `${n + 1} × ${n} = ${prod}, ${n + 1} − ${n} = 1`, [[-n, -(n + 1)]])], '인수분해했어요.'),
      blanksStep('roots', '두 근 구하기', `각 괄호가 0 이 되는 $x$ 를 구해요.`, [rootsLine('x', n, -(n + 1), `x + ${n + 1} = 0 또는 x − ${n} = 0`)], '두 근을 구했어요. 둘 다 답이 될 수 있을까요?'),
      pickStep('x', n, -(n + 1), `맞아요! 자연수여야 하므로 ${n} 이 답이에요.`, '자연수가 아니에요. 문제의 조건(자연수)을 다시 보세요.'),
      blanksStep('check', '검산하기', `두 수 ${n}, ${n + 1} 의 곱을 확인해요.`, [line('검산 :', `${n} \\times ${n + 1} = \\square`, [prod], '곱하세요.')], `곱이 ${prod} 으로 조건과 같아요. ✅`),
    ];
  },

  /* 직사각형 넓이 */
  'w-rect'({ w, d, area }) {
    return [
      choiceStep('setup-choice', '미지수 정하기', `세로의 길이를 $x$ cm 라 하면 가로의 길이는?`, [
        { id: 'a', label: `$(x + ${d})$ cm`, correct: true, feedback: `맞아요! 가로가 ${d}cm 더 길어요.` },
        { id: 'b', label: `$(x - ${d})$ cm`, correct: false, feedback: '가로가 세로보다 더 길다고 했어요.' },
        { id: 'c', label: `$${d}x$ cm`, correct: false, feedback: `${d}배가 아니라 ${d}cm 더 긴 거예요.` },
      ]),
      blanksStep('setup', '식 세우기', `넓이 = 가로 × 세로 를 식으로 써 보세요.`, [line('넓이 :', `x(x + \\square) = \\square`, [d, area], `가로는 x + ${d}, 넓이는 ${area}`)], '식을 세웠어요.'),
      blanksStep('arrange', '= 0 꼴로 정리', `전개하고 이항하여 $x^2 + \\cdots = 0$ 꼴로 만들어요.`, [line('정리 :', `x^2 + \\square x + \\square = 0`, [d, -area], `x · ${d} = ${d}x, ${area} 를 이항하면 −${area}`)], `$x^2 + ${d}x - ${area} = 0$ 이 되었어요.`),
      blanksStep('factor', '인수분해', `곱해서 $-${area}$, 더해서 $${d}$ 가 되는 두 수를 찾으세요.`, [line('인수분해 :', `(x + \\square)(x - \\square) = 0`, [w + d, w], `${w + d} × ${w} = ${area}, ${w + d} − ${w} = ${d}`, [[-w, -(w + d)]])], '인수분해했어요.'),
      blanksStep('roots', '두 근 구하기', `각 괄호가 0 이 되는 $x$ 를 구해요.`, [rootsLine('x', w, -(w + d), `x + ${w + d} = 0 또는 x − ${w} = 0`)], '두 근을 구했어요.'),
      pickStep('x', w, -(w + d), `맞아요! 길이는 양수이므로 ${w} 이 답이에요.`, '길이가 음수일 수는 없어요.'),
      blanksStep('check', '검산하기', `가로 ${w + d}cm, 세로 ${w}cm 의 넓이를 확인해요.`, [line('검산 :', `${w + d} \\times ${w} = \\square`, [area], '곱하세요.')], `넓이 ${area}cm² 로 조건과 같아요. ✅`),
    ];
  },

  /* 정사각형 변 늘이기 */
  'w-square'({ s, inc, area }) {
    const root = s + inc;
    return [
      choiceStep('setup-choice', '미지수 정하기', `처음 한 변이 $x$ cm 일 때, 각 변을 ${inc}cm 씩 늘인 정사각형의 한 변은?`, [
        { id: 'a', label: `$(x + ${inc})$ cm`, correct: true, feedback: `맞아요! ${inc}cm 늘였으니 x + ${inc} 이에요.` },
        { id: 'b', label: `$${inc}x$ cm`, correct: false, feedback: `${inc}배가 아니라 ${inc}cm 를 더한 길이예요.` },
        { id: 'c', label: `$(x - ${inc})$ cm`, correct: false, feedback: '늘였으니 길어져야 해요.' },
      ]),
      blanksStep('setup', '식 세우기', `정사각형의 넓이 = (한 변)² 을 식으로 써 보세요.`, [line('넓이 :', `(x + \\square)^2 = \\square`, [inc, area], `한 변은 x + ${inc}, 넓이는 ${area}`)], '식을 세웠어요. 제곱근을 이용해 풀어요.'),
      blanksStep('sqrt', '제곱근 이용', `$(x + ${inc})^2 = ${area}$ 이므로 $x + ${inc}$ 은 제곱해서 ${area} 이 되는 수예요.`, [line('제곱근 :', `x + ${inc} = \\pm \\square`, [root], `제곱해서 ${area} 이 되는 양수는?`)], `$x + ${inc} = \\pm ${root}$ 이에요.`),
      blanksStep('roots', '두 근 구하기', `$x + ${inc} = ${root}$ 와 $x + ${inc} = -${root}$ 를 각각 풀어요.`, [rootsLine('x', s, -s - 2 * inc, `${root} − ${inc} 과 −${root} − ${inc}`)], '두 근을 구했어요.'),
      pickStep('x', s, -s - 2 * inc, `맞아요! 길이는 양수이므로 ${s} 이 답이에요.`, '길이가 음수일 수는 없어요.'),
      blanksStep('check', '검산하기', `늘인 정사각형의 한 변 ${root}cm 의 넓이를 확인해요.`, [line('검산 :', `${root}^2 = \\square`, [area], `${root} × ${root}`)], `넓이 ${area}cm² 로 조건과 같아요. ✅`),
    ];
  },

  /* 던져 올린 공 */
  'w-ball'({ v, t }) {
    return [
      choiceStep('setup-choice', '조건 해석', `공이 다시 지면에 떨어졌을 때 높이는 몇 m 일까요?`, [
        { id: 'a', label: '$0$ m', correct: true, feedback: '맞아요! 지면에 있으면 높이가 0 이에요.' },
        { id: 'b', label: `$${v}$ m`, correct: false, feedback: `${v}는 초속(속력)이에요. 높이가 아니에요.` },
        { id: 'c', label: '$5$ m', correct: false, feedback: '5는 식의 계수예요. 지면의 높이는 0 이에요.' },
      ]),
      blanksStep('setup', '식 세우기', `높이가 0 이 되는 $t$ 를 구하는 식을 써 보세요.`, [line('식 :', `${v}t - 5t^2 = \\square`, [0], '지면에 떨어지면 높이가 0!')], '식을 세웠어요.'),
      blanksStep('factor', '공통인수로 묶기', `두 항에 공통인 $5t$ 로 묶어요.`, [line('인수분해 :', `5t(\\square - t) = 0`, [t], `${v}t ÷ 5t = ${t}`)], `$5t(${t} - t) = 0$ 이 되었어요.`),
      blanksStep('roots', '두 근 구하기', `$5t = 0$ 또는 $${t} - t = 0$ 을 풀어요.`, [rootsLine('t', 0, t, `t = 0 또는 t = ${t}`)], '두 근을 구했어요. 어느 쪽이 "다시 떨어진" 순간일까요?'),
      pickStep('t', t, 0, `맞아요! ${t}초 후에 다시 지면에 떨어져요.`, 't = 0 은 공을 던진 순간이에요. 그때도 높이는 0 이지만 "다시 떨어진" 때가 아니에요.'),
      blanksStep('check', '검산하기', `$t = ${t}$ 를 높이 식에 넣어 0 이 되는지 확인해요.`, [line('검산 :', `${v} \\times ${t} - 5 \\times ${t}^2 = \\square`, [0], `${v * t} − ${5 * t * t}`)], '높이가 0 이에요. ✅'),
    ];
  },

  /* 어떤 양수 */
  'w-num'({ r, s, k, m }) {
    const checkTerms = [`${r}^2`];
    if (k > 0) checkTerms.push(`- ${k} \\times ${r}`);
    else if (k < 0) checkTerms.push(`+ ${-k} \\times ${r}`);
    checkTerms.push(`- ${m}`);
    const setup = k === 0 ? line('식 :', `x^2 = \\square`, [m], '제곱하면 얼마가 되는지 문제를 다시 읽어 보세요.') : line('식 :', `x^2 = \\square x + \\square`, [k, m], `"그 수의 ${k}배보다 ${m} 만큼 크다" → ${k}x + ${m}`);
    const arrange = k === 0 ? line('정리 :', `x^2 + \\square = 0`, [-m], `${m} 을 이항하면 부호가 바뀌어요.`) : line('정리 :', `x^2 + \\square x + \\square = 0`, [-k, -m], `${k}x 와 ${m} 을 좌변으로 이항하면 부호가 바뀌어요.`);
    return [
      blanksStep('setup', '식 세우기', `구하는 양수를 $x$ 라 하고 문장을 식으로 옮겨 보세요.`, [setup], '식을 세웠어요.'),
      blanksStep('arrange', '= 0 꼴로 정리', `우변의 항을 모두 좌변으로 이항해요.`, [arrange], '이제 인수분해해요.'),
      blanksStep('factor', '인수분해', `곱해서 $${-m}$, 더해서 $${-k}$ 가 되는 두 수를 찾으세요.`, [line('인수분해 :', `(x + \\square)(x - \\square) = 0`, [s, r], `${s} × ${r} = ${m}, ${s} − ${r} = ${-k}`, [[-r, -s]])], '인수분해했어요.'),
      blanksStep('roots', '두 근 구하기', `각 괄호가 0 이 되는 $x$ 를 구해요.`, [rootsLine('x', r, -s, `x + ${s} = 0 또는 x − ${r} = 0`)], '두 근을 구했어요.'),
      pickStep('x', r, -s, `맞아요! 양수여야 하므로 ${r} 이 답이에요.`, '문제에서 "양수"라고 했어요.'),
      blanksStep('check', '검산하기', `$x = ${r}$ 을 정리한 식에 넣어 0 이 되는지 확인해요.`, [line('검산 :', `${checkTerms.join(' ')} = \\square`, [0], `${r * r}${k ? ` − ${k * r}` : ''} − ${m}`)], '0 이 되므로 해가 맞아요. ✅'),
    ];
  },
};

/* ───────────── 기초·기본·발전 (방정식 풀이, 두 근) ───────────── */

const par = (v) => `(${numLatex(v)})`;

/** a(r)² + b(r) + c = □ (= 0) 검산 줄 */
function quadCheckLine(a, b, c, r) {
  const rl = par(r);
  const terms = [a === 1 ? `${rl}^2` : a === -1 ? `-${rl}^2` : `${a}${rl}^2`];
  if (b !== 0) terms.push(b === 1 ? rl : b === -1 ? `-${rl}` : `${b}${rl}`);
  if (c !== 0) terms.push(numLatex(c));
  const rv = r instanceof Fraction ? r.toNumber() : r;
  return line('검산 :', `${joinTerms(terms)} = \\square`, [0], `${a}×(${numLatex(r)})² = ${numLatex(a * rv * rv)}, ${b}×(${numLatex(r)}) = ${numLatex(b * rv)}. 모두 더하면?`);
}

function checkStep(a, b, c, r) {
  return blanksStep('check', '검산하기', `$x = ${numLatex(r)}$ 을 처음 식에 대입해 0 이 되는지 확인해요.`, [quadCheckLine(a, b, c, r)], '0 이 되므로 근이 맞아요. ✅');
}

Object.assign(BUILDERS, {
  /* x² = a */
  pure({ a, r }) {
    return [
      choiceStep('count-choice', '근은 몇 개?', `제곱해서 ${a} 이 되는 수는 몇 개일까요?`, [
        { id: 'a', label: `2개: $${r}$ 과 $-${r}$`, correct: true, feedback: `맞아요! (${r})² 도 (−${r})² 도 ${a} 이에요.` },
        { id: 'b', label: `1개: $${r}$`, correct: false, feedback: `(−${r}) × (−${r}) = ${a} 도 성립해요. 음수를 잊지 마세요!` },
        { id: 'c', label: `1개: $${a}$`, correct: false, feedback: `${a} 을 제곱하면 ${a * a} 이 돼요. 제곱해서 ${a} 이 되는 수를 찾아야 해요.` },
      ]),
      blanksStep('sqrt', '제곱근 이용', `$x^2 = ${a}$ 이므로 $x$ 는 ${a} 의 제곱근이에요.`, [line('', `x = \\pm \\square`, [r], `${r} × ${r} = ${a}`)], `$x = \\pm ${r}$ 이에요.`),
      blanksStep('roots', '두 근 쓰기', `± 를 풀어 두 근을 각각 쓰세요.`, [rootsLine('x', r, -r, `+${r} 과 −${r}`)], '두 근을 구했어요.'),
      checkStep(1, 0, -a, -r),
    ];
  },

  /* x² - a = 0 */
  pure2({ a, r }) {
    return [
      blanksStep('move', '상수항 이항', `상수항 $-${a}$ 을 우변으로 옮겨 $x^2 = \\cdots$ 꼴로 만드세요.`, [line('', `x^2 = \\square`, [a], '이항하면 부호가 바뀌어요.')], `$x^2 = ${a}$ 이 되었어요.`),
      blanksStep('sqrt', '제곱근 이용', `제곱해서 ${a} 이 되는 수를 찾아요.`, [line('', `x = \\pm \\square`, [r], `${r} × ${r} = ${a}`)], `$x = \\pm ${r}$ 이에요.`),
      blanksStep('roots', '두 근 쓰기', `± 를 풀어 두 근을 각각 쓰세요.`, [rootsLine('x', r, -r, `+${r} 과 −${r}`)], '두 근을 구했어요.'),
      checkStep(1, 0, -a, -r),
    ];
  },

  /* (x + p)² = q */
  shift({ p, q, s }) {
    const r1 = -p + s;
    const r2 = -p - s;
    return [
      choiceStep('view-choice', '식 바라보기', `$(${xPlus(p)})^2 = ${q}$ 을 어떻게 보면 좋을까요?`, [
        { id: 'a', label: `괄호 안 $${xPlus(p)}$ 을 하나의 수 A 로 보면 $A^2 = ${q}$`, correct: true, feedback: '맞아요! 괄호 전체를 한 덩어리로 보면 제곱근을 바로 쓸 수 있어요.' },
        { id: 'b', label: `$x^2 = ${q}$ 과 같다`, correct: false, feedback: `괄호 안에 ${p > 0 ? '+' : ''}${p} 이 있어서 x² 과는 달라요.` },
        { id: 'c', label: `괄호를 전개해야만 풀 수 있다`, correct: false, feedback: '전개해도 풀 수 있지만, 제곱근을 이용하면 훨씬 빨라요.' },
      ]),
      blanksStep('sqrt', '제곱근 이용', `괄호 안은 ${q} 의 제곱근이에요.`, [line('', `${xPlus(p)} = \\pm \\square`, [s], `${s} × ${s} = ${q}`)], `$${xPlus(p)} = \\pm ${s}$ 이에요.`),
      blanksStep('roots', '두 근 구하기', `$${xPlus(p)} = ${s}$ 와 $${xPlus(p)} = -${s}$ 를 각각 풀어요. (${p > 0 ? `−${p}` : `+${-p}`} 이항)`, [rootsLine('x', r1, r2, `${s} ${p > 0 ? '−' : '+'} ${Math.abs(p)} 과 −${s} ${p > 0 ? '−' : '+'} ${Math.abs(p)}`)], '두 근을 구했어요.'),
      blanksStep('check', '검산하기', `$x = ${r2}$ 을 넣어 괄호 안을 제곱해 봐요.`, [line('검산 :', `(${r2} ${p > 0 ? '+' : '-'} ${Math.abs(p)})^2 = \\square`, [q], `괄호 안은 ${r2 + p}, 제곱하면?`)], `우변 ${q} 과 같아요. ✅`),
    ];
  },

  /* x² + bx + c = 0 (인수분해) */
  monic({ b, c, r1, r2 }) {
    const u = -r1;
    const v = -r2;
    return [
      blanksStep('find', '두 수 찾기', `곱해서 $${c}$, 더해서 $${b}$ 가 되는 두 정수를 찾으세요.`, [line('두 수 :', `\\square,\\; \\square`, [u, v], `${c} 의 약수 쌍을 떠올리고, 합이 ${b} 인 것을 고르세요.`, [[v, u]])], `두 수는 ${u} 과 ${v} 예요.`),
      blanksStep('factor', '인수분해', `찾은 두 수로 $(x + □)(x + △) = 0$ 꼴을 만드세요.`, [line('인수분해 :', `(x + \\square)(x + \\square) = 0`, [u, v], `두 수를 그대로 괄호에 넣어요.`, [[v, u]])], `$${factorPair(u, v)} = 0$ 이 되었어요.`),
      blanksStep('roots', '두 근 구하기', `AB = 0 이면 A = 0 또는 B = 0! 각 괄호가 0 이 되는 $x$ 를 구해요.`, [rootsLine('x', r1, r2, `x + (${u}) = 0 → x = ${r1}, x + (${v}) = 0 → x = ${r2}`)], '두 근을 구했어요.'),
      checkStep(1, b, c, r1),
    ];
  },

  /* x² + bx = 0 */
  common({ b }) {
    return [
      choiceStep('factor-choice', '공통인수 찾기', `$x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x = 0$ 의 두 항에 공통으로 들어 있는 인수는?`, [
        { id: 'a', label: '$x$', correct: true, feedback: '맞아요! x² = x · x 이고 bx = b · x 이므로 x 로 묶을 수 있어요.' },
        { id: 'b', label: `$${Math.abs(b)}$`, correct: false, feedback: `x² 에는 ${Math.abs(b)} 이 없어요.` },
        { id: 'c', label: '$x^2$', correct: false, feedback: `${Math.abs(b)}x 에는 x² 이 없어요. 공통인 것은 x 하나예요.` },
      ]),
      blanksStep('factor', '공통인수로 묶기', `$x$ 로 묶어 $x(\\cdots) = 0$ 꼴로 만드세요.`, [line('인수분해 :', `x(x + \\square) = 0`, [b], `${b}x ÷ x = ${b}`)], `$x(${xPlus(b)}) = 0$ 이 되었어요.`),
      blanksStep('roots', '두 근 구하기', `$x = 0$ 또는 $${xPlus(b)} = 0$ 이에요. **x = 0 도 답**이라는 것을 잊지 마세요!`, [rootsLine('x', 0, -b, `0 과 ${-b}`)], '두 근을 구했어요.'),
      checkStep(1, b, 0, -b),
    ];
  },

  /* x² + bx + c = 0 (완전제곱, 중근) */
  double({ b, c, r }) {
    const h = -r;
    return [
      choiceStep('view-choice', '식 바라보기', `상수항 ${c} 은 어떤 수의 제곱이고, $x$ 의 계수 ${b} 과 어떤 관계일까요?`, [
        { id: 'a', label: `$${c} = (${h})^2$ 이고 $${b} = 2 \\times (${h})$ → 완전제곱식`, correct: true, feedback: '맞아요! (x + h)² = x² + 2hx + h² 꼴이에요.' },
        { id: 'b', label: `특별한 관계가 없다. 두 수를 찾아 인수분해해야 한다`, correct: false, feedback: `${c} = (${h})² 이고 ${b} = 2 × (${h}) 이에요. 완전제곱식 꼴!` },
        { id: 'c', label: `근의 공식만 쓸 수 있다`, correct: false, feedback: '근의 공식으로도 되지만, 완전제곱식을 알아보면 훨씬 빨라요.' },
      ]),
      blanksStep('factor', '완전제곱식', `$(x + □)^2 = 0$ 꼴로 쓰세요. □ 는 $x$ 의 계수의 절반이에요.`, [line('', `(x + \\square)^2 = 0`, [h], `${b} ÷ 2 = ${h}`)], `$(${xPlus(h)})^2 = 0$ 이 되었어요.`),
      blanksStep('roots', '근 구하기', `$${xPlus(h)} = 0$ 이므로 근이 하나예요(중근).`, [line('중근 :', `x = \\square`, [r], `${h} 을 이항하면?`)], `중근 $x = ${r}$ 이에요. 최종 정답에는 두 칸에 같은 값을 쓰거나 한 칸만 채워도 돼요.`),
      checkStep(1, b, c, r),
    ];
  },

  /* A x² + B x + C = 0, (p x - r1)(q x - r2) */
  nonmonic({ A, B, C, p, q, r1, r2 }) {
    const root1 = F(r1, p);
    const root2 = F(r2, q);
    return [
      choiceStep('view-choice', '식 바라보기', `$x^2$ 의 계수가 ${A} 이에요. 인수분해는 어떤 꼴이 될까요?`, [
        { id: 'a', label: `$(□x + ○)(△x + ◇)$ 꼴: 두 $x$ 계수의 곱이 ${A}, 두 상수의 곱이 ${C}`, correct: true, feedback: '맞아요! 곱이 A 와 C 가 되는 조합 중 전개했을 때 가운데 항이 맞는 것을 찾아요.' },
        { id: 'b', label: `$(x + ○)(x + ◇)$ 꼴: $x$ 계수는 항상 1`, correct: false, feedback: `그러면 전개했을 때 x² 의 계수가 1 이 되어 ${A} 과 달라요.` },
        { id: 'c', label: `양변을 ${A} 으로 나눠 $x^2$ 계수를 1 로 만든다`, correct: false, feedback: '나누면 다른 계수가 분수가 되어 더 복잡해져요. 그대로 인수분해해요.' },
      ]),
      blanksStep('factor', '인수분해', `$(□x + ○)(△x + ◇) = 0$ 을 완성하세요. 전개해서 $${quadExpr(A, B, C)}$ 이 되는지 확인해요.`, [line('인수분해 :', `(\\square x + \\square)(\\square x + \\square) = 0`, [p, -r1, q, -r2], `x 계수 ${p} × ${q} = ${A}, 상수 (${-r1}) × (${-r2}) = ${C}`, [[q, -r2, p, -r1]])], `$${factorNon(p, -r1)}${factorNon(q, -r2)} = 0$ 이 되었어요.`),
      blanksStep('roots', '두 근 구하기', `각 괄호를 0 으로 놓고 $x$ 를 구해요. 분수가 나오면 분수 그대로 (예: 3/2).`, [rootsLine('x', root1, root2, `${factorNon(p, -r1)} = 0 → x = ${root1.toString()}, ${factorNon(q, -r2)} = 0 → x = ${root2.toString()}`)], '두 근을 구했어요.'),
      checkStep(A, B, C, root1),
    ];
  },

  /* (x + p)² = q, q 완전제곱수 아님 */
  'irr-shift'({ p, q }) {
    return [
      choiceStep('view-choice', '식 바라보기', `${q} 은 완전제곱수가 아니에요. 그래도 풀 수 있을까요?`, [
        { id: 'a', label: `괄호 안이 $\\pm\\sqrt{${q}}$ 이면 된다`, correct: true, feedback: '맞아요! 제곱근을 근호 그대로 두면 돼요.' },
        { id: 'b', label: `${q} 이 완전제곱수가 아니므로 근이 없다`, correct: false, feedback: `√${q} 은 실수예요. 근이 있어요.` },
        { id: 'c', label: `전개해서 인수분해한다`, correct: false, feedback: '전개하면 인수분해가 되지 않아요. 제곱근을 이용해요.' },
      ]),
      blanksStep('sqrt', '제곱근 이용', `괄호 안은 ${q} 의 제곱근이에요. 근호는 "루트${q}" 또는 "sqrt(${q})" 로 입력해요.`, [line('', `${xPlus(p)} = \\pm \\square`, [Math.sqrt(q)], `제곱해서 ${q} 이 되는 양수는 √${q} 예요. "루트${q}" 로 입력하세요.`, undefined, [`\\sqrt{${q}}`])], `$${xPlus(p)} = \\pm\\sqrt{${q}}$ 이에요.`),
      blanksStep('roots', '근 구하기', `${p > 0 ? `−${p}` : `+${-p}`} 을 이항해 $x = □ \\pm △$ 꼴로 쓰세요. (두 번째 칸은 근호)`, [line('', `x = \\square \\pm \\square`, [-p, Math.sqrt(q)], `상수 ${p} 을 이항하면 ${-p}, 근호 부분은 그대로 √${q}`, undefined, [`${-p}`, `\\sqrt{${q}}`])], `$x = ${-p} \\pm \\sqrt{${q}}$ 이에요. 최종 정답에는 "${-p}+√${q}", "${-p}-√${q}" 처럼 입력해요.`),
      blanksStep('check', '검산하기', `$x = ${-p} + \\sqrt{${q}}$ 을 넣으면 괄호 안이 $\\sqrt{${q}}$ 이에요. 제곱하면?`, [line('검산 :', `(\\sqrt{${q}})^2 = \\square`, [q], '제곱근을 제곱하면 근호가 사라져요.')], `우변 ${q} 과 같아요. ✅`),
    ];
  },

  /* 근의 공식 */
  formula({ b, c, D, q, h }) {
    return [
      choiceStep('method-choice', '풀이 방법', `곱해서 ${c}, 더해서 ${b} 이 되는 정수가 없어요. 어떤 방법을 쓸까요?`, [
        { id: 'a', label: '근의 공식 $x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', correct: true, feedback: '맞아요! 인수분해가 되지 않을 때는 근의 공식이에요.' },
        { id: 'b', label: '공통인수로 묶기', correct: false, feedback: '상수항이 있어서 공통인수가 없어요.' },
        { id: 'c', label: `$x = \\pm\\sqrt{${c}}$`, correct: false, feedback: 'x 항이 있어서 x² = 수 꼴이 아니에요.' },
      ]),
      blanksStep('coef', '계수 확인', `$ax^2 + bx + c = 0$ 과 비교해 계수를 찾으세요.`, [line('', `a = \\square,\\; b = \\square,\\; c = \\square`, [1, b, c], 'x² 의 계수, x 의 계수, 상수항 순서예요. 부호 포함!')], '계수를 찾았어요.'),
      blanksStep('disc', '근호 안 계산', `$b^2 - 4ac$ 를 계산하세요.`, [line('', `b^2 - 4ac = \\square`, [D], `(${b})² − 4 × 1 × (${c})`)], `근호 안은 ${D} 이에요. $x = \\dfrac{${-b} \\pm \\sqrt{${D}}}{2}$`),
      blanksStep('simplify', '근호 간단히', `$\\sqrt{${D}}$ 을 $a\\sqrt{b}$ 꼴로 간단히 하세요. (${D} = 4 × ${q}) 근호는 "2루트${q}" 처럼 입력해요.`, [line('', `\\sqrt{${D}} = \\square`, [Math.sqrt(D)], `√(4 × ${q}) = 2√${q}. "2루트${q}" 로 입력하세요.`, undefined, [`2\\sqrt{${q}}`])], `$x = \\dfrac{${-b} \\pm 2\\sqrt{${q}}}{2}$ 이에요.`),
      blanksStep('roots', '약분하기', `분자와 분모를 2 로 약분해 $x = □ \\pm △$ 꼴로 쓰세요. (두 번째 칸은 근호)`, [line('', `x = \\square \\pm \\square`, [h, Math.sqrt(q)], `${-b} ÷ 2 = ${h}, 2√${q} ÷ 2 = √${q}`, undefined, [`${h}`, `\\sqrt{${q}}`])], `$x = ${h} \\pm \\sqrt{${q}}$ 이에요. 최종 정답에는 "${h}+√${q}", "${h}-√${q}" 처럼 입력해요.`),
      blanksStep('check', '검산하기', `두 근의 곱은 $c$ 와 같아야 해요. $(${h} + \\sqrt{${q}})(${h} - \\sqrt{${q}}) = (${h})^2 - ${q}$ 을 계산해요.`, [line('검산 :', `(${h})^2 - ${q} = \\square`, [c], `${h * h} − ${q}`)], `상수항 ${c} 과 같아요. ✅`),
    ];
  },

  /* 완전제곱식 이용 */
  complete({ b, c, h, k, s, r1, r2 }) {
    return [
      blanksStep('move', '상수항 이항', `상수항을 우변으로 옮기세요.`, [line('', `x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x = \\square`, [-c], '이항하면 부호가 바뀌어요.')], `$x^2 ${b > 0 ? '+' : '-'} ${Math.abs(b)}x = ${-c}$ 이 되었어요.`),
      blanksStep('square', '완전제곱식 만들기', `양변에 $(x$ 의 계수 $\\div 2)^2$ 을 더하면 좌변이 완전제곱식이 돼요.`, [line('더할 수 :', `\\left(\\dfrac{${b}}{2}\\right)^2 = \\square`, [h * h], `${b} ÷ 2 = ${h}, 제곱하면?`), line('완전제곱식 :', `(x + \\square)^2 = \\square`, [h, k], `좌변은 (x + ${h})², 우변은 ${-c} + ${h * h}`)], `$(${xPlus(h)})^2 = ${k}$ 이 되었어요.`),
      blanksStep('sqrt', '제곱근 이용', `괄호 안은 ${k} 의 제곱근이에요.`, [line('', `${xPlus(h)} = \\pm \\square`, [s], `${s} × ${s} = ${k}`)], `$${xPlus(h)} = \\pm ${s}$ 이에요.`),
      blanksStep('roots', '두 근 구하기', `${h > 0 ? `−${h}` : `+${-h}`} 을 이항해 두 근을 구하세요.`, [rootsLine('x', r1, r2, `${s} ${h > 0 ? '−' : '+'} ${Math.abs(h)} 과 −${s} ${h > 0 ? '−' : '+'} ${Math.abs(h)}`)], '두 근을 구했어요.'),
      checkStep(1, b, c, r1),
    ];
  },
});

/** (x + u)(x + v) 표시 */
function factorPair(u, v) {
  return `(${xPlus(u)})(${xPlus(v)})`;
}

/** (p x + k) 표시 */
function factorNon(p, k) {
  return `(${linearExpr(p, k)})`;
}

export function buildQuadraticSteps(problem) {
  const g = problem.guided;
  const b = BUILDERS[g.type];
  if (!b) throw new Error(`단계별 풀이를 지원하지 않는 이차방정식 문제 유형: ${g.type}`);
  return b(g.params);
}
