/**
 * ============================================================
 *  방정식 도토리 탐험대 - 앱 설정 파일
 * ============================================================
 *  교사가 직접 수정할 수 있는 값들을 한곳에 모았습니다.
 *  값을 바꾼 뒤에는 `npm run build` 로 다시 빌드하면 적용됩니다.
 *  (개발 중에는 `npm run dev` 가 자동으로 반영합니다.)
 * ============================================================
 */

/** 앱 이름 (로그인 화면, 헤더에 표시) */
export const APP_NAME = '방정식 도토리 탐험대';

/**
 * Google Apps Script Web App URL
 *  - apps-script/Code.gs 를 배포한 뒤 발급받은 URL 을 넣으세요.
 *  - 예: 'https://script.google.com/macros/s/AKfycb.../exec'
 *  - 비워 두면 "Mock 모드"로 동작하여 기기 내부(localStorage)에만 저장됩니다.
 *  - 환경변수 VITE_GOOGLE_SCRIPT_URL 로도 지정할 수 있습니다 (.env 파일 참고).
 */
export const GOOGLE_SCRIPT_URL = import.meta.env?.VITE_GOOGLE_SCRIPT_URL || '';

/**
 * Spreadsheet ID (참고용)
 *  - 실제 쓰기/읽기는 Apps Script 가 수행하므로 브라우저에서는 사용하지 않습니다.
 *  - Apps Script 코드의 SPREADSHEET_ID 를 수정하거나, 스크립트를 시트에 바인딩하세요.
 */
export const SPREADSHEET_ID = import.meta.env?.VITE_SPREADSHEET_ID || '';

/** 도토리 몇 개가 모이면 칭찬도장 1개로 바뀌는지 */
export const ACORNS_PER_STAMP = 10;

/**
 * 난이도별 도토리 보상
 *  key: 난이도 id, value: 정답 시 지급 도토리 수
 */
export const DIFFICULTY_REWARDS = {
  basic: 1, // 🌱 기초
  standard: 1, // 🌿 기본
  advanced: 2, // 🌳 발전
  challenge: 3, // 🔥 도전
};

/** 보상 설정 모음 */
export const REWARD_CONFIG = {
  difficulty: DIFFICULTY_REWARDS,
  /** 오답노트의 문제를 다시 맞혔을 때 (복습 완료, 문제당 1회) */
  wrongReview: 1,
  /** 단원의 개념 확인 활동을 모두 마쳤을 때 (단원당 1회) */
  conceptCheckComplete: 2,
  /** 단원의 개념 배우기 STEP 을 모두 마쳤을 때 (단원당 1회) */
  conceptLearnComplete: 2,
};

/** 힌트 최대 단계 (이 단계 이후 "풀이 보기" 활성화) */
export const MAX_HINT_LEVEL = 3;

/** 최근 출제된 문제 ID 를 몇 개까지 기억하여 중복 출제를 피할지 */
export const RECENT_PROBLEM_LIMIT = 10;

/** 연속 정답 메시지 */
export const STREAK_MESSAGES = {
  3: '🔥 3연속 정답!',
  5: '🌟 5연속 정답! 멋져요!',
  10: '🏆 방정식 마스터!',
};

/** 난이도 정의 (표시 순서대로) */
export const DIFFICULTIES = [
  { id: 'basic', label: '기초', emoji: '🌱', desc: '개념을 확인하는 간단한 문제' },
  { id: 'standard', label: '기본', emoji: '🌿', desc: '교과서 수준의 일반적인 문제' },
  { id: 'advanced', label: '발전', emoji: '🌳', desc: '여러 단계의 계산이 필요한 문제' },
  { id: 'challenge', label: '도전', emoji: '🔥', desc: '사고력과 활용 능력이 필요한 문제' },
];

export const DIFFICULTY_MAP = Object.fromEntries(DIFFICULTIES.map((d) => [d.id, d]));

/** 단원 정의 */
export const UNITS = [
  {
    id: 'linear',
    level: 1,
    emoji: '🌱',
    name: '일차방정식',
    gradeLabel: '중학교 1학년',
    slogan: '미지수 x의 값을 찾아라!',
  },
  {
    id: 'simultaneous',
    level: 2,
    emoji: '🌿',
    name: '연립일차방정식',
    gradeLabel: '중학교 2학년',
    slogan: '두 식에 숨어 있는 x와 y를 찾아라!',
  },
  {
    id: 'quadratic',
    level: 3,
    emoji: '🌳',
    name: '이차방정식',
    gradeLabel: '중학교 3학년',
    slogan: 'x²이 등장하는 새로운 방정식에 도전!',
  },
];

export const UNIT_MAP = Object.fromEntries(UNITS.map((u) => [u.id, u]));

/** 테스트용 계정 (학교명이 이 값이면 테스트 데이터로 표시) */
export const TEST_ACCOUNT = {
  school: '테스트중학교',
  grade: '2',
  classNo: '1',
  number: '1',
  name: '테스트학생',
};

/** 동기화(재전송) 간격 (ms) */
export const SYNC_INTERVAL_MS = 15000;

/** 네트워크 요청 타임아웃 (ms) */
export const REQUEST_TIMEOUT_MS = 12000;

/** localStorage 키 접두사 (버전 변경 시 데이터 구조 분리용) */
export const STORAGE_PREFIX = 'ade_v1';

/**
 * "단계별 풀이"(빈칸 채우기·질문으로 한 단계씩 풀기)를 제공하는 단원과 난이도
 *  - 연립일차방정식: 모든 난이도
 *  - 일차·이차방정식: 도전(활용) 문제
 */
export const GUIDED_DIFFICULTIES = {
  linear: ['challenge'],
  simultaneous: ['basic', 'standard', 'advanced', 'challenge'],
  quadratic: ['challenge'],
};

export const GUIDED_UNITS = Object.keys(GUIDED_DIFFICULTIES);
