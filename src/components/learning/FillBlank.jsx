import React, { useState, useMemo } from 'react';
import { MathText, MathInline } from '../common/MathText.jsx';
import { checkSingle, evaluateAnswer } from '../../engine/answerNormalizer.js';

/**
 * 빈칸 채우기 활동
 *  props: intro, lines:[{latex(\square 포함), answer, hint}], after, onComplete()
 *  각 빈칸을 개별 판정. 오답이면 최종 정답 대신 힌트를 보여준다.
 */
export default function FillBlank({ id, intro, lines, after, onComplete }) {
  const [values, setValues] = useState(() => lines.map(() => ''));
  const [status, setStatus] = useState(() => lines.map(() => null)); // null | 'ok' | 'bad'
  const [tries, setTries] = useState(() => lines.map(() => 0));
  const allOk = status.every((s) => s === 'ok');

  // id 가 바뀌면 초기화
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setValues(lines.map(() => ''));
    setStatus(lines.map(() => null));
    setTries(lines.map(() => 0));
  }

  const check = (i) => {
    const target = evaluateAnswer(lines[i].answer);
    const res = target === null ? { correct: String(values[i]).trim() === String(lines[i].answer) } : checkSingle(values[i], target);
    const next = [...status];
    next[i] = res.correct ? 'ok' : 'bad';
    setStatus(next);
    const t = [...tries];
    t[i] += 1;
    setTries(t);
    if (next.every((s) => s === 'ok')) onComplete?.();
  };

  const parts = useMemo(() => lines.map((l) => l.latex.split('\\square')), [lines]);

  return (
    <div className="card soft">
      {intro && (
        <p className="block-text">
          <MathText text={intro} />
        </p>
      )}
      {lines.map((line, i) => (
        <div key={i} className="blank-line">
          {parts[i][0] && <MathInline latex={parts[i][0]} />}
          <input
            className={`input blank ${status[i] === 'ok' ? 'ok' : status[i] === 'bad' ? 'bad' : ''}`}
            value={values[i]}
            inputMode="text"
            aria-label={`빈칸 ${i + 1}`}
            disabled={status[i] === 'ok'}
            onChange={(e) => {
              const v = [...values];
              v[i] = e.target.value;
              setValues(v);
              if (status[i] === 'bad') {
                const s = [...status];
                s[i] = null;
                setStatus(s);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && check(i)}
          />
          {parts[i][1] && <MathInline latex={parts[i][1]} />}
          {status[i] !== 'ok' && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => check(i)} disabled={!values[i].trim()}>
              확인
            </button>
          )}
          {status[i] === 'ok' && <span className="status ok">✅ 정답</span>}
          {status[i] === 'bad' && (
            <span className="status bad">
              🌱 다시 생각해 볼까요?{' '}
              {line.hint && tries[i] >= 1 && (
                <span className="muted" style={{ fontWeight: 500 }}>
                  💡 {line.hint}
                </span>
              )}
            </span>
          )}
        </div>
      ))}
      {allOk && after && (
        <p className="block-text mt-1">
          <MathText text={after} />
        </p>
      )}
      {allOk && <p className="small" style={{ color: 'var(--forest-700)', fontWeight: 700 }}>🎉 빈칸을 모두 채웠어요!</p>}
    </div>
  );
}
