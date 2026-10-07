/**
 * 도토리 / 칭찬도장 / 연속 정답 계산 (순수 함수)
 */
import { ACORNS_PER_STAMP, STREAK_MESSAGES } from '../config/appConfig.js';

/**
 * 도토리를 더하고, 10개 단위로 칭찬도장으로 변환한다.
 * @param {number} acorns 현재 도토리 (0 ~ 9)
 * @param {number} stamps 현재 칭찬도장
 * @param {number} amount 지급할 도토리
 * @returns {{acorns:number, stamps:number, newStamps:number}}
 */
export function applyAcorns(acorns, stamps, amount, perStamp = ACORNS_PER_STAMP) {
  const total = (acorns || 0) + (amount || 0);
  const newStamps = Math.floor(total / perStamp);
  return {
    acorns: total % perStamp,
    stamps: (stamps || 0) + newStamps,
    newStamps,
  };
}

/** 연속 정답 메시지 (해당 횟수에 메시지가 없으면 null) */
export function streakMessage(streak) {
  return STREAK_MESSAGES[streak] || null;
}

/** 다음 칭찬도장까지 남은 도토리 */
export function acornsToNextStamp(acorns, perStamp = ACORNS_PER_STAMP) {
  return perStamp - (acorns % perStamp);
}
