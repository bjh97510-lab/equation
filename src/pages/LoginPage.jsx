import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../store/studentStore.jsx';
import { Button, Loading } from '../components/common/UI.jsx';
import { APP_NAME, TEST_ACCOUNT } from '../config/appConfig.js';
import { SHEETS_MODE } from '../services/sheetsService.js';

const EMPTY = { school: '', grade: '', classNo: '', number: '', name: '' };

export function validateLogin(f) {
  if (!String(f.school).trim()) return '학교명을 입력해 주세요.';
  if (!String(f.grade).trim()) return '학년을 선택해 주세요.';
  if (!String(f.classNo).trim()) return '반을 입력해 주세요.';
  if (!/^\d+$/.test(String(f.classNo).trim())) return '반은 숫자로 입력해 주세요.';
  if (!String(f.number).trim()) return '번호를 입력해 주세요.';
  if (!/^\d+$/.test(String(f.number).trim())) return '번호는 숫자로 입력해 주세요.';
  if (!String(f.name).trim()) return '이름을 입력해 주세요.';
  return null;
}

export default function LoginPage() {
  const { login } = useStudent();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e?.preventDefault();
    const err = validateLogin(form);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      if (res.isReturning) {
        setWelcome(res);
        setTimeout(() => navigate('/', { replace: true }), 1400);
      } else {
        navigate('/', { replace: true });
      }
    } catch (e2) {
      setError('로그인 중 문제가 발생했어요. 다시 시도해 주세요.');
      setLoading(false);
    }
  };

  if (welcome) {
    return (
      <div className="login-wrap">
        <div className="login-card center">
          <div style={{ fontSize: '2.6rem' }}>🌳</div>
          <h1>다시 만났네요, {welcome.student.name} 학생!</h1>
          <p className="muted">
            🌰 도토리 {welcome.data.stats.acorns} · 🏅 칭찬도장 {welcome.data.stats.stamps} · 푼 문제 {welcome.data.stats.totalSolved}개
          </p>
          <p className="small muted">기존 기록을 불러왔어요{welcome.source === 'remote' ? ' (Google Sheets)' : ''}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit} noValidate>
        <h1>🌰 {APP_NAME}</h1>
        <p className="sub">방정식을 풀고 도토리를 모아 수학 숲을 탐험해 보세요!</p>
        {loading ? (
          <Loading text="🌰 도토리를 찾고 있어요..." />
        ) : (
          <>
            <div className="login-grid">
              <div className="field full">
                <label htmlFor="school">학교명</label>
                <input id="school" className={`input ${error.includes('학교') ? 'error' : ''}`} placeholder="예: 홍산중학교" value={form.school} onChange={set('school')} autoComplete="organization" />
              </div>
              <div className="field">
                <label htmlFor="grade">학년</label>
                <select id="grade" className="select" value={form.grade} onChange={set('grade')}>
                  <option value="">선택</option>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="classNo">반</label>
                <input id="classNo" className="input" inputMode="numeric" placeholder="예: 1" value={form.classNo} onChange={set('classNo')} />
              </div>
              <div className="field">
                <label htmlFor="number">번호</label>
                <input id="number" className="input" inputMode="numeric" placeholder="예: 5" value={form.number} onChange={set('number')} />
              </div>
              <div className="field">
                <label htmlFor="name">이름</label>
                <input id="name" className="input" placeholder="예: 홍길동" value={form.name} onChange={set('name')} autoComplete="name" />
              </div>
            </div>
            {error && (
              <p className="form-error" role="alert">
                ⚠️ {error}
              </p>
            )}
            <Button type="submit" size="lg" block onClick={submit}>
              🌳 탐험 시작하기
            </Button>
            <div className="btn-row center" style={{ marginTop: 10 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...TEST_ACCOUNT })}>
                🧪 테스트 계정 입력
              </button>
            </div>
            <p className="small muted center" style={{ marginTop: 10 }}>
              {SHEETS_MODE === 'sheets' ? '학습 기록은 선생님의 Google Sheets 에 저장됩니다.' : '현재 체험 모드: 기록이 이 기기에만 저장됩니다.'}
            </p>
          </>
        )}
      </form>
    </div>
  );
}
