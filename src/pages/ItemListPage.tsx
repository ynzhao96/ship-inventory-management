import { useEffect, useMemo, useState } from "react";
import { getItemList } from "../services/getItemList";
import { Category, InventoryItem } from "../types";
import Pagination from "../components/Pagination";
import { getCategories } from "../services/getCategories";
import { debounce, deriveCategoryIdFromItemId } from "../utils";
import { updateItem } from "../services/updateItem";
import ConfirmModal from "../components/ConfirmModal";

const ItemListPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchMatch, setSearchTerm] = useState('');

  // 提交的item
  const [item, setItem] = useState<InventoryItem>({} as InventoryItem);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [category, setCategory] = useState('');
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // 弹窗/Toast
  const [showModal, setShowModal] = useState(false);

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
    })();
  }, []);

  const fetchList = useMemo(() =>
    debounce(async (category: string, page: number, pageSize: number, searchMatch: string) => {
      const res = await getItemList(category, page, pageSize, searchMatch);
      if (!res.success) throw new Error(res.error || '获取物资库存失败');
      setItems(res.data.list ?? []);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    }, 300)
    , []); // 仅创建一次

  useEffect(() => {
    fetchList(category, page, pageSize, searchMatch);
  }, [category, page, pageSize, searchMatch, fetchList]);

  // 行编辑
  const handleEdit = (id: string | number, field: string, value: string | number) => {
    const idx = Number(id);
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const next = { ...item, [field]: value };

        if (field === 'itemId') {
          const v = String(value ?? '').trim();
          next.categoryId = deriveCategoryIdFromItemId(v) || '';
        }
        return next;
      })
    );
  };

  const handleSubmit = (item: InventoryItem) => {
    updateItem({
      itemId: String(item.itemId),
      itemName: item.itemName,
      itemNameEn: item.itemNameEn,
      categoryId: item.categoryId,
      unit: item.unit,
      specification: item.specification,
    }, 'UPDATE');
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">物料指南</h2>
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资英文名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单位</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">规格</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.itemId}
                    onChange={(e) => handleEdit(index, 'itemId', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.itemName}
                    onChange={(e) => handleEdit(index, 'itemName', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <textarea
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.itemNameEn || ''}
                    onChange={(e) => handleEdit(index, 'itemNameEn', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.unit}
                    onChange={(e) => handleEdit(index, 'unit', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <textarea
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.specification || ''}
                    onChange={(e) => handleEdit(index, 'specification', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => { setItem(item); setShowModal(true); }}>提交</button>
                  <button>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={showModal}
        title="确认提交"
        message="确定提交这次修改吗？此操作不可恢复。"
        confirmText="提交"
        onConfirm={() => { handleSubmit(item); setShowModal(false); }}
        onCancel={() => setShowModal(false)}
      />

      <div className="flex justify-end mt-6">
        {/* 分页 */}
        <div className="border-t">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            canPrev={page > 1}
            canNext={page < totalPages}
            onChangePage={(p) => setPage(p)}
            onChangePageSize={(size) => { setPage(1); setPageSize(size); }}
          />
        </div>
      </div>
    </div>
  )
}

export default ItemListPage;