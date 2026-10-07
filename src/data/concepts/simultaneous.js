/** 중2 연립일차방정식 개념 학습 콘텐츠 */
export const SIMULTANEOUS_STEPS = [
  {
    id: 's1',
    concept: 'two-var',
    title: '미지수가 두 개인 일차방정식',
    blocks: [
      { type: 'text', text: '사과 $x$ 개와 배 $y$ 개를 합해 5개 샀다면 $x + y = 5$ 라고 쓸 수 있어요. 이렇게 **미지수가 두 개**이고 차수가 1인 방정식을 **미지수가 2개인 일차방정식**이라고 합니다.' },
      { type: 'math', latex: 'ax + by + c = 0 \\quad (a \\neq 0,\\; b \\neq 0)' },
      { type: 'text', text: '$x + y = 5$ 의 해는 하나가 아니에요. $x, y$ 가 자연수라면 $(1, 4), (2, 3), (3, 2), (4, 1)$ 모두 해가 됩니다. 해를 **순서쌍 $(x, y)$** 로 나타냅니다.' },
      {
        type: 'choice',
        question: '$2x + y = 7$ 의 해가 **아닌** 것은?',
        options: ['$(1, 5)$', '$(2, 3)$', '$(3, 2)$', '$(0, 7)$'],
        answer: 2,
        explain: '$(3, 2)$ 를 대입하면 $6 + 2 = 8 \\neq 7$ 이므로 해가 아니에요.',
      },
    ],
  },
  {
    id: 's2',
    concept: 'meaning',
    title: '연립방정식의 뜻',
    blocks: [
      { type: 'text', text: '미지수가 2개인 일차방정식 **두 개를 한 쌍으로 묶은 것**을 **연립일차방정식**(줄여서 연립방정식)이라고 합니다.' },
      { type: 'math', latex: '\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}' },
      { type: 'text', text: '사과와 배를 합해 5개 샀고, 사과가 배보다 1개 많다면? 두 조건을 **동시에** 만족하는 $(x, y)$ 를 찾는 것이 목표예요.' },
      { type: 'card', front: 'x + y = 5 와 x - y = 1 을 동시에 만족하는 (x, y)는?', back: '(3, 2)', note: '3 + 2 = 5 ✓, 3 - 2 = 1 ✓ 두 식이 모두 참!' },
    ],
  },
  {
    id: 's3',
    concept: 'meaning',
    title: '연립방정식의 해',
    blocks: [
      { type: 'text', text: '두 방정식을 **동시에 만족**하는 $x, y$ 의 값(순서쌍)을 연립방정식의 **해**라고 하고, 해를 구하는 것을 "연립방정식을 **푼다**"라고 합니다.' },
      {
        type: 'steps',
        items: [
          { expr: 'x + y = 5 \\text{ 의 해: } (1,4), (2,3), (3,2), (4,1), \\dots', note: '첫 식의 해들' },
          { expr: 'x - y = 1 \\text{ 의 해: } (2,1), (3,2), (4,3), \\dots', note: '두 번째 식의 해들' },
          { expr: '\\text{공통인 해: } (3, 2)', note: '두 식 모두에 들어 있는 순서쌍' },
        ],
      },
      {
        type: 'blank',
        intro: '$(x, y) = (4, 1)$ 이 연립방정식 $\\begin{cases} x + 2y = 6 \\\\ 2x - y = 7 \\end{cases}$ 의 해인지 확인해 봅시다.',
        lines: [
          { latex: '4 + 2 \\times 1 = \\square', answer: '6', hint: '첫 식에 대입: 4 + 2' },
          { latex: '2 \\times 4 - 1 = \\square', answer: '7', hint: '둘째 식에 대입: 8 - 1' },
        ],
        after: '두 식 모두 성립하므로 $(4, 1)$ 은 해입니다.',
      },
    ],
  },
  {
    id: 's4',
    concept: 'addition',
    title: '가감법 – 계수가 같은 경우',
    blocks: [
      { type: 'text', text: '두 식을 **더하거나 빼서** 한 미지수를 없애는 방법을 **가감법**이라고 합니다. 한 미지수의 계수가 같거나 부호만 다르면 바로 적용할 수 있어요.' },
      {
        type: 'steps',
        items: [
          { expr: '\\begin{cases} x + y = 7 \\;\\cdots ① \\\\ x - y = 3 \\;\\cdots ② \\end{cases}', note: 'y 의 계수가 +1, -1 로 부호만 달라요' },
          { expr: '2x = 10', note: '① + ② : y 가 사라짐' },
          { expr: 'x = 5', note: '양변을 2로 나누기' },
          { expr: '5 + y = 7 \\;\\Rightarrow\\; y = 2', note: 'x = 5 를 ①에 대입' },
          { expr: '(x, y) = (5, 2)', note: '②에도 대입해 확인: 5 - 2 = 3 ✓' },
        ],
      },
      { type: 'tip', text: '계수의 부호가 **다르면 더하고**, **같으면 뺍니다**.' },
      {
        type: 'blank',
        intro: '$\\begin{cases} 2x + y = 9 \\\\ 2x - y = 3 \\end{cases}$ 두 식을 더해 보세요.',
        lines: [
          { latex: '4x = \\square', answer: '12', hint: '9 + 3 = ?' },
          { latex: 'x = \\square', answer: '3', hint: '12 ÷ 4' },
          { latex: 'y = \\square', answer: '3', hint: '2 × 3 + y = 9 에서 y 는?' },
        ],
      },
    ],
  },
  {
    id: 's5',
    concept: 'addition',
    title: '가감법 – 계수를 맞춰야 하는 경우',
    blocks: [
      { type: 'text', text: '계수가 다르면 한 식(또는 두 식)에 적당한 수를 곱해 **계수의 절댓값을 같게** 만든 뒤 더하거나 뺍니다.' },
      {
        type: 'steps',
        items: [
          { expr: '\\begin{cases} x + 2y = 8 \\;\\cdots ① \\\\ 3x - y = 3 \\;\\cdots ② \\end{cases}', note: 'x 의 계수: 1 과 3' },
          { expr: '3x + 6y = 24 \\;\\cdots ① \\times 3', note: '①에 3을 곱해 x 의 계수를 3으로' },
          { expr: '7y = 21', note: '(① × 3) - ② : x 소거' },
          { expr: 'y = 3', note: '' },
          { expr: 'x + 6 = 8 \\;\\Rightarrow\\; x = 2', note: 'y = 3 을 ①에 대입' },
        ],
      },
      { type: 'text', text: '두 식 모두 곱해야 하는 경우도 있어요. $2x + 3y = 12$, $3x - 2y = 5$ 에서 $x$ 를 없애려면 ①×3, ②×2 로 계수를 6으로 맞춥니다.' },
      {
        type: 'choice',
        question: '$\\begin{cases} 2x + 5y = 1 \\\\ 4x - 3y = 15 \\end{cases}$ 에서 $x$ 를 없애려면?',
        options: ['①에 2를 곱한 뒤 ②에서 뺀다', '①에 2를 곱한 뒤 ②와 더한다', '②에 2를 곱한 뒤 ①에서 뺀다', '①에 5, ②에 3을 곱한다'],
        answer: 0,
        explain: '① × 2 는 $4x + 10y = 2$. 이것을 ②에서 빼면(또는 ②를 이것에서 빼면) $x$ 가 사라져요. 답: $(3, -1)$',
      },
    ],
  },
  {
    id: 's6',
    concept: 'substitution',
    title: '대입법',
    blocks: [
      { type: 'text', text: '한 식을 $x = \\dots$ 또는 $y = \\dots$ 꼴로 만들어 **다른 식에 대입**하여 미지수를 하나로 줄이는 방법을 **대입법**이라고 합니다.' },
      {
        type: 'steps',
        items: [
          { expr: '\\begin{cases} y = 2x - 1 \\;\\cdots ① \\\\ 3x + y = 9 \\;\\cdots ② \\end{cases}', note: '①이 이미 y = … 꼴' },
          { expr: '3x + (2x - 1) = 9', note: '①을 ②의 y 에 대입 (괄호!)' },
          { expr: '5x - 1 = 9 \\;\\Rightarrow\\; 5x = 10', note: '정리' },
          { expr: 'x = 2', note: '' },
          { expr: 'y = 2 \\times 2 - 1 = 3', note: 'x = 2 를 ①에 대입' },
        ],
      },
      { type: 'tip', text: '대입할 때는 **반드시 괄호**로 묶어서 넣으세요. $3x + 2x - 1$ 처럼 괄호 없이 쓰다 부호 실수가 많이 생겨요.' },
      {
        type: 'blank',
        intro: '$\\begin{cases} x = y + 3 \\\\ 2x + y = 12 \\end{cases}$ 를 대입법으로 풀어 보세요.',
        lines: [
          { latex: '2(y + 3) + y = 12 \\;\\Rightarrow\\; 3y + \\square = 12', answer: '6', hint: '2 × 3 = ?' },
          { latex: 'y = \\square', answer: '2', hint: '3y = 6' },
          { latex: 'x = \\square', answer: '5', hint: 'x = y + 3' },
        ],
      },
    ],
  },
  {
    id: 's7',
    concept: 'substitution',
    title: '어떤 방법을 선택할까?',
    blocks: [
      { type: 'text', text: '가감법과 대입법은 모두 "미지수를 하나로 줄이기"가 목적이에요. 상황에 따라 더 편한 방법을 선택하면 됩니다.' },
      { type: 'tip', text: '한 식이 $x = \\dots$, $y = \\dots$ 꼴이면 → **대입법**이 편해요.\n두 식이 모두 $ax + by = c$ 꼴이면 → **가감법**이 편해요.' },
      {
        type: 'choice',
        question: '$\\begin{cases} y = 3x - 2 \\\\ 2x + 3y = 16 \\end{cases}$ 어떤 방법이 편할까요?',
        options: ['대입법 – 첫 식을 둘째 식에 대입', '가감법 – 두 식을 더한다', '가감법 – 두 식을 뺀다', '두 식을 모두 3배 한다'],
        answer: 0,
        explain: '첫 식이 $y = \\dots$ 꼴이므로 바로 대입: $2x + 3(3x - 2) = 16 \\Rightarrow 11x = 22 \\Rightarrow x = 2, y = 4$',
      },
      {
        type: 'choice',
        question: '$\\begin{cases} 3x + 2y = 12 \\\\ 3x - 4y = -6 \\end{cases}$ 어떤 방법이 편할까요?',
        options: ['가감법 – 두 식을 빼서 x 소거', '대입법 – x 를 y 로 나타내 대입', '두 식을 모두 2배 한다', '가감법 – 두 식을 더한다'],
        answer: 0,
        explain: '$x$ 의 계수가 모두 3이므로 두 식을 빼면 $6y = 18$, $y = 3$, $x = 2$',
      },
    ],
  },
  {
    id: 's8',
    concept: 'application',
    title: '연립방정식 활용',
    blocks: [
      { type: 'text', text: '구하려는 두 양을 $x, y$ 로 놓고, 문제에서 **두 개의 조건**을 찾아 식 두 개를 세웁니다.' },
      { type: 'text', text: '**예)** 500원짜리 지우개와 800원짜리 볼펜을 합해 7개 사고 4,100원을 냈다. 각각 몇 개?' },
      {
        type: 'steps',
        items: [
          { expr: '\\text{지우개 } x\\text{개, 볼펜 } y\\text{개}', note: '① 미지수 정하기' },
          { expr: '\\begin{cases} x + y = 7 \\\\ 500x + 800y = 4100 \\end{cases}', note: '② 개수 조건, 금액 조건' },
          { expr: '500x + 500y = 3500 \\;\\Rightarrow\\; 300y = 600', note: '③ 가감법' },
          { expr: 'y = 2,\\; x = 5', note: '지우개 5개, 볼펜 2개' },
          { expr: '2500 + 1600 = 4100 \\;\\checkmark', note: '④ 확인' },
        ],
      },
      { type: 'tip', text: '자주 나오는 유형: 가격·개수 / 학생 수 / 나이 / 거리·속력·시간 / 농도. 각 유형마다 "합"에 대한 식과 "다른 조건"에 대한 식을 찾아보세요.' },
      {
        type: 'choice',
        question: '시속 4km로 $x$ km, 시속 6km로 $y$ km 를 가서 총 2시간 걸렸다. 시간 조건을 나타낸 식은?',
        options: ['$\\dfrac{x}{4} + \\dfrac{y}{6} = 2$', '$4x + 6y = 2$', '$x + y = 2$', '$\\dfrac{4}{x} + \\dfrac{6}{y} = 2$'],
        answer: 0,
        explain: '시간 = 거리 ÷ 속력 이므로 $\\dfrac{x}{4} + \\dfrac{y}{6} = 2$',
      },
    ],
  },
];

