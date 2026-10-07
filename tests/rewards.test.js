import { describe, it, expect } from 'vitest';
import { applyAcorns, streakMessage, acornsToNextStamp } from '../src/utils/rewards.js';

describe('도토리 → 칭찬도장 변환', () => {
  it('1개 지급', () => {
    expect(applyAcorns(0, 0, 1)).toEqual({ acorns: 1, stamps: 0, newStamps: 0 });
  });
  it('10개가 되면 도장 1개로 변환', () => {
    expect(applyAcorns(9, 0, 1)).toEqual({ acorns: 0, stamps: 1, newStamps: 1 });
  });
  it('19개 상태 = 도장 1, 도토리 9', () => {
    let s = { acorns: 0, stamps: 0 };
    for (let i = 0; i < 19; i++) s = applyAcorns(s.acorns, s.stamps, 1);
    expect(s.acorns).toBe(9);
    expect(s.stamps).toBe(1);
  });
  it('20개 변환 = 도장 2, 도토리 0', () => {
    let s = { acorns: 0, stamps: 0 };
    for (let i = 0; i < 20; i++) s = applyAcorns(s.acorns, s.stamps, 1);
    expect(s.acorns).toBe(0);
    expect(s.stamps).toBe(2);
  });
  it('27개를 한 번에 받으면 도장 2 추가, 남은 도토리 7', () => {
    expect(applyAcorns(0, 0, 27)).toEqual({ acorns: 7, stamps: 2, newStamps: 2 });
  });
  it('도토리 8 + 3 = 도장 1, 도토리 1', () => {
    expect(applyAcorns(8, 3, 3)).toEqual({ acorns: 1, stamps: 4, newStamps: 1 });
  });
  it('다음 도장까지 남은 수', () => {
    expect(acornsToNextStamp(7)).toBe(3);
    expect(acornsToNextStamp(0)).toBe(10);
  });
});

describe('연속 정답 메시지', () => {
  it('3, 5, 10 에서만 메시지', () => {
    expect(streakMessage(3)).toContain('3연속');
    expect(streakMessage(5)).toContain('5연속');
    expect(streakMessage(10)).toContain('마스터');
    expect(streakMessage(4)).toBeNull();
    expect(streakMessage(0)).toBeNull();
  });
});
