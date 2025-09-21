import { useEffect, useState } from "react";
import { getCategories } from "../services/getCategories";
import { Category } from "../types";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

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

  useEffect(() => {
    (async () => {
      const res = await getCategories();
      if (!res.success) {
        throw new Error(res.error || "获取物资种类失败");
      }
      setCategories(res.data as CategoryRow[]);
    })();
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold mb-6">类别指南</h2>
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
                  // onClick={() => {
                  //   setSelectedItem(row);
                  //   setModalText("确定提交这次修改吗？此操作不可恢复。");
                  //   setOperation("SUBMIT");
                  //   setShowModal(true);
                  // }}
                  >
                    {category._isNew ? "创建" : "提交"}
                  </button>
                  <button
                    className="px-3 py-1 rounded-md text-white bg-red-500/80 hover:bg-red-600"
                    onClick={() => {
                      // setSelectedItem(row);
                      // setModalText("确定删除这条记录吗？此操作不可恢复。");
                      // setOperation("DELETE");
                      // setShowModal(true);
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
            // if (selectedCategory) handleSubmit(selectedCategory);
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