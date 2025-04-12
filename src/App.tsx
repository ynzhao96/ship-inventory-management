import React, { useState } from 'react'
import LoginPage from './pages/LoginPage'
import ShipListPage from './pages/ShipListPage'
import ShipDetailPage from './pages/ShipDetailPage'
import { Ship } from './types'
import './App.css'

function App() {
  // 简单的页面路由，0 = 登录页面，1 = 船舶列表，2 = 船舶详情
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true)
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null)

  // 模拟登录逻辑
  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage(1)
  }

  // 处理船舶选择
  const handleSelectShip = (ship: Ship) => {
    setSelectedShip(ship)
    setCurrentPage(2)
  }

  // 返回船舶列表
  const handleBackToList = () => {
    setCurrentPage(1)
  }

  // 根据当前页面状态渲染页面
  const renderPage = () => {
    if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} />
    }

    switch (currentPage) {
      case 1:
        return <ShipListPage onSelectShip={handleSelectShip} />
      case 2:
        return <ShipDetailPage onBack={handleBackToList} />
      default:
        return <ShipListPage onSelectShip={handleSelectShip} />
    }
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App
