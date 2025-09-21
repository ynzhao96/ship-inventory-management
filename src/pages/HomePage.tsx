import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ShipListPage from './ShipListPage.tsx';
import SystemLogPage from './SystemLogPage.tsx';
import ItemListPage from './ItemListPage.tsx';
import CategoryPage from './CategoryPage.tsx';
import AbnormalInformationPage from './AbnormalInformationPage.tsx';

const HomePage = ({ }: { onBack: () => void }) => {
  const [activePage, setActivePage] = useState('ship-list');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || '获取船舶信息失败');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 首页的侧边栏菜单项
  const shipListMenuItems = [
    { id: 'ship-list', label: '船舶详情', icon: /* 省略你的 SVG */ (<span className="sr-only">icon</span>) },
    { id: 'anomaly', label: '异常', icon: (<span className="sr-only">icon</span>) },
    { id: 'item-dictionary', label: '物料指南', icon: (<span className="sr-only">icon</span>) },
    { id: 'category-dictionary', label: '类别管理', icon: (<span className="sr-only">icon</span>) },
    { id: 'data-report', label: '系统日志', icon: (<span className="sr-only">icon</span>) },
  ];

  // 导航处理函数
  const handleNavigate = (page: string) => {
    setActivePage(page);
    // 这里可以添加其他导航逻辑
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Header title="船舶管理系统" notificationCount={11} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          menuItems={shipListMenuItems}
        />

        <>
          {/* 加载/错误/空态 */}
          {loading && (
            <div className="text-gray-500">加载中...</div>
          )}
          {!loading && error && (
            <div className="text-red-600">加载失败：{error}</div>
          )}

          {!loading && !error && (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="container mx-auto px-6 py-6">
                {activePage === 'ship-list' ? (
                  <ShipListPage />
                ) : activePage === 'anomaly' ? (
                  <AbnormalInformationPage />
                ) : activePage === 'item-dictionary' ? (
                  <ItemListPage />
                ) : activePage === 'category-dictionary' ? (
                  <CategoryPage />
                ) : activePage === 'data-report' ? (
                  <SystemLogPage />
                ) : null}
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default HomePage; 