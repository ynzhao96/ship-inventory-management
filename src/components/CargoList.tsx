import { useState } from 'react';
import { Cargo, CargoStatus } from '../types';

interface CargoListProps {
  cargos: Cargo[];
  onSelectCargo: (cargo: Cargo) => void;
}

const CargoList = ({ cargos, onSelectCargo }: CargoListProps) => {
  const [filter, setFilter] = useState<string>('');
  
  const filteredCargos = cargos.filter(cargo => 
    cargo.name.toLowerCase().includes(filter.toLowerCase()) ||
    cargo.type.toLowerCase().includes(filter.toLowerCase()) ||
    cargo.status.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusClass = (status: CargoStatus) => {
    switch(status) {
      case CargoStatus.STORED:
        return 'bg-blue-100 text-blue-800';
      case CargoStatus.LOADING:
        return 'bg-yellow-100 text-yellow-800';
      case CargoStatus.IN_TRANSIT:
        return 'bg-green-100 text-green-800';
      case CargoStatus.UNLOADING:
        return 'bg-purple-100 text-purple-800';
      case CargoStatus.DELIVERED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">货物列表</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索货物..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重量/体积</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目的地</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCargos.length > 0 ? (
              filteredCargos.map((cargo) => (
                <tr 
                  key={cargo.id} 
                  onClick={() => onSelectCargo(cargo)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(cargo.status)}`}>
                      {cargo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {`${cargo.weight}吨 / ${cargo.volume}㎥`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{cargo.destination}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  未找到匹配的货物
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CargoList; 