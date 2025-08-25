import { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { getThreshold } from '../api';
import { InboundItemInput } from '../types';

interface Props {
  shipId?: string;
}

const WarningConfigPage: React.FC<Props> = ({ shipId }) => {
  // 预警配置接口
  interface WarningConfig {
    id: string;
    cargoId: string;
    cargoName: string;
    threshold: number;
  }

  // 模拟预警配置数据
  const mockWarningConfigs: WarningConfig[] = [
    {
      id: 'w001',
      cargoId: '001',
      cargoName: '发动机润滑油',
      threshold: 50
    },
    {
      id: 'w002',
      cargoId: '002',
      cargoName: '液压油',
      threshold: 30
    }
  ];

  const [warningConfigs, setWarningConfigs] = useState<WarningConfig[]>(mockWarningConfigs);
  const [items, setItems] = useState<InboundItemInput[]>([]);

  // Toast
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      const res1 = await getThreshold(shipId);
      if (!res1.success) {
        throw new Error(res1.error || '获取物资库存失败');
      }

      setItems(res1.data);
      console.log(items);
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
      id: `w${warningConfigs.length + 1}`.padStart(4, '0'),
      cargoId: '',
      cargoName: '',
      threshold: 0
    };
    setWarningConfigs([...warningConfigs, newConfig]);
  };

  // 更新预警配置
  const handleUpdateWarningConfig = (id: string, field: keyof WarningConfig, value: string | number) => {
    setWarningConfigs(warningConfigs.map(config =>
      config.id === id ? { ...config, [field]: value } : config
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
            {warningConfigs.map(config => (
              <tr key={config.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.cargoId}
                    onChange={(e) => handleUpdateWarningConfig(config.id, 'cargoId', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.cargoName}
                    onChange={(e) => handleUpdateWarningConfig(config.id, 'cargoName', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.threshold}
                    onChange={(e) => handleUpdateWarningConfig(config.id, 'threshold', Number(e.target.value))}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => setWarningConfigs(warningConfigs.filter(w => w.id !== config.id))}
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