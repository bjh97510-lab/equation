/**
 * ============================================================
 *  방정식 도토리 탐험대 - Google Apps Script 중계 API
 * ============================================================
 *  배포 방법은 docs/SETUP_GOOGLE_SHEETS.md 참고
 *
 *  1) 이 스크립트를 스프레드시트에 "바인딩"하면 SPREADSHEET_ID 를 비워도 됩니다.
 *     독립 스크립트로 만들 경우 아래 SPREADSHEET_ID 에 시트 ID 를 넣으세요.
 *  2) 상단 메뉴 [실행] 에서 setupSheets 를 1회 실행하여 시트와 헤더를 만듭니다.
 *  3) 교사 키 설정: setTeacherKey 함수의 값을 바꾼 뒤 1회 실행 (스크립트 속성에 저장).
 *     (브라우저 코드에는 키가 들어가지 않습니다. 교사가 대시보드에서 직접 입력합니다.)
 *  4) [배포] → [새 배포] → 유형: 웹 앱, 실행 사용자: 나, 액세스: 모든 사용자 → URL 복사
 *  5) 복사한 URL 을 웹앱의 .env (VITE_GOOGLE_SCRIPT_URL) 또는 src/config/appConfig.js 에 넣습니다.
 */

var SPREADSHEET_ID = ''; // 비워 두면 바인딩된 스프레드시트 사용

var SHEETS = {
  Students: ['studentId', 'school', 'grade', 'class', 'number', 'name', 'isTest', 'createdAt', 'lastLogin', 'acorns', 'stamps', 'totalSolved', 'totalCorrect', 'bestStreak', 'badges'],
  LearningLog: ['logId', 'timestamp', 'studentId', 'unit', 'concept', 'difficulty', 'problemId', 'question', 'studentAnswer', 'correctAnswer', 'isCorrect', 'attemptNumber', 'hintLevel', 'rewardEarned', 'studySeconds', 'isReview'],
  Rewards: ['timestamp', 'studentId', 'type', 'amount', 'reason', 'problemId', 'acornsAfter', 'stampsAfter'],
  Progress: ['studentId', 'unit', 'concept', 'conceptName', 'status', 'completedCount', 'correctCount', 'accuracy', 'stepsDone', 'stepsTotal', 'lastStudied'],
  WrongAnswers: ['studentId', 'problemId', 'unit', 'concept', 'difficulty', 'question', 'studentAnswer', 'correctAnswer', 'wrongCount', 'reviewStatus', 'lastAttempt', 'problemJson'],
};

/* ───────────────────────── 설정 함수 (수동 1회 실행) ───────────────────────── */

/** 시트와 헤더를 생성한다. (여러 번 실행해도 안전) */
function setupSheets() {
  var ss = getSpreadsheet();
  Object.keys(SHEETS).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    var headers = SHEETS[name];
    var firstRow = sh.getRange(1, 1, 1, headers.length).getValues()[0];
    var needHeader = firstRow.join('') === '';
    if (needHeader) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });
  Logger.log('시트 준비 완료: ' + Object.keys(SHEETS).join(', '));
}

/** 교사 키 설정: 값을 바꾼 뒤 이 함수를 1회 실행하세요. */
function setTeacherKey() {
  var KEY = 'change-me-teacher-key'; // ← 원하는 교사 키로 변경
  PropertiesService.getScriptProperties().setProperty('TEACHER_KEY', KEY);
  Logger.log('교사 키가 저장되었습니다.');
}

/**
 * 테스트 데이터 정리 (수동 실행)
 *  - Students.isTest 가 TRUE 인 학생과 아래 EXTRA_TEST_IDS 의 모든 행을 5개 시트에서 삭제한다.
 *  - 실제 수업 시작 전에 한 번 실행하면 깨끗한 상태로 시작할 수 있다.
 */
