import { useEffect, useState, useMemo, useRef } from 'react';
import { Category, InboundItemInput } from '../types';
import { createInboundBatch } from '../services/createInboundBatch.ts';
import { getCategories } from '../services/getCategories.ts';
import { updateItems } from '../services/updateItems.ts';
import { getItemInfo } from '../services/getItemInfo.ts';
import ConfirmModal from '../components/ConfirmModal.tsx';
import Toast from '../components/Toast.tsx';

interface Props {
  shipId?: string;
}

const SupplyFormPage: React.FC<Props> = ({ shipId }) => {
  const [batchNumber, setBatchNumber] = useState('');
  const [supplyItems, setSupplyItems] = useState<InboundItemInput[]>([{ itemId: '', itemName: '', categoryId: '', quantity: 0, unit: '' }]);
  const [categories, setCategories] = useState<Category[]>([]);
  // 缓存 & 竞态版本号
  const itemCacheRef = useRef<Map<string, any>>(new Map());
  const rowVersionRef = useRef<number[]>([]);

  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  // 清空页面所有信息
  const clearAll = () => {
    setBatchNumber('');
    setSupplyItems([]);
  };

  useEffect(() => {
    (async () => {
      const result = await getCategories();
      if (!result.success) {
        throw new Error(result.error || '获取物资种类失败');
      }

      setCategories(result.data as Category[]);
    })();
  }, []);

  // 增加
  const handleAddSupplyItem = () => {
    const newItem = { id: (supplyItems.length + 1).toString(), itemId: '', itemName: '', categoryId: '', quantity: 0, unit: '' };
    setSupplyItems([...supplyItems, newItem]);
  };

  // 编辑
  const handleUpdateSupplyItem = (id: string | number, field: string, value: string | number) => {
    setSupplyItems(prev =>
      prev.map((item, idx) => {
        const isTarget = typeof id === 'number' ? idx === id : String(idx) === String(id);
        if (!isTarget) return item;

        const next = { ...item, [field]: value };

        if (field === 'itemId') {
          const cat = deriveCategoryIdFromItemId(value);
          next.categoryId = cat || '';
        }

        return next;
      })
    );

    // 在用户编辑 itemId 时，触发去抖查询并自动回填
    if (field === 'itemId') {
      debouncedAutoFill(typeof id === 'number' ? id : Number(id), String(value));
    }
  };

  // 删除
  const handleDeleteSupplyItem = (id: string | number) => {
    setSupplyItems(supplyItems.filter((_item, index) => index !== id));
  };

  // 提交
  const handleSubmitSupply = async () => {
    const items = supplyItems.map((i) => ({
      itemId: i.itemId + '',
      itemName: i.itemName,
      itemNameEn: i.itemNameEn,
      categoryId: i.categoryId,
      unit: i.unit,
      specification: i.specification
    }));
    updateItems(items);
    const res = await createInboundBatch({ batchNo: batchNumber, shipId: shipId, items: supplyItems });

    setToastText(res.message || '');
    requestAnimationFrame(() => setShowToast(true));
    clearAll();
  };

  const deriveCategoryIdFromItemId = (v: string | number): string => {
    const m = String(v ?? '').trim().match(/^\d{2}/); // 只取前两位数字
    return m ? m[0] : '';
  };

  // 简易防抖
  function debounce<F extends (...args: any[]) => void>(fn: F, wait = 300) {
    let t: any;
    return (...args: Parameters<F>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // 自动回填：仅把空字段补上；categoryId 优先用表里返回的，其次用前两位派生
  const autoFillFromItemsTable = async (rowIndex: number, rawItemId: string | number) => {
    const itemId = String(rawItemId ?? '').trim();
    if (!itemId) return;

    // 为该行递增一次版本号，用于竞态保护
    rowVersionRef.current[rowIndex] = (rowVersionRef.current[rowIndex] || 0) + 1;
    const ver = rowVersionRef.current[rowIndex];

    try {
      let item = itemCacheRef.current.get(itemId);
      if (!item) {
        const r = await getItemInfo(itemId);
        if (!r.success || !r.data) return;
        item = r.data;
        itemCacheRef.current.set(itemId, item);
      }

      // 如果期间用户又改了 itemId，这里旧请求就忽略
      if (rowVersionRef.current[rowIndex] !== ver) return;

      setSupplyItems(prev => prev.map((it, idx) => {
        if (idx !== rowIndex) return it;
        const next = { ...it };

        // 只在这些字段为空时回填，避免覆盖用户手动输入
        if (!next.itemName) next.itemName = item.itemName ?? next.itemName;
        if (!next.itemNameEn) next.itemNameEn = item.itemNameEn ?? next.itemNameEn;
        if (!next.unit) next.unit = item.unit ?? next.unit;
        if (!next.specification) next.specification = item.specification ?? next.specification;

        // categoryId 优先用表中值，否则用前两位派生
        const derivedCat = deriveCategoryIdFromItemId(itemId);
        next.categoryId = item.categoryId ?? derivedCat ?? next.categoryId;

        return next;
      }));
    } catch (e) {
      // 静默失败即可；可按需 toast
    }
  };

  // 去抖包装，避免高频请求
  const debouncedAutoFill = useMemo(
    () => debounce(autoFillFromItemsTable, 300),
    []
  );

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称(英文)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资种类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单位</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">规格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplyItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemId}
                      onChange={(e) => handleUpdateSupplyItem(index, 'itemId', e.target.value)}
                      placeholder="请输入物资编号"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemName}
                      onChange={(e) => handleUpdateSupplyItem(index, 'itemName', e.target.value)}
                      placeholder="请输入物资名称"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemNameEn}
                      onChange={(e) => handleUpdateSupplyItem(index, 'itemNameEn', e.target.value)}
                      placeholder="请输入物资名称(英文)"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                      value={categories.find(c => c.categoryId === item.categoryId)?.categoryName ?? ''}
                    >
                    </input>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.quantity}
                      onChange={(e) => handleUpdateSupplyItem(index, 'quantity', Number(e.target.value))}
                      placeholder="请输入数量"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.unit}
                      onChange={(e) => handleUpdateSupplyItem(index, 'unit', e.target.value)}
                      placeholder="请输入单位名称"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.specification}
                      onChange={(e) => handleUpdateSupplyItem(index, 'specification', e.target.value)}
                      placeholder="请输入规格"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteSupplyItem(index)}
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
          onClick={() => setShowModal(true)}
        >
          提交
        </button>

        <ConfirmModal
          open={showModal}
          title="确认提交"
          message="确定提交这批物资吗？此操作不可恢复。"
          confirmText="提交"
          onConfirm={() => { handleSubmitSupply(); setShowModal(false); }}
          onCancel={() => setShowModal(false)}
        />

        <Toast
          open={showToast}
          message={toastText}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
};

export default SupplyFormPage; 