import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, ProgressBar, Modal } from '../components/common/UI.jsx';
import FillBlank from '../components/learning/FillBlank.jsx';
import ChoiceBlock from '../components/learning/ChoiceBlock.jsx';
import { UNIT_MAP } from '../config/appConfig.js';
import { getChecks } from '../data/concepts/index.js';

export default function ConceptCheckPage() {
  const { unit } = useParams();
  const u = UNIT_MAP[unit];
  const checks = useMemo(() => getChecks(unit), [unit]);
  const { completeConceptCheck, setLastLocation, unitProgress } = useStudent();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(null);

  useEffect(() => {
    setLastLocation(unit, 'check');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);
  useEffect(() => setDone(false), [idx]);

  if (!u) return <Navigate to="/" replace />;
  const item = checks[idx];
  const pct = Math.round(((idx + (done ? 1 : 0)) / checks.length) * 100);
  const already = unitProgress(unit).checkCompleted;

  const next = () => {
    if (idx < checks.length - 1) setIdx(idx + 1);
    else setFinished(completeConceptCheck(unit) || {});
  };

  return (
    <div>
      <p className="small">
        <Link to="/">🏠 홈</Link> › <Link to={`/unit/${unit}`}>{u.name}</Link> › 개념 확인
      </p>
      <div className="page-title">
        <h1>✏️ {u.name} 개념 확인</h1>
        {already && <span className="chip">이미 완료한 활동이에요 ✅</span>}
      </div>
      <div className="step-indicator">
        <span className="label">
          {idx + 1} / {checks.length}
        </span>
        <ProgressBar value={pct} right={`${pct}%`} />
      </div>

      {item.type === 'choice' ? (
        <ChoiceBlock id={item.id} question={item.question} options={item.options} answer={item.answer} explain={item.explain} onComplete={(first) => (setDone(true), first && setFirstTry((n) => n + 1))} />
      ) : (
        <FillBlank id={item.id} intro={item.intro} lines={item.lines} after={item.after} onComplete={() => (setDone(true), setFirstTry((n) => n + 1))} />
      )}

      <div className="btn-row between">
        <Button variant="ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>
          ◀ 이전
        </Button>
        <Button onClick={next} disabled={!done} size="lg">
          {idx < checks.length - 1 ? '다음 ▶' : '🎉 개념 확인 완료'}
        </Button>
      </div>

      <Modal open={!!finished} onClose={() => setFinished(null)}>
        <div className="big">✏️</div>
        <h2>개념 확인 완료!</h2>
        <p className="muted">
          {checks.length}개 활동 중 {firstTry}개를 한 번에 해결했어요.
        </p>
        {finished?.rewardEarned > 0 && <p className="acorn-gain">🌰 +{finished.rewardEarned}</p>}
        <div className="btn-row center">
          <Button onClick={() => navigate(`/unit/${unit}/problems`)}>🎯 문제 풀기</Button>
          <Button variant="ghost" onClick={() => navigate(`/unit/${unit}`)}>
            단원 메뉴
          </Button>
        </div>
      </Modal>
    </div>
  );
}
