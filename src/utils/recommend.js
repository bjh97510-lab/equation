/**
 * 학습 기록을 분석하여 다음 학습 행동을 추천한다.
 * 부정적 평가 대신 "다음에 무엇을 해 볼지"를 안내한다.
 */
import { UNITS, DIFFICULTIES } from '../config/appConfig.js';
import { conceptName } from '../engine/problemGenerator.js';
import { getSteps } from '../data/concepts/index.js';

/**
 * @param {object} data 학생 데이터 (progress, stats, wrongAnswers)
 * @returns {string[]} 추천 문장 목록 (최대 3개)
 */
export function buildRecommendations(data) {
  const out = [];
  const progress = data.progress || {};
  const totalSolved = data.stats?.totalSolved || 0;

  if (totalSolved === 0) {
    out.push('아직 푼 문제가 없어요. 📖 개념 배우기로 숲 탐험을 시작해 볼까요?');
    return out;
  }

  // 1) 개념별 정답률 분석
  const conceptRows = [];
  for (const u of UNITS) {
    const cs = progress[u.id]?.conceptStats || {};
    for (const [cid, s] of Object.entries(cs)) {
      if ((s.completed || 0) >= 3) {
        conceptRows.push({ unit: u.id, unitName: u.name, concept: cid, name: conceptName(u.id, cid), acc: s.correct / s.completed, n: s.completed });
      }
    }
  }
  conceptRows.sort((a, b) => a.acc - b.acc);
  const weak = conceptRows.find((r) => r.acc < 0.6);
  const strong = [...conceptRows].reverse().find((r) => r.acc >= 0.8);
  if (strong) out.push(`"${strong.name}" 문제는 잘 해결하고 있어요. 👍`);
  if (weak) out.push(`"${weak.name}" 문제를 조금 더 연습해 볼까요? 개념 카드로 복습하면 도움이 돼요.`);

  // 2) 난이도별: 기초/기본 정답률이 높으면 상위 난이도 추천
  for (const u of UNITS) {
    const ds = progress[u.id]?.difficultyStats || {};
    const low = ['basic', 'standard'].reduce((acc, d) => ({ c: acc.c + (ds[d]?.correct || 0), n: acc.n + (ds[d]?.completed || 0) }), { c: 0, n: 0 });
    const high = ['advanced', 'challenge'].reduce((acc, d) => acc + (ds[d]?.completed || 0), 0);
    if (low.n >= 5 && low.c / low.n >= 0.8 && high < 3) {
      out.push(`${u.name} 기초·기본 정답률이 높아요. 🌳 발전 문제에 도전해 보세요!`);
      break;
    }
  }

  // 3) 개념 학습 미완료 단원 안내
  if (out.length < 3) {
    for (const u of UNITS) {
      const total = getSteps(u.id).length;
      const done = (progress[u.id]?.completedSteps || []).length;
      const solved = Object.values(progress[u.id]?.conceptStats || {}).reduce((s, c) => s + (c.completed || 0), 0);
      if (solved >= 3 && done < total) {
        out.push(`${u.name} 개념 배우기가 ${Math.round((done / total) * 100)}% 진행됐어요. 남은 STEP 도 살펴볼까요?`);
        break;
      }
    }
  }

  // 4) 오답노트
  const pending = (data.wrongAnswers || []).filter((w) => w.reviewStatus !== 'reviewed').length;
  if (pending > 0 && out.length < 3) {
    out.push(`📕 오답노트에 복습을 기다리는 문제가 ${pending}개 있어요. 다시 풀면 도토리도 받을 수 있어요!`);
  }

  if (out.length === 0) out.push('꾸준히 잘하고 있어요! 오늘도 한 단원씩 탐험해 볼까요? 🌰');
  return out.slice(0, 3);
}

/** 교사용: 오답률이 높은 개념 목록 */
export function weakConceptsFromWrong(wrongRows) {
  const map = {};
  for (const w of wrongRows) {
    const k = `${w.unit}|${w.concept}`;
    map[k] = (map[k] || 0) + (Number(w.wrongCount) || 1);
  }
  return Object.entries(map)
    .map(([k, n]) => {
      const [unit, concept] = k.split('|');
      return { unit, concept, name: conceptName(unit, concept), count: n };
    })
    .sort((a, b) => b.count - a.count);
}

void DIFFICULTIES;
