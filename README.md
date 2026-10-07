# 🌰 방정식 도토리 탐험대

중학교 1·2·3학년 학생이 **일차방정식 → 연립일차방정식 → 이차방정식**을 개념부터 활용까지 단계적으로 학습하는 반응형 웹앱입니다.
문제는 매번 자동 생성되며, 정답은 프로그램이 원래 식에 대입해 **검증한 뒤** 출제됩니다. 정답마다 도토리를 받고, 도토리 10개는 칭찬도장 1개가 됩니다.
학습 기록은 교사의 **Google Sheets** 에 저장됩니다(Apps Script 중계).

```
로그인 → 개념 진입 → 단계별 개념학습 → 개념 확인 → 난이도 선택 → 문제풀이
      → 즉각적 피드백 → 도토리 보상 → 칭찬도장 → 학습기록 저장 → 개인별 성장 확인
```

---

## 1. 빠른 시작

```bash
npm install
npm run dev          # http://localhost:5173  (Google Sheets 미설정 시 Mock 모드로 동작)
npm test             # 자동 테스트 (문제 엔진·판정·보상·저장·UI 흐름)
npm run build        # dist/ 에 정적 파일 생성
npm run preview      # 빌드 결과 미리보기
```

Google Sheets 연결은 **[docs/SETUP_GOOGLE_SHEETS.md](docs/SETUP_GOOGLE_SHEETS.md)** 를 따라 10분이면 끝납니다.
연결 전에도 모든 기능이 동작하며, 이때는 기록이 브라우저(localStorage)에만 저장됩니다.

**테스트 계정**: 테스트중학교 / 2학년 / 1반 / 1번 / 테스트학생 (로그인 화면의 "🧪 테스트 계정 입력" 버튼). `Students.isTest` 열이 TRUE 로 표시되어 실제 학생과 구분됩니다.

**교사용 대시보드**: `주소/#/teacher` (Apps Script 에 설정한 교사 키 필요, Mock 모드에서는 바로 열림)

---

## 2. 폴더 구조

```
equation/
├─ index.html
├─ vite.config.js
├─ package.json
├─ .env.example                 # VITE_GOOGLE_SCRIPT_URL 설정 예시
├─ apps-script/
│   └─ Code.gs                  # Google Apps Script 웹 앱 (시트 생성·저장·조회 API)
├─ docs/
│   └─ SETUP_GOOGLE_SHEETS.md   # 시트 연결 가이드 + 오류 확인표
├─ tests/                       # vitest 테스트
│   ├─ engine.test.js           # 문제 생성 3단원×4난이도 각 300개 검증, 답안 정규화/판정
│   ├─ rewards.test.js          # 도토리→도장 변환 (1, 10, 19, 20, 27)
│   ├─ store.test.js            # 학생 ID, 로그인 검증, 서버 복원, 배지, 추천
│   ├─ services.test.js         # 로컬 저장, Mock 시트, 전송 대기열 재전송
│   └─ ui.test.jsx              # 로그인→문제풀이→오답노트→복원→로그아웃 UI 흐름
└─ src/
    ├─ main.jsx / App.jsx       # 진입점, 라우팅(HashRouter), 로그인 보호
    ├─ config/appConfig.js      # ★ 교사 수정용 설정 (보상, 도장 기준, 힌트 단계, 시트 URL…)
    ├─ engine/                  # 수학 엔진 (UI 와 분리)
    │   ├─ fraction.js          # 정확한 유리수 연산
    │   ├─ format.js            # LaTeX 수식 포맷
    │   ├─ linearGenerator.js   # 중1 문제 생성 + 정답 + 풀이 + 힌트
    │   ├─ simultaneousGenerator.js  # 중2
    │   ├─ quadraticGenerator.js     # 중3
    │   ├─ validator.js         # 생성 문제 대입 검증
    │   ├─ answerNormalizer.js  # 답안 정규화·판정 (분수/소수/√/순서 무관)
    │   └─ problemGenerator.js  # 통합 진입점 (검증 실패 재생성, 최근 문제 회피)
    ├─ data/
    │   ├─ concepts/{linear,simultaneous,quadratic}.js  # STEP 설명·카드·개념확인 콘텐츠
    │   └─ badges.js            # 성취 배지 조건
    ├─ services/
    │   ├─ storageService.js    # localStorage (세션·학생별 데이터·대기열)
    │   ├─ sheetsService.js     # Apps Script 통신 (URL 없으면 Mock 자동 사용)
    │   ├─ mockSheets.js        # 개발용 Mock 백엔드
    │   └─ syncQueue.js         # 오프라인 대기열 + 재전송
    ├─ store/studentStore.jsx   # 상태 관리 (보상·연속정답·오답노트·진도·이벤트 전송)
    ├─ utils/                   # rewards, recommend, date
    ├─ components/
    │   ├─ common/              # MathText(KaTeX), UI, ErrorBoundary
    │   ├─ layout/AppShell.jsx  # 헤더·하단 내비·칭찬도장/배지 알림
    │   ├─ learning/            # FlipCard, FillBlank, ChoiceBlock, BlockRenderer
    │   └─ problem/ProblemSolver.jsx  # 입력·판정·힌트 3단계·풀이 카드·피드백
    ├─ pages/                   # Login, Home, Learn, Unit, ConceptLearn, Cards,
    │                           # ConceptCheck, Problem, WrongNote, Record, Reward, Teacher
    └─ styles/global.css        # 디자인 시스템 (숲·도토리 테마, 반응형)
```

