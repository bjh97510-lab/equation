import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Chip, Loading, Modal, ProgressBar } from '../components/common/UI.jsx';
import { sheetsService, SHEETS_MODE } from '../services/sheetsService.js';
import { loadTeacherKey, saveTeacherKey, clearTeacherKey } from '../services/storageService.js';
import { UNITS, UNIT_MAP, DIFFICULTIES } from '../config/appConfig.js';
import { getSteps } from '../data/concepts/index.js';
import { weakConceptsFromWrong } from '../utils/recommend.js';
import { conceptName } from '../engine/problemGenerator.js';
import { formatDateTime, todayKey } from '../utils/date.js';

/**
 * 교사용 대시보드
 *  - 학생 화면과 분리된 /teacher 경로
 *  - Apps Script 의 TEACHER_KEY 로 인증 (Mock 모드에서는 키 없이 열람)
 */
export default function TeacherPage() {
  const [key, setKey] = useState(loadTeacherKey() || '');
  const [authed, setAuthed] = useState(SHEETS_MODE === 'mock' || !!loadTeacherKey());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState({ school: '', grade: '', classNo: '', name: '' });
  const [selected, setSelected] = useState(null);

  const load = async (k = key) => {
    setLoading(true);
    setError('');
    try {
      const res = await sheetsService.fetchTeacherOverview(k);
      if (!res || res.ok === false) throw new Error(res?.error || '인증에 실패했어요. 교사 키를 확인하세요.');
      setData(res);
      setAuthed(true);
      if (SHEETS_MODE === 'sheets') saveTeacherKey(k);
    } catch (e) {
      setError(e.message || String(e));
      setAuthed(SHEETS_MODE === 'mock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const students = useMemo(() => {
    if (!data) return [];
    return data.students
      .filter((s) => !filter.school || String(s.school).includes(filter.school))
      .filter((s) => !filter.grade || String(s.grade) === filter.grade)
      .filter((s) => !filter.classNo || String(s.class) === filter.classNo)
      .filter((s) => !filter.name || String(s.name).includes(filter.name))
      .sort((a, b) => String(a.school).localeCompare(String(b.school)) || Number(a.grade) - Number(b.grade) || Number(a.class) - Number(b.class) || Number(a.number) - Number(b.number));
  }, [data, filter]);

  const todayStr = todayKey();
  const todayCount = data ? data.students.filter((s) => String(s.lastLogin || '').slice(0, 10) === todayStr || data.logs?.some((l) => l.studentId === s.studentId && String(l.timestamp).slice(0, 10) === todayStr)).length : 0;
  const weak = data ? weakConceptsFromWrong(data.wrongAnswers.filter((w) => w.reviewStatus !== 'reviewed')).slice(0, 6) : [];

  const progressOf = (sid, unit) => {
    const rows = (data?.progress || []).filter((p) => p.studentId === sid && p.unit === unit);
    const done = rows.reduce((a, r) => a + (Number(r.stepsDone) || 0), 0);
    const total = getSteps(unit).length;
    return total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  };

  if (!authed) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>👩‍🏫 교사용 대시보드</h1>
          <p className="sub">Apps Script 에 설정한 교사 키를 입력하세요.</p>
          <div className="field">
            <label htmlFor="tkey">교사 키</label>
            <input id="tkey" className="input" type="password" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
          </div>
          {error && <p className="form-error">⚠️ {error}</p>}
          <Button block onClick={() => load()} disabled={loading || !key}>
            {loading ? '확인 중...' : '대시보드 열기'}
          </Button>
          <p className="small muted center mt-2">
            <Link to="/login">← 학생 로그인으로</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="inner">
          <span className="brand">👩‍🏫 교사용 대시보드</span>
          <div className="header-stats">
            <span className="sync-badge">{SHEETS_MODE === 'sheets' ? '☁️ Google Sheets' : '💾 Mock (이 기기 데이터)'}</span>
            <Button size="sm" variant="outline" onClick={() => load()} style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>
              새로고침
            </Button>
            {SHEETS_MODE === 'sheets' && (
              <button type="button" className="btn-logout" onClick={() => (clearTeacherKey(), setAuthed(false), setData(null))}>
                로그아웃
              </button>
            )}
            <Link to="/login" className="btn-logout" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              학생 화면
            </Link>
          </div>
        </div>
      </header>
      <main className="app-main" style={{ paddingBottom: 40 }}>
        {loading && <Loading text="📊 학생 기록을 불러오는 중..." />}
        {error && <p className="form-error">⚠️ {error}</p>}
        {data && (
          <>
            <div className="stat-grid mb-2">
              <div className="stat-tile">
                <div className="k">전체 학생 수</div>
                <div className="v">{data.students.length}</div>
              </div>
              <div className="stat-tile">
                <div className="k">오늘 학습 학생</div>
                <div className="v">{todayCount}</div>
              </div>
              <div className="stat-tile">
                <div className="k">총 풀이 수</div>
                <div className="v">{data.students.reduce((a, s) => a + (Number(s.totalSolved) || 0), 0)}</div>
              </div>
              <div className="stat-tile">
                <div className="k">복습 대기 오답</div>
                <div className="v">{data.wrongAnswers.filter((w) => w.reviewStatus !== 'reviewed').length}</div>
              </div>
            </div>

            <Card>
              <h2>⚠️ 오답이 많은 개념</h2>
              {weak.length === 0 ? (
                <p className="muted">아직 오답 기록이 없어요.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {weak.map((w) => (
                    <Chip key={`${w.unit}-${w.concept}`} tone="brown">
                      {UNIT_MAP[w.unit]?.emoji} {w.name} · {w.count}회
                    </Chip>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2>👥 학생 목록</h2>
              <div className="filters">
                <input className="input" placeholder="학교" value={filter.school} onChange={(e) => setFilter({ ...filter, school: e.target.value })} />
                <select className="select" value={filter.grade} onChange={(e) => setFilter({ ...filter, grade: e.target.value })}>
                  <option value="">학년 전체</option>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
                <input className="input" placeholder="반" value={filter.classNo} onChange={(e) => setFilter({ ...filter, classNo: e.target.value })} />
                <input className="input" placeholder="이름" value={filter.name} onChange={(e) => setFilter({ ...filter, name: e.target.value })} />
              </div>
              <div className="table-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>학교</th>
                      <th>학년/반/번호</th>
                      <th>이름</th>
                      <th>풀이 수</th>
                      <th>정답률</th>
                      <th>일차</th>
                      <th>연립</th>
                      <th>이차</th>
                      <th>🌰</th>
                      <th>🏅</th>
                      <th>최근 접속</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.studentId} className="clickable" onClick={() => setSelected(s)}>
                        <td>
                          {s.school} {s.isTest === true || s.isTest === 'TRUE' ? <Chip tone="gray">테스트</Chip> : null}
                        </td>
                        <td>
                          {s.grade}-{s.class}-{s.number}
                        </td>
                        <td>{s.name}</td>
                        <td>{s.totalSolved || 0}</td>
                        <td>{Number(s.totalSolved) ? `${Math.round((Number(s.totalCorrect) / Number(s.totalSolved)) * 100)}%` : '-'}</td>
                        <td>{progressOf(s.studentId, 'linear')}%</td>
                        <td>{progressOf(s.studentId, 'simultaneous')}%</td>
                        <td>{progressOf(s.studentId, 'quadratic')}%</td>
                        <td>{s.acorns || 0}</td>
                        <td>{s.stamps || 0}</td>
                        <td>{formatDateTime(s.lastLogin)}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={11} className="muted center">
                          조건에 맞는 학생이 없어요.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>

      <Modal open={!!selected} onClose={() => setSelected(null)} wide>
        {selected && <StudentDetail s={selected} data={data} onClose={() => setSelected(null)} progressOf={progressOf} />}
      </Modal>
    </div>
  );
}

function StudentDetail({ s, data, onClose, progressOf }) {
  const prog = data.progress.filter((p) => p.studentId === s.studentId);
  const wrong = data.wrongAnswers.filter((w) => w.studentId === s.studentId);
  const logs = (data.logs || []).filter((l) => l.studentId === s.studentId);
  const byDiff = DIFFICULTIES.map((d) => {
    const rows = logs.filter((l) => l.difficulty === d.id && Number(l.attemptNumber) === 1 && !(l.isReview === true || l.isReview === 'TRUE'));
    const c = rows.filter((l) => l.isCorrect === true || l.isCorrect === 'TRUE').length;
    return { ...d, n: rows.length, c };
  });
  const weak = weakConceptsFromWrong(wrong.filter((w) => w.reviewStatus !== 'reviewed')).slice(0, 5);
  return (
    <div>
      <h2>
        {s.name} <span className="muted small">{s.school} {s.grade}학년 {s.class}반 {s.number}번</span>
      </h2>
      <h3 className="mt-2">학습 현황</h3>
      {UNITS.map((u) => (
        <div key={u.id} className="mt-1">
          <ProgressBar value={progressOf(s.studentId, u.id)} label={`${u.emoji} ${u.name}`} />
        </div>
      ))}
      <h3 className="mt-2">문제 풀이</h3>
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="k">총 풀이 수</div>
          <div className="v">{s.totalSolved || 0}</div>
        </div>
        <div className="stat-tile">
          <div className="k">정답률</div>
          <div className="v">{Number(s.totalSolved) ? `${Math.round((Number(s.totalCorrect) / Number(s.totalSolved)) * 100)}%` : '-'}</div>
        </div>
        <div className="stat-tile">
          <div className="k">도토리 / 도장</div>
          <div className="v">
            🌰 {s.acorns || 0} · 🏅 {s.stamps || 0}
          </div>
        </div>
        <div className="stat-tile">
          <div className="k">연속 정답 최고</div>
          <div className="v">🔥 {s.bestStreak || 0}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {byDiff.map((d) => (
          <Chip key={d.id} tone="gray">
            {d.emoji} {d.label} {d.n ? `${Math.round((d.c / d.n) * 100)}% (${d.c}/${d.n})` : '-'}
          </Chip>
        ))}
      </div>
      <h3 className="mt-2">개념별 기록</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {prog.map((p) => (
          <Chip key={`${p.unit}-${p.concept}`} tone={p.accuracy !== '' && Number(p.accuracy) < 60 && Number(p.completedCount) >= 3 ? 'brown' : ''}>
            {UNIT_MAP[p.unit]?.emoji} {conceptName(p.unit, p.concept)} {p.completedCount ? `${p.correctCount}/${p.completedCount}` : `STEP ${p.stepsDone}/${p.stepsTotal}`}
          </Chip>
        ))}
        {prog.length === 0 && <span className="muted small">기록 없음</span>}
      </div>
      <h3 className="mt-2">취약 개념 (복습 대기 오답)</h3>
      {weak.length === 0 ? <p className="muted small">없음</p> : weak.map((w) => <Chip key={w.concept} tone="danger">{w.name} · {w.count}회</Chip>)}
      <div className="btn-row">
        <Button onClick={onClose}>닫기</Button>
      </div>
    </div>
  );
}
