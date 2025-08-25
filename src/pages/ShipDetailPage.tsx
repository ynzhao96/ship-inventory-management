import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ShipInfoPage from './ShipInfoPage';
import SupplyFormPage from './SupplyFormPage';
import WarningConfigPage from './WarningConfigPage';
import DataReportPage from './DataReportPage';
import AccountManagementPage from './AccountManagementPage';
import InventoryOverviewPage from './InventoryOverviewPage';
import CrewManagementPage from './CrewManagementPage';
import { useParams } from 'react-router-dom';
import { Ship } from '../types';
import { getShipInfo } from '../api';

const ShipDetailPage = ({ onBack }: { onBack: () => void }) => {
  const { shipId } = useParams();
  const [activePage, setActivePage] = useState('ship-info');
  const [ship, setShip] = useState<Ship>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');

        const result = await getShipInfo(shipId);
        if (!result.success) {
          throw new Error(result.error || '获取船舶信息失败');
        }

        setShip(result.data as Ship);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || '获取船舶信息失败');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 船舶详情页特定的侧边栏菜单项
  const shipDetailMenuItems = [
    {
      id: 'ship-info',
      label: '船舶信息',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'add-supply',
      label: '物资入库',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'inventory-storage',
      label: '物资库存',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'data-report',
      label: '数据报表汇总',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 18v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 10h4m-4 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'inventory-prewarn',
      label: '预警配置',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'account-management',
      label: '账号管理',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'crew-management',
      label: '船员管理',
      icon: (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
  ];

  // 导航处理函数
  const handleNavigate = (page: string) => {
    setActivePage(page);
    // 这里可以添加其他导航逻辑
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <Header
        title={`${shipId} - ${ship?.name}`}
        notificationCount={2}
        onBack={onBack}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          menuItems={shipDetailMenuItems}
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
                {activePage === 'ship-info' ? (
                  <ShipInfoPage ship={ship} />
                ) : activePage === 'add-supply' ? (
                  <SupplyFormPage shipId={shipId} />
                ) : activePage === 'inventory-prewarn' ? (
                  <WarningConfigPage shipId={shipId} />
                ) : activePage === 'inventory-storage' ? (
                  <InventoryOverviewPage shipId={shipId} />
                ) : activePage === 'data-report' ? (
                  <DataReportPage />
                ) : activePage === 'account-management' ? (
                  <AccountManagementPage shipId={shipId} />
                ) : activePage === 'crew-management' ? (
                  < CrewManagementPage shipId={shipId} />
                ) : null}
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default ShipDetailPage; 