function cleanupTestData() {
  var EXTRA_TEST_IDS = ['Q1', 'Q2', 'S1']; // 개발 중 자동 테스트가 남긴 임시 ID
  var ss = getSpreadsheet();
  var testIds = {};
  EXTRA_TEST_IDS.forEach(function (id) {
    testIds[id] = true;
  });
  readAll(ss, 'Students').forEach(function (s) {
    if (s.isTest === true || String(s.isTest).toUpperCase() === 'TRUE') testIds[String(s.studentId)] = true;
  });
  var removed = 0;
  Object.keys(SHEETS).forEach(function (name) {
    var sh = getSheet(ss, name);
    var values = sh.getDataRange().getValues();
    if (values.length < 2) return;
    var col = values[0].indexOf('studentId');
    if (col < 0) return;
    for (var r = values.length - 1; r >= 1; r--) {
      if (testIds[String(values[r][col])]) {
        sh.deleteRow(r + 1);
        removed++;
      }
    }
  });
  Logger.log('삭제한 행 수: ' + removed + ' (대상 ID: ' + Object.keys(testIds).join(', ') + ')');
}

/* ───────────────────────── HTTP 엔드포인트 ───────────────────────── */

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'ping':
        return json({ ok: true, mode: 'sheets', time: new Date().toISOString() });
      case 'getStudent':
        return json(getStudent(p.studentId));
      case 'check':
        return json(checkEvents(p.ids));
      case 'verifyTeacher':
        return json({ ok: checkTeacherKey(p.key) });
      case 'teacher':
        if (!checkTeacherKey(p.key)) return json({ ok: false, error: '교사 키가 올바르지 않습니다.' });
        return json(teacherOverview());
      default:
        return json({ ok: false, error: 'unknown action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'events') return json(processEvents(body.events || []));
    return json({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }
}

/* ───────────────────────── 이벤트 처리 ───────────────────────── */

/** 처리한 eventId 를 캐시(6시간)에 기록하여 재전송 시 중복 저장을 막는다 */
var EVENT_CACHE_TTL = 6 * 60 * 60;

function processEvents(events) {
  var ss = getSpreadsheet();
  var processed = 0;
  var cache = {};
  var logIds = null;
  var evCache = CacheService.getScriptCache();
  var doneIds = {};
  events.forEach(function (ev) {
    var row = ev.row || {};
    if (ev.eventId) {
      if (evCache.get('ev:' + ev.eventId)) {
        processed++;
        return; // 이미 처리된 이벤트 (재전송)
      }
      doneIds['ev:' + ev.eventId] = '1';
    }
    switch (ev.type) {
      case 'student':
        upsert(ss, 'Students', ['studentId'], row, cache, { keepFirst: ['createdAt'] });
        break;
      case 'log':
        if (!logIds) logIds = columnSet(ss, 'LearningLog', 'logId');
        if (row.logId && logIds[row.logId]) break; // 중복 저장 방지
        appendRow(ss, 'LearningLog', row);
        if (row.logId) logIds[row.logId] = true;
        break;
      case 'reward':
        appendRow(ss, 'Rewards', row);
        break;
      case 'progress':
        upsert(ss, 'Progress', ['studentId', 'unit', 'concept'], row, cache);
        break;
      case 'wrong':
        upsert(ss, 'WrongAnswers', ['studentId', 'problemId'], row, cache);
        break;
      default:
        return;
    }
    processed++;
  });
  if (Object.keys(doneIds).length) evCache.putAll(doneIds, EVENT_CACHE_TTL);
  return { ok: true, processed: processed };
}

/** 클라이언트가 응답을 받지 못했을 때, 어떤 이벤트가 이미 처리되었는지 확인 */
function checkEvents(idsParam) {
  var ids = String(idsParam || '')
    .split(',')
    .filter(function (s) {
      return s;
    });
  if (ids.length === 0) return { ok: true, done: [] };
  var got = CacheService.getScriptCache().getAll(
    ids.map(function (id) {
      return 'ev:' + id;
    }),
  );
  var done = ids.filter(function (id) {
    return !!got['ev:' + id];
  });
  return { ok: true, done: done };
}

/* ───────────────────────── 조회 ───────────────────────── */

function getStudent(studentId) {
  if (!studentId) return { ok: false, error: 'studentId 가 필요합니다.' };
  var ss = getSpreadsheet();
  var students = readAll(ss, 'Students').filter(function (r) {
    return String(r.studentId) === String(studentId);
  });
  if (students.length === 0) return { ok: true, found: false };
  var progress = readAll(ss, 'Progress').filter(function (r) {
    return String(r.studentId) === String(studentId);
  });
  var wrong = readAll(ss, 'WrongAnswers').filter(function (r) {
    return String(r.studentId) === String(studentId);
  });
  return { ok: true, found: true, student: students[0], progress: progress, wrongAnswers: wrong };
}

function teacherOverview() {
  var ss = getSpreadsheet();
  var logs = readAll(ss, 'LearningLog');
  return {
    ok: true,
    students: readAll(ss, 'Students'),
    progress: readAll(ss, 'Progress'),
    wrongAnswers: readAll(ss, 'WrongAnswers'),
    logs: logs.slice(Math.max(0, logs.length - 2000)),
  };
}

/* ───────────────────────── 시트 유틸 ───────────────────────── */

function getSpreadsheet() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('스프레드시트를 찾을 수 없습니다. SPREADSHEET_ID 를 확인하세요.');
  return ss;
}

function getSheet(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function headersOf(sh, name) {
  var lastCol = Math.max(sh.getLastColumn(), SHEETS[name].length);
  var h = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  if (h.join('') === '') {
    sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]);
    return SHEETS[name].slice();
  }
  return h;
}

