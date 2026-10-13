/**
 * 수식 렌더링 컴포넌트 (KaTeX)
 *  <MathText text="설명 $x + 3 = 7$ 과 **강조**" />  → 인라인 수식 + 간단한 **굵게** 지원
 *  <MathBlock latex="3x + 2 = 14" />                → 블록 수식
 */
import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderLatex(latex, displayMode = false) {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, strict: 'ignore', output: 'html' });
  } catch {
    return `<span class="math-fallback">${escapeHtml(latex)}</span>`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** "$...$" 인라인 수식과 **굵게** 를 HTML 로 변환 */
export function textToHtml(text) {
  if (text == null) return '';
  const parts = String(text).split(/(\$[^$]+\$)/g);
  return parts
    .map((part) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return `<span class="math-inline">${renderLatex(part.slice(1, -1))}</span>`;
      }
      let html = escapeHtml(part);
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // 수식 기호 없이 쓴 "x^2", "t^2" 같은 제곱 표기는 위첨자로
      html = html.replace(/([A-Za-z0-9)\]])\^(\d+)/g, '$1<sup>$2</sup>');
      html = html.replace(/\n/g, '<br/>');
      return html;
    })
    .join('');
}

export function MathText({ text, as: Tag = 'span', className = '' }) {
  const html = useMemo(() => textToHtml(text), [text]);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MathBlock({ latex, big = false, left = false, className = '' }) {
  const html = useMemo(() => renderLatex(latex, true), [latex]);
  return (
    <div className={`math-display ${big ? 'big' : ''} ${left ? 'left' : ''} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function MathInline({ latex, className = '' }) {
  const html = useMemo(() => renderLatex(latex, false), [latex]);
  return <span className={`math-inline ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
