import { useState } from 'react';

const DataReportPage = () => {
  // 模拟库存趋势数据
  const mockStoreData = [
    { store: 'Store-1', name: '发动机润滑油', level: 90 },
    { store: 'Store-2', name: '液压油', level: 30 },
    { store: 'Store-3', name: '安全装备', level: 20 },
    { store: 'Store-4', name: '灭火器', level: 40 },
    { store: 'Store-5', name: '干粮', level: 20 },
    { store: 'Store-6', name: '矿泉水', level: 40 },
    { store: 'Store-7', name: '油漆', level: 10 },
  ];
  const [reportTab, setReportTab] = useState('charts');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">报表统计</h2>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${reportTab === 'charts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setReportTab('charts')}
          >
            图表展示
          </button>
        </div>
      </div>

      {reportTab === 'charts' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">各库存点使用率</h3>
          <div className="grid grid-cols-7 gap-4 mb-8">
            {mockStoreData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-sm font-medium mb-2">{item.store}</div>
                <div className="relative h-32 w-6 bg-gray-200 rounded-full mb-2">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-full"
                    style={{ height: `${item.level}%` }}
                  ></div>
                </div>
                <div className="text-sm font-bold">{item.level}%</div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-4">库存趋势 - 过去30天</h3>
          <div className="h-64 border-b border-gray-300 relative">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
            <div className="absolute left-0 bottom-0 top-0 w-px bg-gray-300"></div>

            <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path
                d="M0,150 C50,120 100,180 150,80 C200,150 250,30 300,90 C350,10 400,70 400,100"
                stroke="#3B82F6"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M0,170 C30,150 70,190 120,160 C170,130 220,170 270,120 C320,150 370,100 400,130"
                stroke="#10B981"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            <div className="absolute bottom-2 left-2 text-xs text-gray-500">08:22</div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">17:52</div>
          </div>
          <div className="mt-4 flex justify-center space-x-8">
            <div className="flex items-center">
              <div className="h-2 w-4 bg-blue-500 mr-2"></div>
              <span className="text-sm">Traffic</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-4 bg-green-500 mr-2"></div>
              <span className="text-sm">Payments</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default DataReportPage; 