function rowToArray(headers, row) {
  return headers.map(function (h) {
    var v = row[h];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
}

function appendRow(ss, name, row) {
  var sh = getSheet(ss, name);
  var headers = headersOf(sh, name);
  sh.appendRow(rowToArray(headers, row));
}

function readAll(ss, name) {
  var sh = getSheet(ss, name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    if (values[i].join('') === '') continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var v = values[i][j];
      if (v instanceof Date) v = v.toISOString();
      obj[headers[j]] = v;
    }
    out.push(obj);
  }
  return out;
}

/** 특정 열의 값 집합 */
function columnSet(ss, name, col) {
  var sh = getSheet(ss, name);
  var headers = headersOf(sh, name);
  var idx = headers.indexOf(col);
  var set = {};
  if (idx < 0 || sh.getLastRow() < 2) return set;
  var vals = sh.getRange(2, idx + 1, sh.getLastRow() - 1, 1).getValues();
  vals.forEach(function (r) {
    if (r[0] !== '') set[String(r[0])] = true;
  });
  return set;
}

/**
 * 키 열 조합이 같은 행이 있으면 갱신, 없으면 추가.
 * options.keepFirst: 기존 값이 있으면 덮어쓰지 않을 컬럼 (예: createdAt)
 */
function upsert(ss, name, keyCols, row, cache, options) {
  options = options || {};
  var sh = getSheet(ss, name);
  var headers = headersOf(sh, name);
  var cacheKey = name;
  if (!cache[cacheKey]) {
    var data = sh.getLastRow() >= 2 ? sh.getRange(2, 1, sh.getLastRow() - 1, headers.length).getValues() : [];
    var index = {};
    data.forEach(function (r, i) {
      var k = keyCols
        .map(function (c) {
          return String(r[headers.indexOf(c)]);
        })
        .join('|');
      index[k] = i + 2; // 시트 행 번호
    });
    cache[cacheKey] = { index: index, nextRow: data.length + 2 };
  }
  var c = cache[cacheKey];
  var key = keyCols
    .map(function (k) {
      return String(row[k]);
    })
    .join('|');
  var arr = rowToArray(headers, row);
  if (c.index[key]) {
    var rowNum = c.index[key];
    if (options.keepFirst) {
      var existing = sh.getRange(rowNum, 1, 1, headers.length).getValues()[0];
      options.keepFirst.forEach(function (col) {
        var i = headers.indexOf(col);
        if (i >= 0 && existing[i] !== '') arr[i] = existing[i];
      });
    }
    sh.getRange(rowNum, 1, 1, headers.length).setValues([arr]);
  } else {
    sh.getRange(c.nextRow, 1, 1, headers.length).setValues([arr]);
    c.index[key] = c.nextRow;
    c.nextRow++;
  }
}

function checkTeacherKey(key) {
  var saved = PropertiesService.getScriptProperties().getProperty('TEACHER_KEY');
  return !!saved && !!key && String(saved) === String(key);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
