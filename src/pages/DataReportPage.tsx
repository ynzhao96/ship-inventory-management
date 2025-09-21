import React, { useEffect, useMemo, useState } from 'react';
import { getShipLogs } from '../services/getShipLogs.ts';
import Pagination from '../components/Pagination.tsx';

type LogType = 'CLAIM' | 'CANCEL_CLAIM' | 'INBOUND_CREATE' | 'INBOUND_CONFIRM' | 'INBOUND_CANCEL' | 'ALL';

type PrimaryType = 'ALL' | 'CLAIM_GROUP' | 'INBOUND_GROUP';
type SubType =
  | 'ALL'
  | 'CLAIM'
  | 'CANCEL_CLAIM'
  | 'INBOUND_CREATE'
  | 'INBOUND_CONFIRM'
  | 'INBOUND_CANCEL';

const PRIMARY_OPTIONS: { value: PrimaryType; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'CLAIM_GROUP', label: '申领' },
  { value: 'INBOUND_GROUP', label: '入库' },
];

const SECONDARY_OPTIONS_BY_PRIMARY: Record<PrimaryType, { value: SubType; label: string }[]> = {
  ALL: [{ value: 'ALL', label: '全部' }],
  CLAIM_GROUP: [
    { value: 'ALL', label: '全部' },
    { value: 'CLAIM', label: '申领' },
    { value: 'CANCEL_CLAIM', label: '取消申领' },
  ],
  INBOUND_GROUP: [
    { value: 'ALL', label: '全部' },
    { value: 'INBOUND_CREATE', label: '创建入库' },
    { value: 'INBOUND_CONFIRM', label: '确认入库' },
    { value: 'INBOUND_CANCEL', label: '取消入库' },
  ],
};

interface ShipLog {
  eventType: Exclude<LogType, 'ALL'>;
  batchNumber?: string | null;
  eventTime: string;
  shipId: string;
  itemId: string;
  itemName: string;
  categoryId: string | number;
  quantity: number;
  actor?: string | null;
  remark?: string | null;
}

interface ApiData {
  list: ShipLog[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApiResp {
  success?: boolean;
  code?: string;
  message?: string;
  data?: ApiData;
}

interface Props {
  shipId?: string;
}

const badgeStyleByType: Record<Exclude<LogType, 'ALL'>, string> = {
  CLAIM: 'bg-blue-100 text-blue-700',
  CANCEL_CLAIM: 'bg-rose-100 text-rose-700',
  INBOUND_CREATE: 'bg-amber-100 text-amber-700',
  INBOUND_CONFIRM: 'bg-emerald-100 text-emerald-700',
  INBOUND_CANCEL: 'bg-gray-200 text-gray-700',
};

const labelByType: Record<Exclude<LogType, 'ALL'>, string> = {
  CLAIM: '申领',
  CANCEL_CLAIM: '取消申领',
  INBOUND_CREATE: '创建入库',
  INBOUND_CONFIRM: '确认入库',
  INBOUND_CANCEL: '取消入库',
};


const DataReportPage: React.FC<Props> = ({ shipId }) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [primaryType, setPrimaryType] = useState<PrimaryType>('ALL');
  const [subType, setSubType] = useState<SubType>('ALL');
  const [startDate, setStartDate] = useState<string>(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>('');     // YYYY-MM-DD

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [rows, setRows] = useState<ShipLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < totalPages, [page, totalPages]);

  const onChangePrimary = (val: PrimaryType) => {
    setPrimaryType(val);
    setSubType('ALL');
    setPage(1);
  };

  const buildTypeFilter = () => {
    // 默认：全部
    if (primaryType === 'ALL') {
      return { logType: 'ALL' as LogType };
    }

    if (primaryType === 'CLAIM_GROUP') {
      if (subType === 'ALL') {
        return { logType: ['CLAIM', 'CANCEL_CLAIM'] };
      }
      return { logType: subType };
    }

    // INBOUND_GROUP
    if (subType === 'ALL') {
      return { logType: ['INBOUND_CREATE', 'INBOUND_CONFIRM', 'INBOUND_CANCEL'] };
    }
    return { logType: subType };
  };

  const fetchLogs = async () => {
    if (!shipId) {
      setErrorMsg('缺少 shipId');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      if ((!startDate && endDate) || (startDate && !endDate)) return;

      const { logType } = buildTypeFilter();
      const resp: ApiResp = await getShipLogs(
        shipId,
        page,
        pageSize,
        startDate || undefined,
        endDate || undefined,
        logType,
      );

      const ok = (resp?.success ?? true); // 你的 http 包有时不带 success，这里做宽松处理
      if (!ok) {
        setErrorMsg(resp?.message || '查询失败');
        setRows([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      const data = resp?.data;
      setRows(data?.list ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (e: any) {
      setErrorMsg(e?.message || '网络错误');
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 变化即自动拉取
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipId, page, pageSize, primaryType, subType, startDate, endDate]);

  // 应用筛选（重置到第1页）
  const applyFilters = () => {
    setPage(1);
  };

  const resetFilters = () => {
    setPrimaryType('ALL');
    setSubType('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setPageSize(10);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">船舶日志</h1>
      </div>

      {/* 筛选栏 */}
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* 一级 */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">日志类型（一级）</label>
          <select
            className="border rounded-md px-3 py-2"
            value={primaryType}
            onChange={(e) => onChangePrimary(e.target.value as PrimaryType)}
            disabled={loading}
          >
            {PRIMARY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 二级 */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">日志类型（二级）</label>
          <select
            className="border rounded-md px-3 py-2"
            value={subType}
            onChange={(e) => { setSubType(e.target.value as SubType); setPage(1); }}
            disabled={loading || primaryType === 'ALL'}  // 全部时禁用二级
          >
            {SECONDARY_OPTIONS_BY_PRIMARY[primaryType].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

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

        <div className="flex items-end gap-2">
          <button
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
            onClick={applyFilters}
            disabled={loading}
          >
            应用
          </button>
          <button
            className="px-4 py-2 rounded-md border disabled:opacity-50"
            onClick={resetFilters}
            disabled={loading}
          >
            重置
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">时间</th>
                <th className="px-4 py-2">事件</th>
                <th className="px-4 py-2">批次号</th>
                <th className="px-4 py-2">物资</th>
                <th className="px-4 py-2">数量</th>
                <th className="px-4 py-2">操作人</th>
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

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    暂无日志
                  </td>
                </tr>
              )}

              {!loading && rows.map((row, idx) => (
                <tr key={`${row.eventType}-${row.itemId}-${row.eventTime}-${idx}`} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{row.eventTime}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeStyleByType[row.eventType]}`}>
                      {labelByType[row.eventType]}
                    </span>
                  </td>
                  <td className="px-4 py-2">{row.batchNumber || '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{row.itemName}</span>
                      <span className="text-xs text-gray-500">ID: {row.itemId} / Cat: {row.categoryId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">{row.quantity}</td>
                  <td className="px-4 py-2">{row.actor || '-'}</td>
                  <td className="px-4 py-2">{row.remark || '-'}</td>
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
            canPrev={canPrev}
            canNext={canNext}
            onChangePage={(p) => setPage(p)}
            onChangePageSize={(size) => { setPage(1); setPageSize(size); }}
          />
        </div>
      </div>

      {/* 错误提示 */}
      {errorMsg && (
        <div className="mt-3 text-sm text-rose-600">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default DataReportPage;
