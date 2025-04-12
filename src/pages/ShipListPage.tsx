import React, { useState } from 'react';
import { Ship, ShipType, ShipStatus } from '../types';

interface ShipListPageProps {
  onSelectShip: (ship: Ship) => void;
}

// 模拟数据
const mockShips: Ship[] = [
  {
    id: 'ABC-123',
    name: '远洋号',
    type: ShipType.CARGO,
    capacity: 2000,
    currentLoad: 1245,
    status: ShipStatus.ACTIVE,
    location: '上海港',
    lastMaintenance: new Date('2023-01-15')
  },
  {
    id: 'ABC-124',
    name: '海龙号',
    type: ShipType.CONTAINER,
    capacity: 3000,
    currentLoad: 2245,
    status: ShipStatus.DOCKED,
    location: '青岛港',
    lastMaintenance: new Date('2023-02-20')
  },
  {
    id: 'ABC-125',
    name: '远航号',
    type: ShipType.TANKER,
    capacity: 5000,
    currentLoad: 3245,
    status: ShipStatus.LOADING,
    location: '广州港',
    lastMaintenance: new Date('2023-03-10')
  },
  {
    id: 'ABC-126',
    name: '海洋号',
    type: ShipType.CARGO,
    capacity: 8000,
    currentLoad: 6245,
    status: ShipStatus.UNLOADING,
    location: '深圳港',
    lastMaintenance: new Date('2023-04-05')
  },
  {
    id: 'ABC-127',
    name: '远洋2号',
    type: ShipType.CARGO,
    capacity: 2000,
    currentLoad: 1245,
    status: ShipStatus.ACTIVE,
    location: '上海港',
    lastMaintenance: new Date('2023-01-15')
  },
  {
    id: 'ABC-128',
    name: '海龙2号',
    type: ShipType.CONTAINER,
    capacity: 3000,
    currentLoad: 1245,
    status: ShipStatus.DOCKED,
    location: '青岛港',
    lastMaintenance: new Date('2023-02-20')
  },
  {
    id: 'ABC-129',
    name: '远航2号',
    type: ShipType.TANKER,
    capacity: 5000,
    currentLoad: 1245,
    status: ShipStatus.LOADING,
    location: '广州港',
    lastMaintenance: new Date('2023-03-10')
  },
  {
    id: 'ABC-130',
    name: '海洋2号',
    type: ShipType.CARGO,
    capacity: 8000,
    currentLoad: 1245,
    status: ShipStatus.UNLOADING,
    location: '深圳港',
    lastMaintenance: new Date('2023-04-05')
  }
];

const ShipListPage: React.FC<ShipListPageProps> = ({ onSelectShip }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('全部');
  const [ships] = useState<Ship[]>(mockShips);

  // 根据选项卡和搜索词筛选船舶
  const filteredShips = ships.filter(ship => {
    const matchesSearch = ship.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ship.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === '全部') return matchesSearch;
    if (activeTab === '新加船舶') return false; // 假设这个选项卡没有内容
    if (activeTab === '美固性') return ship.type === ShipType.TANKER && matchesSearch;
    
    return matchesSearch;
  });

  // 获取状态类样式
  const getStatusClass = (status: ShipStatus): string => {
    switch(status) {
      case ShipStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case ShipStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
      case ShipStatus.DOCKED: return 'bg-blue-100 text-blue-800';
      case ShipStatus.LOADING:
      case ShipStatus.UNLOADING: return 'bg-purple-100 text-purple-800';
      case ShipStatus.DECOMMISSIONED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-blue-900 text-white shadow">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/ship-icon.svg" alt="船舶图标" className="w-8 h-8 mr-2" />
            <h1 className="text-xl font-bold">船舶管理系统</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">5</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex items-center">
              <img src="/avatar.png" alt="用户头像" className="w-8 h-8 rounded-full mr-2" />
              <span>管理员</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">船只选择</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索船只编号或名称"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* 选项卡 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['全部', '新加船舶', '美固性'].map(tab => (
              <button
                key={tab}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* 船舶卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredShips.map(ship => (
            <div 
              key={ship.id} 
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectShip(ship)}
            >
              <h3 className="text-lg font-semibold mb-2">{ship.id}</h3>
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500">总库存</p>
                  <p className="text-lg font-bold">{ship.currentLoad}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">待入库</p>
                  <p className="text-lg font-bold">{ship.capacity - ship.currentLoad > 100 ? 100 : ship.capacity - ship.currentLoad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipListPage; 