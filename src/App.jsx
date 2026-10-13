import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { StudentProvider, useStudent } from './store/studentStore.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { Loading } from './components/common/UI.jsx';
import AppShell from './components/layout/AppShell.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import UnitPage from './pages/UnitPage.jsx';
import ConceptLearnPage from './pages/ConceptLearnPage.jsx';
import CardsPage from './pages/CardsPage.jsx';
import ConceptCheckPage from './pages/ConceptCheckPage.jsx';
import ProblemPage from './pages/ProblemPage.jsx';
import GuidedSolvePage from './pages/GuidedSolvePage.jsx';
import WrongNotePage from './pages/WrongNotePage.jsx';
import RecordPage from './pages/RecordPage.jsx';
import RewardPage from './pages/RewardPage.jsx';
import TeacherPage from './pages/TeacherPage.jsx';

/** 로그인이 필요한 영역 보호. URL 에는 학생 식별자를 노출하지 않는다. */
function RequireStudent() {
  const { student, data, booting } = useStudent();
  if (booting) return <Loading />;
  if (!student || !data) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * 로그인 화면 보호: 이미 로그인된 상태로 "들어올 때"만 홈으로 보낸다.
 * (로그인 직후 "다시 만났네요" 환영 화면은 LoginPage 가 직접 이동을 처리한다)
 */
function PublicOnly({ children }) {
  const { student, booting } = useStudent();
  const hadStudentAtMount = React.useRef(undefined);
  if (booting) return <Loading />;
  if (hadStudentAtMount.current === undefined) hadStudentAtMount.current = !!student;
  if (hadStudentAtMount.current) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <StudentProvider>
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            <Route path="/teacher" element={<TeacherPage />} />
            <Route element={<RequireStudent />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/unit/:unit" element={<UnitPage />} />
                <Route path="/unit/:unit/learn" element={<ConceptLearnPage />} />
                <Route path="/unit/:unit/cards" element={<CardsPage />} />
                <Route path="/unit/:unit/check" element={<ConceptCheckPage />} />
                <Route path="/unit/:unit/problems" element={<ProblemPage />} />
                <Route path="/unit/:unit/guided" element={<GuidedSolvePage />} />
                <Route path="/wrong" element={<WrongNotePage />} />
                <Route path="/record" element={<RecordPage />} />
                <Route path="/reward" element={<RewardPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </StudentProvider>
    </ErrorBoundary>
  );
}
