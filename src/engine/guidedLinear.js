/**
 * 일차방정식 도전(활용) 문제의 단계별 풀이 빌더
 *
 *  생성기가 problem.guided = { form: 'linear-word', type, params } 를 붙이면
 *  여기서 type 별로 "식 세우기 → 정리 → 이항 → 해 → 검산" 단계를 만든다.
 */
import { blanksStep, choiceStep, line } from './guidedCommon.js';

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

export function buildLinearSteps(problem) {
  const g = problem.guided;
  const b = BUILDERS[g.type];
  if (!b) throw new Error(`단계별 풀이를 지원하지 않는 일차방정식 문제 유형: ${g.type}`);
  return b(g.params);
}
