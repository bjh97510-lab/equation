/**
 * 정확한 유리수 연산을 위한 간단한 분수 클래스.
 * 문제 생성·검증에서 부동소수점 오차를 피하기 위해 사용한다.
 */
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

export class Fraction {
  constructor(n, d = 1) {
    if (d === 0) throw new Error('분모는 0이 될 수 없습니다.');
    if (!Number.isInteger(n) || !Number.isInteger(d)) {
      // 소수 → 분수 변환 (최대 6자리)
      const scale = 10 ** 6;
      n = Math.round(n * scale);
      d = Math.round(d * scale);
    }
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
    if (Object.is(this.n, -0)) this.n = 0;
  }
  static from(v) {
    if (v instanceof Fraction) return v;
    if (typeof v === 'number') return new Fraction(v, 1);
    throw new Error('Fraction.from: 지원하지 않는 값');
  }
  add(o) {
    o = Fraction.from(o);
    return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d);
  }
  sub(o) {
    o = Fraction.from(o);
    return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d);
  }
  mul(o) {
    o = Fraction.from(o);
    return new Fraction(this.n * o.n, this.d * o.d);
  }
  div(o) {
    o = Fraction.from(o);
    return new Fraction(this.n * o.d, this.d * o.n);
  }
  neg() {
    return new Fraction(-this.n, this.d);
  }
  abs() {
    return new Fraction(Math.abs(this.n), this.d);
  }
  eq(o) {
    o = Fraction.from(o);
    return this.n === o.n && this.d === o.d;
  }
  isZero() {
    return this.n === 0;
  }
  isInteger() {
    return this.d === 1;
  }
  isNegative() {
    return this.n < 0;
  }
  valueOf() {
    return this.n / this.d;
  }
  toNumber() {
    return this.n / this.d;
  }
  /** 학생에게 보여줄 문자열: 정수 또는 a/b */
  toString() {
    return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`;
  }
  /** LaTeX */
  toLatex() {
    if (this.d === 1) return String(this.n);
    const sign = this.n < 0 ? '-' : '';
    return `${sign}\\frac{${Math.abs(this.n)}}{${this.d}}`;
  }
}

export const F = (n, d = 1) => new Fraction(n, d);
