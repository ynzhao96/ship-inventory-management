import { Cargo } from '../types';

interface CargoDetailProps {
  cargo: Cargo | null;
}

const CargoDetail = ({ cargo }: CargoDetailProps) => {
  if (!cargo) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">请选择货物查看详情</p>
      </div>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '未设定';
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{cargo.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">货物类型</h3>
          <p className="mt-1 text-lg">{cargo.type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">货物状态</h3>
          <p className="mt-1 text-lg">{cargo.status}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">重量</h3>
          <p className="mt-1 text-lg">{cargo.weight}吨</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">体积</h3>
          <p className="mt-1 text-lg">{cargo.volume}㎥</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">目的地</h3>
          <p className="mt-1 text-lg">{cargo.destination}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">预计到达日期</h3>
          <p className="mt-1 text-lg">{formatDate(cargo.arrivalDate)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">装载船舶</h3>
        <p className="text-lg">
          {cargo.shipId ? `船舶ID: ${cargo.shipId}` : '未分配船舶'}
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          编辑货物信息
        </button>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
          分配船舶
        </button>
      </div>
    </div>
  );
};

export default CargoDetail; 