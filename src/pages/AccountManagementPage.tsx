import { useEffect, useState } from 'react';
import { getUserInfo } from '../api';
import { UserInfo } from '../types';

interface Props {
  shipId?: string;
}

const AccountManagementPage: React.FC<Props> = ({ shipId }) => {

  const [accountInfo, setAccountInfo] = useState<UserInfo>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');

        const result = await getUserInfo(shipId);
        if (!result.success) {
          throw new Error(result.error || '获取船舶信息失败');
        }

        setAccountInfo(result.data);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || '获取船舶信息失败');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAccountInfoChange = (field: string, value: string) => {
    setAccountInfo({ ...accountInfo, [field]: value });
  };

  const handleSaveAccountInfo = () => {
    console.log('保存账号信息:', accountInfo);
  };

  return (
    <>
      {/* 加载/错误/空态 */}
      {loading && (
        <div className="text-gray-500">加载中...</div>
      )}
      {!loading && error && (
        <div className="text-red-600">加载失败：{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">账号管理</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">账号</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={accountInfo?.username}
                onChange={(e) => handleAccountInfoChange('username', e.target.value)}
                placeholder="请输入账号"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={accountInfo?.password}
                onChange={(e) => handleAccountInfoChange('password', e.target.value)}
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSaveAccountInfo}
            >
              保存
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountManagementPage; 