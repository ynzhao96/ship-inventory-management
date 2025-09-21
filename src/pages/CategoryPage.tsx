import { useEffect, useMemo, useState } from "react";
import { getCategories } from "../services/getCategories";
import { Category } from "../types";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { updateCategory } from "../services/updateCategory";
import { debounce } from "../utils";

type CategoryRow = Category & { _isNew?: boolean };

const CategoryPage = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  // 弹窗/Toast
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [modalText, setModalText] = useState("");
  const [toastText, setToastText] = useState("");

  // 选中行（用于确认弹窗）
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);
  const [operation, setOperation] = useState("");

  const fetchList = useMemo(
    () =>
      debounce(async () => {
        const res = await getCategories();
        if (!res.success) {
          throw new Error(res.error || "获取物资种类失败");
        }
        setCategories(res.data as CategoryRow[]);
      }, 300),
    []
  );

  useEffect(() => {
    fetchList();
  }, []);

  const handleAddCategory = () => {
    setCategories([{ categoryId: '', categoryName: '', categoryNameEn: '', _isNew: true }, ...categories]);
  };

  // 行编辑
  const handleEditCategory = (id: string | number, field: string, value: string | number) => {
    const idx = Number(id);
    setCategories((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next: CategoryRow = { ...row, [field]: value } as CategoryRow;

        return next;
      })
    );
  };

  // 校验（INSERT/UPDATE 共用）
  const validateRow = (row: CategoryRow): string | null => {
    if (!String(row.categoryId)?.trim()) return "物资类别编号不能为空";
    if (!row.categoryName?.trim()) return "物资类别名称不能为空";
    if (!row.categoryNameEn?.trim()) return "物资类别英文名称不能为空";
    return null;
  };

  // 提交（根据 _isNew 决定 INSERT / UPDATE）
  const handleSubmit = async (row: CategoryRow) => {
    const err = validateRow(row);
    if (err) {
      setToastText(err);
      setShowToast(true);
      return;
    }

    const op = operation === 'SUBMIT' ? (row._isNew ? "INSERT" : "UPDATE") : 'DELETE';
    const payload = {
      categoryId: String(row.categoryId),
      categoryName: row.categoryName,
      categoryNameEn: row.categoryNameEn,
    };

    const res = await updateCategory(payload, op as any);
    setToastText(res.message || (row._isNew ? "创建物料成功" : "更新物料成功"));
    requestAnimationFrame(() => setShowToast(true));

    // 成功后刷新列表（也可以就地把 _isNew 去掉，但回读更稳妥）
    fetchList();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold mb-6">类别管理</h2>
        <button onClick={handleAddCategory} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">添加新类别</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类别编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类别名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">英文名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={category.categoryId}
                    onChange={(e) => handleEditCategory(index, 'categoryId', e.target.value)}
                    placeholder="请输入编号"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={category.categoryName}
                    onChange={(e) => handleEditCategory(index, 'categoryName', e.target.value)}
                    placeholder="请输入名称"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={category.categoryNameEn}
                    onChange={(e) => handleEditCategory(index, 'categoryNameEn', e.target.value)}
                    placeholder="请输入英文名称"
                  />
                </td>
                <td>
                  <button
                    className="px-3 py-1 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      setSelectedCategory(category);
                      setModalText("确定提交这次修改吗？此操作不可恢复。");
                      setOperation("SUBMIT");
                      setShowModal(true);
                    }}
                  >
                    {category._isNew ? "创建" : "提交"}
                  </button>
                  <button
                    className="px-3 py-1 rounded-md text-white bg-red-500/80 hover:bg-red-600"
                    onClick={() => {
                      setSelectedCategory(category);
                      setModalText("确定删除这条记录吗？此操作不可恢复。");
                      setOperation("DELETE");
                      setShowModal(true);
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ConfirmModal
          open={showModal}
          title="确认提交"
          message={modalText}
          confirmText="提交"
          onConfirm={() => {
            if (selectedCategory) handleSubmit(selectedCategory);
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />

        <Toast open={showToast} message={toastText} onClose={() => setShowToast(false)} />
      </div>

    </div>
  )
}

export default CategoryPage;