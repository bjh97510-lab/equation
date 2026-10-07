import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MathBlock, MathText, MathInline } from '../common/MathText.jsx';
import { Button, Chip } from '../common/UI.jsx';
import { judgeAnswer } from '../../engine/answerNormalizer.js';
import { conceptName } from '../../engine/problemGenerator.js';
import { DIFFICULTY_MAP, UNIT_MAP, MAX_HINT_LEVEL } from '../../config/appConfig.js';

/** 문제 본문 표시 */
export function ProblemQuestion({ problem }) {
  const q = problem.question;
  if (q.kind === 'word') {
    return (
      <div className="word-problem">
        <MathText text={q.text} />
      </div>
    );
  }
  if (q.kind === 'system') {
    return <MathBlock latex={q.latex} big />;
  }
  return <MathBlock latex={q.latex} big />;
}

/** 풀이 단계 카드 */
export function SolutionSteps({ steps, revealAll = false }) {
  const [shown, setShown] = useState(revealAll ? steps.length : 1);
  useEffect(() => setShown(revealAll ? steps.length : 1), [steps, revealAll]);
  return (
    <div className="solution-steps">
      {steps.slice(0, shown).map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div className="solution-arrow">
              ↓{s.note && <small>{s.note}</small>}
            </div>
          )}
          <div className="solution-step">
            {i === 0 && s.note && <div className="note">{s.note}</div>}
            <MathBlock latex={s.expr} left />
          </div>
        </React.Fragment>
      ))}
      {shown < steps.length && (
        <div className="btn-row center">
          <Button variant="outline" size="sm" onClick={() => setShown(shown + 1)}>
            다음 단계 ▾
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShown(steps.length)}>
            전체 보기
          </Button>
        </div>
      )}
    </div>
  );
}

function AnswerInputs({ problem, values, setValues, disabled, onEnter, firstRef }) {
  const set = (i, v) => {
    const n = [...values];
    n[i] = v;
    setValues(n);
  };
  const common = (i) => ({
    className: 'input answer',
    value: values[i] ?? '',
    disabled,
    inputMode: 'text',
    autoComplete: 'off',
    onChange: (e) => set(i, e.target.value),
    onKeyDown: (e) => e.key === 'Enter' && onEnter(),
  });
  if (problem.answerType === 'pair') {
    return (
      <div className="answer-row">
        <span className="lbl">x =</span>
        <input ref={firstRef} aria-label="x 값" {...common(0)} />
        <span className="lbl">y =</span>
        <input aria-label="y 값" {...common(1)} />
      </div>
    );
  }
  if (problem.answerType === 'roots') {
    return (
      <div>
        <div className="answer-row">
          <span className="lbl">x₁ =</span>
          <input ref={firstRef} aria-label="첫 번째 근" {...common(0)} />
          <span className="lbl">x₂ =</span>
          <input aria-label="두 번째 근" {...common(1)} />
        </div>
        <p className="small muted">두 근의 순서는 상관없어요. 중근이면 두 칸에 같은 값을 쓰거나 한 칸만 채워도 돼요. √ 는 "루트2" 또는 "sqrt(2)" 로 입력할 수 있어요.</p>
      </div>
    );
  }
  const label = problem.unit === 'quadratic' || problem.question.kind === 'word' ? (problem.question.kind === 'word' ? '답 =' : 'x =') : 'x =';
  return (
    <div>
      <div className="answer-row">
        <span className="lbl">{label}</span>
        <input ref={firstRef} aria-label="답" {...common(0)} />
      </div>
      {problem.unit === 'linear' && <p className="small muted">분수는 "3/2", 소수는 "1.5" 처럼 입력할 수 있어요.</p>}
    </div>
  );
}

/**
 * 문제 풀이 컴포넌트
 *  props:
 *   problem        문제 객체
 *   onSubmit(inputs, {correct, attemptNumber, hintLevel, studySeconds}) → 스토어 결과({rewardEarned, streakMsg, reviewConquered…}) 또는 null
 *   onNext()       다음 문제 / 닫기
 *   nextLabel      다음 버튼 문구
 *   isReview       오답 복습 모드
 */
