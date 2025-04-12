import { useState } from 'react';
import { Ship, ShipStatus } from '../types';

interface ShipListProps {
  ships: Ship[];
  onSelectShip: (ship: Ship) => void;
}

const ShipList = ({ ships, onSelectShip }: ShipListProps) => {
  const [filter, setFilter] = useState<string>('');
  
  const filteredShips = ships.filter(ship => 
    ship.name.toLowerCase().includes(filter.toLowerCase()) ||
    ship.type.toLowerCase().includes(filter.toLowerCase()) ||
    ship.status.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusClass = (status: ShipStatus) => {
    switch(status) {
      case ShipStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ShipStatus.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      case ShipStatus.DOCKED:
        return 'bg-blue-100 text-blue-800';
      case ShipStatus.LOADING:
      case ShipStatus.UNLOADING:
        return 'bg-purple-100 text-purple-800';
      case ShipStatus.DECOMMISSIONED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">船舶列表</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索船舶..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">负载</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredShips.length > 0 ? (
              filteredShips.map((ship) => (
                <tr 
                  key={ship.id} 
                  onClick={() => onSelectShip(ship)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{ship.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ship.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ship.status)}`}>
                      {ship.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{ship.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {`${ship.currentLoad} / ${ship.capacity}`}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  未找到匹配的船舶
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShipList; 