import { useState } from 'react';
import { createInboundBatch } from '../api.ts';
import { InboundItemInput } from '../types';

const SupplyFormPage = (shipId: any) => {
  const [batchNumber, setBatchNumber] = useState('');
  const [supplyItems, setSupplyItems] = useState<InboundItemInput[]>([{ id: '1', itemId: '', itemName: '', itemType: '生活用品', quantity: 0, unit: '' }]);

  const handleAddSupplyItem = () => {
    const newItem = { id: (supplyItems.length + 1).toString(), itemId: '', itemName: '', itemType: '生活用品', quantity: 0, unit: '' };
    setSupplyItems([...supplyItems, newItem]);
  };

  const handleUpdateSupplyItem = (id: string, field: string, value: string | number) => {
    setSupplyItems(supplyItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDeleteSupplyItem = (id: string) => {
    if (supplyItems.length > 1) {
      setSupplyItems(supplyItems.filter(item => item.id !== id));
    }
  };

  const handleSubmitSupply = () => {
    createInboundBatch({ batchNo: batchNumber, shipId: shipId, items: supplyItems });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">物资补充</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">批次号</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={batchNumber}
          onChange={(e) => setBatchNumber(e.target.value)}
          placeholder="请输入批次号"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">物资详情</h3>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleAddSupplyItem}
          >
            添加物资
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资种类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单位</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplyItems.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemId}
                      onChange={(e) => handleUpdateSupplyItem(item.id, 'itemId', e.target.value)}
                      placeholder="请输入物资编号"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemName}
                      onChange={(e) => handleUpdateSupplyItem(item.id, 'itemName', e.target.value)}
                      placeholder="请输入物资名称"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemType}
                      onChange={(e) => handleUpdateSupplyItem(item.id, 'itemType', e.target.value)}
                    >
                      <option value="生活用品">生活用品</option>
                      <option value="维护物资">维护物资</option>
                      <option value="其他">其他</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.quantity}
                      onChange={(e) => handleUpdateSupplyItem(item.id, 'quantity', Number(e.target.value))}
                      placeholder="请输入数量"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.unit}
                      onChange={(e) => handleUpdateSupplyItem(item.id, 'unit', e.target.value)}
                      placeholder="请输入单位名称"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteSupplyItem(item.id)}
                      disabled={supplyItems.length === 1}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleSubmitSupply}
        >
          提交
        </button>
      </div>
    </div>
  );
};

export default SupplyFormPage; 