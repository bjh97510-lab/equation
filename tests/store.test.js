import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { makeStudentId, restoreFromRemote, emptyData } from '../src/store/studentStore.jsx';
import { validateLogin } from '../src/pages/LoginPage.jsx';
import { evaluateBadges } from '../src/data/badges.js';
import { buildRecommendations } from '../src/utils/recommend.js';

describe('학생 식별 ID', () => {
  it('학교명 + 학년 + 반 + 번호 (이름 미포함)', () => {
    expect(makeStudentId({ school: '홍산중학교', grade: '2', classNo: '1', number: '5', name: '홍길동' })).toBe('홍산중학교_2_1_5');
  });
  it('공백은 제거하고 동명이인은 반/번호로 구분된다', () => {
    const a = makeStudentId({ school: ' 홍산중학교 ', grade: '2', classNo: '1', number: '5', name: '홍길동' });
    const b = makeStudentId({ school: '홍산중학교', grade: '2', classNo: '1', number: '6', name: '홍길동' });
    expect(a).toBe('홍산중학교_2_1_5');
    expect(a).not.toBe(b);
  });
});

describe('로그인 검증', () => {
  const ok = { school: '테스트중학교', grade: '2', classNo: '1', number: '1', name: '테스트학생' };
  it('모두 입력하면 통과', () => expect(validateLogin(ok)).toBeNull());
  it('빈 항목은 차단되고 안내 문구를 돌려준다', () => {
    expect(validateLogin({ ...ok, school: '' })).toBe('학교명을 입력해 주세요.');
    expect(validateLogin({ ...ok, grade: '' })).toBe('학년을 선택해 주세요.');
    expect(validateLogin({ ...ok, classNo: '' })).toBe('반을 입력해 주세요.');
    expect(validateLogin({ ...ok, number: '' })).toBe('번호를 입력해 주세요.');
    expect(validateLogin({ ...ok, name: ' ' })).toBe('이름을 입력해 주세요.');
    expect(validateLogin({ ...ok, number: 'a' })).toContain('숫자');
  });
});

describe('서버 데이터 복원', () => {
  it('Students/Progress/WrongAnswers 행으로 로컬 데이터를 만든다', () => {
    const data = restoreFromRemote({
      student: { acorns: '7', stamps: '2', totalSolved: '30', totalCorrect: '24', bestStreak: '6', badges: 'first-solve,streak-5' },
      progress: [{ unit: 'linear', concept: 'solve', completedCount: '10', correctCount: '8', stepsDone: '1' }],
      wrongAnswers: [{ problemId: 'linear-basic-add-1_2', unit: 'linear', concept: 'property', difficulty: 'basic', question: 'x + 1 = 2', studentAnswer: '2', correctAnswer: 'x = 1', wrongCount: '2', reviewStatus: 'pending', problemJson: JSON.stringify({ id: 'linear-basic-add-1_2', answerType: 'single', answer: { value: 1 } }) }],
    });
    expect(data.stats.acorns).toBe(7);
    expect(data.stats.stamps).toBe(2);
    expect(data.badges).toEqual(['first-solve', 'streak-5']);
    expect(data.progress.linear.conceptStats.solve).toEqual({ completed: 10, correct: 8 });
    expect(data.progress.linear.completedSteps.length).toBe(1);
    expect(data.wrongAnswers[0].problem.answer.value).toBe(1);
    expect(data.wrongAnswers[0].wrongCount).toBe(2);
  });
});

describe('배지 평가', () => {
  let data;
  beforeEach(() => {
    data = emptyData();
  });
  it('첫 정답 → 첫 문제 해결 배지', () => {
    data.stats.totalCorrect = 1;
    expect(evaluateBadges(data)).toContain('first-solve');
  });
  it('이미 가진 배지는 다시 주지 않는다', () => {
    data.stats.totalCorrect = 1;
    data.badges = ['first-solve'];
    expect(evaluateBadges(data)).not.toContain('first-solve');
  });
  it('5연속 → 배지', () => {
    data.stats.bestStreak = 5;
    expect(evaluateBadges(data)).toContain('streak-5');
  });
});

describe('학습 추천', () => {
  it('기록이 없으면 시작 안내', () => {
    expect(buildRecommendations(emptyData())[0]).toContain('개념 배우기');
  });
  it('취약 개념과 강점 개념을 안내한다', () => {
    const d = emptyData();
    d.stats.totalSolved = 10;
    d.progress.simultaneous = { completedSteps: [], conceptStats: { addition: { completed: 6, correct: 2 }, substitution: { completed: 5, correct: 5 } }, difficultyStats: {} };
    const recs = buildRecommendations(d).join(' ');
    expect(recs).toContain('대입법');
    expect(recs).toContain('가감법');
    expect(recs).not.toMatch(/못했|부족|실패/);
  });
});

describe('렌더링 스모크 테스트', () => {
  it('React 요소를 문자열로 렌더링할 수 있다', () => {
    const html = renderToString(React.createElement('div', null, '🌰'));
    expect(html).toContain('🌰');
  });
});
