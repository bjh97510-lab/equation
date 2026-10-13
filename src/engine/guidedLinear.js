/**
 * 일차방정식 도전(활용) 문제의 단계별 풀이 빌더
 *
 *  생성기가 problem.guided = { form: 'linear-word', type, params } 를 붙이면
 *  여기서 type 별로 "식 세우기 → 정리 → 이항 → 해 → 검산" 단계를 만든다.
 */
import { blanksStep, choiceStep, line } from './guidedCommon.js';
import { numLatex, linearExpr, xPlus } from './format.js';
import { F } from './fraction.js';

const BUILDERS = {
  /* 연속하는 세 자연수의 합 */
  'w-consec'({ x, sum }) {
    return [
      choiceStep('setup-choice', '미지수 정하기', `가장 작은 수를 $x$ 라 하면, 나머지 두 수는 어떻게 나타낼까요?`, [
        { id: 'a', label: '$x + 1,\\; x + 2$', correct: true, feedback: '맞아요! 연속하는 자연수는 1씩 커져요.' },
        { id: 'b', label: '$2x,\\; 3x$', correct: false, feedback: '2배, 3배가 아니라 1씩 커지는 수예요.' },
        { id: 'c', label: '$x + 2,\\; x + 4$', correct: false, feedback: '2씩 커지면 연속하는 수가 아니에요(홀수나 짝수만 나와요).' },
      ]),
      blanksStep('setup', '식 세우기', `세 수의 합이 ${sum} 이라는 조건을 식으로 써 보세요.`, [line('합 :', `x + (x + 1) + (x + 2) = \\square`, [sum], '세 수를 모두 더한 값이 문제에 주어진 합이에요.')], '식을 세웠어요. 이제 좌변을 정리해요.'),
      blanksStep('simplify', '동류항 정리', `괄호를 풀고 $x$ 항끼리, 상수항끼리 모아요.`, [line('정리 :', `\\square x + \\square = ${sum}`, [3, 3], '$x$ 가 3개, 상수는 1 + 2 = 3 이에요.')], `$3x + 3 = ${sum}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `상수항 3을 우변으로 이항한 뒤 양변을 3으로 나누세요.`, [line('이항 :', `3x = \\square`, [sum - 3], `${sum} − 3 을 계산하세요.`), line('', `x = \\square`, [x], `양변을 3으로 나누세요.`)], `$x = ${x}$ 이에요. 세 수는 ${x}, ${x + 1}, ${x + 2} 예요.`),
      blanksStep('check', '검산하기', `구한 세 수를 더해 조건에 맞는지 확인해요.`, [line('검산 :', `${x} + ${x + 1} + ${x + 2} = \\square`, [sum], '세 수를 더하세요.')], `합이 ${sum} 으로 문제의 조건과 같아요. ✅`),
    ];
  },

  /* 몇 년 후 어머니 나이가 자녀의 2배 */
  'w-age'({ mother, child, n }) {
    return [
      choiceStep('setup-choice', '미지수 정하기', `$x$ 년 후의 어머니와 자녀의 나이는 각각 어떻게 나타낼까요?`, [
        { id: 'a', label: `어머니 $(${mother} + x)$ 살, 자녀 $(${child} + x)$ 살`, correct: true, feedback: '맞아요! 두 사람 모두 x 살씩 많아져요.' },
        { id: 'b', label: `어머니 $${mother}$ 살, 자녀 $(${child} + x)$ 살`, correct: false, feedback: '시간이 지나면 어머니의 나이도 함께 늘어나요.' },
        { id: 'c', label: `어머니 $(${mother} + x)$ 살, 자녀 $${child}x$ 살`, correct: false, feedback: '자녀의 나이도 x 살 "더해지는" 거예요. 곱하는 게 아니에요.' },
      ]),
      blanksStep('setup', '식 세우기', `"어머니의 나이 = 2 × 자녀의 나이" 를 식으로 써 보세요.`, [line('식 :', `${mother} + x = \\square(${child} + x)`, [2], '어머니 나이가 자녀 나이의 몇 배인지 문제를 다시 읽어 보세요.')], '식을 세웠어요. 이제 괄호를 풀어요.'),
      blanksStep('expand', '괄호 풀기', `분배법칙으로 우변의 괄호를 풀어요.`, [line('전개 :', `${mother} + x = \\square + \\square x`, [2 * child, 2], `2 × ${child} 과 2 × x 를 각각 계산하세요.`)], `$${mother} + x = ${2 * child} + 2x$ 가 되었어요.`),
      blanksStep('solve', 'x 구하기', `$x$ 항은 우변으로, 상수항은 좌변으로 모으면 $${mother} - ${2 * child} = 2x - x$ 예요. 정리해서 $x$ 를 구하세요.`, [line('', `x = \\square`, [n], `${mother} − ${2 * child} 을 계산하면 x 의 값이에요.`)], `$x = ${n}$, 즉 ${n}년 후예요.`),
      blanksStep('check', '검산하기', `${n}년 후 어머니는 ${mother + n}살, 자녀는 ${child + n}살이에요. 2배가 맞는지 확인해요.`, [line('검산 :', `2 \\times ${child + n} = \\square`, [2 * (child + n)], `${child + n} 의 2배를 계산하세요.`)], `어머니의 나이 ${mother + n}살과 같아요. ✅`),
    ];
  },

  /* 연필 몇 자루 */
  'w-price'({ pen, noteCost, total, x }) {
    return [
      blanksStep('setup', '식 세우기', `연필을 $x$ 자루 샀다고 할 때, (연필 값) + (공책 값) = (낸 돈) 을 식으로 써 보세요.`, [line('식 :', `\\square x + \\square = ${total}`, [pen, noteCost], `연필 한 자루 ${pen}원 × x 자루, 공책 값은 모두 ${noteCost}원이에요.`)], '식을 세웠어요.'),
      blanksStep('solve', 'x 구하기', `상수항을 우변으로 이항한 뒤 양변을 ${pen}으로 나누세요.`, [line('이항 :', `${pen}x = \\square`, [total - noteCost], `${total} − ${noteCost} 을 계산하세요.`), line('', `x = \\square`, [x], `양변을 ${pen}으로 나누세요.`)], `연필은 ${x}자루예요.`),
      blanksStep('check', '검산하기', `연필 ${x}자루 값과 공책 값을 더해 낸 돈과 같은지 확인해요.`, [line('검산 :', `${pen} \\times ${x} + ${noteCost} = \\square`, [total], '곱한 뒤 더하세요.')], `낸 돈 ${total}원과 같아요. ✅`),
    ];
  },

  /* 갈 때·올 때 속력이 다른 거리 */
  'w-dist'({ a, b, t, L, x }) {
    const ka = L / a;
    const kb = L / b;
    return [
      blanksStep('setup', '식 세우기', `거리를 $x$ km 라 하면 갈 때 걸린 시간은 $\\dfrac{x}{${a}}$ 시간, 올 때는 $\\dfrac{x}{${b}}$ 시간이에요(시간 = 거리 ÷ 속력). 두 시간의 합을 식으로 써 보세요.`, [line('식 :', `\\dfrac{x}{${a}} + \\dfrac{x}{${b}} = \\square`, [t], '총 걸린 시간을 쓰세요. 분수는 3/2 처럼 입력해요.')], '식을 세웠어요. 분수가 있으니 분모를 없애요.'),
      blanksStep('clear', '분모 없애기', `${a}과 ${b}의 최소공배수 ${L}을 양변에 곱하세요.`, [line(`× ${L} :`, `\\square x + \\square x = \\square`, [ka, kb, t * L], `${L} ÷ ${a} = ${ka}, ${L} ÷ ${b} = ${kb}, 우변도 ${L}배!`)], '분수가 사라졌어요.'),
      blanksStep('solve', 'x 구하기', `동류항을 정리하고 나누세요.`, [line('정리 :', `\\square x = \\square`, [ka + kb, t * L], `${ka} + ${kb} 을 계산하세요.`), line('', `x = \\square`, [x], `양변을 ${ka + kb}으로 나누세요.`)], `거리는 ${x} km 예요.`),
      blanksStep('check', '검산하기', `갈 때 ${x} ÷ ${a} 시간, 올 때 ${x} ÷ ${b} 시간. 합이 총 시간과 같은지 확인해요.`, [line('검산 :', `\\dfrac{${x}}{${a}} + \\dfrac{${x}}{${b}} = \\square`, [t], '두 시간을 더하세요.')], `총 ${t}시간으로 조건과 같아요. ✅`),
    ];
  },

  /* 직사각형 둘레 */
  'w-rect'({ w, extra, peri }) {
    return [
      choiceStep('setup-choice', '미지수 정하기', `세로의 길이를 $x$ cm 라 하면 가로의 길이는?`, [
        { id: 'a', label: `$(x + ${extra})$ cm`, correct: true, feedback: `맞아요! 가로가 세로보다 ${extra}cm 더 길어요.` },
        { id: 'b', label: `$(x - ${extra})$ cm`, correct: false, feedback: '가로가 세로보다 "더 길다"고 했어요. 빼면 더 짧아져요.' },
        { id: 'c', label: `$${extra}x$ cm`, correct: false, feedback: `${extra}배가 아니라 ${extra}cm 만큼 더 긴 거예요.` },
      ]),
      blanksStep('setup', '식 세우기', `둘레 = 2 × (가로 + 세로) 예요. 식을 완성하세요.`, [line('둘레 :', `2(x + x + \\square) = \\square`, [extra, peri], `괄호 안은 가로 + 세로, 우변은 둘레의 길이예요.`)], '식을 세웠어요.'),
      blanksStep('expand', '괄호 풀기', `괄호 안을 정리하면 $2(2x + ${extra})$. 분배법칙으로 풀어요.`, [line('전개 :', `\\square x + \\square = ${peri}`, [4, 2 * extra], `2 × 2x = 4x, 2 × ${extra} = ${2 * extra}`)], `$4x + ${2 * extra} = ${peri}$ 가 되었어요.`),
      blanksStep('solve', 'x 구하기', `상수항을 이항하고 양변을 4로 나누세요.`, [line('이항 :', `4x = \\square`, [peri - 2 * extra], `${peri} − ${2 * extra}`), line('', `x = \\square`, [w], '양변을 4로 나누세요.')], `세로는 ${w}cm, 가로는 ${w + extra}cm 예요.`),
      blanksStep('check', '검산하기', `둘레를 다시 계산해 봐요.`, [line('검산 :', `2 \\times (${w + extra} + ${w}) = \\square`, [peri], '가로 + 세로를 2배 하세요.')], `둘레 ${peri}cm 로 조건과 같아요. ✅`),
    ];
  },

  /* 동전 개수 */
  'w-coin'({ total, money, x }) {
    return [
      choiceStep('setup-choice', '미지수 정하기', `500원짜리 동전을 $x$ 개라 하면 100원짜리 동전은 몇 개일까요?`, [
        { id: 'a', label: `$(${total} - x)$ 개`, correct: true, feedback: `맞아요! 전체 ${total}개에서 500원짜리를 빼면 100원짜리 개수예요.` },
        { id: 'b', label: `$(${total} + x)$ 개`, correct: false, feedback: `둘을 합해서 ${total}개이므로 더하면 안 돼요.` },
        { id: 'c', label: `$x$ 개`, correct: false, feedback: '두 동전의 개수가 같다는 조건은 없어요.' },
      ]),
      blanksStep('setup', '식 세우기', `(500원짜리 금액) + (100원짜리 금액) = (총 금액) 을 식으로 써 보세요.`, [line('금액 :', `500x + 100(\\square - x) = \\square`, [total, money], `100원짜리는 (${total} − x)개, 총 금액은 ${money}원이에요.`)], '식을 세웠어요.'),
      blanksStep('expand', '괄호 풀기', `분배법칙으로 $100(${total} - x)$ 를 풀어요.`, [line('전개 :', `500x + \\square - \\square x = ${money}`, [100 * total, 100], `100 × ${total} 과 100 × x 를 각각 계산하세요.`)], '괄호가 사라졌어요.'),
      blanksStep('solve', 'x 구하기', `$x$ 항끼리 모으고 상수항을 이항하세요.`, [line('정리 :', `\\square x = \\square`, [400, money - 100 * total], `500x − 100x = 400x, ${money} − ${100 * total}`), line('', `x = \\square`, [x], '양변을 400으로 나누세요.')], `500원짜리는 ${x}개, 100원짜리는 ${total - x}개예요.`),
      blanksStep('check', '검산하기', `총 금액을 다시 계산해 봐요.`, [line('검산 :', `500 \\times ${x} + 100 \\times ${total - x} = \\square`, [money], '두 금액을 더하세요.')], `총 ${money}원으로 조건과 같아요. ✅`),
    ];
  },
};

/* ───────────── 기초·기본·발전 (방정식 풀이) ───────────── */

/** 값을 괄호로 감싼 표시 (음수 대비): 2 × (-3) */
const par = (v) => `(${numLatex(v)})`;

/** 상수항 이항 선택 문제 (부호가 바뀐다는 것을 확인) */
function moveConstChoice(b, side = '우변') {
  const abs = Math.abs(b);
  const sgn = b > 0 ? '+' : '-';
  const opp = b > 0 ? '-' : '+';
  return choiceStep('move-choice', '이항 알아보기', `$x$ 항만 남기려면 상수항 $${sgn}${abs}$ 을(를) ${side}으로 옮겨야 해요. 옮기면 어떻게 될까요?`, [
    { id: 'a', label: `${side}에 $${opp}${abs}$ 이 된다 (부호가 바뀐다)`, correct: true, feedback: '맞아요! 이항하면 부호가 바뀌어요. 양변에 같은 수를 더하거나 뺀 것과 같아요.' },
    { id: 'b', label: `${side}에 $${sgn}${abs}$ 이 된다 (부호 그대로)`, correct: false, feedback: `이항은 양변에서 ${sgn}${abs} 을 없애는 거예요. 그대로 옮기면 등식이 깨져요.` },
    { id: 'c', label: `$x$ 의 계수에 곱한다`, correct: false, feedback: '더하거나 빼는 항은 곱셈으로 옮길 수 없어요.' },
  ]);
}

Object.assign(BUILDERS, {
  /* x + a = b */
  add({ a, b, x }) {
    return [
      choiceStep('op-choice', '어떻게 할까?', `$x + ${a} = ${b}$ 에서 $x$ 를 혼자 남기려면 양변에 어떻게 해야 할까요?`, [
        { id: 'a', label: `양변에서 ${a} 을(를) 뺀다`, correct: true, feedback: `맞아요! 양변에서 ${a} 을 빼면 좌변에 x 만 남아요.` },
        { id: 'b', label: `양변에 ${a} 을(를) 더한다`, correct: false, feedback: `더하면 좌변이 x + ${2 * a} 이 되어 x 가 혼자 남지 않아요.` },
        { id: 'c', label: `양변을 ${a} 으로 나눈다`, correct: false, feedback: `+${a} 은 더해진 수예요. 나누기가 아니라 빼기로 없애요.` },
      ]),
      blanksStep('solve', 'x 구하기', `양변에서 ${a} 을 빼서 $x$ 를 구하세요.`, [line('', `x = ${b} - \\square`, [a], `좌변의 +${a} 을 없애려고 빼는 수예요.`), line('', `x = \\square`, [x], `${b} − ${a} 을 계산하세요.`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요.`, [line('검산 :', `${par(x)} + ${a} = \\square`, [b], '더하세요.')], `우변 ${b} 과 같아요. ✅`),
    ];
  },

  /* x - a = b */
  sub({ a, b, x }) {
    return [
      choiceStep('op-choice', '어떻게 할까?', `$x - ${a} = ${numLatex(b)}$ 에서 $x$ 를 혼자 남기려면 양변에 어떻게 해야 할까요?`, [
        { id: 'a', label: `양변에 ${a} 을(를) 더한다`, correct: true, feedback: `맞아요! −${a} 을 없애려면 ${a} 을 더해요.` },
        { id: 'b', label: `양변에서 ${a} 을(를) 뺀다`, correct: false, feedback: `빼면 좌변이 x − ${2 * a} 이 돼요. −${a} 의 반대는 +${a}!` },
        { id: 'c', label: `양변에 ${a} 을(를) 곱한다`, correct: false, feedback: `−${a} 은 뺀 수예요. 곱하기가 아니라 더하기로 없애요.` },
      ]),
      blanksStep('solve', 'x 구하기', `양변에 ${a} 을 더해서 $x$ 를 구하세요.`, [line('', `x = ${numLatex(b)} + \\square`, [a], `좌변의 −${a} 을 없애려고 더하는 수예요.`), line('', `x = \\square`, [x], `${numLatex(b)} + ${a} 를 계산하세요.`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요.`, [line('검산 :', `${x} - ${a} = \\square`, [b], '빼세요.')], `우변 ${numLatex(b)} 과 같아요. ✅`),
    ];
  },

  /* a x = b */
  mul({ a, b, x }) {
    return [
      choiceStep('op-choice', '어떻게 할까?', `$${a}x = ${numLatex(b)}$ 에서 $x$ 하나의 값을 알려면 양변에 어떻게 해야 할까요?`, [
        { id: 'a', label: `양변을 ${a} 으로 나눈다`, correct: true, feedback: `맞아요! ${a}x 는 x 를 ${a}번 더한 것이므로 ${a} 으로 나누면 x 하나의 값이에요.` },
        { id: 'b', label: `양변에서 ${a} 을(를) 뺀다`, correct: false, feedback: `${a}x 는 "${a} 곱하기 x" 예요. 빼기로는 없앨 수 없어요.` },
        { id: 'c', label: `양변에 ${a} 을(를) 곱한다`, correct: false, feedback: `곱하면 ${a * a}x 가 되어 더 복잡해져요.` },
      ]),
      blanksStep('solve', 'x 구하기', `양변을 ${a} 으로 나누세요.`, [line('', `x = ${numLatex(b)} \\div \\square`, [a], `x 의 계수예요.`), line('', `x = \\square`, [x], `${numLatex(b)} ÷ ${a} 를 계산하세요. 부호에 주의!`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요.`, [line('검산 :', `${a} \\times ${par(x)} = \\square`, [b], '곱하세요.')], `우변 ${numLatex(b)} 과 같아요. ✅`),
    ];
  },

  /* a x + b = c */
  axb({ a, b, c, x }) {
    return [
      moveConstChoice(b),
      blanksStep('move', '상수항 이항', `상수항을 우변으로 옮겨 $${a}x$ 만 남기세요.`, [line('', `${a}x = \\square`, [c - b], `${numLatex(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} 을 계산하세요.`)], `$${a}x = ${numLatex(c - b)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `양변을 ${a} 으로 나누세요.`, [line('', `x = \\square`, [x], `${numLatex(c - b)} ÷ ${a}`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요.`, [line('검산 :', `${a} \\times ${par(x)} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = \\square`, [c], `${a}×(${x}) = ${a * x} 에 ${b} 을 더하세요.`)], `우변 ${numLatex(c)} 과 같아요. ✅`),
    ];
  },

  /* c - a x = d */
  cax({ a, c, d, x }) {
    return [
      choiceStep('move-choice', '이항 알아보기', `$${c} - ${a}x = ${numLatex(d)}$ 에서 $x$ 항은 $-${a}x$ 예요. 상수항 ${c} 을 우변으로 옮기면?`, [
        { id: 'a', label: `$-${a}x = ${numLatex(d)} - ${c}$`, correct: true, feedback: '맞아요! 이항하면 부호가 바뀌고, x 항의 −부호는 그대로예요.' },
        { id: 'b', label: `$${a}x = ${numLatex(d)} - ${c}$`, correct: false, feedback: `x 항은 −${a}x 예요. 이항한다고 x 항의 부호까지 바뀌지는 않아요.` },
        { id: 'c', label: `$-${a}x = ${numLatex(d)} + ${c}$`, correct: false, feedback: '이항하면 부호가 바뀌어요. +c 는 우변에서 −c 가 돼요.' },
      ]),
      blanksStep('move', '상수항 이항', `우변을 계산하세요.`, [line('', `-${a}x = \\square`, [d - c], `${numLatex(d)} − ${c}`)], `$-${a}x = ${numLatex(d - c)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `양변을 $-${a}$ 으로 나누세요. 음수 ÷ 음수는 양수!`, [line('', `x = \\square`, [x], `${numLatex(d - c)} ÷ (−${a})`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요.`, [line('검산 :', `${c} - ${a} \\times ${par(x)} = \\square`, [d], `${a}×(${x}) = ${a * x} 을 ${c} 에서 빼세요.`)], `우변 ${numLatex(d)} 과 같아요. ✅`),
    ];
  },

  /* a(x + b) = c */
  bracket({ a, b, c, x }) {
    const ab = a * b;
    return [
      blanksStep('expand', '괄호 풀기', `분배법칙으로 ${a} 을 괄호 안의 두 항에 각각 곱하세요.`, [line('전개 :', `\\square x + \\square = ${numLatex(c)}`, [a, ab], `${a} × x = ${a}x, ${a} × (${b}) = ${ab}`)], `$${linearExpr(a, ab)} = ${numLatex(c)}$ 이 되었어요.`),
      blanksStep('move', '상수항 이항', `상수항 ${ab} 을 우변으로 옮기세요.`, [line('', `${a}x = \\square`, [c - ab], `${numLatex(c)} ${ab > 0 ? '−' : '+'} ${Math.abs(ab)}`)], `$${a}x = ${numLatex(c - ab)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `양변을 ${a} 으로 나누세요.`, [line('', `x = \\square`, [x], `${numLatex(c - ab)} ÷ ${a}`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요. 괄호 안 $${x} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = ${x + b}$ 이에요.`, [line('검산 :', `${a} \\times ${par(x + b)} = \\square`, [c], '곱하세요.')], `우변 ${numLatex(c)} 과 같아요. ✅`),
    ];
  },

  /* a x + b = c x + d */
  both({ a, b, c, d, x }) {
    return [
      choiceStep('move-choice', '이항 알아보기', `양변에 모두 $x$ 가 있어요. 어떻게 모을까요?`, [
        { id: 'a', label: `$x$ 항은 좌변으로, 상수항은 우변으로 옮긴다 (옮기면 부호가 바뀐다)`, correct: true, feedback: '맞아요! 같은 종류의 항을 한쪽으로 모으면 일차방정식의 기본 꼴이 돼요.' },
        { id: 'b', label: `$${c}x$ 를 부호 그대로 좌변에 더한다`, correct: false, feedback: '이항하면 부호가 바뀌어요. 우변의 +cx 는 좌변에서 −cx 가 돼요.' },
        { id: 'c', label: `$x$ 항만 옮기고 상수항은 양쪽에 둔다`, correct: false, feedback: '상수항도 한쪽으로 모아야 x 의 값을 구할 수 있어요.' },
      ]),
      blanksStep('collect', '동류항 정리', `$${a}x - ${c}x = ${numLatex(d)} ${b > 0 ? '-' : '+'} ${Math.abs(b)}$ 을 계산하세요.`, [line('정리 :', `\\square x = \\square`, [a - c, d - b], `${a} − ${c} 과 ${numLatex(d)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} 을 계산하세요.`)], `$${linearExpr(a - c, 0)} = ${numLatex(d - b)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `양변을 ${a - c} 으로 나누세요.`, [line('', `x = \\square`, [x], `${numLatex(d - b)} ÷ ${a - c}`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 양변에 각각 넣어 같은 값이 나오는지 확인해요.`, [line('좌변 :', `${a} \\times ${par(x)} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = \\square`, [a * x + b], '곱한 뒤 더하세요.'), line('우변 :', `${c} \\times ${par(x)} ${d > 0 ? '+' : '-'} ${Math.abs(d)} = \\square`, [c * x + d], '곱한 뒤 더하세요.')], '좌변과 우변이 같아요. ✅'),
    ];
  },

  /* x/a + b = c */
  fracx({ a, b, c, k, x }) {
    return [
      moveConstChoice(b),
      blanksStep('move', '상수항 이항', `상수항을 우변으로 옮겨 $\\dfrac{x}{${a}}$ 만 남기세요.`, [line('', `\\dfrac{x}{${a}} = \\square`, [k], `${numLatex(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)}`)], `$\\dfrac{x}{${a}} = ${numLatex(k)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `분모 ${a} 을 없애려면 양변에 ${a} 을 곱해요.`, [line('', `x = ${numLatex(k)} \\times \\square = \\square`, [a, x], `양변에 곱하는 수는 분모 ${a}, 그다음 곱셈을 계산하세요.`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요.`, [line('검산 :', `\\dfrac{${x}}{${a}} ${b > 0 ? '+' : '-'} ${Math.abs(b)} = \\square`, [c], `${x} ÷ ${a} = ${k} 에 ${b} 을 더하세요.`)], `우변 ${numLatex(c)} 과 같아요. ✅`),
    ];
  },

  /* (x + a)/b = c */
  fracp({ a, b, c, x }) {
    return [
      choiceStep('op-choice', '어떻게 할까?', `$\\dfrac{${xPlus(a)}}{${b}} = ${numLatex(c)}$ 에서 분모 ${b} 을 없애려면?`, [
        { id: 'a', label: `양변에 ${b} 을(를) 곱한다`, correct: true, feedback: `맞아요! 분모와 같은 수를 곱하면 분수가 사라져요.` },
        { id: 'b', label: `양변을 ${b} 으로 나눈다`, correct: false, feedback: '나누면 분모가 더 커져요. 반대로 곱해야 해요.' },
        { id: 'c', label: `분자에서 ${b} 을(를) 뺀다`, correct: false, feedback: '분모는 빼기로 없앨 수 없어요.' },
      ]),
      blanksStep('clear', '분모 없애기', `양변에 ${b} 을 곱하세요.`, [line('', `${xPlus(a)} = \\square`, [b * c], `${numLatex(c)} × ${b}`)], `$${xPlus(a)} = ${numLatex(b * c)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `상수항 ${a} 을 우변으로 이항하세요.`, [line('', `x = \\square`, [x], `${numLatex(b * c)} ${a > 0 ? '−' : '+'} ${Math.abs(a)}`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 처음 식에 넣어 확인해요. 분자는 $${x} ${a > 0 ? '+' : '-'} ${Math.abs(a)} = ${x + a}$ 이에요.`, [line('검산 :', `\\dfrac{${x + a}}{${b}} = \\square`, [c], '나누세요.')], `우변 ${numLatex(c)} 과 같아요. ✅`),
    ];
  },

  /* 0.A x + 0.B = 0.C */
  dec({ A, B, C, x }) {
    return [
      choiceStep('op-choice', '어떻게 할까?', `계수가 소수예요. 계산하기 쉽게 만들려면 어떻게 할까요?`, [
        { id: 'a', label: '양변에 10을 곱해 정수 계수로 만든다', correct: true, feedback: '맞아요! 양변에 같은 수를 곱해도 해는 변하지 않아요.' },
        { id: 'b', label: '양변을 10으로 나눈다', correct: false, feedback: '나누면 소수점이 더 늘어나요.' },
        { id: 'c', label: '좌변의 소수점만 지운다', correct: false, feedback: '한쪽만 바꾸면 등식이 깨져요. 양변에 똑같이 해야 해요.' },
      ]),
      blanksStep('clear', '정수로 만들기', `양변의 모든 항에 10을 곱하세요.`, [line('× 10 :', `\\square x + \\square = \\square`, [A, B, C], `0.${A} × 10 = ${A}, 상수항과 우변도 10배!`)], `$${linearExpr(A, B)} = ${numLatex(C)}$ 이 되었어요.`),
      blanksStep('move', '상수항 이항', `상수항을 우변으로 옮기세요.`, [line('', `${A}x = \\square`, [C - B], `${numLatex(C)} ${B > 0 ? '−' : '+'} ${Math.abs(B)}`)], `$${A}x = ${numLatex(C - B)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `양변을 ${A} 으로 나누세요.`, [line('', `x = \\square`, [x], `${numLatex(C - B)} ÷ ${A}`)], `$x = ${x}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${x}$ 을 정수로 만든 식에 넣어 확인해요.`, [line('검산 :', `${A} \\times ${par(x)} ${B > 0 ? '+' : '-'} ${Math.abs(B)} = \\square`, [C], `${A}×(${x}) = ${A * x} 에 ${B} 을 더하세요.`)], `우변 ${numLatex(C)} 과 같아요. ✅`),
    ];
  },

  /* a x + b = c, 해가 분수 */
  fsol({ a, b, c, ax, xn, xd }) {
    const xF = F(xn, xd);
    return [
      moveConstChoice(b),
      blanksStep('move', '상수항 이항', `상수항을 우변으로 옮겨 $${a}x$ 만 남기세요.`, [line('', `${a}x = \\square`, [ax], `${numLatex(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)}`)], `$${a}x = ${numLatex(ax)}$ 이 되었어요.`),
      blanksStep('solve', 'x 구하기', `양변을 ${a} 으로 나누면 $x = \\dfrac{${ax}}{${a}}$ 예요. 나누어떨어지지 않으니 **기약분수**로 약분해서 쓰세요. (예: 3/2)`, [line('', `x = \\square`, [xF], `분자와 분모를 최대공약수로 나누세요. 분수는 "${xn}/${xd}" 처럼 입력해요.`)], `$x = ${xF.toLatex()}$ 이에요.`),
      blanksStep('check', '검산하기', `$x = ${xF.toLatex()}$ 을 처음 식에 넣어 확인해요.`, [line('검산 :', `${a} \\times \\left(${xF.toLatex()}\\right) ${b > 0 ? '+' : '-'} ${Math.abs(b)} = \\square`, [c], `${a} × ${xn}/${xd} = ${ax} 에 ${b} 을 더하세요.`)], `우변 ${numLatex(c)} 과 같아요. ✅`),
    ];
  },
});

export function buildLinearSteps(problem) {
  const g = problem.guided;
  const b = BUILDERS[g.type];
  if (!b) throw new Error(`단계별 풀이를 지원하지 않는 일차방정식 문제 유형: ${g.type}`);
  return b(g.params);
}
