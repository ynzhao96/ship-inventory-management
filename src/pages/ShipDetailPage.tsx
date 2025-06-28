import React, { useState } from 'react';
import { Ship, ShipType, ShipStatus, Cargo, CargoType, CargoStatus } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ShipInfoPage from './ShipInfoPage';
import SupplyFormPage from './SupplyFormPage';
import WarningConfigPage from './WarningConfigPage';
import DataReportPage from './DataReportPage';
import AccountManagementPage from './AccountManagementPage';

interface ShipDetailPageProps {
  onBack: () => void;
  ship: Ship;
}

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
    arrivalDate: new Date('2023-05-20'),
    cargoCode: 'M001',
    cargoCategory: '维护物资',
    quantity: 200
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
    arrivalDate: new Date('2023-05-20'),
    cargoCode: 'M002',
    cargoCategory: '维护物资',
    quantity: 150
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
    arrivalDate: new Date('2023-06-10'),
    cargoCode: 'L001',
    cargoCategory: '生活用品',
    quantity: 50
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
    arrivalDate: new Date('2023-06-15'),
    cargoCode: 'S001',
    cargoCategory: '安全设备',
    quantity: 20
  }
];




const ShipDetailPage: React.FC<ShipDetailPageProps> = ({ onBack, ship }) => {
  const [cargos] = useState<Cargo[]>(mockCargos.filter(cargo => cargo.shipId === ship.id));
  const [activeInventoryTab, setActiveInventoryTab] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [showCargoDetail, setShowCargoDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('入库提交');
  const [activePage, setActivePage] = useState('ship-info');
  const [batchNumber, setBatchNumber] = useState('');
  const [supplyItems, setSupplyItems] = useState<Array<{
    id: string;
    cargoId: string;
    cargoName: string;
    cargoType: string;
    quantity: number;
  }>>([{ id: '1', cargoId: '', cargoName: '', cargoType: '生活用品', quantity: 0 }]);
  const [inventoryView, setInventoryView] = useState<'cards' | 'list'>('cards');

  // 船舶详情页特定的侧边栏菜单项
  const shipDetailMenuItems = [
    {
      id: 'ship-info',
      label: '船舶信息',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'add-supply',
      label: '物资入库',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'inventory-storage',
      label: '物资库存',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
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
      id: 'inventory-prewarn',
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
                          cargo.cargoCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeInventoryTab === '全部') return matchesSearch;
    return cargo.cargoCategory === activeInventoryTab && matchesSearch;
  });

  

  

  // 添加新的物资行
  const handleAddSupplyItem = () => {
    const newItem = {
      id: (supplyItems.length + 1).toString(),
      cargoId: '',
      cargoName: '',
      cargoType: '生活用品',
      quantity: 0
    };
    setSupplyItems([...supplyItems, newItem]);
  };

  // 更新物资行
  const handleUpdateSupplyItem = (id: string, field: string, value: string | number) => {
    setSupplyItems(supplyItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 删除物资行
  const handleDeleteSupplyItem = (id: string) => {
    if (supplyItems.length > 1) {
      setSupplyItems(supplyItems.filter(item => item.id !== id));
    }
  };

  // 提交物资补充表单
  const handleSubmitSupply = () => {
    // 这里添加提交逻辑
    console.log('提交物资补充:', {
      batchNumber,
      supplyItems
    });
  };

  const handleCargoClick = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setShowCargoDetail(true);
  };

  const renderCargoDetail = () => {
    if (!selectedCargo) return null;

    const mockRecords = [
      { id: '1', type: '入库提交', date: '2024-03-20 14:30:00', quantity: 100 },
      { id: '2', type: '入库确认', date: '2024-03-19 09:15:00', quantity: 50 },
      { id: '3', type: '申领记录', date: '2024-03-18 16:45:00', quantity: 30 },
      { id: '4', type: '入库提交', date: '2024-03-17 11:20:00', quantity: 200 },
      { id: '5', type: '入库确认', date: '2024-03-16 10:00:00', quantity: 150 },
    ];

    const filteredRecords = mockRecords.filter(record => {
      if (activeTab === '全部') return true;
      return record.type === activeTab;
    });

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCargo.name}</h2>
                <p className="text-gray-500">物资编号：{selectedCargo.cargoCode}</p>
              </div>
              <button
                onClick={() => setShowCargoDetail(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {['全部', '入库提交', '入库确认', '申领记录'].map(tab => (
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

            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map(record => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{record.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{record.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染库存概况页
  const renderInventoryOverview = () => (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">库存总览</h2>
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded-md ${inventoryView === 'cards' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setInventoryView('cards')}
          >
            卡片视图
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${inventoryView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setInventoryView('list')}
          >
            列表视图
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="搜索物资编号或名称"
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

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['全部', '生活用品', '维护物资', '安全设备'].map(tab => (
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

      {inventoryView === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCargos.map(cargo => (
            <div 
              key={cargo.id} 
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCargoClick(cargo)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{cargo.name}</h3>
                <span className="text-sm text-gray-500">{cargo.cargoCode}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">{cargo.cargoCategory}</div>
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500">当前库存</p>
                  <p className="text-lg font-bold">{cargo.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">待入库</p>
                  <p className="text-lg font-bold">{cargo.volume > cargo.quantity ? cargo.volume - cargo.quantity : cargo.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资种类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前库存</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">待入库</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCargos.map(cargo => (
                <tr 
                  key={cargo.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCargoClick(cargo)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.cargoCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.cargoCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.volume > cargo.quantity ? cargo.volume - cargo.quantity : cargo.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Header 
        title={`船舶${ship.id}`}
        notificationCount={2}
        onBack={onBack}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activePage={activePage} 
          onNavigate={handleNavigate} 
          menuItems={shipDetailMenuItems} 
        />

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            {activePage === 'ship-info' ? (
              <ShipInfoPage ship={ship} />
            ) : activePage === 'add-supply' ? (
              <SupplyFormPage />
            ) : activePage === 'inventory-prewarn' ? (
              <WarningConfigPage />
            ) : activePage === 'inventory-storage' ? (
              renderInventoryOverview()
            ) : activePage === 'data-report' ? (
              <DataReportPage />
            ) : activePage === 'account-management' ? (
              <AccountManagementPage />
            ) : null}
            {showCargoDetail && renderCargoDetail()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipDetailPage; 