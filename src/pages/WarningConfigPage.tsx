import { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { getThreshold } from '../api';

interface Props {
  shipId?: string;
}

const WarningConfigPage: React.FC<Props> = ({ shipId }) => {
  // 预警配置接口
  interface WarningConfig {
    itemId: string;
    itemName: string;
    threshold: number;
  }

  // 模拟预警配置数据
  const [warningConfigs, setWarningConfigs] = useState<WarningConfig[]>([]);

  // Toast
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      const res1 = await getThreshold(shipId);
      if (!res1.success) {
        throw new Error(res1.error || '获取物资库存失败');
      }

      setWarningConfigs(res1.data);
    })();
  }, []);

  const handleSubmit = () => {
    console.log('submit clicked');
    setText('nothing happens');
    setOpen(false);
    requestAnimationFrame(() => setOpen(true));
  }

  // 添加新的预警配置行
  const handleAddWarningConfig = () => {
    const newConfig: WarningConfig = {
      itemId: '',
      itemName: '',
      threshold: 0
    };
    setWarningConfigs([...warningConfigs, newConfig]);
  };

  // 更新预警配置
  const handleUpdateWarningConfig = (id: number, field: keyof WarningConfig, value: string | number) => {
    setWarningConfigs(warningConfigs.map((config, index) =>
      index === id ? { ...config, [field]: value } : config
    ));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">预警配置</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleAddWarningConfig}
        >
          添加配置
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预警阈值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warningConfigs.map((config, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.itemId}
                    onChange={(e) => handleUpdateWarningConfig(index, 'itemId', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.itemName}
                    onChange={(e) => handleUpdateWarningConfig(index, 'itemName', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.threshold}
                    onChange={(e) => handleUpdateWarningConfig(index, 'threshold', Number(e.target.value))}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => setWarningConfigs(warningConfigs.filter((_w, idx) => idx !== index))}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-6">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleSubmit}
        >
          提交
        </button>
        <Toast
          open={open}
          message={text}
          onClose={() => setOpen(false)}
        />
      </div>
    </div>
  );
};

export default WarningConfigPage; 