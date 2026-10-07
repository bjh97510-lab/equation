import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, Chip, EmptyState } from '../components/common/UI.jsx';
import FlipCard from '../components/learning/FlipCard.jsx';
import { UNIT_MAP } from '../config/appConfig.js';
import { getCards } from '../data/concepts/index.js';

export default function CardsPage() {
  const { unit } = useParams();
  const u = UNIT_MAP[unit];
  const { data, markCard, setLastLocation } = useStudent();
  const all = useMemo(() => getCards(unit), [unit]);
  const [mode, setMode] = useState('all'); // all | review
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setLastLocation(unit, 'cards');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  if (!u) return <Navigate to="/" replace />;
  const reviewIds = new Set(data.cards.review);
  const understoodIds = new Set(data.cards.understood);
  const list = mode === 'review' ? all.filter((c) => reviewIds.has(c.id)) : all;
  const card = list[Math.min(idx, Math.max(0, list.length - 1))];
  const status = card ? (understoodIds.has(card.id) ? 'understood' : reviewIds.has(card.id) ? 'review' : null) : null;

  const mark = (ok) => {
    markCard(card.id, ok);
    if (idx < list.length - 1) setIdx(idx + 1);
  };

  return (
    <div>
      <p className="small">
        <Link to="/">🏠 홈</Link> › <Link to={`/unit/${unit}`}>{u.name}</Link> › 개념 카드
      </p>
      <div className="page-title">
        <h1>🃏 {u.name} 개념 카드</h1>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <Button variant={mode === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => (setMode('all'), setIdx(0))}>
            전체 {all.length}
          </Button>
          <Button variant={mode === 'review' ? 'primary' : 'outline'} size="sm" onClick={() => (setMode('review'), setIdx(0))}>
            🔄 다시 볼 카드 {all.filter((c) => reviewIds.has(c.id)).length}
          </Button>
        </div>
      </div>
      <p className="subtitle">
        이해한 카드 {all.filter((c) => understoodIds.has(c.id)).length}장 · 다시 볼 카드 {all.filter((c) => reviewIds.has(c.id)).length}장
      </p>

      {!card ? (
        <EmptyState emoji="🌿" title="다시 볼 카드가 없어요" desc="모든 카드를 이해했어요! 전체 카드를 다시 훑어볼 수도 있어요." action={<Button onClick={() => setMode('all')}>전체 카드 보기</Button>} />
      ) : (
        <div className="card">
          <div className="problem-meta">
            <Chip>
              {Math.min(idx, list.length - 1) + 1} / {list.length}
            </Chip>
            {status === 'understood' && <Chip>알겠어요 👍</Chip>}
            {status === 'review' && <Chip tone="brown">다시 볼래요 🔄</Chip>}
          </div>
          <FlipCard id={card.id} front={card.front} back={card.back} note={card.note} showActions onMark={mark} status={status} />
          <div className="btn-row between">
            <Button variant="ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>
              ◀ 이전 카드
            </Button>
            <Button variant="outline" onClick={() => setIdx(Math.min(list.length - 1, idx + 1))} disabled={idx >= list.length - 1}>
              다음 카드 ▶
            </Button>
          </div>
        </div>
      )}

      <div className="card soft mt-2">
        <div className="small muted" style={{ marginBottom: 6 }}>
          카드 목록
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {list.map((c, i) => (
            <button key={c.id} type="button" className={`btn btn-sm ${i === idx ? 'btn-primary' : understoodIds.has(c.id) ? 'btn-secondary' : reviewIds.has(c.id) ? 'btn-danger' : 'btn-outline'}`} onClick={() => setIdx(i)}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
