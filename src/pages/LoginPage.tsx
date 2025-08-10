import React, { useState } from 'react';
import { adminLogin } from '../api';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await adminLogin(username, password);

    if (result.success) {
      // 简单持久化登录态（生产建议存 token）
      localStorage.setItem('auth', '1');
      onLogin();  // 或者用路由跳转 navigate('/')
    } else {
      alert(result.error || '登录失败');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">登录页面</h1>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full">
              <img
                src="/ship-icon.svg"
                alt="船舶图标"
                className="w-10 h-10 text-blue-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1zaGlwIj48cGF0aCBkPSJNMiAyMGE2IDYgMCAwIDAgMTIgMCA2IDYgMCAwIDAgMTIgMEgyWiIvPjxwYXRoIGQ9Ik0xMiA4VjZhMiAyIDAgMCAxIDItMmg0YTIgMiAwIDAgMSAyIDJ2MiIvPjxwYXRoIGQ9Ik00LjkzIDkuOTNBNCAwIDAgMSA4IDhhNCAwIDAgMSA4IDBhNCAwIDAgMSAzLjA3IDEuOTMiLz48cGF0aCBkPSJNMTIgOHYxMiIvPjwvc3ZnPg==';
                }}
              />
            </div>
          </div>
          <h2 className="text-lg">船舶仓储管理系统-管理端</h2>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="用户名"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="密码"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            登录
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Copyright © {new Date().getFullYear()} 船舶仓储管理系统</p>
          <p>版本号 v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 