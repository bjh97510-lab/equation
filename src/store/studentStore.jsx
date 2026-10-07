/**
 * 학생 상태 관리 (React Context + useReducer)
 *
 *  관리 상태: currentStudent, stats(acorns, stamps, streak…), progress, wrongAnswers,
 *             cards, badges, claimedRewards, recentProblemIds, daily, lastLocation
 *  - 모든 변경은 localStorage 에 즉시 저장 (새로고침 복원)
 *  - 중요 이벤트는 syncQueue 를 통해 Google Sheets 로 전송
 */
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { REWARD_CONFIG, RECENT_PROBLEM_LIMIT, TEST_ACCOUNT, UNIT_MAP } from '../config/appConfig.js';
import { applyAcorns, streakMessage } from '../utils/rewards.js';
import { todayKey, nowIso, uid } from '../utils/date.js';
import { evaluateBadges } from '../data/badges.js';
import { getSteps } from '../data/concepts/index.js';
import { conceptName } from '../engine/problemGenerator.js';
import * as storage from '../services/storageService.js';
import { enqueue, enqueueMany, startAutoSync } from '../services/syncQueue.js';
import { sheetsService } from '../services/sheetsService.js';

/* ───────────────────────── 초기 데이터 ───────────────────────── */
export function emptyData() {
  return {
    stats: { acorns: 0, stamps: 0, totalSolved: 0, totalCorrect: 0, bestStreak: 0, streak: 0, reviewedCount: 0, totalAcorns: 0 },
    progress: {},
    wrongAnswers: [],
    cards: { understood: [], review: [] },
    badges: [],
    claimedRewards: {},
    recentProblemIds: [],
    daily: {},
    lastLocation: null,
    createdAt: nowIso(),
    lastLogin: nowIso(),
  };
}

function unitProgress(data, unit) {
  return (
    data.progress[unit] || {
      completedSteps: [],
      checkCompleted: false,
      learnRewarded: false,
      checkRewarded: false,
      conceptStats: {},
      difficultyStats: {},
      lastStudied: null,
    }
  );
}

export function makeStudentId({ school, grade, classNo, number }) {
  const clean = (s) => String(s ?? '').trim().replace(/\s+/g, '');
  return `${clean(school)}_${clean(grade)}_${clean(classNo)}_${clean(number)}`;
}

/* ───────────────────────── 시트 행 변환 ───────────────────────── */
function studentRow(student, data) {
  return {
    studentId: student.studentId,
    school: student.school,
    grade: student.grade,
    class: student.classNo,
    number: student.number,
    name: student.name,
    isTest: student.school === TEST_ACCOUNT.school,
    createdAt: data.createdAt,
    lastLogin: data.lastLogin,
    acorns: data.stats.acorns,
    stamps: data.stats.stamps,
    totalSolved: data.stats.totalSolved,
    totalCorrect: data.stats.totalCorrect,
    bestStreak: data.stats.bestStreak,
    badges: (data.badges || []).join(','),
  };
}

function progressRow(student, data, unit, concept) {
  const up = unitProgress(data, unit);
  const cs = up.conceptStats[concept] || { completed: 0, correct: 0 };
  const steps = getSteps(unit);
  const stepDone = steps.filter((s) => s.concept === concept && up.completedSteps.includes(s.id)).length;
  const stepTotal = steps.filter((s) => s.concept === concept).length;
  let status = 'in-progress';
  if (stepTotal > 0 && stepDone >= stepTotal && cs.completed >= 3 && cs.correct / cs.completed >= 0.7) status = 'mastered';
  else if (stepTotal > 0 && stepDone >= stepTotal) status = 'learned';
  return {
    studentId: student.studentId,
    unit,
    concept,
    conceptName: conceptName(unit, concept),
    status,
    completedCount: cs.completed,
    correctCount: cs.correct,
    accuracy: cs.completed ? Math.round((cs.correct / cs.completed) * 100) : '',
    stepsDone: stepDone,
    stepsTotal: stepTotal,
    lastStudied: nowIso(),
  };
}

function wrongRow(student, w) {
  return {
    studentId: student.studentId,
    problemId: w.problemId,
    unit: w.unit,
    concept: w.concept,
    difficulty: w.difficulty,
    question: w.questionText,
    studentAnswer: w.studentAnswer,
    correctAnswer: w.correctAnswer,
    wrongCount: w.wrongCount,
    reviewStatus: w.reviewStatus,
    lastAttempt: w.lastAttempt,
    problemJson: w.problem ? JSON.stringify(w.problem) : '',
  };
}

