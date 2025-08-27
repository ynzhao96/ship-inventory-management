import { useEffect, useMemo, useState } from 'react';
import { Ship } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { getShipList } from '../services/getShipList';

const ShipListPage = ({ }: { onLogout: () => void }) => {
  const navigate = useNavigate();

  // 数据状态
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // UI 状态
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState('ship-management');

  // 挂载时请求数据；卸载时中止
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError('');

        const result = await getShipList();
        // 如果你没改 api.ts，这里用 result.user；改了就用 result.data
        if (!result.success) {
          throw new Error(result.error || '获取船舶失败');
        }

        // 假设后端返回的每条数据字段与你的 Ship 类型一致；
        // 如果不一致，在这里做一次映射转换为 Ship 类型。
        setShips(result.data as Ship[]);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || '获取船舶失败');
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const handleSelectShip = (shipId: string) => {
    navigate(`/ships/${shipId}`);
  };

  const shipListMenuItems = [
    { id: 'ship-management', label: '船舶管理', icon: /* 省略你的 SVG */ (<span className="sr-only">icon</span>) },
    { id: 'data-report', label: '数据报表汇总', icon: (<span className="sr-only">icon</span>) },
    { id: 'anomaly', label: '异常', icon: (<span className="sr-only">icon</span>) },
  ];

  const handleNavigate = (page: string) => setActivePage(page);

  // 过滤 + 搜索（useMemo 避免每次渲染都重新计算）
  const filteredShips = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ships.filter((ship) => {
      const matchesSearch =
        !term ||
        ship.id?.toLowerCase()?.includes(term) ||
        ship.name?.toLowerCase()?.includes(term);

      return matchesSearch;
    });
  }, [ships, searchTerm]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Header title="船舶管理系统" notificationCount={11} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          menuItems={shipListMenuItems}
        />

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">船只选择</h2>

              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索船只编号或名称"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* 你的搜索图标 */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <button className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-500 text-white rounded-r-md">
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* 加载/错误/空态 */}
            {loading && (
              <div className="text-gray-500">加载中...</div>
            )}
            {!loading && error && (
              <div className="text-red-600">加载失败：{error}</div>
            )}
            {!loading && !error && filteredShips.length === 0 && (
              <div className="text-gray-500">暂无数据</div>
            )}

            {/* 船舶卡片网格 */}
            {!loading && !error && filteredShips.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredShips.map((ship) => (
                  <div
                    key={ship.id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectShip(ship.id)}
                  >
                    <h3 className="text-lg font-semibold mb-2">{ship.id} {ship.name}</h3>
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">总库存</p>
                        <p className="text-lg font-bold">{(ship as any).currentLoad ?? '--'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">待入库</p>
                        <p className="text-lg font-bold">
                          {
                            (() => {
                              const capacity = (ship as any).capacity ?? 0;
                              const current = (ship as any).currentLoad ?? 0;
                              if (!capacity) return '--';
                              const diff = capacity - current;
                              return diff > 100 ? 100 : diff;
                            })()
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipListPage;
