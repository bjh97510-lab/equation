import React from 'react';
import { useStudent } from '../store/studentStore.jsx';
import { Button, ProgressBar, PageTitle } from '../components/common/UI.jsx';
import { UNITS } from '../config/appConfig.js';
import { getSteps } from '../data/concepts/index.js';

/** 📖 학습 탭: 단원별 진도와 바로가기 */
export default function LearnPage() {
  const { getUnitProgressPercent, unitProgress } = useStudent();
  return (
    <div>
      <PageTitle title="📖 학습" sub="단원을 선택해 개념을 배우고 문제에 도전해 보세요." />
      <div className="list">
        {UNITS.map((u) => {
          const up = unitProgress(u.id);
          const total = getSteps(u.id).length;
          return (
            <div key={u.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0 }}>
                    {u.emoji} {u.name}
                  </h2>
                  <span className="muted small">
                    {u.gradeLabel} · STEP {up.completedSteps.length}/{total} 완료 {up.checkCompleted ? '· 개념 확인 완료 ✅' : ''}
                  </span>
                </div>
                <div className="btn-row" style={{ marginTop: 0 }}>
                  <Button variant="outline" size="sm" to={`/unit/${u.id}/learn`}>
                    📖 개념 배우기
                  </Button>
                  <Button size="sm" to={`/unit/${u.id}/problems`}>
                    🎯 문제 풀기
                  </Button>
                  <Button variant="ghost" size="sm" to={`/unit/${u.id}`}>
                    전체 메뉴
                  </Button>
                </div>
              </div>
              <div className="mt-1">
                <ProgressBar value={getUnitProgressPercent(u.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
