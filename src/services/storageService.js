/**
 * 브라우저 로컬 저장소 (localStorage) 래퍼
 *  - 로그인 세션, 학생별 학습 데이터, 전송 대기열을 저장한다.
 *  - 학생별 데이터는 studentId 로 키를 분리하여 서로 섞이지 않게 한다.
 */
import { STORAGE_PREFIX } from '../config/appConfig.js';

const memoryFallback = new Map();

function storage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    /* ignore */
  }
  return {
    getItem: (k) => (memoryFallback.has(k) ? memoryFallback.get(k) : null),
    setItem: (k, v) => memoryFallback.set(k, String(v)),
    removeItem: (k) => memoryFallback.delete(k),
    key: (i) => Array.from(memoryFallback.keys())[i] ?? null,
    get length() {
      return memoryFallback.size;
    },
  };
}

const key = (name) => `${STORAGE_PREFIX}:${name}`;

export function getJSON(name, fallback = null) {
  try {
    const raw = storage().getItem(key(name));
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJSON(name, value) {
  try {
    storage().setItem(key(name), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(name) {
  try {
    storage().removeItem(key(name));
  } catch {
    /* ignore */
  }
}

/* ───── 세션 (로그인 유지) ───── */
export const loadSession = () => getJSON('session', null);
export const saveSession = (student) => setJSON('session', student);
export const clearSession = () => remove('session');

/* ───── 학생 데이터 ───── */
export const loadStudentData = (studentId) => getJSON(`student:${studentId}`, null);
export const saveStudentData = (studentId, data) => setJSON(`student:${studentId}`, data);

/** 이 기기에 저장된 모든 학생 ID (교사용 Mock 대시보드 등에서 사용) */
export function listLocalStudentIds() {
  const ids = [];
  try {
    const s = storage();
    const prefix = key('student:');
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(prefix)) ids.push(k.slice(prefix.length));
    }
  } catch {
    /* ignore */
  }
  return ids;
}

/* ───── 전송 대기열 ───── */
export const loadQueue = () => getJSON('queue', []);
export const saveQueue = (q) => setJSON('queue', q);

/* ───── 교사 키 (세션 저장) ───── */
export const loadTeacherKey = () => getJSON('teacherKey', '');
export const saveTeacherKey = (k) => setJSON('teacherKey', k);
export const clearTeacherKey = () => remove('teacherKey');
