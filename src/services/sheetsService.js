/**
 * Google Sheets 통신 서비스 (Apps Script Web App 중계)
 *
 *  - 브라우저에는 비밀키를 두지 않는다. Apps Script URL 만 사용한다.
 *  - POST 는 text/plain 으로 보내 CORS preflight 를 피한다 (Apps Script 권장 방식).
 *  - GOOGLE_SCRIPT_URL 이 비어 있으면 mockSheets 로 대체된다.
 */
import { GOOGLE_SCRIPT_URL, REQUEST_TIMEOUT_MS } from '../config/appConfig.js';
import { mockSheets } from './mockSheets.js';

export function isSheetsConfigured() {
  return typeof GOOGLE_SCRIPT_URL === 'string' && GOOGLE_SCRIPT_URL.startsWith('http');
}

async function withTimeout(promise, ms = REQUEST_TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function getJson(params) {
  const url = new URL(GOOGLE_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await withTimeout(fetch(url.toString(), { method: 'GET', redirect: 'follow' }));
  if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
  return res.json();
}

async function postJson(body) {
  const res = await withTimeout(
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    }),
  );
  if (!res.ok) throw new Error(`서버 응답 오류 (${res.status})`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('서버 응답을 해석할 수 없습니다. Apps Script 배포 설정(액세스: 모든 사용자)을 확인하세요.');
  }
}

const realSheets = {
  mode: 'sheets',
  ping: () => getJson({ action: 'ping' }),
  fetchStudent: (studentId) => getJson({ action: 'getStudent', studentId }),
  sendEvents: (events) => postJson({ action: 'events', events }),
  /** 응답을 받지 못한 이벤트 중 서버가 이미 처리한 것의 id 목록 */
  checkEvents: (ids) => getJson({ action: 'check', ids: ids.join(',') }),
  fetchTeacherOverview: (teacherKey) => getJson({ action: 'teacher', key: teacherKey }),
  verifyTeacherKey: (teacherKey) => getJson({ action: 'verifyTeacher', key: teacherKey }),
};

export const sheetsService = isSheetsConfigured() ? realSheets : mockSheets;
export const SHEETS_MODE = sheetsService.mode;
