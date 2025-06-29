import React, { useState } from 'react';
import { Cargo, CargoType, CargoStatus, Ship } from '../types';

interface InventoryOverviewPageProps {
  ship: Ship;
}
const InventoryOverviewPage: React.FC<InventoryOverviewPageProps> = ({ ship }) => {
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
  const [inventoryView, setInventoryView] = useState<'cards' | 'list'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeInventoryTab, setActiveInventoryTab] = useState('全部');
  const [cargos] = useState<Cargo[]>(mockCargos.filter(cargo => cargo.shipId === ship.id));
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [showCargoDetail, setShowCargoDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('入库提交');
  


  // 过滤显示的货物
  const filteredCargos = cargos.filter(cargo => {
    const matchesSearch = cargo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cargo.cargoCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeInventoryTab === '全部') return matchesSearch;
    return cargo.cargoCategory === activeInventoryTab && matchesSearch;
  });

  const handleCargoClick = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setShowCargoDetail(true);
  };

  // 渲染物资详情
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

  return (
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeInventoryTab === tab
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
      {showCargoDetail && renderCargoDetail()}
    </div>
  )
}

export default InventoryOverviewPage;
