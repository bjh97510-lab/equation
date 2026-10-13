import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MathInline, MathText } from '../common/MathText.jsx';
import { Button, Chip, ProgressBar } from '../common/UI.jsx';
import { ProblemQuestion, SolutionSteps, answerLatex } from './ProblemSolver.jsx';
import { checkSingle, judgeAnswer, evaluateAnswer } from '../../engine/answerNormalizer.js';
import { planGuided, estimateTotalSteps } from '../../engine/guided.js';
import { conceptName } from '../../engine/problemGenerator.js';
import { DIFFICULTY_MAP, UNIT_MAP, MAX_HINT_LEVEL } from '../../config/appConfig.js';

const LABELS = ['①', '②', '③', '④'];
/** 같은 단계에서 이만큼 틀리면 "답 채워 보기" 버튼이 나타난다 */
const REVEAL_AFTER = 2;

/* ───────────── 선택형 단계 ───────────── */
function ChoiceStep({ step, onDecide, onMistake }) {
  const [picked, setPicked] = useState(null);
  const [wrongs, setWrongs] = useState([]);
  const [done, setDone] = useState(false);

  const choose = (opt) => {
    if (done) return;
    if (step.free || opt.correct) {
      setPicked(opt.id);
      setDone(true);
      onDecide(opt.id, opt.feedback);
    } else {
      setPicked(opt.id);
      setWrongs((w) => (w.includes(opt.id) ? w : [...w, opt.id]));
      onMistake();
    }
  };
  const pickedOpt = step.options.find((o) => o.id === picked);

  return (
    <div>
      <p className="block-text">
        <MathText text={step.prompt} />
      </p>
      <div className="choice-list">
        {step.options.map((o, i) => {
          const cls = done && o.id === picked ? 'correct' : wrongs.includes(o.id) ? 'wrong' : '';
          return (
            <button key={o.id} type="button" className={`choice-btn ${cls}`} onClick={() => choose(o)} disabled={done || wrongs.includes(o.id)}>
              <span className="mark">{LABELS[i]}</span>
              <MathText text={o.label} />
              {done && o.id === picked && <span style={{ marginLeft: 'auto' }}>✅</span>}
              {wrongs.includes(o.id) && <span style={{ marginLeft: 'auto' }}>✖</span>}
            </button>
          );
        })}
      </div>
      {!done && pickedOpt && wrongs.includes(pickedOpt.id) && (
        <div className="hint-box">
          <span className="lvl">🌱 다시 생각해 볼까요?</span> <MathText text={pickedOpt.feedback} />
        </div>
      )}
      {done && pickedOpt && (
        <div className="hint-box">
          <span className="lvl">✅</span> <MathText text={pickedOpt.feedback} />
        </div>
      )}
    </div>
  );
}

/* ───────────── 빈칸 채우기 단계 ───────────── */
function judgeLine(line, inputs) {
  const perBlank = line.answers.map((ans, i) => checkSingle(inputs[i], ans).correct);
  if (perBlank.every(Boolean)) return { ok: true, perBlank, alt: false };
  const vals = inputs.map(evaluateAnswer);
  for (const alt of line.alt || []) {
    if (alt.every((a, i) => checkSingle(inputs[i], a).correct)) return { ok: true, perBlank: perBlank.map(() => true), alt: true };
  }
  const invalid = vals.some((v, i) => v === null && String(inputs[i]).trim() !== '');
  return { ok: false, perBlank, alt: false, invalid };
}

