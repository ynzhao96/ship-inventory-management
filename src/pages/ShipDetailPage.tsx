import React, { useState } from 'react';
import { Ship, ShipType, ShipStatus, Cargo, CargoType, CargoStatus } from '../types';
import Sidebar from '../components/Sidebar';

interface ShipDetailPageProps {
  onBack: () => void;
}

// 模拟船舶数据
const mockShip: Ship = {
  id: 'ABC-123',
  name: '远洋号',
  type: ShipType.CARGO,
  capacity: 2000,
  currentLoad: 1245,
  status: ShipStatus.ACTIVE,
  location: '上海港',
  lastMaintenance: new Date('2023-01-15')
};

// 模拟货物数据
const mockCargos: Cargo[] = [
  {
    id: '001',
    name: '发动机润滑油',
    type: CargoType.LIQUID,
    weight: 200,
    volume: 220,
    shipId: 'ABC-123',
    status: CargoStatus.STORED,
    destination: '上海港',
    arrivalDate: new Date('2023-05-20')
  },
  {
    id: '002',
    name: '液压油',
    type: CargoType.LIQUID,
    weight: 150,
    volume: 165,
    shipId: 'ABC-123',
    status: CargoStatus.STORED,
    destination: '上海港',
    arrivalDate: new Date('2023-05-20')
  },
  {
    id: '003',
    name: '安全装备',
    type: CargoType.CONTAINER,
    weight: 300,
    volume: 350,
    shipId: 'ABC-123',
    status: CargoStatus.STORED,
    destination: '青岛港',
    arrivalDate: new Date('2023-06-10')
  },
  {
    id: '004',
    name: '灭火器',
    type: CargoType.CONTAINER,
    weight: 100,
    volume: 120,
    shipId: 'ABC-123',
    status: CargoStatus.STORED,
    destination: '广州港',
    arrivalDate: new Date('2023-06-15')
  }
];

// 模拟库存趋势数据
const mockStoreData = [
  { store: 'Store-1', name: '发动机润滑油', level: 90 },
  { store: 'Store-2', name: '液压油', level: 30 },
  { store: 'Store-3', name: '安全装备', level: 20 },
  { store: 'Store-4', name: '灭火器', level: 40 },
  { store: 'Store-5', name: '干粮', level: 20 },
  { store: 'Store-6', name: '矿泉水', level: 40 },
  { store: 'Store-7', name: '油漆', level: 10 },
];

