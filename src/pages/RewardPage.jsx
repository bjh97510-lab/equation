import React from 'react';
import { useStudent } from '../store/studentStore.jsx';
import { Card, PageTitle, ProgressBar } from '../components/common/UI.jsx';
import { ACORNS_PER_STAMP, DIFFICULTIES, DIFFICULTY_REWARDS, REWARD_CONFIG } from '../config/appConfig.js';
import { BADGES } from '../data/badges.js';
import { acornsToNextStamp } from '../utils/rewards.js';

export default function RewardPage() {
  const { data } = useStudent();
  const { acorns, stamps, totalAcorns = 0 } = data.stats;
  const remain = acornsToNextStamp(acorns);
  return (
    <div>
      <PageTitle title="🌰 도토리 컬렉션" sub="문제를 풀어 도토리를 모으면 10개마다 칭찬도장 1개로 바뀌어요." />
      <Card>
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="k">현재 도토리</div>
            <div className="v">🌰 {acorns}</div>
          </div>
          <div className="stat-tile">
            <div className="k">칭찬도장</div>
            <div className="v">🏅 {stamps}</div>
          </div>
          <div className="stat-tile">
            <div className="k">누적 도토리</div>
            <div className="v">{totalAcorns}</div>
          </div>
          <div className="stat-tile">
            <div className="k">성취 배지</div>
            <div className="v">
              {data.badges.length}/{BADGES.length}
            </div>
          </div>
        </div>
        <h3 className="mt-3">다음 칭찬도장까지</h3>
        <div className="acorn-dots" aria-label={`도토리 ${acorns}개 / ${ACORNS_PER_STAMP}개`}>
          {Array.from({ length: ACORNS_PER_STAMP }).map((_, i) => (
            <span key={i} className={i < acorns ? '' : 'empty'}>
              🌰
            </span>
          ))}
        </div>
        <ProgressBar value={(acorns / ACORNS_PER_STAMP) * 100} right={`${acorns} / ${ACORNS_PER_STAMP}`} brown />
        <p className="mt-1" style={{ fontWeight: 700, color: 'var(--brown-700)' }}>
          도토리 {remain}개를 더 모으면 칭찬도장을 받을 수 있어요!
        </p>
      </Card>

      <Card>
        <h2>🏅 칭찬도장</h2>
        {stamps === 0 ? (
          <p className="muted">아직 칭찬도장이 없어요. 도토리 {ACORNS_PER_STAMP}개를 모아 첫 도장을 받아 보세요!</p>
        ) : (
          <div style={{ fontSize: '2rem', lineHeight: 1.4, wordBreak: 'break-all' }}>{'🏅'.repeat(Math.min(stamps, 60))}{stamps > 60 ? ` +${stamps - 60}` : ''}</div>
        )}
      </Card>

      <Card>
        <h2>🎖️ 성취 배지</h2>
        <div className="badge-grid">
          {BADGES.map((b) => (
            <div key={b.id} className={`badge-tile ${data.badges.includes(b.id) ? '' : 'locked'}`}>
              <div className="em">{b.emoji}</div>
              <div className="nm">{b.name}</div>
              <div className="ds">{b.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card soft>
        <h3>도토리는 어떻게 받나요?</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {DIFFICULTIES.map((d) => (
            <li key={d.id}>
              {d.emoji} {d.label} 문제 정답: 🌰 {DIFFICULTY_REWARDS[d.id]}
            </li>
          ))}
          <li>📕 오답노트 문제를 다시 맞히기(오답 정복): 🌰 {REWARD_CONFIG.wrongReview}</li>
          <li>📖 단원 개념 배우기 완료: 🌰 {REWARD_CONFIG.conceptLearnComplete}</li>
          <li>✏️ 단원 개념 확인 완료: 🌰 {REWARD_CONFIG.conceptCheckComplete}</li>
        </ul>
        <p className="small muted mt-1">같은 문제에서는 처음 맞혔을 때 한 번만 도토리를 받을 수 있어요.</p>
      </Card>
    </div>
  );
}