/* ───────────────────────── 리듀서 ───────────────────────── */
const initialState = { student: null, data: null, booting: true, notices: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'BOOT_DONE':
      return { ...state, booting: false, student: action.student, data: action.data };
    case 'LOGIN':
      return { ...state, student: action.student, data: action.data };
    case 'LOGOUT':
      return { ...state, student: null, data: null, notices: [] };
    case 'SET_DATA':
      return { ...state, data: action.data };
    case 'PUSH_NOTICE':
      return { ...state, notices: [...state.notices, { id: uid('n'), ...action.notice }] };
    case 'DISMISS_NOTICE':
      return { ...state, notices: state.notices.filter((n) => n.id !== action.id) };
    default:
      return state;
  }
}

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dataRef = useRef(null);
  dataRef.current = state.data;
  const studentRef = useRef(null);
  studentRef.current = state.student;

  /* 부팅: 세션 복원 */
  useEffect(() => {
    const session = storage.loadSession();
    let data = null;
    if (session?.studentId) {
      data = storage.loadStudentData(session.studentId) || emptyData();
    }
    dispatch({ type: 'BOOT_DONE', student: session?.studentId ? session : null, data });
    startAutoSync();
  }, []);

  /** 데이터 저장 (로컬) + 상태 반영 */
  const commit = useCallback((data) => {
    const student = studentRef.current;
    if (student) storage.saveStudentData(student.studentId, data);
    dataRef.current = data;
    dispatch({ type: 'SET_DATA', data });
  }, []);

  const pushNotice = useCallback((notice) => dispatch({ type: 'PUSH_NOTICE', notice }), []);
  const dismissNotice = useCallback((id) => dispatch({ type: 'DISMISS_NOTICE', id }), []);

  /** 배지 평가 → 새 배지 알림 */
  const checkBadges = useCallback(
    (data) => {
      const gained = evaluateBadges(data);
      if (gained.length === 0) return data;
      const next = { ...data, badges: [...(data.badges || []), ...gained] };
      gained.forEach((id) => pushNotice({ kind: 'badge', badgeId: id }));
      return next;
    },
    [pushNotice],
  );

  /* ───── 로그인 ───── */
  const login = useCallback(
    async (form) => {
      const student = {
        studentId: makeStudentId(form),
        school: String(form.school).trim(),
        grade: String(form.grade),
        classNo: String(form.classNo).trim(),
        number: String(form.number).trim(),
        name: String(form.name).trim(),
      };
      let data = storage.loadStudentData(student.studentId);
      let isReturning = !!data;
      let source = data ? 'local' : 'new';

      // 로컬 기록이 없으면 서버(시트)에서 복원 시도
      if (!data) {
        try {
          const res = await sheetsService.fetchStudent(student.studentId);
          if (res?.found && res.student) {
            data = restoreFromRemote(res);
            isReturning = true;
            source = 'remote';
          }
        } catch {
          /* 네트워크 오류: 새 데이터로 진행 */
        }
      }
      if (!data) data = emptyData();
      data = { ...data, lastLogin: nowIso() };

      studentRef.current = student;
      storage.saveSession(student);
      storage.saveStudentData(student.studentId, data);
      dispatch({ type: 'LOGIN', student, data });
      enqueue('student', studentRow(student, data));
      return { isReturning, source, student, data };
    },
    [],
  );

  const logout = useCallback(() => {
    storage.clearSession();
    studentRef.current = null;
    dispatch({ type: 'LOGOUT' });
  }, []);

  /* ───── 위치 기억 ───── */
  const setLastLocation = useCallback(
    (unit, menu) => {
      const d = dataRef.current;
      if (!d) return;
      commit({ ...d, lastLocation: { unit, menu, at: nowIso() } });
    },
    [commit],
  );

  /* ───── 문제 출제 기록 ───── */
  const recordProblemShown = useCallback(
    (problemId) => {
      const d = dataRef.current;
      if (!d) return;
      const recent = [...(d.recentProblemIds || []), problemId].slice(-RECENT_PROBLEM_LIMIT);
      commit({ ...d, recentProblemIds: recent });
    },
    [commit],
  );

  /* ───── 도토리 지급 (내부) ───── */
  function grantAcorns(data, amount, reason, problemId, student) {
    if (amount <= 0) return { data, newStamps: 0 };
    const r = applyAcorns(data.stats.acorns, data.stats.stamps, amount);
    const stats = { ...data.stats, acorns: r.acorns, stamps: r.stamps, totalAcorns: (data.stats.totalAcorns || 0) + amount };
    const today = todayKey();
    const daily = { ...data.daily, [today]: { ...(data.daily[today] || { solved: 0, correct: 0, acorns: 0 }), acorns: (data.daily[today]?.acorns || 0) + amount } };
    const events = [
      { type: 'reward', row: { timestamp: nowIso(), studentId: student.studentId, type: 'acorn', amount, reason, problemId: problemId || '', acornsAfter: r.acorns, stampsAfter: r.stamps } },
    ];
    if (r.newStamps > 0) {
      events.push({ type: 'reward', row: { timestamp: nowIso(), studentId: student.studentId, type: 'stamp', amount: r.newStamps, reason: 'acorns-to-stamp', problemId: problemId || '', acornsAfter: r.acorns, stampsAfter: r.stamps } });
    }
    return { data: { ...data, stats, daily }, newStamps: r.newStamps, events };
  }

  /* ───── 문제 제출 ───── */
  const submitAnswer = useCallback(
    ({ problem, inputs, correct, hintLevel = 0, attemptNumber = 1, studySeconds = 0, isReview = false }) => {
      const d0 = dataRef.current;
      const student = studentRef.current;
      if (!d0 || !student) return null;
      let data = { ...d0, stats: { ...d0.stats }, progress: { ...d0.progress }, daily: { ...d0.daily }, claimedRewards: { ...d0.claimedRewards }, wrongAnswers: [...d0.wrongAnswers] };
      const events = [];
      const today = todayKey();
      const dayStat = { ...(data.daily[today] || { solved: 0, correct: 0, acorns: 0 }) };

      // 첫 시도에서만 전체 통계/정답률에 반영 (재시도는 기록만)
      const countsForStats = attemptNumber === 1 && !isReview;
      if (countsForStats) {
        data.stats.totalSolved += 1;
        dayStat.solved += 1;
        if (correct) {
          data.stats.totalCorrect += 1;
          dayStat.correct += 1;
        }
      }
      data.daily[today] = dayStat;

      // 연속 정답
      let streakMsg = null;
      if (!isReview) {
        if (correct) {
          data.stats.streak += 1;
          if (data.stats.streak > data.stats.bestStreak) data.stats.bestStreak = data.stats.streak;
          streakMsg = streakMessage(data.stats.streak);
        } else {
          data.stats.streak = 0;
        }
      }

      // 개념/난이도별 통계 (첫 시도만)
      const up = { ...unitProgress(data, problem.unit) };
      if (countsForStats) {
        const cs = { ...(up.conceptStats[problem.concept] || { completed: 0, correct: 0 }) };
        cs.completed += 1;
        if (correct) cs.correct += 1;
        up.conceptStats = { ...up.conceptStats, [problem.concept]: cs };
        const ds = { ...(up.difficultyStats[problem.difficulty] || { completed: 0, correct: 0 }) };
        ds.completed += 1;
        if (correct) ds.correct += 1;
        up.difficultyStats = { ...up.difficultyStats, [problem.difficulty]: ds };
      }
      up.lastStudied = nowIso();
      data.progress[problem.unit] = up;

      // 보상 (문제당 1회만)
      let rewardEarned = 0;
      let newStamps = 0;
      let reviewConquered = false;
      const rewardKey = isReview ? `review:${problem.id}` : problem.id;
      if (correct && !data.claimedRewards[rewardKey]) {
        rewardEarned = isReview ? REWARD_CONFIG.wrongReview : problem.reward;
        data.claimedRewards[rewardKey] = nowIso();
        const g = grantAcorns(data, rewardEarned, isReview ? 'wrong-review' : `correct-${problem.difficulty}`, problem.id, student);
        data = g.data;
        newStamps = g.newStamps;
        events.push(...(g.events || []));
      }

      // 오답노트
      const studentAnswer = inputs.filter((s) => s != null && String(s).trim() !== '').join(', ');
      const idx = data.wrongAnswers.findIndex((w) => w.problemId === problem.id);
      if (!correct) {
        if (idx >= 0) {
          const w = { ...data.wrongAnswers[idx], wrongCount: data.wrongAnswers[idx].wrongCount + 1, studentAnswer, lastAttempt: nowIso() };
          if (!isReview) w.reviewStatus = 'pending';
          data.wrongAnswers[idx] = w;
        } else {
          data.wrongAnswers.push({
            problemId: problem.id,
            date: nowIso(),
            unit: problem.unit,
            concept: problem.concept,
            difficulty: problem.difficulty,
            problem, // 당시 문제 내용 전체 (알고리즘이 바뀌어도 기록 유지)
            questionText: problem.question.kind === 'word' ? problem.question.text : problem.question.latex,
            studentAnswer,
            correctAnswer: problem.answerDisplay,
            wrongCount: 1,
            reviewStatus: 'pending',
            lastAttempt: nowIso(),
          });
        }
        events.push({ type: 'wrong', row: wrongRow(student, data.wrongAnswers[idx >= 0 ? idx : data.wrongAnswers.length - 1]) });
      } else if (isReview && idx >= 0 && data.wrongAnswers[idx].reviewStatus !== 'reviewed') {
        data.wrongAnswers[idx] = { ...data.wrongAnswers[idx], reviewStatus: 'reviewed', reviewedAt: nowIso(), lastAttempt: nowIso() };
        data.stats.reviewedCount += 1;
        reviewConquered = true;
        events.push({ type: 'wrong', row: wrongRow(student, data.wrongAnswers[idx]) });
      }

      // 학습 로그
      events.push({
        type: 'log',
        row: {
          logId: uid('log'),
          timestamp: nowIso(),
          studentId: student.studentId,
          unit: problem.unit,
          concept: problem.concept,
          difficulty: problem.difficulty,
          problemId: problem.id,
          question: problem.question.kind === 'word' ? problem.question.text : problem.question.latex,
          studentAnswer,
          correctAnswer: problem.answerDisplay,
          isCorrect: correct,
          attemptNumber,
          hintLevel,
          rewardEarned,
          studySeconds,
          isReview,
        },
      });
      events.push({ type: 'progress', row: progressRow(student, data, problem.unit, problem.concept) });

      // 배지
      data = checkBadges(data);
      events.push({ type: 'student', row: studentRow(student, data) });

      commit(data);
      enqueueMany(events);
      if (newStamps > 0) pushNotice({ kind: 'stamp', count: newStamps });
      return { correct, rewardEarned, newStamps, streak: data.stats.streak, streakMsg, reviewConquered, acorns: data.stats.acorns, stamps: data.stats.stamps };
    },
    [commit, checkBadges, pushNotice],
  );

  /* ───── 개념 STEP 완료 ───── */
  const completeStep = useCallback(
    (unit, stepId) => {
      const d0 = dataRef.current;
      const student = studentRef.current;
      if (!d0 || !student) return null;
      const up = { ...unitProgress(d0, unit) };
      if (up.completedSteps.includes(stepId)) return { already: true };
      up.completedSteps = [...up.completedSteps, stepId];
      up.lastStudied = nowIso();
      let data = { ...d0, progress: { ...d0.progress, [unit]: up } };
      const step = getSteps(unit).find((s) => s.id === stepId);
      const events = [{ type: 'progress', row: progressRow(student, data, unit, step?.concept || stepId) }];
      let rewardEarned = 0;
      let newStamps = 0;
      const all = getSteps(unit).length;
      if (up.completedSteps.length >= all && !up.learnRewarded) {
        up.learnRewarded = true;
        rewardEarned = REWARD_CONFIG.conceptLearnComplete;
        const g = grantAcorns(data, rewardEarned, `concept-learn-complete-${unit}`, '', student);
        data = g.data;
        newStamps = g.newStamps;
        events.push(...(g.events || []));
      }
      data = checkBadges(data);
      events.push({ type: 'student', row: studentRow(student, data) });
      commit(data);
      enqueueMany(events);
      if (newStamps > 0) pushNotice({ kind: 'stamp', count: newStamps });
      return { rewardEarned, newStamps, completedAll: up.completedSteps.length >= all };
    },
    [commit, checkBadges, pushNotice],
  );

  /* ───── 개념 확인 완료 ───── */
  const completeConceptCheck = useCallback(
    (unit) => {
      const d0 = dataRef.current;
      const student = studentRef.current;
      if (!d0 || !student) return null;
      const up = { ...unitProgress(d0, unit), checkCompleted: true, lastStudied: nowIso() };
      let data = { ...d0, progress: { ...d0.progress, [unit]: up } };
      let rewardEarned = 0;
      let newStamps = 0;
      const events = [];
      if (!up.checkRewarded) {
        up.checkRewarded = true;
        rewardEarned = REWARD_CONFIG.conceptCheckComplete;
        const g = grantAcorns(data, rewardEarned, `concept-check-complete-${unit}`, '', student);
        data = g.data;
        newStamps = g.newStamps;
        events.push(...(g.events || []));
      }
      data = checkBadges(data);
      events.push({ type: 'student', row: studentRow(student, data) });
      commit(data);
      enqueueMany(events);
      if (newStamps > 0) pushNotice({ kind: 'stamp', count: newStamps });
      return { rewardEarned, newStamps };
    },
    [commit, checkBadges, pushNotice],
  );

  /* ───── 카드 학습 기록 ───── */
  const markCard = useCallback(
    (cardId, understood) => {
      const d = dataRef.current;
      if (!d) return;
      const understoodSet = new Set(d.cards.understood);
      const reviewSet = new Set(d.cards.review);
      if (understood) {
        understoodSet.add(cardId);
        reviewSet.delete(cardId);
      } else {
        reviewSet.add(cardId);
        understoodSet.delete(cardId);
      }
      commit({ ...d, cards: { understood: [...understoodSet], review: [...reviewSet] } });
    },
    [commit],
  );

  /* ───── 파생 값 ───── */
  const getUnitProgressPercent = useCallback((unit) => {
    const d = dataRef.current;
    if (!d) return 0;
    const total = getSteps(unit).length;
    const done = unitProgress(d, unit).completedSteps.length;
    return total ? Math.round((done / total) * 100) : 0;
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      submitAnswer,
      completeStep,
      completeConceptCheck,
      markCard,
      recordProblemShown,
      setLastLocation,
      getUnitProgressPercent,
      pushNotice,
      dismissNotice,
      unitProgress: (unit) => (state.data ? unitProgress(state.data, unit) : unitProgress(emptyData(), unit)),
    }),
    [state, login, logout, submitAnswer, completeStep, completeConceptCheck, markCard, recordProblemShown, setLastLocation, getUnitProgressPercent, pushNotice, dismissNotice],
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent 는 StudentProvider 안에서 사용해야 합니다.');
  return ctx;
}

