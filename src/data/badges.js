/**
 * 성취 배지 정의
 *  check(state) 가 true 가 되면 배지를 획득한다. (state 는 학생 데이터 전체)
 */
import { getSteps } from './concepts/index.js';

function unitCorrect(state, unit) {
  const cs = state.progress?.[unit]?.conceptStats || {};
  return Object.values(cs).reduce((s, c) => s + (c.correct || 0), 0);
}

function unitAdvancedCorrect(state, unit) {
  const d = state.progress?.[unit]?.difficultyStats || {};
  return (d.advanced?.correct || 0) + (d.challenge?.correct || 0);
}

function unitLearnDone(state, unit) {
  const total = getSteps(unit).length;
  const done = (state.progress?.[unit]?.completedSteps || []).length;
  return total > 0 && done >= total;
}

export const BADGES = [
  {
    id: 'first-solve',
    emoji: '🌱',
    name: '첫 문제 해결',
    desc: '첫 번째 문제를 맞혔어요.',
    check: (s) => (s.stats?.totalCorrect || 0) >= 1,
  },
  {
    id: 'concept-explorer',
    emoji: '🧠',
    name: '개념 탐험가',
    desc: '한 단원의 개념 배우기를 모두 마쳤어요.',
    check: (s) => ['linear', 'simultaneous', 'quadratic'].some((u) => unitLearnDone(s, u)),
  },
  {
    id: 'streak-5',
    emoji: '🔥',
    name: '5연속 정답',
    desc: '한 번에 5문제를 연속으로 맞혔어요.',
    check: (s) => (s.stats?.bestStreak || 0) >= 5,
  },
  {
    id: 'streak-10',
    emoji: '🏆',
    name: '방정식 마스터',
    desc: '10문제를 연속으로 맞혔어요.',
    check: (s) => (s.stats?.bestStreak || 0) >= 10,
  },
  {
    id: 'wrong-master',
    emoji: '📕',
    name: '오답 정복자',
    desc: '오답노트의 문제 5개를 복습 완료했어요.',
    check: (s) => (s.stats?.reviewedCount || 0) >= 5,
  },
  {
    id: 'first-stamp',
    emoji: '🏅',
    name: '첫 칭찬도장',
    desc: '도토리 10개를 모아 칭찬도장을 받았어요.',
    check: (s) => (s.stats?.stamps || 0) >= 1,
  },
  {
    id: 'linear-master',
    emoji: '🌳',
    name: '일차방정식 마스터',
    desc: '일차방정식 개념을 모두 배우고 발전·도전 문제 10개를 맞혔어요.',
    check: (s) => unitLearnDone(s, 'linear') && unitAdvancedCorrect(s, 'linear') >= 10,
  },
  {
    id: 'simultaneous-master',
    emoji: '🌿',
    name: '연립방정식 마스터',
    desc: '연립방정식 개념을 모두 배우고 발전·도전 문제 10개를 맞혔어요.',
    check: (s) => unitLearnDone(s, 'simultaneous') && unitAdvancedCorrect(s, 'simultaneous') >= 10,
  },
  {
    id: 'quadratic-master',
    emoji: '🏆',
    name: '이차방정식 마스터',
    desc: '이차방정식 개념을 모두 배우고 발전·도전 문제 10개를 맞혔어요.',
    check: (s) => unitLearnDone(s, 'quadratic') && unitAdvancedCorrect(s, 'quadratic') >= 10,
  },
  {
    id: 'hundred',
    emoji: '💯',
    name: '백 문제 탐험',
    desc: '총 100문제를 풀었어요.',
    check: (s) => (s.stats?.totalSolved || 0) >= 100,
  },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/** 새로 획득한 배지 id 목록을 돌려준다 */
export function evaluateBadges(state) {
  const owned = new Set(state.badges || []);
  const gained = [];
  for (const b of BADGES) {
    if (owned.has(b.id)) continue;
    try {
      if (b.check(state)) gained.push(b.id);
    } catch {
      /* ignore */
    }
  }
  return gained;
}

void unitCorrect;
