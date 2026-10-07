/**
 * 중1 일차방정식 개념 학습 콘텐츠
 *
 * 블록 종류
 *  text     : 설명 문장 ($...$ 안은 수식)
 *  math     : 수식 한 줄 (크게 표시)
 *  balance  : 저울 시각화 { left, right }
 *  card     : 뒤집기 카드 { front, back, note }  (뒤집어야 다음으로 진행)
 *  steps    : 한 단계씩 펼쳐 보는 풀이 { items:[{expr, note}] }
 *  blank    : 빈칸 채우기 { intro, lines:[{ latex(□ 위치에 \square), answer, hint }] }
 *  choice   : 선택형 { question, options, answer(index), explain }
 *  tip      : 강조 상자
 */
export const LINEAR_STEPS = [
  {
    id: 'l1',
    concept: 'equation-basics',
    title: '등식 알아보기',
    blocks: [
      { type: 'text', text: '등호 $=$ 는 "왼쪽과 오른쪽의 값이 같다"는 뜻이에요. 등호를 사용하여 두 양이 같음을 나타낸 식을 **등식**이라고 합니다.' },
      { type: 'balance', left: '3 + 4', right: '7', caption: '저울이 수평이면 양쪽 값이 같아요.' },
      { type: 'text', text: '등호 왼쪽을 **좌변**, 오른쪽을 **우변**, 둘을 합쳐 **양변**이라고 부릅니다.' },
      {
        type: 'choice',
        question: '다음 중 등식인 것은?',
        options: ['$2x + 1$', '$5 - 3 = 2$', '$x > 4$', '$3 \\times 2$'],
        answer: 1,
        explain: '등호(=)가 있는 식만 등식이에요. $5 - 3 = 2$ 가 등식입니다.',
      },
    ],
  },
  {
    id: 'l2',
    concept: 'equation-basics',
    title: '방정식이란?',
    blocks: [
      { type: 'math', latex: '\\square + 3 = 7' },
      { type: 'text', text: '□에 어떤 수가 들어가면 식이 참이 될까요? 카드를 눌러 확인해 보세요.' },
      { type: 'card', front: '□ + 3 = 7 에서 □는?', back: '4', note: '4 + 3 = 7 이므로 □ = 4 일 때만 참이 됩니다.' },
      { type: 'text', text: '□ 대신 문자 $x$ 를 사용하면 $x + 3 = 7$ 이라고 쓸 수 있어요. 이처럼 **$x$ 의 값에 따라 참이 되기도 하고 거짓이 되기도 하는 등식**을 **방정식**이라고 하고, 문자 $x$ 를 **미지수**라고 합니다.' },
      { type: 'math', latex: 'x + 3 = 7' },
      { type: 'tip', text: '$x$ 에 어떤 값을 넣어도 항상 참인 등식(예: $2x + x = 3x$)은 방정식이 아니라 항등식이라고 해요.' },
    ],
  },
  {
    id: 'l3',
    concept: 'equation-basics',
    title: '방정식의 해',
    blocks: [
      { type: 'text', text: '방정식을 **참이 되게 하는 미지수의 값**을 그 방정식의 **해** 또는 **근**이라고 하고, 해를 구하는 것을 "방정식을 **푼다**"라고 합니다.' },
      { type: 'math', latex: '2x - 1 = 5 \\quad\\Rightarrow\\quad x = 3 \\text{ 일 때 } 2\\cdot 3 - 1 = 5 \\;(\\text{참})' },
      {
        type: 'choice',
        question: '방정식 $3x = 12$ 의 해는?',
        options: ['$x = 3$', '$x = 4$', '$x = 9$', '$x = 36$'],
        answer: 1,
        explain: '$3 \\times 4 = 12$ 이므로 $x = 4$ 가 해입니다. 해를 대입해서 참인지 확인하는 습관을 들이세요!',
      },
      {
        type: 'blank',
        intro: 'x = 2 가 다음 방정식의 해인지 확인해 봅시다: $5x - 3 = 7$',
        lines: [
          { latex: '5 \\times 2 - 3 = \\square', answer: '7', hint: '5 × 2 를 먼저 계산하고 3을 빼 보세요.' },
        ],
        after: '좌변 = 7 = 우변 이므로 $x = 2$ 는 해입니다.',
      },
    ],
  },
  {
    id: 'l4',
    concept: 'property',
    title: '등식의 성질',
    blocks: [
      { type: 'text', text: '수평인 저울의 양쪽에 **같은 무게**를 더하거나 빼도 저울은 수평을 유지해요. 등식도 똑같습니다.' },
      { type: 'balance', left: 'x + 2', right: '5', caption: '양변에서 2를 빼면?' },
      { type: 'balance', left: 'x', right: '3', caption: '여전히 수평! x = 3' },
      {
        type: 'steps',
        items: [
          { expr: 'a = b \\;\\Rightarrow\\; a + c = b + c', note: '양변에 같은 수를 더해도 등식은 성립' },
          { expr: 'a = b \\;\\Rightarrow\\; a - c = b - c', note: '양변에서 같은 수를 빼도 성립' },
          { expr: 'a = b \\;\\Rightarrow\\; ac = bc', note: '양변에 같은 수를 곱해도 성립' },
          { expr: 'a = b \\;\\Rightarrow\\; \\dfrac{a}{c} = \\dfrac{b}{c} \\;(c \\neq 0)', note: '양변을 0이 아닌 같은 수로 나누어도 성립' },
        ],
      },
      {
        type: 'choice',
        question: '$x - 4 = 9$ 에서 $x$ 를 구하려면 양변에 어떻게 해야 할까요?',
        options: ['양변에 4를 더한다', '양변에서 4를 뺀다', '양변에 4를 곱한다', '양변을 4로 나눈다'],
        answer: 0,
        explain: '좌변의 $-4$ 를 없애려면 양변에 4를 더합니다. $x = 13$',
      },
    ],
  },
  {
    id: 'l5',
    concept: 'property',
    title: '이항',
    blocks: [
      { type: 'text', text: '"반대편으로 넘어가면 부호가 바뀐다"를 외우기 전에, **왜** 그런지 등식의 성질로 살펴봅시다.' },
      {
        type: 'steps',
        items: [
          { expr: 'x + 5 = 12', note: '처음 식' },
          { expr: 'x + 5 - 5 = 12 - 5', note: '양변에서 5를 뺀다 (등식의 성질)' },
          { expr: 'x = 12 - 5', note: '좌변의 +5 가 사라지고, 우변에 -5 가 나타났어요' },
          { expr: 'x = 7', note: '계산' },
        ],
      },
      { type: 'text', text: '이 과정을 간단히 "$+5$ 를 우변으로 옮기면서 $-5$ 로 바꾼다"라고 표현한 것이 **이항**입니다. 즉, 이항은 등식의 성질을 줄여서 쓴 것이에요.' },
      { type: 'math', latex: 'x + 5 = 12 \\quad\\Rightarrow\\quad x = 12 - 5' },
      {
        type: 'blank',
        intro: '이항을 이용하여 풀어 보세요: $x - 6 = 10$',
        lines: [
          { latex: 'x = 10 + \\square', answer: '6', hint: '좌변의 -6 을 우변으로 옮기면 부호가 어떻게 될까요?' },
          { latex: 'x = \\square', answer: '16', hint: '10 + 6 을 계산하세요.' },
        ],
      },
    ],
  },
  {
    id: 'l6',
    concept: 'solve',
    title: '일차방정식 풀이',
    blocks: [
      { type: 'text', text: '모든 항을 좌변으로 이항하여 정리했을 때 $(x \\text{에 대한 일차식}) = 0$ 꼴이 되는 방정식을 **일차방정식**이라고 합니다. 풀이 순서는 다음과 같아요.' },
      { type: 'tip', text: '① $x$ 항은 좌변으로, 상수항은 우변으로 이항 → ② 양변을 정리하여 $ax = b$ 꼴로 → ③ 양변을 $a$ 로 나눈다' },
      {
        type: 'steps',
        items: [
          { expr: '3x + 2 = 14', note: '처음 식' },
          { expr: '3x = 14 - 2', note: '① 상수항 +2 를 우변으로 이항' },
          { expr: '3x = 12', note: '② 정리' },
          { expr: 'x = 4', note: '③ 양변을 3으로 나누기' },
        ],
      },
      {
        type: 'blank',
        intro: '$3x + 5 = 17$ 을 풀어 보세요.',
        lines: [
          { latex: '3x = \\square', answer: '12', hint: '17에서 5를 어떻게 하면 좋을까요?' },
          { latex: 'x = \\square', answer: '4', hint: '12를 3으로 나누면?' },
        ],
      },
      {
        type: 'blank',
        intro: '양변에 $x$ 가 있는 경우: $5x - 3 = 2x + 9$',
        lines: [
          { latex: '5x - 2x = 9 + \\square', answer: '3', hint: '-3 을 우변으로 이항하면 +3' },
          { latex: '3x = \\square', answer: '12', hint: '9 + 3 = ?' },
          { latex: 'x = \\square', answer: '4', hint: '12 ÷ 3 = ?' },
        ],
      },
    ],
  },
  {
    id: 'l7',
    concept: 'bracket',
    title: '괄호가 있는 방정식',
    blocks: [
      { type: 'text', text: '괄호가 있으면 먼저 **분배법칙**으로 괄호를 풀고, 그다음 일반적인 순서로 풉니다.' },
      { type: 'math', latex: 'a(b + c) = ab + ac' },
      {
        type: 'steps',
        items: [
          { expr: '2(x + 3) = 14', note: '처음 식' },
          { expr: '2x + 6 = 14', note: '분배법칙: 2를 x 와 3에 각각 곱하기' },
          { expr: '2x = 14 - 6 = 8', note: '상수항 이항 후 정리' },
          { expr: 'x = 4', note: '양변을 2로 나누기' },
        ],
      },
      {
        type: 'blank',
        intro: '$3(x - 2) = 9$ 를 풀어 보세요.',
        lines: [
          { latex: '3x - \\square = 9', answer: '6', hint: '3 × 2 = ?' },
          { latex: '3x = \\square', answer: '15', hint: '9 + 6 = ?' },
          { latex: 'x = \\square', answer: '5', hint: '15 ÷ 3 = ?' },
        ],
      },
      { type: 'tip', text: '괄호 앞이 음수일 때 주의! $-2(x - 3) = -2x + 6$ 입니다.' },
    ],
  },
  {
    id: 'l8',
    concept: 'fraction',
    title: '분수·소수가 포함된 방정식',
    blocks: [
      { type: 'text', text: '계수가 분수나 소수이면 **양변에 적당한 수를 곱해** 계수를 정수로 바꾸면 편해요. 분수는 분모의 최소공배수를, 소수는 10, 100, … 을 곱합니다.' },
      {
        type: 'steps',
        items: [
          { expr: '\\dfrac{x}{2} + 1 = 4', note: '처음 식' },
          { expr: 'x + 2 = 8', note: '양변에 2를 곱하기 (모든 항에!)' },
          { expr: 'x = 6', note: '상수항 이항' },
        ],
      },
      {
        type: 'steps',
        items: [
          { expr: '0.3x + 0.5 = 1.4', note: '처음 식' },
          { expr: '3x + 5 = 14', note: '양변에 10을 곱하기' },
          { expr: '3x = 9', note: '상수항 이항' },
          { expr: 'x = 3', note: '양변을 3으로 나누기' },
        ],
      },
      {
        type: 'blank',
        intro: '$\\dfrac{x}{3} - 2 = 1$ 을 풀어 보세요.',
        lines: [
          { latex: 'x - 6 = \\square', answer: '3', hint: '양변에 3을 곱하면 우변 1은 얼마가 될까요?' },
          { latex: 'x = \\square', answer: '9', hint: '3 + 6 = ?' },
        ],
      },
      { type: 'tip', text: '양변에 수를 곱할 때는 **모든 항**에 곱해야 해요. 상수항을 빼먹는 실수가 가장 많아요!' },
    ],
  },
  {
    id: 'l9',
    concept: 'application',
    title: '일차방정식 활용',
    blocks: [
      { type: 'text', text: '생활 속 문제는 다음 순서로 해결합니다.' },
      { type: 'tip', text: '① 구하려는 것을 $x$ 로 놓기 → ② 문제의 조건을 방정식으로 세우기 → ③ 방정식 풀기 → ④ 답이 문제에 맞는지 확인하기' },
      { type: 'text', text: '**예)** 연속하는 세 자연수의 합이 36일 때 세 수를 구해 봅시다.' },
      {
        type: 'steps',
        items: [
          { expr: 'x,\\; x + 1,\\; x + 2', note: '① 가장 작은 수를 x 로 놓기' },
          { expr: 'x + (x + 1) + (x + 2) = 36', note: '② 합이 36' },
          { expr: '3x + 3 = 36 \\;\\Rightarrow\\; 3x = 33', note: '③ 정리' },
          { expr: 'x = 11', note: '세 수는 11, 12, 13' },
          { expr: '11 + 12 + 13 = 36 \\;\\checkmark', note: '④ 확인' },
        ],
      },
      {
        type: 'choice',
        question: '한 개 800원인 빵을 $x$ 개 사고 1,000원짜리 음료 1개를 샀더니 4,200원이었다. 알맞은 방정식은?',
        options: ['$800x + 1000 = 4200$', '$800 + 1000x = 4200$', '$1800x = 4200$', '$800x - 1000 = 4200$'],
        answer: 0,
        explain: '빵 값 $800x$ 원에 음료 1,000원을 더하면 4,200원. $x = 4$ 개!',
      },
      { type: 'text', text: '이제 **문제 풀기**에서 다양한 활용 문제에 도전해 보세요. 나이, 거리, 도형, 개수 문제가 기다리고 있어요! 🌰' },
    ],
  },
];

