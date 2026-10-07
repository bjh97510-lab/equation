import React, { useState } from 'react';
import { MathText, MathBlock, MathInline } from '../common/MathText.jsx';
import FlipCard from './FlipCard.jsx';
import FillBlank from './FillBlank.jsx';
import ChoiceBlock from './ChoiceBlock.jsx';

function Balance({ left, right, caption }) {
  return (
    <div className="balance" aria-label={`저울: 왼쪽 ${left}, 오른쪽 ${right}`}>
      <div className="pans">
        <div className="pan">
          <MathInline latex={left} />
        </div>
        <div className="pivot">⚖️</div>
        <div className="pan">
          <MathInline latex={right} />
        </div>
      </div>
      <div className="beam" />
      <div className="base" />
      {caption && <div className="caption">{caption}</div>}
    </div>
  );
}

function StepsBlock({ items, onComplete, id }) {
  const [shown, setShown] = useState(1);
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setShown(1);
  }
  const done = shown >= items.length;
  return (
    <div>
      <div className="step-list">
        {items.slice(0, shown).map((it, i) => (
          <div key={i} className="step-item">
            <span className="num">{i + 1}</span>
            <div>
              {it.note && <div className="note">{it.note}</div>}
              <MathBlock latex={it.expr} left className="math-display" />
            </div>
          </div>
        ))}
      </div>
      {!done && (
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const n = shown + 1;
              setShown(n);
              if (n >= items.length) onComplete?.();
            }}
          >
            다음 단계 보기 ▾
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 개념 STEP 의 블록들을 렌더링한다.
 *  interactive 블록(card/blank/choice/steps)이 완료되면 onBlockDone(index) 호출
 */
export default function BlockRenderer({ stepId, blocks, onBlockDone }) {
  return (
    <div>
      {blocks.map((b, i) => {
        const key = `${stepId}-${i}`;
        switch (b.type) {
          case 'text':
            return (
              <p key={key} className="block block-text">
                <MathText text={b.text} />
              </p>
            );
          case 'math':
            return (
              <div key={key} className="block">
                <MathBlock latex={b.latex} big />
              </div>
            );
          case 'tip':
            return (
              <div key={key} className="block block-tip">
                💡 <MathText text={b.text} />
              </div>
            );
          case 'balance':
            return (
              <div key={key} className="block">
                <Balance left={b.left} right={b.right} caption={b.caption} />
              </div>
            );
          case 'steps':
            return (
              <div key={key} className="block">
                <StepsBlock id={key} items={b.items} onComplete={() => onBlockDone?.(i)} />
              </div>
            );
          case 'card':
            return (
              <div key={key} className="block">
                <FlipCard id={key} front={b.front} back={b.back} note={b.note} onFlip={() => onBlockDone?.(i)} />
              </div>
            );
          case 'blank':
            return (
              <div key={key} className="block">
                <FillBlank id={key} intro={b.intro} lines={b.lines} after={b.after} onComplete={() => onBlockDone?.(i)} />
              </div>
            );
          case 'choice':
            return (
              <div key={key} className="block">
                <ChoiceBlock id={key} question={b.question} options={b.options} answer={b.answer} explain={b.explain} onComplete={() => onBlockDone?.(i)} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** 완료가 필요한(상호작용) 블록인지 */
export function isInteractiveBlock(b) {
  return ['card', 'blank', 'choice', 'steps'].includes(b.type);
}
