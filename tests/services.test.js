import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as storage from '../src/services/storageService.js';
import { mockSheets } from '../src/services/mockSheets.js';
import { enqueue, flush, getStatus } from '../src/services/syncQueue.js';

describe('로컬 저장소', () => {
  beforeEach(() => {
    storage.clearSession();
  });
  it('세션 저장/복원/삭제 (새로고침 복원, 로그아웃)', () => {
    expect(storage.loadSession()).toBeNull();
    storage.saveSession({ studentId: 'A_1_1_1', name: '가' });
    expect(storage.loadSession().studentId).toBe('A_1_1_1');
    storage.clearSession();
    expect(storage.loadSession()).toBeNull();
  });
  it('학생별 데이터는 studentId 로 분리된다', () => {
    storage.saveStudentData('A_1_1_1', { stats: { acorns: 3 } });
    storage.saveStudentData('A_1_1_2', { stats: { acorns: 9 } });
    expect(storage.loadStudentData('A_1_1_1').stats.acorns).toBe(3);
    expect(storage.loadStudentData('A_1_1_2').stats.acorns).toBe(9);
    expect(storage.loadStudentData('없음')).toBeNull();
  });
});

describe('Mock Sheets 백엔드', () => {
  beforeEach(() => mockSheets.reset());
  it('이벤트를 처리하고 학생 데이터를 조회한다', async () => {
    const r = await mockSheets.sendEvents([
      { type: 'student', row: { studentId: 'S1', name: '가', acorns: 2 } },
      { type: 'log', row: { logId: 'L1', studentId: 'S1', isCorrect: true } },
      { type: 'log', row: { logId: 'L1', studentId: 'S1', isCorrect: true } }, // 중복
      { type: 'progress', row: { studentId: 'S1', unit: 'linear', concept: 'solve', completedCount: 1 } },
      { type: 'wrong', row: { studentId: 'S1', problemId: 'P1', wrongCount: 1 } },
    ]);
    expect(r.ok).toBe(true);
    const s = await mockSheets.fetchStudent('S1');
    expect(s.found).toBe(true);
    expect(s.student.name).toBe('가');
    expect(s.progress.length).toBe(1);
    expect(s.wrongAnswers.length).toBe(1);
    const t = await mockSheets.fetchTeacherOverview();
    expect(t.logs.length).toBe(1); // logId 중복 제거
    const none = await mockSheets.fetchStudent('없음');
    expect(none.found).toBe(false);
  });
});

describe('전송 대기열', () => {
  beforeEach(() => {
    storage.saveQueue([]);
    mockSheets.reset();
  });
  it('이벤트를 넣으면 전송 후 대기열이 비워진다', async () => {
    enqueue('student', { studentId: 'Q1', name: '큐' });
    await flush();
    await new Promise((r) => setTimeout(r, 200));
    expect(getStatus().pending).toBe(0);
    const s = await mockSheets.fetchStudent('Q1');
    expect(s.found).toBe(true);
  });
  it('네트워크 오류 시 대기열에 남고 다음 flush 에서 재전송된다', async () => {
    const spy = vi.spyOn(mockSheets, 'sendEvents').mockRejectedValueOnce(new Error('network'));
    enqueue('student', { studentId: 'Q2', name: '오류' });
    await new Promise((r) => setTimeout(r, 200));
    expect(getStatus().pending).toBe(1);
    expect(getStatus().lastError).toBe('network');
    await flush();
    expect(getStatus().pending).toBe(0);
    expect(getStatus().lastError).toBeNull();
    spy.mockRestore();
  });
});
