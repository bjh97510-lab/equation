import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { ProgressBar, Chip } from '../components/common/UI.jsx';
import { UNIT_MAP, GUIDED_UNITS } from '../config/appConfig.js';
import { getSteps, getCards } from '../data/concepts/index.js';

export default function UnitPage() {
  const { unit } = useParams();
  const u = UNIT_MAP[unit];
  const { unitProgress, setLastLocation, data } = useStudent();
  useEffect(() => {
    if (u) setLastLocation(unit, 'menu');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);
  if (!u) return <Navigate to="/" replace />;

  const up = unitProgress(unit);
  const total = getSteps(unit).length;
  const pct = total ? Math.round((up.completedSteps.length / total) * 100) : 0;
  const cards = getCards(unit);
  const reviewCards = cards.filter((c) => data.cards.review.includes(c.id)).length;
  const pendingWrong = data.wrongAnswers.filter((w) => w.unit === unit && w.reviewStatus !== 'reviewed').length;
  const solved = Object.values(up.conceptStats).reduce((s, c) => s + c.completed, 0);
  const correct = Object.values(up.conceptStats).reduce((s, c) => s + c.correct, 0);

  const menus = [
    { to: `/unit/${unit}/learn`, ico: '📖', title: '개념 배우기', desc: `STEP ${up.completedSteps.length}/${total} 완료`, badge: pct === 100 ? <Chip>완료 ✅</Chip> : null },
    { to: `/unit/${unit}/cards`, ico: '🃏', title: '개념 카드', desc: `카드 ${cards.length}장 · 다시 볼 카드 ${reviewCards}장`, badge: reviewCards > 0 ? <Chip tone="brown">🔄 {reviewCards}</Chip> : null },
    { to: `/unit/${unit}/check`, ico: '✏️', title: '개념 확인', desc: '빈칸 채우기 · 선택형 활동', badge: up.checkCompleted ? <Chip>완료 ✅</Chip> : null },
    { to: `/unit/${unit}/problems`, ico: '🎯', title: '문제 풀기', desc: '기초 · 기본 · 발전 · 도전 난이도 선택' },
    ...(GUIDED_UNITS.includes(unit)
      ? [
          {
            to: `/unit/${unit}/guided`,
            ico: '🪜',
            title: '단계별 풀이',
            desc: unit === 'simultaneous' ? '질문에 답하고 빈칸을 채우며 한 단계씩 천천히' : '도전(활용) 문제를 질문과 빈칸으로 한 단계씩',
            badge: <Chip tone="gold">NEW</Chip>,
          },
        ]
      : []),
    { to: `/unit/${unit}/problems?difficulty=challenge`, ico: '🔥', title: '도전 문제', desc: '활용 문제 · 🌰 3개' },
    { to: `/wrong?unit=${unit}`, ico: '📕', title: '오답노트', desc: `복습할 문제 ${pendingWrong}개`, badge: pendingWrong > 0 ? <Chip tone="danger">{pendingWrong}</Chip> : null },
    { to: `/record`, ico: '📊', title: '나의 기록', desc: solved ? `이 단원 ${solved}문제 · 정답률 ${Math.round((correct / solved) * 100)}%` : '아직 푼 문제가 없어요' },
  ];

  return (
    <div>
      <p className="small">
        <Link to="/">🏠 홈</Link> › {u.name}
      </p>
      <div className="page-title">
        <div>
          <span className="chip">
            {u.emoji} LEVEL {u.level} · {u.gradeLabel}
          </span>
          <h1 style={{ marginTop: 6 }}>{u.name}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {u.slogan}
          </p>
        </div>
      </div>
      <div className="card soft mb-2">
        <ProgressBar value={pct} label="개념 학습 진도" />
      </div>
      <div className="card-grid">
        {menus.map((m) => (
          <Link key={m.to} to={m.to} className="card menu-card">
            <span className="ico" aria-hidden>
              {m.ico}
            </span>
            <span>
              <div className="title">{m.title}</div>
              <div className="desc">{m.desc}</div>
            </span>
            {m.badge && <span className="badge">{m.badge}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
