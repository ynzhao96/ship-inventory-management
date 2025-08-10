// src/App.tsx
import { JSX, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ShipListPage from './pages/ShipListPage';
import ShipDetailPage from './pages/ShipDetailPage';
import { Ship } from './types';

// 简单的登录态读取
function useAuth() {
  const [authed, setAuthed] = useState<boolean>(false);
  useEffect(() => {
    setAuthed(localStorage.getItem('auth') === '1');
  }, []);
  return { authed, setAuthed };
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const authed = localStorage.getItem('auth') === '1';
  return authed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { authed, setAuthed } = useAuth();
  const navigate = useNavigate();

  const handleLoggedIn = () => {
    localStorage.setItem('auth', '1');
    setAuthed(true);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuthed(false);
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      {/* 登录页：已登录访问则跳回首页 */}
      <Route
        path="/login"
        element={
          authed ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLoggedIn} />
        }
      />

      {/* 受保护的页面 */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <ShipListPage onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/ships/:shipId"
        element={
          <RequireAuth>
            <ShipDetailPage onBack={() => navigate(-1)} />
          </RequireAuth>
        }
      />

      {/* 兜底：未匹配到的路径 → 首页或 404 */}
      <Route path="*" element={<Navigate to={authed ? '/' : '/login'} replace />} />
    </Routes>
  );
}