/** 개념 카드 (Flip Card) */
export const LINEAR_CARDS = [
  { id: 'lc1', front: '등식이란?', back: '등호(=)를 사용하여 두 양이 같음을 나타낸 식', note: '예: 3 + 4 = 7, x + 2 = 5' },
  { id: 'lc2', front: '방정식이란?', back: 'x 의 값에 따라 참 또는 거짓이 되는 등식', note: '예: x + 3 = 7 은 x = 4 일 때만 참' },
  { id: 'lc3', front: '방정식의 해(근)란?', back: '방정식을 참이 되게 하는 미지수의 값', note: '해를 대입하면 좌변 = 우변' },
  { id: 'lc4', front: '$3x = 12$ 일 때 $x$ 의 값은?', back: '$x = 4$', note: '양변을 3으로 나누면 됩니다.' },
  { id: 'lc5', front: '$x + 5 = 12$ 를 이항하면?', back: '$x = 12 - 5$', note: '양변에서 5를 뺀 것을 줄여 쓴 표현이에요.' },
  { id: 'lc6', front: '등식의 성질 4가지', back: '양변에 같은 수를 더하기 / 빼기 / 곱하기 / 0이 아닌 수로 나누기', note: '어느 경우에도 등식은 성립합니다.' },
  { id: 'lc7', front: '$2(x + 3)$ 을 전개하면?', back: '$2x + 6$', note: '분배법칙: 2를 괄호 안 두 항에 각각 곱합니다.' },
  { id: 'lc8', front: '$0.2x + 0.3 = 1.1$ 양변에 10을 곱하면?', back: '$2x + 3 = 11$', note: '모든 항에 10을 곱해야 해요. 답: x = 4' },
  { id: 'lc9', front: '$\\dfrac{x}{4} = 3$ 의 해는?', back: '$x = 12$', note: '양변에 4를 곱합니다.' },
  { id: 'lc10', front: '$5x - 3 = 2x + 9$ 에서 첫 단계는?', back: 'x 항은 좌변, 상수항은 우변으로 이항: $5x - 2x = 9 + 3$', note: '정리하면 3x = 12, x = 4' },
];

