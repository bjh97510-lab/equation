import React, { useState, useEffect } from 'react';
import { MathText } from '../common/MathText.jsx';

/**
 * 3D 뒤집기 카드
 *  props: front, back, note, onFlip(), actions(boolean) → 알겠어요/다시 볼래요 버튼, onMark(understood)
 */
export default function FlipCard({ id, front, back, note, onFlip, showActions = false, onMark, status }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => setFlipped(false), [id]);

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    if (next) onFlip?.();
  };

  return (
    <div>
      <div className="flip-scene">
        <div
          className={`flip-card ${flipped ? 'flipped' : ''}`}
          onClick={flip}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), flip())}
        >
          <div className="flip-face flip-front">
            <span className="tag">Q</span>
            <MathText text={front} />
            <span className="hint">카드를 눌러 뒤집어 보세요</span>
          </div>
          <div className="flip-face flip-back">
            <span className="tag">A</span>
            <div className="answer">
              <MathText text={back} />
            </div>
            {note && (
              <div className="note">
                <MathText text={note} />
              </div>
            )}
          </div>
        </div>
      </div>
      {showActions && flipped && (
        <div className="btn-row center">
          <button type="button" className={`btn ${status === 'understood' ? 'btn-primary' : 'btn-outline'}`} onClick={() => onMark?.(true)}>
            알겠어요 👍
          </button>
          <button type="button" className={`btn ${status === 'review' ? 'btn-secondary' : 'btn-outline'}`} onClick={() => onMark?.(false)}>
            다시 볼래요 🔄
          </button>
        </div>
      )}
    </div>
  );
}
