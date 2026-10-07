import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStudent } from '../../store/studentStore.jsx';
import { subscribe } from '../../services/syncQueue.js';
import { BADGE_MAP } from '../../data/badges.js';
import { Modal, Button } from '../common/UI.jsx';
import { ACORNS_PER_STAMP } from '../../config/appConfig.js';

function SyncBadge() {
  const [st, setSt] = useState(null);
  useEffect(() => subscribe(setSt), []);
  if (!st) return null;
  if (st.mode === 'mock') return <span className="sync-badge" title="Google Sheets 미설정: 기기에만 저장">💾 기기 저장</span>;
  if (st.pending > 0) return <span className="sync-badge" title={st.lastError || ''}>⏳ 저장 대기 {st.pending}</span>;
  return <span className="sync-badge">☁️ 저장됨</span>;
}

function NoticeHost() {
  const { notices, dismissNotice } = useStudent();
  const n = notices[0];
  if (!n) return null;
  if (n.kind === 'stamp') {
    return (
      <Modal open onClose={() => dismissNotice(n.id)}>
        <div className="big">🏅</div>
        <h2>칭찬도장 획득!</h2>
        <p>
          도토리 {ACORNS_PER_STAMP}개를 모았습니다!{n.count > 1 ? ` (도장 ${n.count}개)` : ''}
        </p>
        <Button onClick={() => dismissNotice(n.id)}>계속 탐험하기</Button>
      </Modal>
    );
  }
  if (n.kind === 'badge') {
    const b = BADGE_MAP[n.badgeId];
    return (
      <Modal open onClose={() => dismissNotice(n.id)}>
        <div className="big">{b?.emoji || '🎖️'}</div>
        <h2>성취 배지 획득!</h2>
        <h3>{b?.name}</h3>
        <p className="muted">{b?.desc}</p>
        <Button onClick={() => dismissNotice(n.id)}>좋아요!</Button>
      </Modal>
    );
  }
  return null;
}

/** 오프라인/저장 실패 시 안내 토스트 */
function OfflineToast() {
  const [st, setSt] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(
    () =>
      subscribe((s) => {
        setSt(s);
        setShow(s.mode !== 'mock' && s.pending > 0 && !!s.lastError && !s.syncing);
      }),
    [],
  );
  if (!show || !st) return null;
  return (
    <div className="toast-host">
      <div className="toast warn">📡 학습 내용은 기기에 임시 저장되었습니다. 인터넷 연결 후 다시 저장합니다.</div>
    </div>
  );
}

const NAV = [
  { to: '/', label: '홈', ico: '🏠', end: true },
  { to: '/learn', label: '학습', ico: '📖' },
  { to: '/wrong', label: '오답', ico: '📕' },
  { to: '/record', label: '기록', ico: '📊' },
  { to: '/reward', label: '보상', ico: '🌰' },
];

export default function AppShell() {
  const { student, data, logout } = useStudent();
  const navigate = useNavigate();
  const onLogout = () => {
    if (window.confirm('로그아웃할까요? 학습 기록은 저장되어 있어요.')) {
      logout();
      navigate('/login', { replace: true });
    }
  };
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="inner">
          <Link to="/" className="brand">
            🌰 <span>방정식 도토리 탐험대</span>
          </Link>
          <nav className="header-nav" aria-label="주 메뉴">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.ico} {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-stats">
            <span className="stat-pill" title="도토리">
              🌰 {data?.stats.acorns ?? 0}
            </span>
            <span className="stat-pill" title="칭찬도장">
              🏅 {data?.stats.stamps ?? 0}
            </span>
            <SyncBadge />
            {student && (
              <button type="button" className="btn-logout" onClick={onLogout}>
                로그아웃
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="하단 메뉴">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ico" aria-hidden>
              {n.ico}
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <NoticeHost />
      <OfflineToast />
    </div>
  );
}
