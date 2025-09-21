import { useEffect, useMemo, useState } from "react";
import { getShipList } from "../services/getShipList";
import { Ship } from "../types";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { updateShip } from "../services/updateShip";
import { debounce } from "../utils";

type ShipRow = Ship & { _isNew?: boolean };

const ShipManagementPage = () => {
  const [ships, setShips] = useState<ShipRow[]>([]);

  // 弹窗/Toast
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [modalText, setModalText] = useState("");
  const [toastText, setToastText] = useState("");

  // 选中行（用于确认弹窗）
  const [selectedShip, setSelectedShip] = useState<ShipRow | null>(null);
  const [operation, setOperation] = useState("");

  const fetchList = useMemo(
    () =>
      debounce(async () => {
        const res = await getShipList();
        if (!res.success) {
          throw new Error(res.error || "获取物资种类失败");
        }
        setShips(res.data as ShipRow[]);
      }, 300),
    []
  );

  useEffect(() => {
    fetchList();
  }, []);

  const handleAddShip = () => {
    setShips([{ id: '', name: '', type: '', _isNew: true }, ...ships]);
  };

  // 行编辑
  const handleEditShip = (id: string | number, field: string, value: string | number) => {
    const idx = Number(id);
    setShips((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next: ShipRow = { ...row, [field]: value } as ShipRow;

        return next;
      })
    );
  };

  // 校验（INSERT/UPDATE 共用）
  const validateRow = (row: ShipRow): string | null => {
    if (!String(row.id)?.trim()) return "物资类别编号不能为空";
    if (!row.name?.trim()) return "物资类别名称不能为空";
    if (!row.type?.trim()) return "物资类别英文名称不能为空";
    return null;
  };

  // 提交（根据 _isNew 决定 INSERT / UPDATE）
  const handleSubmit = async (row: ShipRow) => {
    const err = validateRow(row);
    if (err) {
      setToastText(err);
      setShowToast(true);
      return;
    }

    const op = operation === 'SUBMIT' ? (row._isNew ? "INSERT" : "UPDATE") : 'DELETE';
    const payload = {
      shipId: String(row.id),
      shipName: row.name,
      shipType: row.type,
    };

    const res = await updateShip(payload, op as any);
    setToastText(res.message || (row._isNew ? "创建船舶成功" : "更新船舶成功"));
    requestAnimationFrame(() => setShowToast(true));

    // 成功后刷新列表（也可以就地把 _isNew 去掉，但回读更稳妥）
    fetchList();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold mb-6">船舶管理</h2>
        <button onClick={handleAddShip} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">添加新船舶</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">船舶编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类别名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">船舶类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ships.map((ship, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ship.id}
                    onChange={(e) => handleEditShip(index, 'id', e.target.value)}
                    placeholder="请输入编号"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ship.name}
                    onChange={(e) => handleEditShip(index, 'name', e.target.value)}
                    placeholder="请输入名称"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ship.type}
                    onChange={(e) => handleEditShip(index, 'type', e.target.value)}
                    placeholder="请输入类型"
                  />
                </td>
                <td>
                  <button
                    className="px-3 py-1 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      setSelectedShip(ship);
                      setModalText("确定提交这次修改吗？此操作不可恢复。");
                      setOperation("SUBMIT");
                      setShowModal(true);
                    }}
                  >
                    {ship._isNew ? "创建" : "提交"}
                  </button>
                  <button
                    className="px-3 py-1 rounded-md text-white bg-red-500/80 hover:bg-red-600"
                    onClick={() => {
                      setSelectedShip(ship);
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
            if (selectedShip) handleSubmit(selectedShip);
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />

        <Toast open={showToast} message={toastText} onClose={() => setShowToast(false)} />
      </div>

    </div>
  )
}

export default ShipManagementPage;