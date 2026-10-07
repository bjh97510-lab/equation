import React from 'react';
import { useStudent } from '../store/studentStore.jsx';
import { Card, ProgressBar, PageTitle, Chip } from '../components/common/UI.jsx';
import { UNITS, DIFFICULTIES } from '../config/appConfig.js';
import { getSteps } from '../data/concepts/index.js';
import { buildRecommendations } from '../utils/recommend.js';
import { conceptName } from '../engine/problemGenerator.js';
import { todayKey } from '../utils/date.js';
import { BADGES } from '../data/badges.js';

function Tile({ k, v }) {
  return (
    <div className="stat-tile">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

export default function RecordPage() {
  const { student, data } = useStudent();
  const today = data.daily[todayKey()] || { solved: 0, correct: 0, acorns: 0 };
  const s = data.stats;
  const acc = (c, n) => (n ? `${Math.round((c / n) * 100)}%` : '-');
  const recs = buildRecommendations(data);

  return (
    <div>
      <PageTitle title="📊 나의 학습 기록" sub={`${student.school} ${student.grade}학년 ${student.classNo}반 ${student.number}번 ${student.name}`} />

      <Card>
        <h2>🌞 오늘의 기록</h2>
        <div className="stat-grid">
          <Tile k="푼 문제" v={today.solved} />
          <Tile k="정답" v={today.correct} />
          <Tile k="정답률" v={acc(today.correct, today.solved)} />
          <Tile k="획득 도토리" v={`🌰 ${today.acorns}`} />
        </div>
      </Card>

      <Card>
        <h2>🌳 전체 기록</h2>
        <div className="stat-grid">
          <Tile k="총 문제 수" v={s.totalSolved} />
          <Tile k="총 정답 수" v={s.totalCorrect} />
          <Tile k="누적 정답률" v={acc(s.totalCorrect, s.totalSolved)} />
          <Tile k="오답 복습 완료" v={s.reviewedCount} />
          <Tile k="현재 도토리" v={`🌰 ${s.acorns}`} />
          <Tile k="칭찬도장" v={`🏅 ${s.stamps}`} />
          <Tile k="연속 정답 최고" v={`🔥 ${s.bestStreak}`} />
          <Tile k="누적 도토리" v={`🌰 ${s.totalAcorns || 0}`} />
        </div>
      </Card>

      <Card>
        <h2>🧭 학습 추천</h2>
        {recs.map((r, i) => (
          <p key={i} style={{ fontWeight: 600 }}>
            • {r}
          </p>
        ))}
      </Card>

      <Card>
        <h2>📈 단원별 진도</h2>
        {UNITS.map((u) => {
          const up = data.progress[u.id];
          const total = getSteps(u.id).length;
          const done = up?.completedSteps?.length || 0;
          const cs = up?.conceptStats || {};
          const ds = up?.difficultyStats || {};
          const solved = Object.values(cs).reduce((a, c) => a + c.completed, 0);
          const correct = Object.values(cs).reduce((a, c) => a + c.correct, 0);
          return (
            <div key={u.id} className="mt-2">
              <ProgressBar value={total ? (done / total) * 100 : 0} label={`${u.emoji} ${u.name}`} right={`${done}/${total} STEP · 문제 ${solved}개 · 정답률 ${acc(correct, solved)}`} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {DIFFICULTIES.map((d) => (
                  <Chip key={d.id} tone="gray">
                    {d.emoji} {d.label} {ds[d.id] ? `${ds[d.id].correct}/${ds[d.id].completed}` : '-'}
                  </Chip>
                ))}
                {Object.entries(cs).map(([cid, c]) => (
                  <Chip key={cid} tone={c.completed >= 3 && c.correct / c.completed < 0.6 ? 'brown' : ''}>
                    {conceptName(u.id, cid)} {acc(c.correct, c.completed)}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}
      </Card>

      <Card>
        <h2>🎖️ 성취 배지 ({data.badges.length}/{BADGES.length})</h2>
        <div className="badge-grid">
          {BADGES.map((b) => (
            <div key={b.id} className={`badge-tile ${data.badges.includes(b.id) ? '' : 'locked'}`} title={b.desc}>
              <div className="em">{b.emoji}</div>
              <div className="nm">{b.name}</div>
              <div className="ds">{b.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