---

## 3. 설정 (src/config/appConfig.js)

| 값 | 기본 | 설명 |
|---|---|---|
| `GOOGLE_SCRIPT_URL` | `''` | Apps Script 웹 앱 URL. `.env` 의 `VITE_GOOGLE_SCRIPT_URL` 로도 지정 |
| `ACORNS_PER_STAMP` | 10 | 도토리 몇 개 = 칭찬도장 1개 |
| `DIFFICULTY_REWARDS` | 기초1 / 기본1 / 발전2 / 도전3 | 난이도별 도토리 |
| `REWARD_CONFIG.wrongReview` | 1 | 오답 복습 성공 보너스 |
| `REWARD_CONFIG.conceptLearnComplete` / `conceptCheckComplete` | 2 / 2 | 단원 개념학습·개념확인 완료 보너스(단원당 1회) |
| `MAX_HINT_LEVEL` | 3 | 힌트 단계 수 (이후 풀이 보기 활성화) |
| `RECENT_PROBLEM_LIMIT` | 10 | 최근 N문제와 같은 문제 재출제 방지 |
| `STREAK_MESSAGES` | 3/5/10 | 연속 정답 메시지 |

---

## 4. 문제 엔진 요약

- **역생성**: 해(x), (x, y), 두 근(r₁, r₂)을 먼저 정한 뒤 식을 만들어 해가 지저분해지지 않게 합니다.
- **검증**: 모든 문제는 출제 전 `validator.js` 에서 해를 원래 식에 대입(분수 연산)하여 좌변=우변인지 확인하고, 실패하면 다시 생성합니다.
- **문제 객체**: `id, grade, unit, concept, difficulty, question, answer, acceptedAnswers, solutionSteps, hints, reward` (+ `answerType`: single / pair / roots)
- **난이도별 유형**

| 단원 | 기초 | 기본 | 발전 | 도전 |
|---|---|---|---|---|
| 일차 | x+a=b, x−a=b, ax=b | ax+b=c, c−ax=d | a(x+b)=c, ax+b=cx+d, 분수·소수, 분수 해 | 연속수·나이·가격·거리·도형·동전 |
| 연립 | 계수 같음(더하기/빼기) | 한 식만 배수, 대입법 | 두 식 모두 배수, 괄호, 대입법 | 과일값·학생수·닭토끼·나이·속력·농도 |
| 이차 | x²=a, x²−a=0, (x+p)²=q | 인수분해, 공통인수, 중근 | ax²+bx+c=0, 완전제곱식, (x+p)²=q(무리근), 근의 공식 | 연속수·직사각형·정사각형·공 던지기·수 |

- **답안 판정**: 공백·`+4`·`04`·`x=4` 정규화, `3/2` = `1.5` 동치, `√5`/`루트5`/`sqrt(5)`/`1+√2`/`(1-√5)/2` 평가, 이차방정식 두 근 **순서 무관**, 중근은 한 칸만 입력해도 인정, `1±√2` 한 칸 입력도 인정.

---

## 5. 데이터 저장

- **로컬**: 학생별 키 `ade_v1:student:<학교_학년_반_번호>` 로 분리 저장 → 새로고침 복원, 학생 간 혼합 없음.
- **Google Sheets**: Students / LearningLog / Rewards / Progress / WrongAnswers 5개 시트. 문제 내용과 정답을 로그에 함께 저장하므로 생성 알고리즘이 바뀌어도 과거 기록이 유지됩니다.
- **중복 방지**: 문제당 `claimedRewards[problemId]` 로 도토리 1회 지급, 제출 버튼 잠금, `LearningLog.logId` 로 서버 중복 저장 차단.
- **오프라인**: 이벤트는 대기열에 먼저 저장 → 15초 주기/온라인 복귀 시 재전송. 실패해도 학습 화면은 유지됩니다.
- **보안**: 브라우저에는 비밀키가 없습니다. 교사 데이터 조회는 Apps Script 스크립트 속성의 `TEACHER_KEY` 로만 가능하며, URL 파라미터로 다른 학생 기록을 열람하는 경로는 없습니다.

