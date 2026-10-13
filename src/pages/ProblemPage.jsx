import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, Chip, Loading } from '../components/common/UI.jsx';
import ProblemSolver from '../components/problem/ProblemSolver.jsx';
import { UNIT_MAP, DIFFICULTIES, DIFFICULTY_MAP, DIFFICULTY_REWARDS } from '../config/appConfig.js';
import { generateProblem } from '../engine/problemGenerator.js';
import { isGuidedSupported } from '../engine/guided.js';

/**
 * 난이도 선택
 *  allowed: 선택 가능한 난이도 id 목록 (생략하면 모두). 나머지는 "준비 중"으로 비활성화.
 */
export function DifficultySelect({ unit, onPick, allowed = null }) {
  return (
    <div>
      <h2>난이도를 선택하세요</h2>
      <div className="card-grid cols-4">
        {DIFFICULTIES.map((d) => {
          const ok = !allowed || allowed.includes(d.id);
          return (
            <button key={d.id} type="button" className={`diff-card ${ok ? '' : 'disabled'}`} onClick={() => ok && onPick(d.id)} disabled={!ok} aria-disabled={!ok}>
              <span className="em">{d.emoji}</span>
              <span className="nm">{d.label}</span>
              <span className="ds">{ok ? d.desc : '단계별 풀이 준비 중'}</span>
              <span className="rw">{ok ? `정답 시 🌰 ${DIFFICULTY_REWARDS[d.id]}` : '—'}</span>
            </button>
          );
        })}
      </div>
      <p className="small muted mt-2">{UNIT_MAP[unit].emoji} 문제는 매번 새로 만들어지고, 정답은 프로그램이 식에 대입해 검증한 뒤 출제돼요.</p>
    </div>
  );
}

function SessionSummary({ session, unit, onContinue }) {
  const navigate = useNavigate();
  const acc = session.solved ? Math.round((session.correct / session.solved) * 100) : 0;
  return (
    <div className="card center" style={{ padding: 32 }}>
      <div style={{ fontSize: '3rem' }}>🎉</div>
      <h1>오늘의 탐험 완료!</h1>
      <div className="stat-grid mt-2" style={{ textAlign: 'left' }}>
        <div className="stat-tile">
          <div className="k">푼 문제</div>
          <div className="v">{session.solved}문제</div>
        </div>
        <div className="stat-tile">
          <div className="k">정답</div>
          <div className="v">{session.correct}문제</div>
        </div>
        <div className="stat-tile">
          <div className="k">정답률</div>
          <div className="v">{acc}%</div>
        </div>
        <div className="stat-tile">
          <div className="k">획득 도토리</div>
          <div className="v">🌰 {session.acorns}개</div>
        </div>
      </div>
      <p className="mt-2 muted">복습이 필요한 문제: {session.wrong}개</p>
      <div className="btn-row center">
        {session.wrong > 0 && (
          <Button variant="secondary" onClick={() => navigate(`/wrong?unit=${unit}`)}>
            📕 오답 복습
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate('/')}>
          🌳 다른 단원 탐험
        </Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          🏠 홈으로
        </Button>
        <Button onClick={onContinue}>계속 풀기</Button>
      </div>
    </div>
  );
}

export default function ProblemPage() {
  const { unit } = useParams();
  const [params, setParams] = useSearchParams();
  const u = UNIT_MAP[unit];
  const { data, submitAnswer, recordProblemShown, setLastLocation } = useStudent();
  const difficulty = params.get('difficulty');
  const [problem, setProblem] = useState(null);
  const [session, setSession] = useState({ solved: 0, correct: 0, acorns: 0, wrong: 0 });
  const [summary, setSummary] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLastLocation(unit, 'problems');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const makeProblem = useCallback(() => {
    try {
      const p = generateProblem(unit, difficulty, data?.recentProblemIds || []);
      setProblem(p);
      recordProblemShown(p.id);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.message);
    }
  }, [unit, difficulty, data?.recentProblemIds, recordProblemShown]);

  useEffect(() => {
    if (difficulty && DIFFICULTY_MAP[difficulty]) {
      setProblem(null);
      makeProblem();
    } else {
      setProblem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, difficulty]);

  const diffMeta = useMemo(() => DIFFICULTY_MAP[difficulty], [difficulty]);
  if (!u) return <Navigate to="/" replace />;

  const onSubmit = (inputs, meta) => {
    const res = submitAnswer({ problem, inputs, ...meta });
    if (meta.attemptNumber === 1) {
      setSession((s) => ({
        solved: s.solved + 1,
        correct: s.correct + (meta.correct ? 1 : 0),
        acorns: s.acorns + (res?.rewardEarned || 0),
        wrong: s.wrong + (meta.correct ? 0 : 1),
      }));
    } else if (meta.correct && res?.rewardEarned) {
      setSession((s) => ({ ...s, acorns: s.acorns + res.rewardEarned }));
    }
    return res;
  };

  return (
    <div>
      <p className="small">
        <Link to="/">🏠 홈</Link> › <Link to={`/unit/${unit}`}>{u.name}</Link> › 문제 풀기
      </p>
      <div className="page-title">
        <h1>
          🎯 {u.name} 문제 풀기 {diffMeta && <span className="chip gold" style={{ fontSize: '0.9rem', verticalAlign: 'middle' }}>{diffMeta.emoji} {diffMeta.label}</span>}
        </h1>
        {diffMeta && (
          <div className="btn-row" style={{ marginTop: 0 }}>
            <Chip>이번 세션 {session.correct}/{session.solved} · 🌰 {session.acorns}</Chip>
            <Button variant="outline" size="sm" onClick={() => setParams({})}>
              난이도 변경
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSummary(true)} disabled={session.solved === 0}>
              🏁 탐험 마치기
            </Button>
          </div>
        )}
      </div>

      {!difficulty || !diffMeta ? (
        <DifficultySelect unit={unit} onPick={(d) => setParams({ difficulty: d })} />
      ) : summary ? (
        <SessionSummary session={session} unit={unit} onContinue={() => (setSummary(false), makeProblem())} />
      ) : error ? (
        <div className="card center">
          <h3>🌳 잠시 길을 잃었어요.</h3>
          <p className="muted">{error}</p>
          <Button onClick={makeProblem}>다시 시도</Button>
        </div>
      ) : !problem ? (
        <Loading text="🌰 문제를 만들고 있어요..." />
      ) : (
        <ProblemSolver
          key={problem.id}
          problem={problem}
          onSubmit={onSubmit}
          onNext={makeProblem}
          nextLabel="다음 문제 ▶"
          extraActions={
            isGuidedSupported(problem) ? (
              <Button variant="ghost" to={`/unit/${unit}/guided?difficulty=${problem.difficulty}`} state={{ problem }}>
                🪜 이 문제를 단계별로 풀기
              </Button>
            ) : null
          }
        />
      )}
      {problem && !summary && data.stats.streak >= 3 && <p className="center small mt-2" style={{ color: 'var(--brown-700)', fontWeight: 700 }}>🔥 현재 {data.stats.streak}연속 정답 중!</p>}
    </div>
  );
}
