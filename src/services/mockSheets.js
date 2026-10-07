/**
 * Mock Google Sheets 백엔드
 *  - GOOGLE_SCRIPT_URL 이 비어 있을 때 사용된다.
 *  - Apps Script 와 같은 API 형태로 localStorage 에 데이터를 저장한다.
 *  - 실제 연동으로 교체할 때 UI/스토어 코드는 바꿀 필요가 없다.
 */
import { getJSON, setJSON } from './storageService.js';

const DB_KEY = 'mockdb';

function loadDb() {
  return getJSON(DB_KEY, { students: {}, learningLog: [], rewards: [], progress: {}, wrongAnswers: {} });
}
function saveDb(db) {
  setJSON(DB_KEY, db);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockSheets = {
  mode: 'mock',

  async ping() {
    await delay(50);
    return { ok: true, mode: 'mock' };
  },

  async fetchStudent(studentId) {
    await delay(120);
    const db = loadDb();
    const student = db.students[studentId];
    if (!student) return { ok: true, found: false };
    const progress = Object.values(db.progress).filter((p) => p.studentId === studentId);
    const wrongAnswers = Object.values(db.wrongAnswers).filter((w) => w.studentId === studentId);
    return { ok: true, found: true, student, progress, wrongAnswers };
  },

  async sendEvents(events) {
    await delay(80);
    const db = loadDb();
    const seenLog = new Set(db.learningLog.map((l) => l.logId));
    let processed = 0;
    for (const ev of events) {
      const row = ev.row || {};
      switch (ev.type) {
        case 'student': {
          const prev = db.students[row.studentId] || {};
          db.students[row.studentId] = { ...prev, ...row, createdAt: prev.createdAt || row.createdAt || ev.timestamp };
          break;
        }
        case 'log': {
          if (row.logId && seenLog.has(row.logId)) break;
          db.learningLog.push(row);
          seenLog.add(row.logId);
          break;
        }
        case 'reward':
          db.rewards.push(row);
          break;
        case 'progress':
          db.progress[`${row.studentId}|${row.unit}|${row.concept}`] = row;
          break;
        case 'wrong':
          db.wrongAnswers[`${row.studentId}|${row.problemId}`] = row;
          break;
        default:
          break;
      }
      processed++;
    }
    saveDb(db);
    return { ok: true, processed };
  },

  async fetchTeacherOverview() {
    await delay(150);
    const db = loadDb();
    return {
      ok: true,
      students: Object.values(db.students),
      progress: Object.values(db.progress),
      wrongAnswers: Object.values(db.wrongAnswers),
      logs: db.learningLog.slice(-500),
    };
  },

  async verifyTeacherKey() {
    return { ok: true };
  },

  /** Mock 은 전송이 즉시 완료되므로 확인할 미처리 이벤트가 없다 */
  async checkEvents() {
    return { ok: true, done: [] };
  },

  /** 테스트용: Mock DB 초기화 */
  reset() {
    saveDb({ students: {}, learningLog: [], rewards: [], progress: {}, wrongAnswers: {} });
  },
};