export const SIMULTANEOUS_CARDS = [
  { id: 'sc1', front: '미지수가 2개인 일차방정식의 해는 어떻게 나타낼까?', back: '순서쌍 $(x, y)$', note: '예: x + y = 5 의 해 (2, 3)' },
  { id: 'sc2', front: '연립방정식이란?', back: '미지수가 2개인 일차방정식 두 개를 한 쌍으로 묶은 것', note: '두 식을 동시에 만족하는 해를 찾아요.' },
  { id: 'sc3', front: '가감법이란?', back: '두 식을 더하거나 빼서 한 미지수를 없애는 방법', note: '계수의 절댓값을 같게 맞춘 뒤 사용' },
  { id: 'sc4', front: '대입법이란?', back: '한 식을 다른 식에 대입하여 미지수를 하나로 줄이는 방법', note: 'x = … 또는 y = … 꼴일 때 편리' },
  { id: 'sc5', front: '$\\begin{cases} x + y = 6 \\\\ x - y = 2 \\end{cases}$ 의 해는?', back: '$(4, 2)$', note: '두 식을 더하면 2x = 8' },
  { id: 'sc6', front: '계수의 부호가 다르면? 같으면?', back: '다르면 더하고, 같으면 뺀다', note: '예: +2y 와 -2y → 더하기' },
  { id: 'sc7', front: '$y = x + 1$ 을 $2x + y = 7$ 에 대입하면?', back: '$2x + (x + 1) = 7$', note: '괄호로 묶어 대입! 3x = 6, x = 2, y = 3' },
  { id: 'sc8', front: '$\\begin{cases} 2x + 3y = 7 \\\\ 3x - 2y = 4 \\end{cases}$ 에서 x 를 없애려면?', back: '①×3, ②×2 로 x 의 계수를 6 으로 맞춘 뒤 뺀다', note: '13y = 13, y = 1, x = 2' },
  { id: 'sc9', front: '거리·속력·시간 관계', back: '시간 = 거리 ÷ 속력, 거리 = 속력 × 시간', note: '활용 문제에서 시간 식을 세울 때 사용' },
  { id: 'sc10', front: '농도 문제에서 소금의 양은?', back: '소금 양 = (농도/100) × 소금물 양', note: '소금물 양 식과 소금 양 식, 두 개를 세워요.' },
];

