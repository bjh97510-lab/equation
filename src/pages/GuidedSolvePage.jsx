import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, Chip, Loading } from '../components/common/UI.jsx';
import GuidedSolver from '../components/problem/GuidedSolver.jsx';
import { DifficultySelect } from './ProblemPage.jsx';
import { UNIT_MAP, DIFFICULTY_MAP, GUIDED_UNITS, GUIDED_DIFFICULTIES } from '../config/appConfig.js';
import { generateProblem } from '../engine/problemGenerator.js';
import { isGuidedSupported } from '../engine/guided.js';

/**
 * 단계별 풀이 페이지
 *  - /unit/:unit/guided?difficulty=basic
 *  - 문제 풀기 화면에서 "단계별로 풀기" 로 넘어오면 location.state.problem 의 문제를 그대로 사용한다.
 */
export default function GuidedSolvePage() {
  const { unit } = useParams();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const u = UNIT_MAP[unit];
  const supported = GUIDED_UNITS.includes(unit);
  const allowedDiffs = GUIDED_DIFFICULTIES[unit] || [];
  const { data, submitAnswer, recordProblemShown, setLastLocation } = useStudent();
  const difficulty = params.get('difficulty');
  const handed = location.state?.problem;
  const [problem, setProblem] = useState(() => (isGuidedSupported(handed) ? handed : null));
  const [session, setSession] = useState({ solved: 0, correct: 0, acorns: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (u) setLastLocation(unit, 'guided');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  // 넘겨받은 문제가 있으면 난이도 파라미터를 맞춰 둔다
  useEffect(() => {
    if (isGuidedSupported(handed) && params.get('difficulty') !== handed.difficulty) {
      setParams({ difficulty: handed.difficulty }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handed?.id]);

  const makeProblem = useCallback(() => {
    try {
      let p = null;
      for (let i = 0; i < 20; i++) {
        p = generateProblem(unit, difficulty, data?.recentProblemIds || []);
        if (isGuidedSupported(p)) break;
      }
      if (!isGuidedSupported(p)) throw new Error('단계별 풀이를 지원하는 문제를 만들지 못했어요.');
      setProblem(p);
      recordProblemShown(p.id);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.message);
    }
  }, [unit, difficulty, data?.recentProblemIds, recordProblemShown]);

  useEffect(() => {
    if (!difficulty || !DIFFICULTY_MAP[difficulty] || !allowedDiffs.includes(difficulty)) {
      setProblem(null);
      return;
    }
    if (problem && problem.difficulty === difficulty) return; // 넘겨받은 문제 유지
    setProblem(null);
    makeProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, difficulty]);

  // 이 단원에서 단계별 풀이를 지원하는 난이도일 때만 유효
  const diffMeta = useMemo(() => (allowedDiffs.includes(difficulty) ? DIFFICULTY_MAP[difficulty] : null), [difficulty, allowedDiffs]);
  if (!u) return <Navigate to="/" replace />;

  const onSubmit = (inputs, meta) => {
    const res = submitAnswer({ problem, inputs, correct: meta.correct, attemptNumber: meta.attemptNumber, hintLevel: meta.hintLevel, studySeconds: meta.studySeconds });
    if (meta.attemptNumber === 1) {
      setSession((s) => ({ solved: s.solved + 1, correct: s.correct + (meta.correct ? 1 : 0), acorns: s.acorns + (res?.rewardEarned || 0) }));
    } else if (meta.correct && res?.rewardEarned) {
      setSession((s) => ({ ...s, acorns: s.acorns + res.rewardEarned }));
    }
    return res;
  };

  return (
    <div>
      <p className="small">
        <Link to="/">🏠 홈</Link> › <Link to={`/unit/${unit}`}>{u.name}</Link> › 단계별 풀이
      </p>
      <div className="page-title">
        <h1>
          🪜 {u.name} 단계별 풀이 {diffMeta && <span className="chip gold" style={{ fontSize: '0.9rem', verticalAlign: 'middle' }}>{diffMeta.emoji} {diffMeta.label}</span>}
        </h1>
        {diffMeta && (
          <div className="btn-row" style={{ marginTop: 0 }}>
            <Chip>이번 세션 {session.correct}/{session.solved} · 🌰 {session.acorns}</Chip>
            <Button variant="outline" size="sm" onClick={() => setParams({})}>
              난이도 변경
            </Button>
            <Button variant="ghost" size="sm" to={`/unit/${unit}/problems${difficulty ? `?difficulty=${difficulty}` : ''}`}>
              🎯 혼자 풀기
            </Button>
          </div>
        )}
      </div>

      {!supported ? (
        <div className="card center" style={{ padding: 32 }}>
          <div style={{ fontSize: '2.6rem' }}>🪜</div>
          <h3>이 단원의 단계별 풀이는 준비 중이에요.</h3>
          <p className="muted">지금은 연립일차방정식 단원에서 사용할 수 있어요.</p>
          <Button to={`/unit/${unit}/problems`}>🎯 문제 풀기로 가기</Button>
        </div>
      ) : !difficulty || !diffMeta ? (
        <div>
          <div className="card soft mb-2">
            <p className="block-text" style={{ margin: 0 }}>
              🪜 <strong>단계별 풀이</strong>에서는 문제를 한 번에 풀지 않아요. <strong>어떤 미지수를 없앨지, 더할지 뺄지</strong>를 질문에 답해 고르고, 각 단계의 식을 <strong>빈칸 채우기</strong>로 완성하면서 천천히 해를 구해요.
            </p>
          </div>
          <DifficultySelect unit={unit} allowed={allowedDiffs} onPick={(d) => setParams({ difficulty: d })} />
        </div>
      ) : error ? (
        <div className="card center">
          <h3>🌳 잠시 길을 잃었어요.</h3>
          <p className="muted">{error}</p>
          <Button onClick={makeProblem}>다시 시도</Button>
        </div>
      ) : !problem ? (
        <Loading text="🌰 문제를 만들고 있어요..." />
      ) : (
        <GuidedSolver key={problem.id} problem={problem} onSubmit={onSubmit} onNext={makeProblem} nextLabel="다음 문제 ▶" />
      )}
    </div>
  );
}
