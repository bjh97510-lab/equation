import React, { useState } from 'react';
import { MathText } from '../common/MathText.jsx';

const LABELS = ['①', '②', '③', '④', '⑤'];

/**
 * 선택형 활동
 *  props: question, options[], answer(index), explain, onComplete(correctOnFirstTry)
 */
export default function ChoiceBlock({ id, question, options, answer, explain, onComplete }) {
  const [picked, setPicked] = useState(null);
  const [wrongs, setWrongs] = useState([]);
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setPicked(null);
    setWrongs([]);
  }
  const solved = picked === answer;

  const choose = (i) => {
    if (solved) return;
    if (i === answer) {
      setPicked(i);
      onComplete?.(wrongs.length === 0);
    } else {
      setWrongs((w) => (w.includes(i) ? w : [...w, i]));
      setPicked(i);
    }
  };

  return (
    <div className="card soft">
      <p className="block-text">
        <MathText text={question} />
      </p>
      <div className="choice-list">
        {options.map((o, i) => {
          const cls = solved && i === answer ? 'correct' : wrongs.includes(i) ? 'wrong' : '';
          return (
            <button key={i} type="button" className={`choice-btn ${cls}`} onClick={() => choose(i)} disabled={solved || wrongs.includes(i)}>
              <span className="mark">{LABELS[i]}</span>
              <MathText text={o} />
              {solved && i === answer && <span style={{ marginLeft: 'auto' }}>✅</span>}
              {wrongs.includes(i) && <span style={{ marginLeft: 'auto' }}>✖</span>}
            </button>
          );
        })}
      </div>
      {!solved && wrongs.length > 0 && <p className="small mt-1" style={{ color: 'var(--brown-700)', fontWeight: 600 }}>🌱 거의 다 왔어요! 다른 보기를 다시 살펴볼까요?</p>}
      {solved && (
        <div className="hint-box">
          <span className="lvl">✅ 정답!</span> <MathText text={explain} />
        </div>
      )}
    </div>
  );
}
