import { Ship } from '../types';

interface ShipDetailProps {
  ship: Ship | null;
}

const ShipDetail = ({ ship }: ShipDetailProps) => {
  if (!ship) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">请选择一艘船舶查看详情</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{ship.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">船舶类型</h3>
          <p className="mt-1 text-lg">{ship.type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">船舶状态</h3>
          <p className="mt-1 text-lg">{ship.status}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">当前位置</h3>
          <p className="mt-1 text-lg">{ship.location}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">最近维护日期</h3>
          <p className="mt-1 text-lg">{formatDate(ship.lastMaintenance)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">载重情况</h3>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full" 
            style={{ width: `${(ship.currentLoad / ship.capacity) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-sm text-gray-600">
          <span>当前载重: {ship.currentLoad}吨</span>
          <span>总容量: {ship.capacity}吨</span>
          <span>使用率: {((ship.currentLoad / ship.capacity) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          编辑船舶信息
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          管理货物
        </button>
      </div>
    </div>
  );
};

export default ShipDetail; 