import React from 'react';
import { Link } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, ProgressBar } from '../components/common/UI.jsx';
import { UNITS, UNIT_MAP } from '../config/appConfig.js';
import { buildRecommendations } from '../utils/recommend.js';

export default function HomePage() {
  const { student, data, getUnitProgressPercent } = useStudent();
  const pending = (data?.wrongAnswers || []).filter((w) => w.reviewStatus !== 'reviewed').length;
  const recs = data ? buildRecommendations(data).slice(0, 1) : [];
  const last = data?.lastLocation;

  return (
    <div>
      <div className="page-title">
        <div>
          <h1>🌳 {student.name} 학생의 방정식 탐험</h1>
          <p className="muted" style={{ margin: 0 }}>
            오늘도 도토리를 모으며 수학 실력을 키워 볼까요?
          </p>
        </div>
        <div className="header-stats" style={{ color: 'var(--forest-900)' }}>
          <span className="chip gold" style={{ fontSize: '1rem' }}>
            🌰 도토리 {data.stats.acorns}
          </span>
          <span className="chip gold" style={{ fontSize: '1rem' }}>
            🏅 칭찬도장 {data.stats.stamps}
          </span>
        </div>
      </div>

      {(last || pending > 0 || recs.length > 0) && (
        <div className="card soft mb-2">
          <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {recs.map((r, i) => (
                <p key={i} style={{ margin: 0, fontWeight: 600 }}>
                  🧭 {r}
                </p>
              ))}
            </div>
            <div className="btn-row" style={{ marginTop: 0 }}>
              {last?.unit && UNIT_MAP[last.unit] && (
                <Button variant="outline" size="sm" to={`/unit/${last.unit}`}>
                  ▶ 이어서 탐험: {UNIT_MAP[last.unit].name}
                </Button>
              )}
              {pending > 0 && (
                <Button variant="secondary" size="sm" to="/wrong">
                  📕 오답 복습 {pending}개
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card-grid cols-3">
        {UNITS.map((u) => {
          const pct = getUnitProgressPercent(u.id);
          return (
            <div key={u.id} className="card unit-card">
              <span className="deco" aria-hidden>
                {u.emoji}
              </span>
              <span className="level">
                {u.emoji} LEVEL {u.level}
              </span>
              <h2>{u.name}</h2>
              <span className="grade">{u.gradeLabel}</span>
              <p className="slogan">{u.slogan}</p>
              <ProgressBar value={pct} label="개념 학습 진도" />
              <div className="actions btn-row">
                <Button to={`/unit/${u.id}`} block>
                  학습 시작
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="small muted center mt-3">
        학년과 관계없이 모든 단원을 탐험할 수 있어요. <Link to="/record">📊 나의 기록</Link>에서 성장 과정을 확인해 보세요.
      </p>
    </div>
  );
}
