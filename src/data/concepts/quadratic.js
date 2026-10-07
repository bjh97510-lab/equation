/** 중3 이차방정식 개념 학습 콘텐츠 */
export const QUADRATIC_STEPS = [
  {
    id: 'q1',
    concept: 'meaning',
    title: '이차방정식의 뜻',
    blocks: [
      { type: 'text', text: '모든 항을 좌변으로 이항하여 정리했을 때 $(x \\text{에 대한 이차식}) = 0$ 꼴이 되는 방정식을 **이차방정식**이라고 합니다.' },
      { type: 'math', latex: 'ax^2 + bx + c = 0 \\quad (a \\neq 0)' },
      { type: 'text', text: '$x^2$ 항이 반드시 있어야 해요. $a = 0$ 이면 일차방정식이 되어 버리니까요.' },
      {
        type: 'choice',
        question: '다음 중 이차방정식인 것은?',
        options: ['$x^2 + 2x = x^2 - 1$', '$3x - 5 = 0$', '$x^2 = 2x + 3$', '$x^3 - x = 0$'],
        answer: 2,
        explain: '$x^2 - 2x - 3 = 0$ 으로 정리되므로 이차방정식! 첫 번째는 $x^2$ 이 사라져 일차방정식이 돼요.',
      },
      { type: 'card', front: '$x(x - 3) = 4$ 는 이차방정식일까?', back: '예! $x^2 - 3x - 4 = 0$', note: '전개하여 정리하면 x² 항이 남아요.' },
    ],
  },
  {
    id: 'q2',
    concept: 'meaning',
    title: '이차방정식의 해와 근',
    blocks: [
      { type: 'text', text: '이차방정식을 참이 되게 하는 $x$ 의 값을 **해** 또는 **근**이라고 합니다. 이차방정식의 해는 보통 **2개**이고, 1개(중근)인 경우도 있어요.' },
      {
        type: 'blank',
        intro: '$x = 2$ 와 $x = -1$ 이 $x^2 - x - 2 = 0$ 의 해인지 확인해 봅시다.',
        lines: [
          { latex: 'x = 2: \\; 4 - 2 - 2 = \\square', answer: '0', hint: '2² - 2 - 2' },
          { latex: 'x = -1: \\; 1 + 1 - 2 = \\square', answer: '0', hint: '(-1)² - (-1) - 2' },
        ],
        after: '두 값을 대입하면 모두 0이 되므로 둘 다 해입니다. 해가 2개!',
      },
      { type: 'tip', text: '이차방정식의 답을 쓸 때는 "$x = 2$ 또는 $x = -1$" 처럼 두 근을 모두 써야 해요.' },
    ],
  },
  {
    id: 'q3',
    concept: 'factoring',
    title: '인수분해를 이용한 풀이',
    blocks: [
      { type: 'text', text: '두 수의 곱이 0이면 적어도 하나는 0이에요. 이 성질을 이용합니다.' },
      { type: 'math', latex: 'AB = 0 \\;\\Rightarrow\\; A = 0 \\;\\text{또는}\\; B = 0' },
      {
        type: 'steps',
        items: [
          { expr: 'x^2 - 5x + 6 = 0', note: '곱해서 6, 더해서 -5 인 두 수: -2, -3' },
          { expr: '(x - 2)(x - 3) = 0', note: '인수분해' },
          { expr: 'x - 2 = 0 \\;\\text{또는}\\; x - 3 = 0', note: 'AB = 0 성질' },
          { expr: 'x = 2 \\;\\text{또는}\\; x = 3', note: '두 근' },
        ],
      },
      {
        type: 'blank',
        intro: '$x^2 + 3x - 10 = 0$ 을 풀어 보세요. (곱 -10, 합 3 인 두 수는 5, -2)',
        lines: [
          { latex: '(x + 5)(x - \\square) = 0', answer: '2', hint: '5 × (-2) = -10, 5 + (-2) = 3' },
          { latex: 'x = -5 \\;\\text{또는}\\; x = \\square', answer: '2', hint: 'x - 2 = 0' },
        ],
      },
      { type: 'tip', text: '공통인수가 있으면 먼저 묶어요. $x^2 - 4x = 0 \\Rightarrow x(x - 4) = 0 \\Rightarrow x = 0$ 또는 $x = 4$. $x = 0$ 도 근이에요!' },
    ],
  },
  {
    id: 'q4',
    concept: 'sqrt',
    title: '제곱근을 이용한 풀이',
    blocks: [
      { type: 'text', text: '$x^2 = q$ ($q > 0$) 꼴은 **제곱근**을 이용해 바로 풀 수 있어요.' },
      { type: 'math', latex: 'x^2 = q \\;\\Rightarrow\\; x = \\pm\\sqrt{q}' },
      {
        type: 'steps',
        items: [
          { expr: 'x^2 = 9 \\;\\Rightarrow\\; x = \\pm 3', note: '완전제곱수면 정수 근' },
          { expr: 'x^2 = 5 \\;\\Rightarrow\\; x = \\pm\\sqrt{5}', note: '완전제곱수가 아니면 근호 그대로' },
          { expr: '(x - 1)^2 = 4 \\;\\Rightarrow\\; x - 1 = \\pm 2 \\;\\Rightarrow\\; x = 3 \\;\\text{또는}\\; x = -1', note: '괄호 전체를 하나로 보기' },
        ],
      },
      {
        type: 'blank',
        intro: '$(x + 2)^2 = 25$ 를 풀어 보세요.',
        lines: [
          { latex: 'x + 2 = \\pm \\square', answer: '5', hint: '제곱해서 25가 되는 양수' },
          { latex: 'x = 3 \\;\\text{또는}\\; x = \\square', answer: '-7', hint: 'x + 2 = -5 이면 x 는?' },
        ],
      },
      { type: 'tip', text: '$\\pm$ 를 빼먹지 마세요. 양의 제곱근과 음의 제곱근, 근이 두 개예요.' },
    ],
  },
  {
    id: 'q5',
    concept: 'complete-square',
    title: '완전제곱식',
    blocks: [
      { type: 'text', text: '$(x + p)^2$ 처럼 어떤 식의 제곱으로 나타내어지는 식을 **완전제곱식**이라고 합니다.' },
      { type: 'math', latex: '(x + p)^2 = x^2 + 2px + p^2' },
      { type: 'text', text: '$x^2 + 6x + \\square$ 가 완전제곱식이 되려면? $x$ 의 계수 6의 절반은 3, 그 제곱 9를 넣으면 $(x + 3)^2$ 이 돼요.' },
      { type: 'tip', text: '$x^2 + bx$ 에 $\\left(\\dfrac{b}{2}\\right)^2$ 을 더하면 완전제곱식이 됩니다.' },
      {
        type: 'blank',
        intro: '완전제곱식 만들기',
        lines: [
          { latex: 'x^2 + 8x + \\square = (x + 4)^2', answer: '16', hint: '(8 ÷ 2)² = ?' },
          { latex: 'x^2 - 10x + \\square = (x - 5)^2', answer: '25', hint: '(-10 ÷ 2)² = ?' },
        ],
      },
      { type: 'card', front: '$x^2 - 6x + 9 = 0$ 의 근은?', back: '$x = 3$ (중근)', note: '(x - 3)² = 0 이므로 근이 하나뿐이에요.' },
    ],
  },
  {
    id: 'q6',
    concept: 'complete-square',
    title: '완전제곱식을 이용한 풀이',
    blocks: [
      { type: 'text', text: '인수분해가 어려울 때는 좌변을 완전제곱식으로 바꾼 뒤 제곱근을 이용합니다.' },
      {
        type: 'steps',
        items: [
          { expr: 'x^2 + 4x - 1 = 0', note: '곱 -1, 합 4 인 정수가 없어 인수분해 불가' },
          { expr: 'x^2 + 4x = 1', note: '상수항을 우변으로' },
          { expr: 'x^2 + 4x + 4 = 1 + 4', note: '양변에 (4/2)² = 4 더하기' },
          { expr: '(x + 2)^2 = 5', note: '완전제곱식' },
          { expr: 'x + 2 = \\pm\\sqrt{5} \\;\\Rightarrow\\; x = -2 \\pm \\sqrt{5}', note: '제곱근 이용' },
        ],
      },
      {
        type: 'blank',
        intro: '$x^2 - 2x - 3 = 0$ 을 완전제곱식으로 풀어 보세요.',
        lines: [
          { latex: 'x^2 - 2x + 1 = 3 + \\square', answer: '1', hint: '(-2 ÷ 2)² 을 양변에 더하기' },
          { latex: '(x - 1)^2 = \\square', answer: '4', hint: '3 + 1' },
          { latex: 'x = 3 \\;\\text{또는}\\; x = \\square', answer: '-1', hint: 'x - 1 = ±2' },
        ],
      },
    ],
  },
  {
    id: 'q7',
    concept: 'formula',
    title: '근의 공식',
    blocks: [
      { type: 'text', text: '$ax^2 + bx + c = 0$ 을 완전제곱식 방법으로 일반적으로 풀면 **근의 공식**이 나옵니다. 어떤 이차방정식이든 계수만 대입하면 풀 수 있어요.' },
      { type: 'math', latex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad (b^2 - 4ac \\geq 0)' },
      {
        type: 'steps',
        items: [
          { expr: 'x^2 - 3x + 1 = 0', note: 'a = 1, b = -3, c = 1' },
          { expr: 'x = \\dfrac{-(-3) \\pm \\sqrt{(-3)^2 - 4 \\cdot 1 \\cdot 1}}{2 \\cdot 1}', note: '대입 (부호 주의!)' },
          { expr: 'x = \\dfrac{3 \\pm \\sqrt{9 - 4}}{2} = \\dfrac{3 \\pm \\sqrt{5}}{2}', note: '계산' },
        ],
      },
      {
        type: 'blank',
        intro: '$2x^2 + 5x + 1 = 0$ 에 근의 공식을 적용해 봅시다.',
        lines: [
          { latex: 'b^2 - 4ac = 25 - \\square', answer: '8', hint: '4 × 2 × 1 = ?' },
          { latex: 'x = \\dfrac{-5 \\pm \\sqrt{\\square}}{4}', answer: '17', hint: '25 - 8' },
        ],
      },
      { type: 'tip', text: '$b^2 - 4ac$ 가 0 이면 중근, 음수이면 (중학교 범위에서) 근이 없어요.' },
    ],
  },
  {
    id: 'q8',
    concept: 'formula',
    title: '풀이 방법 선택',
    blocks: [
      { type: 'text', text: '세 가지 방법 중 어떤 것을 쓸지 식의 모양을 보고 판단해 보세요.' },
      { type: 'tip', text: '$x^2 = q$, $(x + p)^2 = q$ 꼴 → **제곱근**\n인수분해가 쉽게 되는 꼴 → **인수분해**\n그 외 → **근의 공식** (또는 완전제곱식)' },
      {
        type: 'choice',
        question: '$(x - 3)^2 = 7$ 에 가장 알맞은 방법은?',
        options: ['제곱근 이용', '인수분해', '근의 공식', '전개 후 대입'],
        answer: 0,
        explain: '괄호의 제곱 = 수 꼴이므로 바로 $x - 3 = \\pm\\sqrt{7}$, $x = 3 \\pm \\sqrt{7}$',
      },
      {
        type: 'choice',
        question: '$x^2 + 7x + 12 = 0$ 에 가장 알맞은 방법은?',
        options: ['인수분해', '제곱근 이용', '근의 공식', '그래프'],
        answer: 0,
        explain: '곱 12, 합 7 인 두 수 3, 4 → $(x + 3)(x + 4) = 0$, $x = -3$ 또는 $x = -4$',
      },
      {
        type: 'choice',
        question: '$x^2 + 2x - 5 = 0$ 에 가장 알맞은 방법은?',
        options: ['근의 공식 (또는 완전제곱식)', '인수분해', '제곱근 바로 이용', '양변을 x 로 나누기'],
        answer: 0,
        explain: '곱 -5, 합 2 인 정수가 없어요. 근의 공식: $x = -1 \\pm \\sqrt{6}$',
      },
    ],
  },
  {
    id: 'q9',
    concept: 'application',
    title: '이차방정식 활용',
    blocks: [
      { type: 'text', text: '활용 문제도 **미지수 정하기 → 식 세우기 → 풀기 → 확인**의 순서는 같아요. 단, 이차방정식은 근이 2개 나오므로 **문제 조건에 맞는 근만** 답으로 고릅니다.' },
      { type: 'text', text: '**예)** 연속하는 두 자연수의 곱이 56일 때, 두 수를 구해 봅시다.' },
      {
        type: 'steps',
        items: [
          { expr: 'x(x + 1) = 56', note: '작은 수를 x 로' },
          { expr: 'x^2 + x - 56 = 0', note: '정리' },
          { expr: '(x + 8)(x - 7) = 0', note: '인수분해' },
          { expr: 'x = -8 \\;\\text{또는}\\; x = 7', note: '두 근' },
          { expr: 'x = 7 \\;\\Rightarrow\\; 7, 8', note: 'x 는 자연수이므로 -8 은 제외!' },
        ],
      },
      {
        type: 'choice',
        question: '세로가 가로보다 3cm 짧은 직사각형의 넓이가 40cm²일 때, 가로를 $x$ 로 놓은 식은?',
        options: ['$x(x - 3) = 40$', '$x(x + 3) = 40$', '$2x + 2(x - 3) = 40$', '$x^2 - 3 = 40$'],
        answer: 0,
        explain: '세로 = $x - 3$, 넓이 = 가로 × 세로 = $x(x - 3) = 40$. 풀면 $x = 8$ (음수 근 제외)',
      },
      { type: 'text', text: '이제 **문제 풀기**에서 다양한 이차방정식에 도전해 보세요! 🌳' },
    ],
  },
];

export const QUADRATIC_CARDS = [
  { id: 'qc1', front: '이차방정식의 일반형은?', back: '$ax^2 + bx + c = 0 \\;(a \\neq 0)$', note: 'x² 항이 반드시 있어야 해요.' },
  { id: 'qc2', front: '$AB = 0$ 이면?', back: '$A = 0$ 또는 $B = 0$', note: '인수분해를 이용한 풀이의 핵심 성질' },
  { id: 'qc3', front: '$x^2 - 5x + 6 = 0$ 의 근은?', back: '$x = 2$ 또는 $x = 3$', note: '(x - 2)(x - 3) = 0' },
  { id: 'qc4', front: '$x^2 = 7$ 의 근은?', back: '$x = \\pm\\sqrt{7}$', note: '제곱근 이용. ± 잊지 않기!' },
  { id: 'qc5', front: '중근이란?', back: '이차방정식의 두 근이 서로 같을 때 그 근', note: '예: (x - 3)² = 0 → x = 3' },
  { id: 'qc6', front: '$x^2 + 10x + \\square$ 가 완전제곱식이 되는 □는?', back: '$25$', note: '(10 ÷ 2)² = 25 → (x + 5)²' },
  { id: 'qc7', front: '근의 공식', back: '$x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', note: 'ax² + bx + c = 0 의 근' },
  { id: 'qc8', front: '$x^2 - 2x - 1 = 0$ 의 근은?', back: '$x = 1 \\pm \\sqrt{2}$', note: '근의 공식: (2 ± √8)/2 = 1 ± √2' },
  { id: 'qc9', front: '$(x + 1)^2 = 9$ 의 근은?', back: '$x = 2$ 또는 $x = -4$', note: 'x + 1 = ±3' },
  { id: 'qc10', front: '활용 문제에서 근이 2개 나오면?', back: '문제 조건(길이는 양수, 자연수 등)에 맞는 근만 답으로 고른다', note: '예: 길이가 -5 는 불가능' },
];

export const QUADRATIC_CHECKS = [
  {
    id: 'qk1',
    type: 'choice',
    question: '다음 중 이차방정식이 **아닌** 것은?',
    options: ['$x^2 = 4$', '$x(x + 1) = x^2 + 3$', '$2x^2 - x = 0$', '$(x - 1)^2 = 0$'],
    answer: 1,
    explain: '$x^2 + x = x^2 + 3 \\Rightarrow x = 3$. $x^2$ 이 사라져 일차방정식이 됩니다.',
  },
  {
    id: 'qk2',
    type: 'blank',
    intro: '$x^2 = 49$',
    lines: [{ latex: 'x = \\pm\\square', answer: '7', hint: '제곱해서 49' }],
  },
  {
    id: 'qk3',
    type: 'blank',
    intro: '$x^2 - 7x + 12 = 0$ (곱 12, 합 -7)',
    lines: [
      { latex: '(x - 3)(x - \\square) = 0', answer: '4', hint: '(-3) × (-4) = 12' },
      { latex: 'x = 3 \\;\\text{또는}\\; x = \\square', answer: '4', hint: '' },
    ],
  },
  {
    id: 'qk4',
    type: 'blank',
    intro: '$(x - 2)^2 = 16$',
    lines: [
      { latex: 'x - 2 = \\pm\\square', answer: '4', hint: '' },
      { latex: 'x = 6 \\;\\text{또는}\\; x = \\square', answer: '-2', hint: 'x - 2 = -4' },
    ],
  },
  {
    id: 'qk5',
    type: 'blank',
    intro: '$x^2 + 6x + 2 = 0$ 을 완전제곱식으로',
    lines: [
      { latex: '(x + 3)^2 = \\square', answer: '7', hint: '양변에 9를 더하면 우변은 -2 + 9' },
    ],
    after: '따라서 $x = -3 \\pm \\sqrt{7}$',
  },
  {
    id: 'qk6',
    type: 'choice',
    question: '$x^2 - 4x + 1 = 0$ 의 근은?',
    options: ['$x = 2 \\pm \\sqrt{3}$', '$x = -2 \\pm \\sqrt{3}$', '$x = 2 \\pm \\sqrt{5}$', '$x = 1$ 또는 $x = 3$'],
    answer: 0,
    explain: '근의 공식: $x = \\dfrac{4 \\pm \\sqrt{16 - 4}}{2} = \\dfrac{4 \\pm 2\\sqrt{3}}{2} = 2 \\pm \\sqrt{3}$',
  },
];
