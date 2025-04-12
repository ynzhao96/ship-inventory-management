import React, { useState } from 'react'
import LoginPage from './pages/LoginPage'
import ShipListPage from './pages/ShipListPage'
import ShipDetailPage from './pages/ShipDetailPage'
import './App.css'

function App() {
  // 简单的页面路由，0 = 登录页面，1 = 船舶列表，2 = 船舶详情
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  // 模拟登录逻辑
  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage(1)
  }

  // 简单的导航函数
  const navigateTo = (page: number) => {
    setCurrentPage(page)
  }

  // 根据当前页面状态渲染页面
  const renderPage = () => {
    if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} />
    }

    switch (currentPage) {
      case 1:
        return <ShipListPage onSelectShip={() => navigateTo(2)} />
      case 2:
        return <ShipDetailPage onBack={() => navigateTo(1)} />
      default:
        return <LoginPage onLogin={handleLogin} />
    }
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App
