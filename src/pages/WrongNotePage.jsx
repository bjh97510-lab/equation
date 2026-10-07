import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, Chip, EmptyState, Modal, PageTitle } from '../components/common/UI.jsx';
import { MathText, MathBlock } from '../components/common/MathText.jsx';
import ProblemSolver, { SolutionSteps } from '../components/problem/ProblemSolver.jsx';
import { UNITS, UNIT_MAP, DIFFICULTY_MAP } from '../config/appConfig.js';
import { conceptName } from '../engine/problemGenerator.js';
import { formatDate } from '../utils/date.js';

function QuestionPreview({ w }) {
  if (w.problem?.question) {
    const q = w.problem.question;
    if (q.kind === 'word') return <MathText text={q.text} as="p" className="small" />;
    return <MathBlock latex={q.latex} left />;
  }
  // 서버 복원 등으로 문제 객체가 없을 때
  return /\\|\^|=/.test(w.questionText || '') ? <MathBlock latex={w.questionText} left /> : <p>{w.questionText}</p>;
}

export default function WrongNotePage() {
  const { data, submitAnswer } = useStudent();
  const [params] = useSearchParams();
  const [unitFilter, setUnitFilter] = useState(params.get('unit') || 'all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [active, setActive] = useState(null); // 다시 풀기 중인 오답
  const [viewSolution, setViewSolution] = useState(null);

  const list = useMemo(() => {
    return [...data.wrongAnswers]
      .filter((w) => unitFilter === 'all' || w.unit === unitFilter)
      .filter((w) => statusFilter === 'all' || (statusFilter === 'pending' ? w.reviewStatus !== 'reviewed' : w.reviewStatus === 'reviewed'))
      .sort((a, b) => new Date(b.lastAttempt) - new Date(a.lastAttempt));
  }, [data.wrongAnswers, unitFilter, statusFilter]);

  const pendingCount = data.wrongAnswers.filter((w) => w.reviewStatus !== 'reviewed').length;
  const reviewedCount = data.wrongAnswers.length - pendingCount;

  return (
    <div>
      <PageTitle title="📕 오답노트" sub={`복습 대기 ${pendingCount}개 · 복습 완료 ${reviewedCount}개 — 다시 맞히면 "오답 정복!" 🌰 보너스도 있어요.`} />
      <div className="card soft mb-2">
        <div className="btn-row" style={{ marginTop: 0 }}>
          <Button size="sm" variant={unitFilter === 'all' ? 'primary' : 'outline'} onClick={() => setUnitFilter('all')}>
            전체 단원
          </Button>
          {UNITS.map((u) => (
            <Button key={u.id} size="sm" variant={unitFilter === u.id ? 'primary' : 'outline'} onClick={() => setUnitFilter(u.id)}>
              {u.emoji} {u.name}
            </Button>
          ))}
        </div>
        <div className="btn-row">
          <Button size="sm" variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('pending')}>
            복습 대기
          </Button>
          <Button size="sm" variant={statusFilter === 'reviewed' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('reviewed')}>
            복습 완료
          </Button>
          <Button size="sm" variant={statusFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('all')}>
            모두
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState emoji="🌿" title={statusFilter === 'pending' ? '복습할 오답이 없어요' : '아직 기록이 없어요'} desc="문제를 풀다가 틀린 문제는 자동으로 이곳에 저장돼요." />
      ) : (
        <div className="list">
          {list.map((w) => {
            const u = UNIT_MAP[w.unit];
            const d = DIFFICULTY_MAP[w.difficulty];
            return (
              <div key={w.problemId} className="list-item">
                <div className="row">
                  <Chip>
                    {u?.emoji} {u?.name}
                  </Chip>
                  <Chip tone="brown">{conceptName(w.unit, w.concept)}</Chip>
                  <Chip tone="gold">
                    {d?.emoji} {d?.label}
                  </Chip>
                  {w.reviewStatus === 'reviewed' ? <Chip>복습 완료 ✅</Chip> : <Chip tone="danger">오답 {w.wrongCount}회</Chip>}
                  <span className="small muted" style={{ marginLeft: 'auto' }}>
                    {formatDate(w.date)}
                  </span>
                </div>
                <div className="mt-1">
                  <QuestionPreview w={w} />
                </div>
                <div className="small muted">
                  내 답: <strong>{w.studentAnswer || '(빈칸)'}</strong> · 정답: <strong>{w.correctAnswer}</strong>
                </div>
                <div className="btn-row">
                  {w.problem ? (
                    <Button size="sm" onClick={() => setActive(w)}>
                      🔄 다시 풀기
                    </Button>
                  ) : (
                    <span className="small muted">이 기기에 문제 원본이 없어 다시 풀기는 할 수 없어요.</span>
                  )}
                  {w.problem?.solutionSteps && (
                    <Button size="sm" variant="ghost" onClick={() => setViewSolution(w)}>
                      📝 풀이 보기
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} wide>
        {active && (
          <ProblemSolver
            key={active.problemId}
            problem={active.problem}
            isReview
            nextLabel="닫기"
            onNext={() => setActive(null)}
            onSubmit={(inputs, meta) => submitAnswer({ problem: active.problem, inputs, ...meta, isReview: true })}
          />
        )}
      </Modal>

      <Modal open={!!viewSolution} onClose={() => setViewSolution(null)} wide>
        {viewSolution && (
          <div>
            <h3>📝 풀이 과정</h3>
            <QuestionPreview w={viewSolution} />
            <SolutionSteps steps={viewSolution.problem.solutionSteps} revealAll />
            <div className="btn-row">
              <Button onClick={() => setViewSolution(null)}>닫기</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