function BlanksStep({ step, onDone, onMistake, onReveal }) {
  const [values, setValues] = useState(() => step.lines.map((l) => l.answers.map(() => '')));
  const [status, setStatus] = useState(() => step.lines.map((l) => l.answers.map(() => null))); // null|'ok'|'bad'
  const [lineOk, setLineOk] = useState(() => step.lines.map(() => false));
  const [altNote, setAltNote] = useState(() => step.lines.map(() => false));
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [invalidMsg, setInvalidMsg] = useState(false);
  const firstRef = useRef(null);
  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 50);
  }, []);

  const parts = useMemo(() => step.lines.map((l) => l.latex.split('\\square')), [step]);
  const allFilled = values.every((row, li) => lineOk[li] || row.every((v) => String(v).trim() !== ''));

  const setVal = (li, bi, v) => {
    setValues((prev) => prev.map((row, i) => (i === li ? row.map((x, j) => (j === bi ? v : x)) : row)));
    setStatus((prev) => prev.map((row, i) => (i === li ? row.map((s, j) => (j === bi && s === 'bad' ? null : s)) : row)));
  };

  const check = () => {
    if (done || !allFilled) return;
    const nextStatus = status.map((r) => [...r]);
    const nextOk = [...lineOk];
    const nextAlt = [...altNote];
    let anyInvalid = false;
    step.lines.forEach((line, li) => {
      if (lineOk[li]) return;
      const res = judgeLine(line, values[li]);
      if (res.invalid) anyInvalid = true;
      nextOk[li] = res.ok;
      nextAlt[li] = res.alt;
      nextStatus[li] = res.perBlank.map((ok) => (ok ? 'ok' : 'bad'));
    });
    setInvalidMsg(anyInvalid);
    setStatus(nextStatus);
    setLineOk(nextOk);
    setAltNote(nextAlt);
    if (nextOk.every(Boolean)) {
      setDone(true);
      onDone();
    } else {
      setTries((t) => t + 1);
      onMistake();
    }
  };

  const reveal = () => {
    setValues(step.lines.map((l) => l.answers.map((a) => String(a))));
    setStatus(step.lines.map((l) => l.answers.map(() => 'ok')));
    setLineOk(step.lines.map(() => true));
    setRevealed(true);
    setDone(true);
    onReveal();
    onDone();
  };

  return (
    <div>
      <p className="block-text">
        <MathText text={step.prompt} />
      </p>
      {step.lines.map((line, li) => (
        <div key={li} className={`blank-line guided-line ${lineOk[li] ? 'done' : ''}`}>
          {line.label && <span className="line-label">{line.label}</span>}
          {parts[li].map((frag, bi) => (
            <React.Fragment key={bi}>
              {frag.trim() && <MathInline latex={frag} />}
              {bi < line.answers.length && (
                <input
                  ref={li === 0 && bi === 0 ? firstRef : undefined}
                  className={`input blank ${status[li][bi] === 'ok' ? 'ok' : status[li][bi] === 'bad' ? 'bad' : ''}`}
                  value={values[li][bi]}
                  inputMode="text"
                  autoComplete="off"
                  aria-label={`${step.title} 빈칸 ${li + 1}-${bi + 1}`}
                  disabled={lineOk[li] || done}
                  onChange={(e) => setVal(li, bi, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && check()}
                />
              )}
            </React.Fragment>
          ))}
          {lineOk[li] && <span className="status ok">{altNote[li] ? '✅ 순서를 바꿔 계산했네요. 맞아요!' : '✅'}</span>}
          {!lineOk[li] && status[li].some((s) => s === 'bad') && (
            <span className="status bad">
              🌱 다시 확인해 볼까요?{' '}
              {line.hint && (
                <span className="muted" style={{ fontWeight: 500 }}>
                  💡 <MathText text={line.hint} />
                </span>
              )}
            </span>
          )}
        </div>
      ))}
      {invalidMsg && <p className="form-error">입력을 이해하지 못했어요. 숫자, 분수(3/2), 소수(1.5) 형태로 입력해 주세요.</p>}
      {!done && (
        <div className="btn-row">
          <Button onClick={check} disabled={!allFilled}>
            ✅ 확인
          </Button>
          {tries >= REVEAL_AFTER && (
            <Button variant="ghost" onClick={reveal}>
              🙋 답 채워 보기
            </Button>
          )}
        </div>
      )}
      {done && step.explain && (
        <div className="hint-box">
          <span className="lvl">{revealed ? '📝 함께 채웠어요' : '✅ 잘했어요!'}</span> <MathText text={step.explain} />
        </div>
      )}
    </div>
  );
}

