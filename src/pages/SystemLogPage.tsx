import { useEffect, useState } from "react";
import { getSystemLog } from "../services/getSystemLog";
import Pagination from "../components/Pagination";

interface SystemLog {
  id?: string;
  eventType?: string;
  operator?: string;
  object?: string;
  quantity?: string;
  time?: string;
  note?: string;
}

const SystemLogPage = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [startDate, setStartDate] = useState<string>(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>('');     // YYYY-MM-DD
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await getSystemLog(
        page,
        pageSize,
        startDate || undefined,
        endDate || undefined,
      );

      const ok = (resp?.success ?? true); // 你的 http 包有时不带 success，这里做宽松处理
      if (!ok) {
        setErrorMsg(resp?.message || '查询失败');
        setLogs([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      const data = resp?.data;
      setLogs(data?.list ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (e: any) {
      setErrorMsg(e?.message || '网络错误');
      setLogs([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, startDate, endDate]);

  return (
    <div className="p-4">
      {/* 时间筛选 */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">开始日期</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">结束日期</label>
          <input
            type="date"
            className="border rounded-md px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* 列表 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">eventType</th>
                <th className="px-4 py-2">操作人</th>
                <th className="px-4 py-2">操作对象</th>
                <th className="px-4 py-2">数量</th>
                <th className="px-4 py-2">时间</th>
                <th className="px-4 py-2">备注</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    加载中…
                  </td>
                </tr>
              )}

              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    暂无日志
                  </td>
                </tr>
              )}

              {!loading && logs.map((log, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{log.eventType}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium`}>
                      {log.operator}
                    </span>
                  </td>
                  <td className="px-4 py-2">{log.object}</td>
                  <td className="px-4 py-2">{log.quantity}</td>
                  <td className="px-4 py-2">{log.time}</td>
                  <td className="px-4 py-2">{log.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

        {/* 错误提示 */}
        {errorMsg && (
          <div className="mt-3 text-sm text-rose-600">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}

export default SystemLogPage;