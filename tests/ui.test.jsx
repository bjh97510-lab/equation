// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, within, configure } from '@testing-library/react';
import App from '../src/App.jsx';

// 느린 환경(CI, 병렬 실행)에서도 안정적으로 동작하도록 비동기 대기 시간을 늘린다
configure({ asyncUtilTimeout: 5000 });
import * as storage from '../src/services/storageService.js';
import { mockSheets } from '../src/services/mockSheets.js';

async function loginAs({ school = '테스트중학교', grade = '2', classNo = '1', number = '1', name = '테스트학생' } = {}) {
  fireEvent.change(screen.getByLabelText('학교명'), { target: { value: school } });
  fireEvent.change(screen.getByLabelText('학년'), { target: { value: grade } });
  fireEvent.change(screen.getByLabelText('반'), { target: { value: classNo } });
  fireEvent.change(screen.getByLabelText('번호'), { target: { value: number } });
  fireEvent.change(screen.getByLabelText('이름'), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: /탐험 시작하기/ }));
  await waitFor(() => expect(screen.getByText(/학생의 방정식 탐험/)).toBeTruthy(), { timeout: 4000 });
}

describe('전체 학습 흐름 (UI)', () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    window.location.hash = '#/';
    window.scrollTo = () => {};
    window.confirm = () => true;
    mockSheets.reset();
  });

  it('빈칸 로그인 차단 → 신규 로그인 → 홈 표시', async () => {
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    fireEvent.click(screen.getByRole('button', { name: /탐험 시작하기/ }));
    expect(screen.getByRole('alert').textContent).toContain('학교명을 입력해 주세요.');
    fireEvent.change(screen.getByLabelText('학교명'), { target: { value: '테스트중학교' } });
    fireEvent.click(screen.getByRole('button', { name: /탐험 시작하기/ }));
    expect(screen.getByRole('alert').textContent).toContain('학년을 선택해 주세요.');
    await loginAs();
    expect(storage.loadSession().studentId).toBe('테스트중학교_2_1_1');
    expect(screen.getAllByText(/일차방정식/).length).toBeGreaterThan(0);
  });

  it('문제 풀기: 정답 → 도토리 지급, 같은 문제 재확인 시 중복 지급 없음, 오답 → 힌트 → 오답노트', async () => {
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    await loginAs();

    // 단원 → 문제 풀기 → 기초
    window.location.hash = '#/unit/linear/problems?difficulty=basic';
    const input = await screen.findByLabelText('답', {}, { timeout: 4000 });

    // 현재 문제의 정답을 로컬 데이터에서 알아낼 수 없으므로, 틀린 답을 먼저 제출
    fireEvent.change(input, { target: { value: '99999' } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    await screen.findByText(/거의 다 왔어요/);
    fireEvent.click(screen.getByRole('button', { name: /힌트 보기/ }));
    expect(screen.getByText(/힌트 1/)).toBeTruthy();

    // 오답노트에 저장되었는지
    const data = storage.loadStudentData('테스트중학교_2_1_1');
    expect(data.wrongAnswers.length).toBe(1);
    expect(data.stats.totalSolved).toBe(1);
    expect(data.stats.totalCorrect).toBe(0);
    const problem = data.wrongAnswers[0].problem;

    // 다시 풀기 → 정답 입력
    fireEvent.click(screen.getByRole('button', { name: /다시 풀기/ }));
    fireEvent.change(screen.getByLabelText('답'), { target: { value: problem.answer.display } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    await screen.findByText(/정답입니다/);
    const after = storage.loadStudentData('테스트중학교_2_1_1');
    expect(after.stats.acorns).toBe(1); // 기초 1개
    expect(after.claimedRewards[problem.id]).toBeTruthy();
    // 두 번째 시도는 통계(totalSolved)에 중복 반영되지 않음
    expect(after.stats.totalSolved).toBe(1);

    // 오답노트 화면에서 다시 풀기 → 오답 정복
    window.location.hash = '#/wrong';
    await screen.findByText(/오답노트/);
    fireEvent.click(await screen.findByRole('button', { name: /다시 풀기/ }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('답'), { target: { value: problem.answer.display } });
    fireEvent.click(within(dialog).getByRole('button', { name: /정답 확인/ }));
    await within(dialog).findByText(/오답 정복/);
    const reviewed = storage.loadStudentData('테스트중학교_2_1_1');
    expect(reviewed.wrongAnswers[0].reviewStatus).toBe('reviewed');
    expect(reviewed.stats.reviewedCount).toBe(1);
    expect(reviewed.stats.acorns).toBe(2); // 복습 보너스 1
  });

  it('새로고침 후 세션이 복원되고, 로그아웃하면 로그인 화면으로 돌아간다', async () => {
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    await loginAs();
    cleanup();
    // 새로고침 시뮬레이션: 다시 렌더
    render(<App />);
    await screen.findByText(/학생의 방정식 탐험/);
    fireEvent.click(screen.getAllByRole('button', { name: '로그아웃' })[0]);
    await screen.findByText(/탐험 시작하기/);
    expect(storage.loadSession()).toBeNull();
  });

  it('기존 학생 재로그인 시 기록을 불러온다 (다시 만났네요)', async () => {
    storage.saveStudentData('테스트중학교_2_1_1', { ...JSON.parse(JSON.stringify((await import('../src/store/studentStore.jsx')).emptyData())), stats: { acorns: 7, stamps: 3, totalSolved: 10, totalCorrect: 8, bestStreak: 4, streak: 0, reviewedCount: 0, totalAcorns: 37 } });
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    fireEvent.change(screen.getByLabelText('학교명'), { target: { value: '테스트중학교' } });
    fireEvent.change(screen.getByLabelText('학년'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('반'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('번호'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '테스트학생' } });
    fireEvent.click(screen.getByRole('button', { name: /탐험 시작하기/ }));
    await screen.findByText(/다시 만났네요, 테스트학생 학생!/);
    expect(screen.getByText(/도토리 7/)).toBeTruthy();
  });

  it('개념 배우기: STEP 진행 표시와 다음 버튼 활성화 규칙', async () => {
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    await loginAs();
    window.location.hash = '#/unit/linear/learn';
    await screen.findByText(/STEP 1 \/ 9/);
    const next = screen.getByRole('button', { name: /다음 ▶/ });
    expect(next.disabled).toBe(true); // 선택형 활동을 끝내야 함
    // 정답 보기(②) 클릭
    fireEvent.click(screen.getByRole('button', { name: /②/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /다음 ▶/ }).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: /다음 ▶/ }));
    await screen.findByText(/STEP 2 \/ 9/);
    const d = storage.loadStudentData('테스트중학교_2_1_1');
    expect(d.progress.linear.completedSteps).toEqual(['l1']);
  });

  it('이차방정식: 두 근을 순서 바꿔 입력해도 정답', async () => {
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    await loginAs();
    window.location.hash = '#/unit/quadratic/problems?difficulty=standard';
    const x1 = await screen.findByLabelText('첫 번째 근', {}, { timeout: 4000 });
    // 틀린 답으로 문제를 오답노트에 저장해 정답을 얻는다
    fireEvent.change(x1, { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('두 번째 근'), { target: { value: '54321' } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    await screen.findByText(/거의 다 왔어요/);
    const p = storage.loadStudentData('테스트중학교_2_1_1').wrongAnswers[0].problem;
    fireEvent.click(screen.getByRole('button', { name: /다시 풀기/ }));
    const [a, b] = p.answer.display;
    fireEvent.change(screen.getByLabelText('첫 번째 근'), { target: { value: b } });
    fireEvent.change(screen.getByLabelText('두 번째 근'), { target: { value: a } });
    fireEvent.click(screen.getByRole('button', { name: /정답 확인/ }));
    await screen.findByText(/정답입니다/);
  });

  it('교사용 대시보드(Mock) 가 학생 목록을 보여준다', async () => {
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    await loginAs();
    await waitFor(async () => expect((await mockSheets.fetchStudent('테스트중학교_2_1_1')).found).toBe(true), { timeout: 3000 });
    cleanup();
    window.location.hash = '#/teacher';
    render(<App />);
    await screen.findByText(/학생 목록/, {}, { timeout: 4000 });
    await screen.findByText('테스트학생');
    void vi;
  });

  it('단계별 풀이: 단원 메뉴에 노출되고, 일차방정식 기초 문제도 열리며, 문제 풀기에서 같은 문제를 넘겨받는다', async () => {
    render(<App />);
    await screen.findByText(/탐험 시작하기/);
    await loginAs();
    window.location.hash = '#/unit/simultaneous';
    await screen.findByText('단계별 풀이', {}, { timeout: 4000 });
    // 일차방정식: 난이도 선택에서 모든 난이도가 열려 있고, 기초를 고르면 바로 시작
    window.location.hash = '#/unit/linear/guided';
    await screen.findByText('난이도를 선택하세요', {}, { timeout: 4000 });
    expect(document.querySelectorAll('.diff-card.disabled').length).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: /기초/ }));
    await screen.findByText(/STEP 1 \//, {}, { timeout: 4000 });
    expect(screen.getByText(/한 단계씩 풀어 보세요/)).toBeTruthy();

    // 문제 풀기 → 단계별로 풀기 (같은 문제가 넘어간다)
    window.location.hash = '#/unit/simultaneous/problems?difficulty=basic';
    await screen.findByLabelText('x 값', {}, { timeout: 4000 });
    const shownId = storage.loadStudentData('테스트중학교_2_1_1').recentProblemIds.slice(-1)[0];
    fireEvent.click(screen.getByRole('link', { name: /단계별로 풀기/ }));
    await screen.findByText(/STEP 1 \//, {}, { timeout: 4000 });
    expect(window.location.hash).toContain('/unit/simultaneous/guided');
    expect(storage.loadStudentData('테스트중학교_2_1_1').recentProblemIds.slice(-1)[0]).toBe(shownId);
    expect(screen.getByText('없앨 미지수 고르기')).toBeTruthy();
  });
});
