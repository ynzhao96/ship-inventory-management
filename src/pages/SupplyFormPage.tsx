import { useEffect, useState, useMemo } from 'react';
import { Category, InboundItemInput } from '../types';
import { createInboundBatch } from '../services/createInboundBatch.ts';
import { getCategories } from '../services/getCategories.ts';
import { getItemInfo } from '../services/getItemInfo.ts';
import ConfirmModal from '../components/ConfirmModal.tsx';
import Toast from '../components/Toast.tsx';
import { debounce, deriveCategoryIdFromItemId } from '../utils.ts';

interface Props {
  shipId?: string;
}

// 在本组件中扩展一位标记：existsInItems
type SupplyRow = InboundItemInput & { existsInItems?: boolean };

const SupplyFormPage: React.FC<Props> = ({ shipId }) => {
  const [batchNumber, setBatchNumber] = useState('');
  const [supplyItems, setSupplyItems] = useState<SupplyRow[]>([
    { itemId: '', itemName: '', categoryId: '', quantity: 0, unit: '' }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 弹窗/Toast
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
      if (!result.success) throw new Error(result.error || '获取物资种类失败');
      setCategories(result.data as Category[]);
    })();
  }, []);

  const validateSupplyForm = (): string | null => {
    if (!batchNumber) return '请填写批次号';
    if (!supplyItems.length) return '请添加物资';
    for (const item of supplyItems) {
      if (!item.itemId) return '物资编号不能为空';
      if (!item.itemName) return '物资名称不能为空';
      if (!item.categoryId) return '物资类别不能为空';
      if (!item.unit) return '单位不能为空';
      const qty = typeof item.quantity === 'string' ? Number(item.quantity) : item.quantity;
      if (!qty || qty <= 0) return '数量必须大于0';
    }
    return null;
  };

  // 行新增
  const handleAddSupplyItem = () => {
    const newItem: SupplyRow = { itemId: '', itemName: '', categoryId: '', quantity: 0, unit: '' };
    setSupplyItems(prev => [...prev, newItem]);
  };

  // 行编辑
  const handleUpdateSupplyItem = (id: string | number, field: string, value: string | number) => {
    const idx = Number(id);
    setSupplyItems(prev =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const next: SupplyRow = { ...item, [field]: value } as SupplyRow;

        if (field === 'itemId') {
          const v = String(value ?? '').trim();
          next.categoryId = deriveCategoryIdFromItemId(v) || '';
          // 清空时去掉“未找到”标记
          if (!v) next.existsInItems = undefined;
        }
        return next;
      })
    );

    // 输入 itemId 时触发去抖查询
    if (field === 'itemId') {
      debouncedAutoFill(idx, String(value));
    }
  };

  // 行删除
  const handleDeleteSupplyItem = (id: string | number) => {
    const idx = Number(id);
    setSupplyItems(prev => prev.filter((_item, i) => i !== idx));
  };

  // 自动回填 + 是否存在标记
  const autoFillFromItemsTable = async (rowIndex: number, rawItemId: string | number) => {
    const itemId = String(rawItemId ?? '').trim();
    if (!itemId) return;

    try {
      const r = await getItemInfo(itemId);
      const found = !!(r && r.success && r.data && Object.keys(r.data || {}).length > 0);
      const item = (r?.data || {}) as Partial<InboundItemInput>;

      setSupplyItems(prev => {
        // 避免陈旧响应污染：只在当前值仍然是这个 itemId 时才落库
        if (prev[rowIndex]?.itemId !== itemId) return prev;

        return prev.map((it, idx) => {
          if (idx !== rowIndex) return it;
          const next: SupplyRow = { ...it, existsInItems: found };

          if (found) {
            next.itemName = item.itemName ?? '';
            next.itemNameEn = item.itemNameEn ?? '';
            next.unit = item.unit ?? '';
            next.specification = item.specification ?? '';

            const derivedCat = deriveCategoryIdFromItemId(itemId);
            next.categoryId = next.categoryId || (item.categoryId ?? derivedCat ?? '');
          }
          return next;
        });
      });
    } catch (_e) {
      // 查询失败时也标记为未找到
      setSupplyItems(prev =>
        prev.map((it, idx) =>
          idx === rowIndex && String(it.itemId).trim() === itemId
            ? { ...it, existsInItems: false }
            : it
        )
      );
    }
  };

  // 去抖
  const debouncedAutoFill = useMemo(
    () => debounce(autoFillFromItemsTable, 300),
    []
  );

  const cn = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ');

  // 是否存在“未在物料指南中找到”的行
  const hasMissing = useMemo(
    () => supplyItems.some(it => it.existsInItems === false),
    [supplyItems]
  );

  const formError = useMemo(() => validateSupplyForm(), [batchNumber, supplyItems]);
  const disableSubmit = !!formError || hasMissing;

  // 提交
  const handleSubmitSupply = async () => {
    // 双保险：若按钮被意外点击，仍阻止
    if (disableSubmit) {
      setToastText(formError || '存在未在物料指南中的记录，请先添加后再提交');
      setShowToast(true);
      return;
    }

    const res = await createInboundBatch({
      batchNo: batchNumber,
      shipId: shipId,
      items: supplyItems
    });

    setToastText(res.message || '');
    requestAnimationFrame(() => setShowToast(true));
    clearAll();
  };

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
                      value={item.itemId}
                      onChange={(e) => handleUpdateSupplyItem(index, 'itemId', e.target.value)}
                      placeholder="请输入物资编号"
                      className={cn(
                        "w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2",
                        // 正常态
                        !item.existsInItems === false && "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        // 错误态
                        item.existsInItems === false && "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50"
                      )}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <textarea
                      disabled
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemName}
                      onChange={(e) => handleUpdateSupplyItem(index, 'itemName', e.target.value)}
                      placeholder="物资名称"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <textarea
                      disabled
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.itemNameEn || ''}
                      onChange={(e) => handleUpdateSupplyItem(index, 'itemNameEn', e.target.value)}
                      placeholder="物资名称(英文)"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                      value={categories.find(c => c.categoryId === item.categoryId)?.categoryName ?? ''}
                    />
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
                      disabled
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.unit}
                      onChange={(e) => handleUpdateSupplyItem(index, 'unit', e.target.value)}
                      placeholder="单位名称"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <textarea
                      disabled
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.specification || ''}
                      onChange={(e) => handleUpdateSupplyItem(index, 'specification', e.target.value)}
                      placeholder="规格"
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

        {hasMissing && (
          <div className="mt-3 text-sm text-red-600">
            存在未在物料指南中的记录，请先在“物料指南”添加后再提交。
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          className={`px-6 py-2 rounded-md text-white ${disableSubmit ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={disableSubmit}
          onClick={() => {
            const err = validateSupplyForm();
            if (err) {
              setToastText(err);
              setShowToast(true);
              return;
            }
            if (hasMissing) {
              setToastText('存在未在物料指南中的记录，请先添加后再提交');
              setShowToast(true);
              return;
            }
            setShowModal(true);
          }}
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