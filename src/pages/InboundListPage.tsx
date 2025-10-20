import { useEffect, useMemo, useState } from "react";
import { getInboundList } from "../services/getInboundList";
import { Inbound } from "../types";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { debounce } from "../utils";
import { updateInbound } from "../services/updateInbound";

interface Props {
  shipId?: string;
}

const InboundListPage: React.FC<Props> = ({ shipId }) => {
  const [inboundList, setInboundList] = useState<Inbound[]>([]);

  // 弹窗/Toast
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [modalText, setModalText] = useState("");
  const [toastText, setToastText] = useState("");

  // 选中行（用于确认弹窗）
  const [selectedInbound, setSelectedInbound] = useState<Inbound | null>(null);
  const [operation, setOperation] = useState("");

  const fetchList = useMemo(
    () =>
      debounce(async () => {
        const res = await getInboundList(shipId);
        if (!res.success) {
          throw new Error(res.error || "获取待入库信息失败");
        }
        setInboundList(res.data as Inbound[]);
      }, 300),
    []
  );

  useEffect(() => {
    fetchList();
  }, []);

  // 行编辑
  const handleEditInbound = (id: string | number, field: string, value: string | number) => {
    const idx = Number(id);
    setInboundList((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next: Inbound = { ...row, [field]: value } as Inbound;

        return next;
      })
    );
  };

  // 校验（INSERT/UPDATE 共用）
  const validateRow = (row: Inbound): string | null => {
    if (!String(row.inboundId)?.trim()) return "入库信息id不能为空";
    if (!row.batchNumber?.trim()) return "批次号不能为空";
    if (!row.quantity) return "入库数量不能为空";
    return null;
  };

  // 提交（根据 _isNew 决定 INSERT / UPDATE）
  const handleSubmit = async (row: Inbound) => {
    const err = validateRow(row);
    if (err) {
      setToastText(err);
      setShowToast(true);
      return;
    }

    const op = operation === 'SUBMIT' ? "UPDATE" : 'DELETE';
    const payload = {
      inboundId: String(row.inboundId),
      batchNumber: row.batchNumber,
      quantity: row.quantity,
    };

    const res = await updateInbound(payload, op as any);
    setToastText(res.message || ("更新物料成功"));
    requestAnimationFrame(() => setShowToast(true));

    // 成功后刷新列表（也可以就地把 _isNew 去掉，但回读更稳妥）
    fetchList();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold mb-6">待入库列表</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">批次号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">英文名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入库数量</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inboundList.map((inbound, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={inbound.batchNumber}
                    onChange={(e) => handleEditInbound(index, 'batchNumber', e.target.value)}
                    placeholder="请输入批次号"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
                    value={inbound.itemId}
                    onChange={(e) => handleEditInbound(index, 'itemId', e.target.value)}
                    placeholder="请输入物资编号"
                    disabled
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
                    value={inbound.itemName}
                    onChange={(e) => handleEditInbound(index, 'itemName', e.target.value)}
                    placeholder="请输入物资名称"
                    disabled
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
                    value={inbound.itemNameEn}
                    onChange={(e) => handleEditInbound(index, 'itemNameEn', e.target.value)}
                    placeholder="请输入物资英文名称"
                    disabled
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={inbound.quantity}
                    onChange={(e) => handleEditInbound(index, 'quantity', e.target.value)}
                    placeholder="请输入入库数量"
                  />
                </td>
                <td>
                  <button
                    className="px-3 py-1 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      setSelectedInbound(inbound);
                      setModalText("确定提交这次修改吗？此操作不可恢复。");
                      setOperation("SUBMIT");
                      setShowModal(true);
                    }}
                  >
                    {"提交"}
                  </button>
                  <button
                    className="px-3 py-1 rounded-md text-white bg-red-500/80 hover:bg-red-600"
                    onClick={() => {
                      setSelectedInbound(inbound);
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
            if (selectedInbound) handleSubmit(selectedInbound);
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />

        <Toast open={showToast} message={toastText} onClose={() => setShowToast(false)} />
      </div>

    </div>
  )
}

export default InboundListPage;