/* ───────────── 최종 정답 단계 ───────────── */
function FinalStep({ step, problem, onSubmit, result }) {
  const [values, setValues] = useState(['', '']);
  const [invalid, setInvalid] = useState(false);
  const firstRef = useRef(null);
  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 50);
  }, []);
  const isPair = problem.answerType === 'pair';
  const isRoots = problem.answerType === 'roots';
  const needed = isPair || isRoots ? 2 : 1;
  // 두 근은 중근일 때 한 칸만 채워도 된다
  const filled = isRoots ? values.some((v) => String(v).trim() !== '') : values.slice(0, needed).every((v) => String(v).trim() !== '');
  const solved = !!result?.correct;

  const submit = () => {
    if (!filled || solved) return;
    const judged = judgeAnswer(problem, values.slice(0, needed));
    if (judged.reason === 'invalid' || judged.x?.reason === 'invalid' || judged.y?.reason === 'invalid') {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onSubmit(values.slice(0, needed), judged.correct);
  };

  const label1 = isPair ? 'x =' : isRoots ? 'x₁ =' : problem.question.kind === 'word' ? '답 =' : 'x =';
  const aria1 = isPair ? '최종 x 값' : isRoots ? '최종 첫 번째 근' : '최종 답';
  const label2 = isPair ? 'y =' : 'x₂ =';
  const aria2 = isPair ? '최종 y 값' : '최종 두 번째 근';

  return (
    <div>
      <p className="block-text">{step.prompt}</p>
      <div className="answer-row">
        <span className="lbl">{label1}</span>
        <input ref={firstRef} className="input answer" aria-label={aria1} value={values[0]} disabled={solved} autoComplete="off" onChange={(e) => setValues([e.target.value, values[1]])} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {needed === 2 && (
          <>
            <span className="lbl">{label2}</span>
            <input className="input answer" aria-label={aria2} value={values[1]} disabled={solved} autoComplete="off" onChange={(e) => setValues([values[0], e.target.value])} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </>
        )}
      </div>
      {isRoots && <p className="small muted">두 근의 순서는 상관없어요. 중근이면 한 칸만 채워도 돼요. √ 는 "루트2" 또는 "sqrt(2)" 로 입력할 수 있어요.</p>}
      {invalid && <p className="form-error">입력을 이해하지 못했어요. 숫자, 분수(3/2), 소수(1.5), 루트(√5) 형태로 입력해 주세요.</p>}
      {!solved && (
        <div className="btn-row">
          <Button onClick={submit} disabled={!filled} size="lg">
            ✅ 정답 확인
          </Button>
        </div>
      )}
      {result && !result.correct && (
        <div className="feedback bad" role="status" aria-live="polite">
          <h3>🌱 거의 다 왔어요!</h3>
          <p>{isPair ? '풀이 노트에서 구한 x, y 값을 다시 확인해 보세요. 두 값의 순서가 바뀌지 않았는지도 살펴보세요.' : isRoots ? '풀이 노트에서 구한 두 근을 다시 확인해 보세요. 부호와 근호 표기를 살펴보세요.' : '풀이 노트에서 구한 값과 문제가 묻는 것(단위, 조건)을 다시 확인해 보세요.'}</p>
        </div>
      )}
    </div>
  );
}

/**
 * 단계별 풀이 컴포넌트
 *  props:
 *   problem   guided 메타데이터가 있는 연립방정식 문제
 *   onSubmit(inputs, {correct, attemptNumber, hintLevel, studySeconds}) → 스토어 결과
 *   onNext()  다음 문제
 */
