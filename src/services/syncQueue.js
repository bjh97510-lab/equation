/**
 * 전송 대기열 (오프라인 대비 재전송 구조)
 *
 *  - 저장 이벤트는 먼저 localStorage 대기열에 기록된다.
 *  - 온라인이면 즉시 전송을 시도하고, 실패하면 남겨 두고 주기적으로 재시도한다.
 *  - 각 이벤트에는 eventId 가 있어 서버에서 중복 저장을 막을 수 있다.
 */
import { loadQueue, saveQueue } from './storageService.js';
import { sheetsService } from './sheetsService.js';
import { SYNC_INTERVAL_MS } from '../config/appConfig.js';
import { uid, nowIso } from '../utils/date.js';

const listeners = new Set();
let syncing = false;
let lastError = null;
let lastSyncedAt = null;
let timer = null;

function notify() {
  const status = getStatus();
  listeners.forEach((fn) => {
    try {
      fn(status);
    } catch {
      /* ignore */
    }
  });
}

export function getStatus() {
  return {
    pending: loadQueue().length,
    syncing,
    lastError,
    lastSyncedAt,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    mode: sheetsService.mode,
  };
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(getStatus());
  return () => listeners.delete(fn);
}

/**
 * 이벤트 추가
 * @param {'student'|'log'|'reward'|'progress'|'wrong'} type
 * @param {object} row 시트에 기록될 행 데이터
 */
export function enqueue(type, row) {
  const q = loadQueue();
  q.push({ eventId: uid('ev'), type, row, timestamp: nowIso() });
  saveQueue(q);
  notify();
  // 즉시 전송 시도 (비동기)
  void flush();
}

export function enqueueMany(events) {
  const q = loadQueue();
  for (const { type, row } of events) q.push({ eventId: uid('ev'), type, row, timestamp: nowIso() });
  saveQueue(q);
  notify();
  void flush();
}

export async function flush() {
  if (syncing) return getStatus();
  const q = loadQueue();
  if (q.length === 0) return getStatus();
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    lastError = '오프라인';
    notify();
    return getStatus();
  }
  syncing = true;
  notify();
  try {
    const batch = q.slice(0, 50);
    const res = await sheetsService.sendEvents(batch);
    if (!res || res.ok === false) throw new Error(res?.error || '서버가 저장을 거부했습니다.');
    // 성공한 배치 제거 (전송 중 추가된 이벤트는 유지)
    const current = loadQueue();
    const sentIds = new Set(batch.map((e) => e.eventId));
    saveQueue(current.filter((e) => !sentIds.has(e.eventId)));
    lastError = null;
    lastSyncedAt = nowIso();
  } catch (e) {
    lastError = e?.message || String(e);
    // 응답을 받지 못했어도 서버가 처리했을 수 있다 → 처리된 이벤트는 대기열에서 제거 (중복 저장 방지)
    try {
      const ids = q.slice(0, 50).map((ev) => ev.eventId);
      const chk = await sheetsService.checkEvents?.(ids);
      if (chk?.ok && Array.isArray(chk.done) && chk.done.length > 0) {
        const done = new Set(chk.done);
        saveQueue(loadQueue().filter((ev) => !done.has(ev.eventId)));
        if (loadQueue().length === 0) lastError = null;
      }
    } catch {
      /* 확인 실패 시 다음 재시도에서 다시 처리 */
    }
  } finally {
    syncing = false;
    notify();
  }
  // 남은 것이 있으면 이어서 전송
  if (!lastError && loadQueue().length > 0) return flush();
  return getStatus();
}

export function startAutoSync() {
  if (timer) return;
  timer = setInterval(() => void flush(), SYNC_INTERVAL_MS);
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => void flush());
  }
  void flush();
}

export function stopAutoSync() {
  if (timer) clearInterval(timer);
  timer = null;
}
