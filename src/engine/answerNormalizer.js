/**
 * 학생 답안 정규화 및 수치 평가
 *
 * 지원 입력 예:
 *   "4", "+4", "04", "-3", " 2 ", "x=4", "1/2", "-3/4", "0.5", "1.25",
 *   "√5", "루트5", "sqrt(5)", "2√3", "-√2", "1+√2", "(1-√5)/2", "(3±√5)/2"(두 근 동시 입력)
 *
 * 평가 결과는 JavaScript 숫자(Number). 판정은 오차 허용 비교로 수행한다.
 */

const TOLERANCE = 1e-7;

/** 문자열 전처리 */
export function normalizeAnswerString(raw) {
  if (raw == null) return '';
  let s = String(raw);
  s = s.replace(/\s+/g, '');
  s = s.replace(/[−–—]/g, '-'); // 유니코드 마이너스/대시
  s = s.replace(/[×·]/g, '*'); // × ·
  s = s.replace(/÷/g, '/'); // ÷
  s = s.replace(/，/g, ','); // 전각 쉼표
  s = s.replace(/（/g, '(').replace(/）/g, ')');
  s = s.replace(/^[xyXY][₁₂12]?=/, ''); // "x=4", "x₁=3" 제거
  s = s.replace(/루트/g, '√');
  s = s.replace(/sqrt/gi, '√');
  s = s.replace(/^\+/, '');
  return s;
}

class Parser {
  constructor(s) {
    this.s = s;
    this.i = 0;
  }
  peek() {
    return this.s[this.i];
  }
  eof() {
    return this.i >= this.s.length;
  }
  expect(ch) {
    if (this.peek() !== ch) throw new Error('괄호가 맞지 않습니다.');
    this.i++;
  }
  parseExpr() {
    let v = this.parseTerm();
    while (!this.eof()) {
      const c = this.peek();
      if (c === '+') {
        this.i++;
        v += this.parseTerm();
      } else if (c === '-') {
        this.i++;
        v -= this.parseTerm();
      } else break;
    }
    return v;
  }
  parseTerm() {
    let v = this.parseFactor();
    while (!this.eof()) {
      const c = this.peek();
      if (c === '*') {
        this.i++;
        v *= this.parseFactor();
      } else if (c === '/') {
        this.i++;
        const d = this.parseFactor();
        if (d === 0) throw new Error('0으로 나눌 수 없습니다.');
        v /= d;
      } else if (c === '√' || c === '(') {
        // 암시적 곱: 2√3, 2(1+2)
        v *= this.parseFactor();
      } else break;
    }
    return v;
  }
  parseFactor() {
    const c = this.peek();
    if (c === '-') {
      this.i++;
      return -this.parseFactor();
    }
    if (c === '+') {
      this.i++;
      return this.parseFactor();
    }
    return this.parsePrimary();
  }
  parseNumber() {
    const m = /^(\d+\.?\d*|\.\d+)/.exec(this.s.slice(this.i));
    if (!m) return null;
    this.i += m[0].length;
    return parseFloat(m[0]);
  }
  parsePrimary() {
    const c = this.peek();
    if (c === undefined) throw new Error('값이 비어 있습니다.');
    if (c === '(') {
      this.i++;
      const v = this.parseExpr();
      this.expect(')');
      return v;
    }
    if (c === '√') {
      this.i++;
      let inner;
      if (this.peek() === '(') inner = this.parsePrimary();
      else if (this.peek() === '√') inner = this.parsePrimary();
      else {
        inner = this.parseNumber();
        if (inner === null) throw new Error('√ 뒤에 숫자가 필요합니다.');
      }
      if (inner < 0) throw new Error('음수의 제곱근');
      return Math.sqrt(inner);
    }
    const n = this.parseNumber();
    if (n !== null) return n;
    throw new Error('해석할 수 없는 문자');
  }
}

/** 문자열을 숫자로 평가. 실패 시 null. */
export function evaluateAnswer(raw) {
  const s = normalizeAnswerString(raw);
  if (s === '') return null;
  try {
    const p = new Parser(s);
    const v = p.parseExpr();
    if (!p.eof()) return null;
    if (!Number.isFinite(v)) return null;
    return v;
  } catch {
    return null;
  }
}

/** 두 수가 같은지 (오차 허용) */
export function numbersEqual(a, b) {
  if (a == null || b == null) return false;
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= TOLERANCE * scale;
}

/** "a±√b" 입력을 두 값으로 분리 */
export function splitPlusMinus(raw) {
  const s = normalizeAnswerString(raw);
  if (!s.includes('±')) return null;
  return [s.replace('±', '+'), s.replace('±', '-')];
}

/**
 * 단일 값 판정
 * @returns {{correct:boolean, parsed:number|null, reason?:string}}
 */
export function checkSingle(studentRaw, correctValue) {
  const v = evaluateAnswer(studentRaw);
  if (v === null) return { correct: false, parsed: null, reason: 'invalid' };
  return { correct: numbersEqual(v, correctValue), parsed: v };
}

/** (x, y) 쌍 판정 */
export function checkPair(xRaw, yRaw, xVal, yVal) {
  const x = checkSingle(xRaw, xVal);
  const y = checkSingle(yRaw, yVal);
  return { correct: x.correct && y.correct, x, y };
}

/**
 * 두 근 판정: 순서 무관. 중근일 때는 하나만 입력해도 허용.
 * @param {string[]} raws 길이 2
 * @param {number[]} roots 길이 2 (중근이면 같은 값)
 */
export function checkRoots(raws, roots) {
  const [r1, r2] = roots;
  const isDouble = numbersEqual(r1, r2);
  let inputs = raws.map((r) => normalizeAnswerString(r)).filter((r) => r !== '');
  if (inputs.length === 1) {
    const pm = splitPlusMinus(inputs[0]);
    if (pm) inputs = pm;
    else if (inputs[0].includes(',')) inputs = inputs[0].split(',');
  }
  const vals = inputs.map(evaluateAnswer);
  if (vals.length === 0 || vals.some((v) => v === null)) return { correct: false, reason: 'invalid' };
  if (isDouble) {
    const ok = vals.every((v) => numbersEqual(v, r1));
    return { correct: ok, parsed: vals };
  }
  if (vals.length !== 2) return { correct: false, reason: 'incomplete', parsed: vals };
  const [a, b] = vals;
  const ok =
    (numbersEqual(a, r1) && numbersEqual(b, r2)) || (numbersEqual(a, r2) && numbersEqual(b, r1));
  return { correct: ok, parsed: vals };
}

/**
 * 문제 객체와 학생 입력(배열)을 받아 판정하는 통합 함수
 * problem.answerType: 'single' | 'pair' | 'roots'
 * problem.answer: single → {value}, pair → {x, y}, roots → {roots:[v1,v2]}
 */
export function judgeAnswer(problem, inputs) {
  const type = problem.answerType;
  if (type === 'single') return checkSingle(inputs[0], problem.answer.value);
  if (type === 'pair') return checkPair(inputs[0], inputs[1], problem.answer.x, problem.answer.y);
  if (type === 'roots') return checkRoots([inputs[0] ?? '', inputs[1] ?? ''], problem.answer.roots);
  return { correct: false, reason: 'unknown-type' };
}
