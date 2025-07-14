import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import ShipListPage from './pages/ShipListPage'
import ShipDetailPage from './pages/ShipDetailPage'
import { Ship } from './types'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('shipList')
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setActivePage('shipList')
  }

  const handleSelectShip = (ship: Ship) => {
    setSelectedShip(ship)
    setActivePage('shipDetail')
  }

  const handleBackToList = () => {
    setActivePage('shipList')
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (activePage === 'shipDetail' && selectedShip) {
    return <ShipDetailPage onBack={handleBackToList} ship={selectedShip} />
  }

  return <ShipListPage onSelectShip={handleSelectShip} />
}

export default App
