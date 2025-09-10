import React from 'react';
import { Ship } from '../types';

interface ShipInfoPageProps {
  ship?: Ship;
}

const ShipInfoPage: React.FC<ShipInfoPageProps> = ({ ship }) => {
  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{ship?.name}</h2>
          {/* <div className="space-x-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              编辑信息
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-1">船舶编号</h3>
              <p className="text-lg font-semibold">{ship?.id}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-1">船舶类型</h3>
              <p className="text-lg font-semibold">{ship?.type}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShipInfoPage; 