export default function ProblemSolver({ problem, onSubmit, onNext, nextLabel = '다음 문제 ▶', isReview = false, extraActions = null }) {
  const [values, setValues] = useState(['', '']);
  const [attempt, setAttempt] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [result, setResult] = useState(null); // {correct, storeResult}
  const [showSolution, setShowSolution] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const startRef = useRef(Date.now());
  const firstRef = useRef(null);
  const [solvedCorrect, setSolvedCorrect] = useState(false);

  useEffect(() => {
    setValues(['', '']);
    setAttempt(0);
    setHintLevel(0);
    setResult(null);
    setShowSolution(false);
    setInvalid(false);
    setSolvedCorrect(false);
    startRef.current = Date.now();
    setTimeout(() => firstRef.current?.focus(), 50);
  }, [problem?.id]);

  const unit = UNIT_MAP[problem.unit];
  const diff = DIFFICULTY_MAP[problem.difficulty];
  const needed = problem.answerType === 'single' ? 1 : 2;
  const filled = useMemo(() => {
    if (problem.answerType === 'roots') return values.some((v) => String(v).trim() !== '');
    return values.slice(0, needed).every((v) => String(v).trim() !== '');
  }, [values, needed, problem.answerType]);

  const submit = () => {
    if (submitting || solvedCorrect || !filled) return;
    const judged = judgeAnswer(problem, values);
    if (judged.reason === 'invalid') {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setSubmitting(true);
    const attemptNumber = attempt + 1;
    setAttempt(attemptNumber);
    const studySeconds = Math.round((Date.now() - startRef.current) / 1000);
    const storeResult = onSubmit?.(values.slice(0, needed), { correct: judged.correct, attemptNumber, hintLevel, studySeconds });
    setResult({ correct: judged.correct, storeResult });
    if (judged.correct) setSolvedCorrect(true);
    // 빠른 연타로 인한 중복 제출 방지
    setTimeout(() => setSubmitting(false), 600);
  };

  const retry = () => {
    setResult(null);
    setSubmitting(false);
    setValues(['', '']);
    setTimeout(() => firstRef.current?.focus(), 50);
  };

  /** 오답 피드백이 떠 있는 상태에서 답을 고치면 피드백을 닫고 다시 제출할 수 있게 한다 */
  const updateValues = (next) => {
    setValues(next);
    if (result && !result.correct) {
      setResult(null);
      setSubmitting(false);
    }
  };

  const canShowSolution = hintLevel >= MAX_HINT_LEVEL || solvedCorrect;

  return (
    <div className="card">
      <div className="problem-meta">
        <Chip>{unit?.emoji} {unit?.name}</Chip>
        <Chip tone="brown">{conceptName(problem.unit, problem.concept)}</Chip>
        <Chip tone="gold">
          {diff?.emoji} {diff?.label} · 🌰 {isReview ? '복습' : problem.reward}
        </Chip>
        {isReview && <Chip tone="danger">📕 오답 다시 풀기</Chip>}
      </div>

      <h3 style={{ marginTop: 6 }}>{problem.question.kind === 'word' ? '다음 문제를 풀어 보세요.' : '다음 방정식을 푸세요.'}</h3>
      <ProblemQuestion problem={problem} />
      {problem.question.note && <p className="small muted">※ {problem.question.note}</p>}

      <AnswerInputs problem={problem} values={values} setValues={updateValues} disabled={solvedCorrect} onEnter={submit} firstRef={firstRef} />
      {invalid && <p className="form-error">입력을 이해하지 못했어요. 숫자, 분수(3/2), 소수(1.5), 루트(√5) 형태로 입력해 주세요.</p>}

      {!solvedCorrect && !(result && !result.correct) && (
        <div className="btn-row">
          <Button onClick={submit} disabled={!filled || submitting} size="lg">
            ✅ 정답 확인
          </Button>
          {extraActions}
        </div>
      )}

      {result && result.correct && (
        <div className="feedback ok" role="status" aria-live="polite">
          <h3>{isReview && result.storeResult?.reviewConquered ? '🎉 오답 정복!' : '🎉 정답입니다!'}</h3>
          <p style={{ marginBottom: 6 }}>
            <strong>멋진 탐험이었어요!</strong>{' '}
            {result.storeResult?.rewardEarned > 0 ? (
              <span className="acorn-gain">🌰 +{result.storeResult.rewardEarned}</span>
            ) : (
              <span className="muted small">(이미 보상을 받은 문제예요)</span>
            )}
          </p>
          {result.storeResult?.streakMsg && <p style={{ fontWeight: 800, color: 'var(--brown-700)' }}>{result.storeResult.streakMsg}</p>}
          <p className="small muted">
            정답: <MathInline latex={answerLatex(problem)} />
          </p>
          <div className="btn-row">
            <Button onClick={onNext}>{nextLabel}</Button>
            <Button variant="outline" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? '풀이 닫기' : '📝 풀이 보기'}
            </Button>
          </div>
        </div>
      )}

      {result && !result.correct && (
        <div className="feedback bad" role="status" aria-live="polite">
          <h3>🌱 거의 다 왔어요!</h3>
          <p>어느 부분을 다시 살펴볼까요?</p>
          <div className="btn-row">
            {hintLevel < MAX_HINT_LEVEL && (
              <Button variant="secondary" onClick={() => setHintLevel((h) => Math.min(MAX_HINT_LEVEL, h + 1))}>
                💡 힌트 보기 ({hintLevel}/{MAX_HINT_LEVEL})
              </Button>
            )}
            <Button variant="outline" onClick={retry}>
              🔄 다시 풀기
            </Button>
            {canShowSolution && (
              <Button variant="ghost" onClick={() => setShowSolution(true)}>
                📝 풀이 보기
              </Button>
            )}
            <Button variant="ghost" onClick={onNext}>
              {nextLabel}
            </Button>
          </div>
        </div>
      )}

      {hintLevel > 0 && !solvedCorrect && (
        <div>
          {problem.hints.slice(0, hintLevel).map((h, i) => (
            <div key={i} className="hint-box">
              <span className="lvl">힌트 {i + 1}</span>
              <MathText text={h} />
            </div>
          ))}
          {!result && hintLevel >= MAX_HINT_LEVEL && (
            <div className="btn-row">
              <Button variant="ghost" size="sm" onClick={() => setShowSolution(true)}>
                📝 풀이 보기
              </Button>
            </div>
          )}
        </div>
      )}

      {showSolution && (
        <div className="mt-2">
          <h3>📝 풀이 과정</h3>
          <SolutionSteps steps={problem.solutionSteps} revealAll={solvedCorrect} />
          <p className="small muted mt-1">
            정답: <MathInline latex={answerLatex(problem)} />
          </p>
          {!solvedCorrect && (
            <div className="btn-row">
              <Button variant="outline" onClick={retry}>
                🔄 풀이를 보고 다시 풀기
              </Button>
              <Button variant="ghost" onClick={onNext}>
                {nextLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function answerLatex(problem) {
  if (problem.answerType === 'roots') {
    const [a, b] = problem.rootsLatex || problem.answer.display || [];
    if (problem.answer.isDouble) return `x = ${a}\\;(\\text{중근})`;
    return `x = ${a} \\;\\text{또는}\\; x = ${b}`;
  }
  if (problem.answerType === 'pair') return `x = ${problem.answer.x},\\; y = ${problem.answer.y}`;
  const disp = problem.answer.display ?? problem.answer.value;
  const latex = String(disp).includes('/') ? fracLatex(disp) : String(disp);
  return problem.question.kind === 'word' ? `${latex}` : `x = ${latex}`;
}

function fracLatex(s) {
  const m = /^(-?)(\d+)\/(\d+)$/.exec(String(s));
  if (!m) return String(s);
  return `${m[1]}\\frac{${m[2]}}{${m[3]}}`;
}
