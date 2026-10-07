import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, ProgressBar, Modal } from '../components/common/UI.jsx';
import BlockRenderer, { isInteractiveBlock } from '../components/learning/BlockRenderer.jsx';
import { UNIT_MAP } from '../config/appConfig.js';
import { getSteps } from '../data/concepts/index.js';

export default function ConceptLearnPage() {
  const { unit } = useParams();
  const u = UNIT_MAP[unit];
  const steps = useMemo(() => getSteps(unit), [unit]);
  const { unitProgress, completeStep, setLastLocation } = useStudent();
  const navigate = useNavigate();
  const up = unitProgress(unit);

  // 시작 STEP: 첫 미완료 STEP
  const firstIncomplete = Math.max(
    0,
    steps.findIndex((s) => !up.completedSteps.includes(s.id)),
  );
  const [idx, setIdx] = useState(firstIncomplete === -1 ? 0 : firstIncomplete);
  const [doneBlocks, setDoneBlocks] = useState(new Set());
  const [finished, setFinished] = useState(null);

  useEffect(() => {
    setLastLocation(unit, 'learn');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);
  useEffect(() => {
    setDoneBlocks(new Set());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idx]);

  if (!u) return <Navigate to="/" replace />;
  const step = steps[idx];
  const required = step.blocks.map((b, i) => (isInteractiveBlock(b) ? i : -1)).filter((i) => i >= 0);
  const alreadyDone = up.completedSteps.includes(step.id);
  const canNext = alreadyDone || required.every((i) => doneBlocks.has(i));
  const pct = Math.round(((idx + 1) / steps.length) * 100);

  const next = () => {
    const res = completeStep(unit, step.id);
    if (idx < steps.length - 1) setIdx(idx + 1);
    else setFinished(res || { completedAll: true });
  };

  return (
    <div>
      <p className="small">
        <Link to="/">🏠 홈</Link> › <Link to={`/unit/${unit}`}>{u.name}</Link> › 개념 배우기
      </p>
      <div className="step-indicator">
        <span className="label">
          STEP {idx + 1} / {steps.length}
        </span>
        <ProgressBar value={pct} right={`${pct}%`} />
      </div>
      <div className="card">
        <h2>
          {u.emoji} STEP {idx + 1}. {step.title}
          {alreadyDone && <span className="chip" style={{ marginLeft: 8 }}>완료 ✅</span>}
        </h2>
        <BlockRenderer stepId={step.id} blocks={step.blocks} onBlockDone={(i) => setDoneBlocks((s) => new Set([...s, i]))} />
        {!canNext && <p className="small muted">💡 카드 뒤집기, 빈칸, 선택 활동을 모두 마치면 [다음] 버튼이 활성화돼요.</p>}
        <div className="btn-row between">
          <Button variant="ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>
            ◀ 이전
          </Button>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {idx < steps.length - 1 && alreadyDone && (
              <Button variant="outline" onClick={() => setIdx(idx + 1)}>
                건너뛰기
              </Button>
            )}
            <Button onClick={next} disabled={!canNext} size="lg">
              {idx < steps.length - 1 ? '다음 ▶' : '🎉 개념 학습 완료'}
            </Button>
          </div>
        </div>
      </div>

      <div className="card soft mt-2">
        <div className="small muted" style={{ marginBottom: 6 }}>
          STEP 바로가기
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {steps.map((s, i) => (
            <button key={s.id} type="button" className={`btn btn-sm ${i === idx ? 'btn-primary' : up.completedSteps.includes(s.id) ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setIdx(i)}>
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
      </div>

      <Modal open={!!finished} onClose={() => setFinished(null)}>
        <div className="big">🌳</div>
        <h2>{u.name} 개념 학습 완료!</h2>
        {finished?.rewardEarned > 0 && <p className="acorn-gain">🌰 +{finished.rewardEarned}</p>}
        <p className="muted">이제 개념 확인과 문제 풀기로 실력을 다져 볼까요?</p>
        <div className="btn-row center">
          <Button onClick={() => navigate(`/unit/${unit}/check`)}>✏️ 개념 확인</Button>
          <Button variant="secondary" onClick={() => navigate(`/unit/${unit}/problems`)}>
            🎯 문제 풀기
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/unit/${unit}`)}>
            단원 메뉴
          </Button>
        </div>
      </Modal>
    </div>
  );
}