export const SIMULTANEOUS_CHECKS = [
  {
    id: 'sk1',
    type: 'choice',
    question: '$x + 3y = 10$ 의 해인 것은?',
    options: ['$(1, 2)$', '$(4, 2)$', '$(2, 3)$', '$(5, 1)$'],
    answer: 1,
    explain: '$4 + 3 \\times 2 = 10$ ✓',
  },
  {
    id: 'sk2',
    type: 'blank',
    intro: '$\\begin{cases} x + y = 9 \\\\ x - y = 5 \\end{cases}$',
    lines: [
      { latex: '2x = \\square', answer: '14', hint: '두 식을 더하기' },
      { latex: 'x = \\square', answer: '7', hint: '14 ÷ 2' },
      { latex: 'y = \\square', answer: '2', hint: '7 + y = 9' },
    ],
  },
  {
    id: 'sk3',
    type: 'blank',
    intro: '$\\begin{cases} 3x + y = 11 \\\\ x + y = 5 \\end{cases}$',
    lines: [
      { latex: '2x = \\square', answer: '6', hint: '첫 식에서 둘째 식을 빼기' },
      { latex: 'x = \\square', answer: '3', hint: '' },
      { latex: 'y = \\square', answer: '2', hint: '3 + y = 5' },
    ],
  },
  {
    id: 'sk4',
    type: 'blank',
    intro: '$\\begin{cases} y = x + 2 \\\\ 3x + y = 14 \\end{cases}$ (대입법)',
    lines: [
      { latex: '3x + (x + 2) = 14 \\;\\Rightarrow\\; 4x = \\square', answer: '12', hint: '14 - 2' },
      { latex: 'x = \\square', answer: '3', hint: '' },
      { latex: 'y = \\square', answer: '5', hint: 'y = x + 2' },
    ],
  },
  {
    id: 'sk5',
    type: 'choice',
    question: '$\\begin{cases} 2x + y = 8 \\\\ x - 3y = -3 \\end{cases}$ 의 해는?',
    options: ['$(3, 2)$', '$(2, 4)$', '$(4, 0)$', '$(1, 6)$'],
    answer: 0,
    explain: '②×2: $2x - 6y = -6$. ①에서 빼면 $7y = 14$, $y = 2$, $x = 3$',
  },
  {
    id: 'sk6',
    type: 'choice',
    question: '닭 $x$ 마리, 토끼 $y$ 마리의 다리 수의 합이 26개일 때 알맞은 식은?',
    options: ['$2x + 4y = 26$', '$x + y = 26$', '$4x + 2y = 26$', '$2x + 2y = 26$'],
    answer: 0,
    explain: '닭은 다리 2개, 토끼는 4개이므로 $2x + 4y = 26$',
  },
];