export default function GuidedSolver({ problem, onSubmit, onNext, nextLabel = '다음 문제 ▶' }) {
  const [decisions, setDecisions] = useState({});
  const [idx, setIdx] = useState(0);
  const [doneIdx, setDoneIdx] = useState(-1); // 완료된 마지막 단계 번호
  const [mistakes, setMistakes] = useState(0);
  const [reveals, setReveals] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    setDecisions({});
    setIdx(0);
    setDoneIdx(-1);
    setMistakes(0);
    setReveals(0);
    setAttempt(0);
    setResult(null);
    setShowSolution(false);
    startRef.current = Date.now();
  }, [problem?.id]);

  const plan = useMemo(() => planGuided(problem, decisions), [problem, decisions]);
  const total = useMemo(() => Math.max(plan.steps.length, estimateTotalSteps(problem, decisions)), [problem, decisions, plan]);
  const steps = plan.steps;
  const step = steps[Math.min(idx, steps.length - 1)];
  const unit = UNIT_MAP[problem.unit];
  const diff = DIFFICULTY_MAP[problem.difficulty];
  const pct = Math.round(((doneIdx + 1) / total) * 100);
  const finished = !!result?.correct;

  const decide = (key, value) => {
    setDecisions((d) => ({ ...d, [key]: value }));
    setDoneIdx((d) => Math.max(d, idx));
  };
  const markDone = () => setDoneIdx((d) => Math.max(d, idx));
  const goNext = () => {
    setIdx((i) => i + 1);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const submitFinal = (values, correct) => {
    const attemptNumber = attempt + 1;
    setAttempt(attemptNumber);
    const studySeconds = Math.round((Date.now() - startRef.current) / 1000);
    const hintLevel = Math.min(MAX_HINT_LEVEL, reveals + Math.floor(mistakes / 2));
    const storeResult = onSubmit?.(values, { correct, attemptNumber, hintLevel, studySeconds, guided: true });
    setResult({ correct, storeResult });
    if (correct) markDone();
  };

  const completed = steps.slice(0, doneIdx + 1).filter((s) => s.kind === 'blanks');

  return (
    <div className="card guided">
      <div className="problem-meta">
        <Chip>{unit?.emoji} {unit?.name}</Chip>
        <Chip tone="brown">{conceptName(problem.unit, problem.concept)}</Chip>
        <Chip tone="gold">
          {diff?.emoji} {diff?.label} · 🌰 {problem.reward}
        </Chip>
        <Chip>🪜 단계별 풀이</Chip>
      </div>
      <h3 style={{ marginTop: 6 }}>{problem.question.kind === 'word' ? '다음 문제를 한 단계씩 풀어 보세요.' : '다음 방정식을 한 단계씩 풀어 보세요.'}</h3>
      <ProblemQuestion problem={problem} />
      {problem.question.kind === 'system' && (
        <p className="small muted" style={{ marginTop: -4 }}>
          위 식을 ① (첫째 식), ② (둘째 식) 라고 부를게요.
        </p>
      )}

      <div className="step-indicator" style={{ marginTop: 12 }}>
        <span className="label">
          🪜 STEP {Math.min(idx + 1, total)} / {total}
        </span>
        <ProgressBar value={pct} right={`${pct}%`} />
      </div>

      {completed.length > 0 && (
        <details className="guided-notes" open>
          <summary>📓 풀이 노트 (지금까지 완성한 식)</summary>
          <ol>
            {completed.map((s) => (
              <li key={s.key}>
                <span className="t">{s.title}</span>
                <div className="lines">
                  {s.summary.map((l, i) => (
                    <div key={i}>
                      {l.label && <span className="line-label">{l.label}</span>} <MathInline latex={l.latex} />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="card soft guided-step" key={`${problem.id}-${step.key}`}>
        <div className="guided-step-title">
          <span className="num">{idx + 1}</span>
          <h3>{step.title}</h3>
        </div>
        {step.kind === 'choice' && <ChoiceStep step={step} onDecide={(id) => decide(step.key, id)} onMistake={() => setMistakes((m) => m + 1)} />}
        {step.kind === 'blanks' && <BlanksStep step={step} onDone={markDone} onMistake={() => setMistakes((m) => m + 1)} onReveal={() => setReveals((r) => r + 1)} />}
        {step.kind === 'final' && <FinalStep step={step} problem={problem} onSubmit={submitFinal} result={result} />}

        {step.kind !== 'final' && doneIdx >= idx && (
          <div className="btn-row">
            <Button onClick={goNext} size="lg">
              다음 단계 ▶
            </Button>
          </div>
        )}
      </div>

      {finished && (
        <div className="feedback ok" role="status" aria-live="polite">
          <h3>🎉 정답입니다! 단계별 풀이 완료!</h3>
          <p style={{ marginBottom: 6 }}>
            <strong>차근차근 끝까지 해냈어요!</strong>{' '}
            {result.storeResult?.rewardEarned > 0 ? <span className="acorn-gain">🌰 +{result.storeResult.rewardEarned}</span> : <span className="muted small">(이미 보상을 받은 문제예요)</span>}
          </p>
          {result.storeResult?.streakMsg && <p style={{ fontWeight: 800, color: 'var(--brown-700)' }}>{result.storeResult.streakMsg}</p>}
          <p className="small muted">
            정답: <MathInline latex={answerLatex(problem)} />
            {problem.question.kind === 'word' && problem.answerDisplay ? ` (${problem.answerDisplay})` : ''} · 틀린 횟수 {mistakes}회
          </p>
          <div className="btn-row">
            <Button onClick={onNext}>{nextLabel}</Button>
            <Button variant="outline" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? '풀이 닫기' : '📝 전체 풀이 보기'}
            </Button>
          </div>
          {showSolution && (
            <div className="mt-2">
              <SolutionSteps steps={problem.solutionSteps} revealAll />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