/** 개념 확인 활동 */
export const LINEAR_CHECKS = [
  {
    id: 'lk1',
    type: 'choice',
    question: '다음 중 방정식 $2x - 1 = 7$ 의 해는?',
    options: ['$x = 3$', '$x = 4$', '$x = 6$', '$x = 8$'],
    answer: 1,
    explain: '$2 \\times 4 - 1 = 7$ 이므로 $x = 4$',
  },
  {
    id: 'lk2',
    type: 'blank',
    intro: '$4x - 7 = 9$',
    lines: [
      { latex: '4x = \\square', answer: '16', hint: '-7 을 우변으로 이항하면 9 + 7' },
      { latex: 'x = \\square', answer: '4', hint: '16 ÷ 4' },
    ],
  },
  {
    id: 'lk3',
    type: 'choice',
    question: '$x - 3 = 8$ 을 풀 때 사용한 등식의 성질은?',
    options: ['양변에 3을 더한다', '양변에서 3을 뺀다', '양변에 3을 곱한다', '양변을 3으로 나눈다'],
    answer: 0,
    explain: '좌변의 -3 을 없애기 위해 양변에 3을 더합니다. $x = 11$',
  },
  {
    id: 'lk4',
    type: 'blank',
    intro: '$2(x + 4) = 18$',
    lines: [
      { latex: '2x + \\square = 18', answer: '8', hint: '2 × 4 = ?' },
      { latex: '2x = \\square', answer: '10', hint: '18 - 8' },
      { latex: 'x = \\square', answer: '5', hint: '10 ÷ 2' },
    ],
  },
  {
    id: 'lk5',
    type: 'blank',
    intro: '$\\dfrac{x}{5} + 2 = 6$',
    lines: [
      { latex: '\\dfrac{x}{5} = \\square', answer: '4', hint: '6 - 2' },
      { latex: 'x = \\square', answer: '20', hint: '양변에 5를 곱하기' },
    ],
  },
  {
    id: 'lk6',
    type: 'choice',
    question: '$6x + 2 = 4x - 6$ 의 해는?',
    options: ['$x = -4$', '$x = -2$', '$x = 2$', '$x = 4$'],
    answer: 0,
    explain: '$6x - 4x = -6 - 2 \\Rightarrow 2x = -8 \\Rightarrow x = -4$',
  },
];