---

## 6. 배포

빌드 결과는 **`dist/index.html` 한 파일**에 JS·CSS·수식 폰트가 모두 들어 있습니다.

```bash
npm run build
```

- **파일을 그대로 열기**: `dist/index.html` 을 더블클릭하면 웹서버 없이도 실행됩니다. (USB·구글 드라이브·클래스룸 자료로 배포 가능)
- **웹에 올리기**: `dist/index.html` 을 GitHub Pages, Netlify, 학교 웹서버 등에 올리면 됩니다. HashRouter 를 사용하므로 서버 설정이 필요 없습니다.
- **Vercel (GitHub 연동)**: Vercel 은 GitHub 저장소의 `main` 브랜치에 코드가 push 될 때마다 자동으로 `npm run build` 를 실행해 배포합니다 (`vercel.json` 에 설정됨). 따라서 **소스 코드를 GitHub 에 push 해야** "Production Deployment" 가 생깁니다. `dist/` 는 올리지 않습니다.
  ```bash
  git add -A && git commit -m "update" && git push origin main
  ```
  `.env` 의 `VITE_GOOGLE_SCRIPT_URL` 은 저장소에 함께 올라가며(공개 URL, 비밀 아님) Vercel 빌드에 그대로 사용됩니다. Vercel 대시보드 → Settings → Environment Variables 에 같은 이름으로 넣어도 됩니다.
- 글꼴(Noto Sans KR)만 인터넷에서 불러오며, 오프라인이면 기기 기본 글꼴로 표시됩니다.
- Google Sheets 를 쓰려면 빌드 **전에** `.env` 에 `VITE_GOOGLE_SCRIPT_URL` 을 넣으세요.
- 학생에게는 배포 URL 만 안내하면 됩니다. 교사는 `URL/#/teacher`.

---

## 7. 테스트

```bash
npm test
```

| 영역 | 내용 |
|---|---|
| 로그인 | 빈칸 차단 메시지, 신규/기존 학생, 새로고침 복원, 로그아웃 |
| 일차방정식 | 3단원×4난이도 각 300문제 검증 통과, 음수 해, 분수 해(`3/2`=`1.5`) |
| 연립방정식 | (x, y) 판정, 음수 포함, 순서 바뀌면 오답 |
| 이차방정식 | 두 근 순서 무관, 중근, `±` 표기, 무리근 `1+√2` |
| 보상 | 1개, 10개 변환, 19개 상태, 20개 변환, 27개 → 도장 2 + 도토리 7 |
| 오답 | 자동 저장, 재도전, 복습 완료 + 보너스, 통계 중복 반영 없음 |
| 저장 | 학생별 분리, Mock 시트 중복 로그 제거, 네트워크 오류 후 재전송 |
| UI | 로그인→문제→힌트→오답노트→오답 정복→교사 대시보드 전 흐름(jsdom) |

---

## 8. 오류가 날 때

| 증상 | 확인 |
|---|---|
| 화면에 "🌳 잠시 길을 잃었어요" | 브라우저 콘솔 오류 확인 후 [다시 시도]. 기록은 localStorage 에 보존됨 |
| 상단 "⏳ 저장 대기 N" 이 계속 남음 | `.env` 의 URL, Apps Script 배포 권한(모든 사용자) → docs 참고 |
| 수식이 깨짐 | KaTeX 폰트가 `dist/assets` 와 함께 배포되었는지 (dist 전체 업로드) |
| 기존 학생인데 "신규"로 인식 | 학교명 띄어쓰기/학년/반/번호가 이전과 같은지 (이름은 ID 에 사용하지 않음) |
| 다른 기기에서 기록이 안 보임 | Google Sheets 연동이 되어야 기기 간 복원 가능 (Mock 모드는 기기 내 저장) |
| 테스트 실패 | `npm install` 후 Node 18 이상인지 확인 |

---

## 9. 기술 스택

React 18 · Vite 5 · react-router-dom 6 (HashRouter) · KaTeX · Vitest + Testing Library · Google Apps Script
