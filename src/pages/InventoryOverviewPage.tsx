import React, { useEffect, useState } from 'react';
import { Category, InventoryItem, Inbound, ItemLog } from '../types';
import { getInventoryList } from '../services/getInventoryList.ts';
import { getCategories } from '../services/getCategories.ts';
import { getInboundList } from '../services/getInboundList.ts';
import { getItemLogs } from '../services/getItemLogs.ts';
import Pagination from '../components/Pagination.tsx';

interface InventoryOverviewPageProps {
  shipId?: string;
}
const InventoryOverviewPage: React.FC<InventoryOverviewPageProps> = ({ shipId }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inbounds, setInbounds] = useState<Inbound[]>([]);

  const [inventoryView, setInventoryView] = useState<'cards' | 'list'>('list');
  const [searchMatch, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('入库提交');
  const [itemLogs, setItemLogs] = useState<ItemLog>({} as ItemLog);

  // 分页相关
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [category, setCategory] = useState('');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    (async () => {
      const res = await getInventoryList(shipId, category, page, pageSize, searchMatch);
      if (!res.success) {
        throw new Error(res.error || '获取物资库存失败');
      }
      setItems(res.data.list);
      setTotal(res.data.total);
    })();
  }, [page, pageSize, category, searchMatch]);

  useEffect(() => {
    setPage(1);
  }, [category, searchMatch]);

  useEffect(() => {
    (async () => {
      const res2 = await getCategories();
      if (!res2.success) {
        throw new Error(res2.error || '获取物资种类失败');
      }

      setCategories(res2.data as Category[]);

      const res3 = await getInboundList(shipId);
      if (!res3.success) {
        throw new Error(res2.error || '获取待入库信息失败');
      }
      setInbounds(res3.data);
    })();
  }, []);

  useEffect(() => {
    inbounds.forEach(inbound => {
      const item = items.find(x => x.itemId === inbound.itemId);
      if (item) {
        item.inboundQuantity ??= 0;
        item.inboundQuantity += Number(inbound.quantity) || 0;
      }
    })
  }, [items, inbounds]);

  const handleItemClick = async (item: InventoryItem) => {
    const res = await getItemLogs(String(item.itemId), shipId || '');
    setItemLogs(res.data);
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  // 渲染物资详情
  const renderItemDetail = () => {
    if (!selectedItem) return null;

    let filteredRecords: any[] = [];
    if (activeTab === '入库提交') {
      filteredRecords = itemLogs?.inbounds || [];
    } else if (activeTab === '入库确认') {
      filteredRecords = itemLogs?.confirms || [];
    } else if (activeTab === '申领记录') {
      filteredRecords = itemLogs?.claims || [];
    } else {
      // 全部：合并并打上来源标签，便于区分
      filteredRecords = [
        ...(itemLogs?.inbounds || []).map(r => ({ ...r, __type: '入库提交' })),
        ...(itemLogs?.confirms || []).map(r => ({ ...r, __type: '入库确认' })),
        ...(itemLogs?.claims || []).map(r => ({ ...r, __type: '申领记录' })),
      ];
    }

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.itemName}</h2>
                <p className="text-gray-500">物资编号：{selectedItem.itemId}</p>
                <p className="text-gray-500">规格：{selectedItem.specification}</p>
                <p className="text-gray-500">备注：{selectedItem.remark}</p>
              </div>
              <button
                onClick={() => setShowItemDetail(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {['入库提交', '入库确认', '申领记录'].map(tab => (
                  <button
                    key={tab}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  {activeTab === '入库提交' && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">批次号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                    </tr>
                  )}
                  {activeTab === '入库确认' && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">批次号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实际数量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
                    </tr>
                  )}
                  {activeTab === '申领记录' && (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申领人</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === '入库提交' && (
                    filteredRecords.map(record =>
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.batchNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.createdAt}</td>
                      </tr>)
                  )}
                  {activeTab === '入库确认' && (
                    filteredRecords.map(record =>
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.batchNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.actualQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.confirmedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.confirmRemark}</td>
                      </tr>)
                  )}
                  {activeTab === '申领记录' && (
                    filteredRecords.map(record =>
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.claimer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.claimedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">{record.claimRemark}</td>
                      </tr>)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">库存总览</h2>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${inventoryView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setInventoryView('list')}
          >
            列表视图
          </button>
          <button
            className={`px-4 py-2 rounded-md ${inventoryView === 'cards' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setInventoryView('cards')}
          >
            卡片视图
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="搜索物资编号或名称"
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          value={searchMatch}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap space-x-8">
          {[{ categoryId: '', categoryName: '全部' }, ...categories].map(tab => (
            <button
              key={tab.categoryId}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${category === tab.categoryId
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setCategory(tab.categoryId)}
            >
              {tab.categoryName}
            </button>
          ))}
        </nav>
      </div>

      {inventoryView === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{item.itemName}</h3>
                <span className="text-sm text-gray-500">{item.itemId}</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">{categories.find(category => category.categoryId === item.categoryId)?.categoryName || ''}</div>
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500">当前库存</p>
                  <p className="text-lg font-bold">{item.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">待入库</p>
                  <p className="text-lg font-bold">{item.inboundQuantity ?? ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资编号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资种类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前库存</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">待入库</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{item.itemId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{categories.find(category => category.categoryId === item.categoryId)?.categoryName || ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.inboundQuantity ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* <div className="flex items-center justify-end gap-3 py-3">
        <span className="text-sm text-gray-500">
          显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total || 0)} / 共 {total || 0}
        </span>
        <select value={pageSize} onChange={e => { setPage(1); setPageSize(Number(e.target.value)); }}>
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}/页</option>)}
        </select>
        <button disabled={!canPrev} onClick={() => { setPage(p => p - 1); }}>上一页</button>
        <span>{page} / {totalPages}</span>
        <button disabled={!canNext} onClick={() => { setPage(p => p + 1); }}>下一页</button>
      </div> */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        canPrev={page > 1}
        canNext={page < totalPages}
        onChangePage={setPage}
        onChangePageSize={setPageSize}
      />
      {showItemDetail && renderItemDetail()}
    </div>
  )
}

export default InventoryOverviewPage;
