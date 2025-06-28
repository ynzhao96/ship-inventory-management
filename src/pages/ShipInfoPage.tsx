import React from 'react';
import { Ship } from '../types';

interface ShipInfoPageProps {
  ship: Ship;
}

const ShipInfoPage: React.FC<ShipInfoPageProps> = ({ ship }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{ship.name}</h2>
      <div className="space-x-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          编辑信息
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">船舶编号</h3>
          <p className="text-lg font-semibold">{ship.id}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">船舶类型</h3>
          <p className="text-lg font-semibold">{ship.type}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">船舶状态</h3>
          <p className="text-lg font-semibold">{ship.status}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">当前位置</h3>
          <p className="text-lg font-semibold">{ship.location}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">总容量</h3>
          <p className="text-lg font-semibold">{ship.capacity}吨</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">当前载重</h3>
          <p className="text-lg font-semibold">{ship.currentLoad}吨</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">使用率</h3>
          <div className="mt-2">
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
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-1">上次维护时间</h3>
          <p className="text-lg font-semibold">{ship.lastMaintenance.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ShipInfoPage; 