/* ───── 서버 데이터 → 로컬 데이터 복원 ───── */
export function restoreFromRemote(res) {
  const base = emptyData();
  const s = res.student || {};
  base.createdAt = s.createdAt || base.createdAt;
  base.stats = {
    ...base.stats,
    acorns: Number(s.acorns) || 0,
    stamps: Number(s.stamps) || 0,
    totalSolved: Number(s.totalSolved) || 0,
    totalCorrect: Number(s.totalCorrect) || 0,
    bestStreak: Number(s.bestStreak) || 0,
  };
  if (s.badges) base.badges = String(s.badges).split(',').filter(Boolean);
  for (const p of res.progress || []) {
    const up = base.progress[p.unit] || { completedSteps: [], checkCompleted: false, learnRewarded: false, checkRewarded: false, conceptStats: {}, difficultyStats: {}, lastStudied: null };
    up.conceptStats[p.concept] = { completed: Number(p.completedCount) || 0, correct: Number(p.correctCount) || 0 };
    // 서버에는 STEP 단위가 아니라 개념 단위 완료가 저장되므로, 완료된 개념의 STEP 을 복원
    if (Number(p.stepsDone) > 0) {
      const steps = getSteps(p.unit).filter((st) => st.concept === p.concept).slice(0, Number(p.stepsDone));
      for (const st of steps) if (!up.completedSteps.includes(st.id)) up.completedSteps.push(st.id);
    }
    up.lastStudied = p.lastStudied || up.lastStudied;
    base.progress[p.unit] = up;
  }
  for (const w of res.wrongAnswers || []) {
    base.wrongAnswers.push({
      problemId: w.problemId,
      date: w.lastAttempt || nowIso(),
      unit: w.unit,
      concept: w.concept,
      difficulty: w.difficulty,
      problem: safeParse(w.problemJson), // 시트에 저장된 문제 전체 (없으면 null)
      questionText: w.question,
      studentAnswer: w.studentAnswer,
      correctAnswer: w.correctAnswer,
      wrongCount: Number(w.wrongCount) || 1,
      reviewStatus: w.reviewStatus || 'pending',
      lastAttempt: w.lastAttempt,
    });
  }
  base.stats.reviewedCount = base.wrongAnswers.filter((w) => w.reviewStatus === 'reviewed').length;
  return base;
}

function safeParse(s) {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

void UNIT_MAP;
