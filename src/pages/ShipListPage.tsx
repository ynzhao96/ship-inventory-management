import { useState } from 'react';
import { Ship, ShipType, ShipStatus } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

// 模拟船舶数据
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

const ShipListPage = ({ }: { onLogout: () => void }) => {
  const navigate = useNavigate();
  const handleSelectShip = (shipId: string) => {
    navigate(`/ships/${shipId}`);
  };
  const [ships] = useState<Ship[]>(mockShips);
  const [activeTab, setActiveTab] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState('ship-management');

  // 船舶列表页特定的侧边栏菜单项
  const shipListMenuItems = [
    {
      id: 'ship-management',
      label: '船舶管理',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 20a6 6 0 0 0 12 0 6 6 0 0 0 12 0H2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.93 9.93A4 4 0 0 1 8 8a4 4 0 0 1 8 0 4 4 0 0 1 3.07 1.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'data-report',
      label: '数据报表汇总',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 18v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 10h4m-4 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'anomaly',
      label: '异常',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2c-1.61 0-3.09.86-3.93 2.25L2.75 14.25A4.49 4.49 0 0 0 6.9 21h10.2a4.49 4.49 0 0 0 4.15-6.75L15.93 4.25A4.47 4.47 0 0 0 12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
  ];

  // 导航处理函数
  const handleNavigate = (page: string) => {
    setActivePage(page);
    // 这里可以添加其他导航逻辑
  };

  // 过滤显示的船舶
  const filteredShips = ships.filter(ship => {
    const matchesSearch = ship.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === '全部') return matchesSearch;
    if (activeTab === '新加坡线') return ship.status === ShipStatus.ACTIVE && matchesSearch;
    if (activeTab === '美国线') return ship.location === '美国' && matchesSearch;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* 使用抽象的Header组件 */}
      <Header
        title="船舶管理系统"
        notificationCount={11}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          menuItems={shipListMenuItems}
        />

        {/* 主要内容 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
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
                <button className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-500 text-white rounded-r-md">
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* 选项卡 */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {['全部', '新加坡线', '美国线'].map(tab => (
                  <button
                    key={tab}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
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
                  onClick={() => handleSelectShip(ship.id)}
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
      </div>
    </div>
  );
};

export default ShipListPage; 