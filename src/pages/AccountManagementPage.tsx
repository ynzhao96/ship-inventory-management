import { useState } from 'react';

const AccountManagementPage = () => {
  // 模拟账号管理数据
  const mockAccountData = {
    username: 'qwerty',
    password: '123456',
  };
  const [accountInfo, setAccountInfo] = useState(mockAccountData);

  const handleAccountInfoChange = (field: string, value: string) => {
    setAccountInfo({ ...accountInfo, [field]: value });
  };

  const handleSaveAccountInfo = () => {
    console.log('保存账号信息:', accountInfo);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">账号管理</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">账号</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={accountInfo.username}
            onChange={(e) => handleAccountInfoChange('username', e.target.value)}
            placeholder="请输入账号"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={accountInfo.password}
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
  );
};

export default AccountManagementPage; 