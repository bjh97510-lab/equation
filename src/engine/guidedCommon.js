/**
 * 단계별 풀이 공통 도구
 *
 *  단계(step) 형식
 *    { key, kind:'choice', title, prompt, free, options:[{id,label,correct,feedback}] }
 *    { key, kind:'blanks', title, prompt, lines:[{label, latex(\square 포함), answers:number[], alt?:number[][], hint}], explain, summary:[{label, latex}] }
 *    { key, kind:'final', title, prompt }
 *
 *  ※ 빈칸(\square)은 LaTeX 최상위에만 둔다 (\frac{}{} 안 등 중괄호 내부 금지).
 *    화면은 \square 를 기준으로 수식을 잘라 조각별로 렌더링하기 때문이다.
 */
import { numLatex } from './format.js';

/**
 * \square 를 정답으로 채워 넣은 LaTeX (풀이 노트 표시용)
 *  - "+ \square" 뒤에 음수가 오면 "- 3" 으로 바꾼다
 *  - 계수 자리(바로 뒤가 x, y, t)에 ±1 이 오면 숫자 1 을 생략한다
 */
export function fillBlanks(latex, answers) {
  let out = latex;
  for (const ans of answers) {
    const idx = out.indexOf('\\square');
    if (idx < 0) break;
    let before = out.slice(0, idx);
    let after = out.slice(idx + '\\square'.length);
    let s = typeof ans === 'string' ? ans : numLatex(ans);
    const isCoef = /^\s*[xyt]/.test(after);
    if (isCoef) {
      after = after.replace(/^\s+/, '');
      if (Math.abs(ans) === 1) s = ans < 0 ? '-' : '';
    }
    if (s.startsWith('-') && /\+\s*$/.test(before)) {
      before = before.replace(/\+\s*$/, '- ');
      s = s.slice(1);
    }
    out = before + s + after;
  }
  return out;
}

export function blanksStep(key, title, prompt, lines, explain) {
  return {
    key,
    kind: 'blanks',
    title,
    prompt,
    lines,
    explain,
    summary: lines.map((l) => ({ label: l.label || '', latex: fillBlanks(l.latex, l.display || l.answers) })),
  };
}

/**
 * 선택형 단계
 *  free=true 면 어느 보기를 골라도 진행되고(선택에 따라 이후 단계가 달라짐),
 *  free=false 면 correct 인 보기를 골라야 진행된다.
 */
export function choiceStep(key, title, prompt, options, free = false) {
  return { key, kind: 'choice', title, prompt, free, options };
}

export function finalStep(prompt = '위에서 구한 답을 정리해서 적어 보세요.') {
  return { key: 'final', kind: 'final', title: '최종 정답', prompt };
}

/**
 * 빈칸 줄 하나
 *  answers : 판정용 값 (숫자 또는 Fraction). 무리수(√5 등)는 수치로 두고 display 로 표시를 지정한다.
 *  alt     : 다른 순서/부호로 써도 정답인 조합들
 *  display : 풀이 노트에 채워 넣을 LaTeX (생략하면 answers 를 그대로 표시)
 */
export function line(label, latex, answers, hint, alt, display) {
  return { label, latex, answers, hint, ...(alt ? { alt } : {}), ...(display ? { display } : {}) };
}
