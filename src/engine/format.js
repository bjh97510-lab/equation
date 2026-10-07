/**
 * 수식(LaTeX) 문자열 생성 도우미
 */
import { Fraction } from './fraction.js';

/** 숫자/분수를 LaTeX 로 */
export function numLatex(v) {
  if (v instanceof Fraction) return v.toLatex();
  if (Number.isInteger(v)) return String(v);
  return String(parseFloat(Number(v).toFixed(6)));
}

/** 소수 표기 (예: 0.5, 1.2) */
export function decLatex(v) {
  return String(parseFloat(Number(v).toFixed(6)));
}

/** 음수면 괄호로 감싼 LaTeX (예: 대입 과정 표시용) */
export function wrapNeg(v) {
  const s = numLatex(v);
  return s.startsWith('-') ? `(${s})` : s;
}

/**
 * 계수가 붙은 항을 만든다. coef=1 → x, coef=-1 → -x, coef=0 → ''
 * @param {number|Fraction} coef
 * @param {string} v 변수 이름 (예: 'x', 'x^2')
 */
export function term(coef, v) {
  const c = coef instanceof Fraction ? coef : new Fraction(coef);
  if (c.isZero()) return '';
  if (c.eq(1)) return v;
  if (c.eq(-1)) return `-${v}`;
  return `${c.toLatex()}${v}`;
}

/** 소수 계수 항 (예: 0.5x) */
export function decTerm(coef, v) {
  if (coef === 0) return '';
  if (coef === 1) return v;
  if (coef === -1) return `-${v}`;
  return `${decLatex(coef)}${v}`;
}

/**
 * 여러 항을 부호를 고려해 연결한다.
 * ['3x', '-2', 'y'] → '3x - 2 + y'
 */
export function joinTerms(terms) {
  const parts = terms.filter((t) => t !== '' && t != null);
  if (parts.length === 0) return '0';
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const t = parts[i];
    if (t.startsWith('-')) out += ` - ${t.slice(1)}`;
    else out += ` + ${t}`;
  }
  return out;
}

/** a·x + b 꼴의 일차식 LaTeX */
export function linearExpr(a, b, v = 'x') {
  const A = Fraction.from(a);
  const B = Fraction.from(b);
  const t = [term(A, v)];
  if (!B.isZero()) t.push(B.toLatex());
  return joinTerms(t);
}

/** a x + b y (+ c) 꼴 LaTeX */
export function twoVarExpr(a, b, c) {
  const t = [term(a, 'x'), term(b, 'y')];
  if (c !== undefined && !Fraction.from(c).isZero()) t.push(Fraction.from(c).toLatex());
  return joinTerms(t);
}

/** a x² + b x + c LaTeX */
export function quadExpr(a, b, c) {
  const t = [term(a, 'x^2'), term(b, 'x')];
  const C = Fraction.from(c);
  if (!C.isZero()) t.push(C.toLatex());
  return joinTerms(t);
}

/** (x + b) 형태 */
export function xPlus(b, v = 'x') {
  const B = Fraction.from(b);
  if (B.isZero()) return v;
  return B.isNegative() ? `${v} - ${B.abs().toLatex()}` : `${v} + ${B.toLatex()}`;
}

/** 숫자를 사람이 읽는 문자열로 (정답 표시용) */
export function answerDisplay(v) {
  if (v instanceof Fraction) return v.toString();
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(parseFloat(v.toFixed(4)));
  return String(v);
}

/**
 * 이차방정식 근 표현 객체
 *  { p, q, sign, den } → (p ± √q)/den
 */
export function rootDisplay(root) {
  if (root instanceof Fraction) return root.toString();
  if (typeof root === 'number') return answerDisplay(root);
  const { p, q, sign, den } = root;
  const sq = `√${q}`;
  const sgn = sign > 0 ? '+' : '-';
  const num = p === 0 ? `${sign > 0 ? '' : '-'}${sq}` : `${p} ${sgn} ${sq}`;
  return den === 1 ? num : `(${num})/${den}`;
}

export function rootLatex(root) {
  if (root instanceof Fraction) return root.toLatex();
  if (typeof root === 'number') return numLatex(root);
  const { p, q, sign, den } = root;
  const sq = `\\sqrt{${q}}`;
  const sgn = sign > 0 ? '+' : '-';
  const num = p === 0 ? `${sign > 0 ? '' : '-'}${sq}` : `${p} ${sgn} ${sq}`;
  return den === 1 ? num : `\\dfrac{${num}}{${den}}`;
}

export function rootValue(root) {
  if (root instanceof Fraction) return root.toNumber();
  if (typeof root === 'number') return root;
  const { p, q, sign, den } = root;
  return (p + sign * Math.sqrt(q)) / den;
}