const ShipDetailPage: React.FC<ShipDetailPageProps> = ({ onBack }) => {
  const [ship] = useState<Ship>(mockShip);
  const [cargos] = useState<Cargo[]>(mockCargos);
  const [activeInventoryTab, setActiveInventoryTab] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [reportTab, setReportTab] = useState('charts');
  const [activePage, setActivePage] = useState('inventory-storage');

  // 船舶详情页特定的侧边栏菜单项
  const shipDetailMenuItems = [
    {
      id: 'inventory',
      label: '物资库存',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      children: [
        {
          id: 'inventory-storage',
          label: '物资库存',
          icon: (
            <svg className="w-4 h-4 mr-3" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        },
        {
          id: 'inventory-data',
          label: '数据报表汇总',
          icon: (
            <svg className="w-4 h-4 mr-3" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        },
        {
          id: 'inventory-prewarn',
          label: '预警配置',
          icon: (
            <svg className="w-4 h-4 mr-3" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        }
      ]
    },
    {
      id: 'data-report',
      label: '数据报表汇总',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 18v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 10h4m-4 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'prewarn',
      label: '预警配置',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'account-management',
      label: '账号管理',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  // 导航处理函数
  const handleNavigate = (page: string) => {
    setActivePage(page);
    // 这里可以添加其他导航逻辑
  };

  // 过滤显示的货物
  const filteredCargos = cargos.filter(cargo => {
    const matchesSearch = cargo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cargo.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeInventoryTab === '全部') return matchesSearch;
    if (activeInventoryTab === '生活用品') return cargo.type === CargoType.CONTAINER && matchesSearch;
    if (activeInventoryTab === '机械设备') return cargo.type === CargoType.BULK && matchesSearch;
    
    return matchesSearch;
  });

  // 渲染库存概况页
  const renderInventoryOverview = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">库存总览</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="搜索物品编号或名称"
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

      {/* 库存类型选项卡 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['全部', '生活用品', '机械设备'].map(tab => (
            <button
              key={tab}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeInventoryTab === tab 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveInventoryTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* 货物卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCargos.map(cargo => (
          <div 
            key={cargo.id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCargo(cargo)}
          >
            <h3 className="text-lg font-semibold mb-2">{cargo.name}</h3>
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-sm text-gray-500">当前库存</p>
                <p className="text-lg font-bold">{cargo.weight}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">待入库</p>
                <p className="text-lg font-bold">{cargo.volume > cargo.weight ? cargo.volume - cargo.weight : cargo.weight}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 货物详情弹窗 */}
      {selectedCargo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedCargo.name}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedCargo(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="font-medium">类型:</span>
                <span>{selectedCargo.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">重量:</span>
                <span>{selectedCargo.weight}吨</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">体积:</span>
                <span>{selectedCargo.volume}㎥</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">状态:</span>
                <span>{selectedCargo.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">目的地:</span>
                <span>{selectedCargo.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">到达日期:</span>
                <span>{selectedCargo.arrivalDate?.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => setSelectedCargo(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染报表页面
  const renderReportPage = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">报表统计</h2>
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded-md ${reportTab === 'charts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setReportTab('charts')}
          >
            图表展示
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${reportTab === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setReportTab('table')}
          >
            列表视图
          </button>
        </div>
      </div>

      {reportTab === 'charts' ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">各库存点使用率</h3>
          <div className="grid grid-cols-7 gap-4 mb-8">
            {mockStoreData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-sm font-medium mb-2">{item.store}</div>
                <div className="relative h-32 w-6 bg-gray-200 rounded-full mb-2">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-full"
                    style={{ height: `${item.level}%` }}
                  ></div>
                </div>
                <div className="text-sm font-bold">{item.level}%</div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-4">库存趋势 - 过去30天</h3>
          <div className="h-64 border-b border-gray-300 relative">
            {/* 这里只是模拟图表 */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
            <div className="absolute left-0 bottom-0 top-0 w-px bg-gray-300"></div>
            
            {/* 模拟折线图 */}
            <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path 
                d="M0,150 C50,120 100,180 150,80 C200,150 250,30 300,90 C350,10 400,70 400,100" 
                stroke="#3B82F6" 
                strokeWidth="2" 
                fill="none"
              />
              <path 
                d="M0,170 C30,150 70,190 120,160 C170,130 220,170 270,120 C320,150 370,100 400,130" 
                stroke="#10B981" 
                strokeWidth="2" 
                fill="none"
              />
            </svg>
            
            <div className="absolute bottom-2 left-2 text-xs text-gray-500">08:22</div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">17:52</div>
          </div>
          <div className="mt-4 flex justify-center space-x-8">
            <div className="flex items-center">
              <div className="h-2 w-4 bg-blue-500 mr-2"></div>
              <span className="text-sm">Traffic</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-4 bg-green-500 mr-2"></div>
              <span className="text-sm">Payments</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">油品库存明细</h3>
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-gray-500 text-sm">当前库存</span>
              <div className="text-xl font-bold">1,245</div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">待入库</span>
              <div className="text-xl font-bold">107</div>
            </div>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">记录</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">批次号</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">补充</td>
                <td className="px-6 py-4 whitespace-nowrap">200</td>
                <td className="px-6 py-4 whitespace-nowrap">2023-3-12 18:00:52</td>
                <td className="px-6 py-4 whitespace-nowrap">LOT-20230312-001</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">申领</td>
                <td className="px-6 py-4 whitespace-nowrap">1</td>
                <td className="px-6 py-4 whitespace-nowrap">2023-3-11 18:00:52</td>
                <td className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">申领</td>
                <td className="px-6 py-4 whitespace-nowrap">2</td>
                <td className="px-6 py-4 whitespace-nowrap">2023-3-10 18:00:52</td>
                <td className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">申领</td>
                <td className="px-6 py-4 whitespace-nowrap">3</td>
                <td className="px-6 py-4 whitespace-nowrap">2023-3-09 18:00:52</td>
                <td className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">申领</td>
                <td className="px-6 py-4 whitespace-nowrap">4</td>
                <td className="px-6 py-4 whitespace-nowrap">2023-3-08 18:00:52</td>
                <td className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-blue-900 text-white shadow z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-3 hover:bg-blue-800 p-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <img src="/ship-icon.svg" alt="船舶图标" className="w-8 h-8 mr-2" />
            <h1 className="text-xl font-bold">船舶ABC-123</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
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

      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar 
          activePage={activePage} 
          onNavigate={handleNavigate} 
          menuItems={shipDetailMenuItems} 
        />

        {/* 主要内容 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{ship.name}</h2>
                  <p className="text-gray-500">{ship.type} | {ship.status}</p>
                </div>
                <div className="space-x-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    编辑信息
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                    添加货物
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">容量</h3>
                  <p className="text-xl font-bold">{ship.capacity}吨</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">当前载重</h3>
                  <p className="text-xl font-bold">{ship.currentLoad}吨</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">位置</h3>
                  <p className="text-xl font-bold">{ship.location}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">上次维护</h3>
                  <p className="text-xl font-bold">{ship.lastMaintenance.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">使用率</h3>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(ship.currentLoad / ship.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-sm text-gray-600">
                  <span>已使用: {((ship.currentLoad / ship.capacity) * 100).toFixed(1)}%</span>
                  <span>剩余空间: {(ship.capacity - ship.currentLoad)}吨</span>
                </div>
              </div>
            </div>

            <ul className="flex border-b border-gray-200 mb-6">
              <li className="mr-2">
                <button
                  className={`py-2 px-4 font-medium text-sm ${
                    reportTab !== 'charts' && reportTab !== 'table'
                      ? 'bg-white border-t border-l border-r rounded-t-lg text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setReportTab('')}
                >
                  库存总览
                </button>
              </li>
              <li className="mr-2">
                <button
                  className={`py-2 px-4 font-medium text-sm ${
                    reportTab === 'charts' || reportTab === 'table'
                      ? 'bg-white border-t border-l border-r rounded-t-lg text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setReportTab('charts')}
                >
                  报表页面
                </button>
              </li>
            </ul>

            {reportTab === 'charts' || reportTab === 'table' ? renderReportPage() : renderInventoryOverview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipDetailPage; 