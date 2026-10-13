/**
 * 이차방정식 도전(활용) 문제의 단계별 풀이 빌더
 *
 *  생성기가 problem.guided = { form: 'quadratic-word', type, params } 를 붙이면
 *  "식 세우기 → = 0 꼴 정리 → 인수분해/제곱근 → 두 근 → 조건에 맞는 근 고르기 → 검산" 단계를 만든다.
 */
import { blanksStep, choiceStep, line } from './guidedCommon.js';

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

export function buildQuadraticSteps(problem) {
  const g = problem.guided;
  const b = BUILDERS[g.type];
  if (!b) throw new Error(`단계별 풀이를 지원하지 않는 이차방정식 문제 유형: ${g.type}`);
  return b(g.params);
}
