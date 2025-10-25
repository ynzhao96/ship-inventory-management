import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getShipLogs } from '../services/getShipLogs.ts';
import Pagination from '../components/Pagination.tsx';
import { debounce } from '../utils.ts';
import { Category } from '../types.ts';
import { getCategories } from '../services/getCategories.ts';
import * as XLSX from 'xlsx';

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
  { value: 'CLAIM_GROUP', label: '出库' },
  { value: 'INBOUND_GROUP', label: '入库' },
];

const SECONDARY_OPTIONS_BY_PRIMARY: Record<PrimaryType, { value: SubType; label: string }[]> = {
  ALL: [{ value: 'ALL', label: '全部' }],
  CLAIM_GROUP: [
    { value: 'ALL', label: '全部' },
    { value: 'CLAIM', label: '出库' },
    { value: 'CANCEL_CLAIM', label: '取消出库' },
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
  unit?: string;
  specification?: string;
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
  CLAIM: '出库',
  CANCEL_CLAIM: '取消出库',
  INBOUND_CREATE: '创建入库',
  INBOUND_CONFIRM: '确认入库',
  INBOUND_CANCEL: '取消入库',
};


const DataReportPage: React.FC<Props> = ({ shipId }) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const [primaryType, setPrimaryType] = useState<PrimaryType>('ALL');
  const [batchNo, setBatchNo] = useState('');
  const [subType, setSubType] = useState<SubType>('ALL');
  const [startDate, setStartDate] = useState<string>(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>('');     // YYYY-MM-DD

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [rows, setRows] = useState<ShipLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < totalPages, [page, totalPages]);

  // 导出相关
  const [exporting, setExporting] = useState(false);
  const [exportPage, setExportPage] = useState(0);
  const [exportTotalPages, setExportTotalPages] = useState(0);
  const exportCanceledRef = useRef(false);
  const exportAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getCategories();
      if (!res.success) {
        throw new Error(res.error || "获取物资种类失败");
      }
      setCategories(res.data as Category[]);
    })();
  }, []);

  const onChangePrimary = (val: PrimaryType) => {
    setPrimaryType(val);
    setSubType('ALL');
    setPage(1);
    setBatchNo('');
    setSelectedCategory('');
  };

  const buildTypeFilter = (primaryType: PrimaryType, subType: SubType) => {
    if (primaryType === 'ALL') return { logType: 'ALL' as LogType };
    if (primaryType === 'CLAIM_GROUP') {
      if (subType === 'ALL') return { logType: ['CLAIM', 'CANCEL_CLAIM'] as LogType[] };
      return { logType: subType as LogType };
    }
    // INBOUND_GROUP
    if (subType === 'ALL') return { logType: ['INBOUND_CREATE', 'INBOUND_CONFIRM', 'INBOUND_CANCEL'] as LogType[] };
    return { logType: subType as LogType };
  };

  type FetchArgs = {
    shipId?: string;
    page: number;
    pageSize: number;
    startDate?: string;
    endDate?: string;
    primaryType: PrimaryType;
    subType: SubType;
    batchNo?: string;
    category?: string;
  };

  // ✅ 真正的取数函数：完全用参数，不依赖外部状态（避免闭包问题）
  const doFetchLogs = async (
    args: FetchArgs,
    {
      setLoading, setErrorMsg, setRows, setTotal, setTotalPages,
      getShipLogs,
    }: {
      setLoading: React.Dispatch<React.SetStateAction<boolean>>;
      setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
      setRows: React.Dispatch<React.SetStateAction<ShipLog[]>>;
      setTotal: React.Dispatch<React.SetStateAction<number>>;
      setTotalPages: React.Dispatch<React.SetStateAction<number>>;
      getShipLogs: typeof import('../services/getShipLogs').getShipLogs;
    }
  ) => {
    const { shipId, page, pageSize, startDate, endDate, primaryType, subType, batchNo, category } = args;

    if (!shipId) {
      setErrorMsg('缺少 shipId');
      return;
    }
    if ((!startDate && endDate) || (startDate && !endDate)) {
      // 起止不成对，直接不请求
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { logType } = buildTypeFilter(primaryType, subType);
      const resp: ApiResp = await getShipLogs(
        shipId,
        page,
        pageSize,
        startDate || undefined,
        endDate || undefined,
        logType as any, // 支持 string | string[]
        batchNo,
        category
      );

      const ok = (resp?.success ?? true);
      if (!ok) {
        setErrorMsg(resp?.message || '查询失败');
        setRows([]); setTotal(0); setTotalPages(1);
        return;
      }
      const data = resp?.data;
      setRows(data?.list ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (e: any) {
      setErrorMsg(e?.message || '网络错误');
      setRows([]); setTotal(0); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchRef = useRef(
    debounce((args: FetchArgs) => {
      // 这里调用纯函数，传入需要的 setter 和服务
      doFetchLogs(args, {
        setLoading, setErrorMsg, setRows, setTotal, setTotalPages,
        getShipLogs,
      });
    }, 300)
  ).current;

  useEffect(() => {
    debouncedFetchRef({
      shipId,
      page,
      pageSize,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      primaryType,
      subType,
      batchNo,
      category: selectedCategory,
    });
    // 卸载时取消未触发的定时器（若你的 debounce 支持 .cancel）
    return () => {
      (debouncedFetchRef as any).cancel?.();
    };
  }, [shipId, page, pageSize, primaryType, subType, startDate, endDate, batchNo, selectedCategory, debouncedFetchRef]);

  const resetFilters = () => {
    setPrimaryType('ALL');
    setSubType('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setPageSize(25);
    setBatchNo('');
    setSelectedCategory('');
  };

  const showBatch = primaryType === 'INBOUND_GROUP';

  // 取消导出
  const handleCancelExport = () => {
    exportCanceledRef.current = true;
    exportAbortRef.current?.abort(); // 中断当前页请求（若支持）
  };

  // 导出全部（带进度 & 取消）
  const handleExportAll = async () => {
    if (!shipId) return;

    // 基本准备
    setExporting(true);
    exportCanceledRef.current = false;
    setExportPage(0);
    setExportTotalPages(0);

    // === 组装自定义顶部信息 ===
    const startStr = startDate ? new Date(startDate).toISOString().slice(0, 10) : '(未选择)';
    const endStr = endDate ? new Date(endDate).toISOString().slice(0, 10) : '(未选择)';
    const periodLine = `时间段: ${startStr} ~ ${endStr}`;
    const eventTypeTitle = `事件类型: ${subType === 'ALL' ?
      PRIMARY_OPTIONS.find(opt => opt.value === primaryType)?.label :
      SECONDARY_OPTIONS_BY_PRIMARY?.[primaryType]?.find(opt => opt.value === subType)?.label}`;
    const batchNumberTitle = `批次号: ${batchNo || '(未选择)'}`;
    const categoryTitle = `物资种类: ${categories.find((x) => x.categoryId === selectedCategory)?.categoryName || '全部'}`;

    const headers = ['时间', '事件', '批次号', '物资ID', '物资名称', '单位', '规格', '物资种类', '数量', '操作人', '备注'];
    const topInfoRows = [
      [periodLine],
      [eventTypeTitle],
      [batchNumberTitle],
      [categoryTitle],
      [''],           // 空行做视觉间距
      headers         // 表头行
    ];
    // 表头行数量
    const headerRowIdx = topInfoRows.length - 1; // 0-based
    const colWidths = [20, 12, 16, 24, 16, 10, 10, 12, 30];
    const label = (t: ShipLog['eventType']) => labelByType[t];
    const toAoA = (list: ShipLog[]) => list.map(r => ([
      r.eventTime, label(r.eventType), r.batchNumber ?? '', r.itemId, r.itemName, r.unit, r.specification, categories.find((x) => x.categoryId === r.categoryId)?.categoryName,
      r.quantity, r.actor ?? '', r.remark ?? ''
    ]));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(topInfoRows);
    // 合并“说明行”整行单元格（不合并表头行）
    ws['!merges'] = Array.from({ length: headerRowIdx }, (_, r) => ({
      s: { r, c: 0 },
      e: { r, c: headers.length - 1 },
    }));
    ws['!cols'] = colWidths.map(wch => ({ wch }));
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: headerRowIdx, c: 0 },
        e: { r: headerRowIdx, c: headers.length - 1 }
      })
    };

    // 后端的 pageSize 上限是 100，这里导出就直接用 100 减少请求数
    const pageSizeForExport = 100;
    const { logType } = buildTypeFilter(primaryType, subType);

    try {
      // 先请求第一页，拿 total/totalPages
      let ctrl = new AbortController();
      exportAbortRef.current = ctrl;

      const first = await getShipLogs(
        shipId, 1, pageSizeForExport,
        startDate || undefined, endDate || undefined,
        logType as any, batchNo || undefined, selectedCategory, ctrl.signal
      );

      if (exportCanceledRef.current) throw new Error('EXPORT_CANCELED');

      const total = first?.data?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / pageSizeForExport));
      setExportTotalPages(totalPages);
      setExportPage(Math.min(1, totalPages));

      XLSX.utils.sheet_add_aoa(ws, toAoA(first?.data?.list ?? []), { origin: -1 });

      // 逐页追加
      for (let p = 2; p <= totalPages; p++) {
        if (exportCanceledRef.current) throw new Error('EXPORT_CANCELED');

        ctrl = new AbortController();
        exportAbortRef.current = ctrl;

        const resp = await getShipLogs(
          shipId, p, pageSizeForExport,
          startDate || undefined, endDate || undefined,
          logType as any, batchNo || undefined, selectedCategory, ctrl.signal
        );

        if (exportCanceledRef.current) throw new Error('EXPORT_CANCELED');

        XLSX.utils.sheet_add_aoa(ws, toAoA(resp?.data?.list ?? []), { origin: -1 });
        setExportPage(p);

        // 让出事件循环，避免 UI 卡顿
        // 若不需要可移除
        await new Promise(r => setTimeout(r, 0));
      }

      XLSX.utils.book_append_sheet(wb, ws, '日志');

      // 行数较大时建议用 xlsx
      const bookType: 'xlsx' | 'xls' = total > 65000 ? 'xlsx' : 'xlsx'; // 如需 .xls 可按条件切换
      XLSX.writeFile(wb, `数据报表_${new Date().toISOString().slice(0, 10)}.${bookType}`, { bookType });
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message === 'EXPORT_CANCELED') {
        // 用户取消：静默处理或提示已取消
        // 这里不弹错误
      } else {
        // 其他异常可提示
        setErrorMsg(err?.message || '导出失败');
      }
    } finally {
      // 收尾
      setExporting(false);
      exportAbortRef.current = null;
      exportCanceledRef.current = false;
      setExportPage(0);
      setExportTotalPages(0);
    }
  };

  // ✅ 新增：按物资汇总导出（统计某时间段内每个物资的入库确认总量 & 出库总量）
  const handleExportByItem = async () => {
    if (!shipId) return;

    // 与现有导出一致的状态管理
    setExporting(true);
    exportCanceledRef.current = false;
    setExportPage(0);
    setExportTotalPages(0);

    // === 顶部说明信息 ===
    const startStr = startDate ? new Date(startDate).toISOString().slice(0, 10) : '(未选择)';
    const endStr = endDate ? new Date(endDate).toISOString().slice(0, 10) : '(未选择)';
    const periodLine = `时间段: ${startStr} ~ ${endStr}`;
    const categoryTitle = `物资种类筛选: ${categories.find((x) => x.categoryId === selectedCategory)?.categoryName || '全部'}`;
    const headers = ['物资ID', '物资名称', '单位', '规格', '物资种类', '入库确认合计', '出库合计', '净变动(入-出)'];

    // 你项目里的事件名请按实际调整👇
    // 入库只统计“入库确认”
    const INBOUND_TYPES = new Set<string>(['INBOUND_CONFIRM']);
    // 出库统计所有导致库存减少的事件（按你的实际事件名补全）
    const OUTBOUND_TYPES = new Set<string>([
      'OUTBOUND', 'OUTBOUND_CONFIRM', 'USE', 'CONSUME', 'CLAIM', 'CLAIM_CONFIRM'
    ]);

    // 若你的后端 quantity 已经正负分明，可用“符号”判断；
    // 这里为了稳妥，仍以事件类型为主，数量取绝对值参与对应方向的合计
    const normalizeQty = (q: any) => {
      const num = Number(q);
      return Number.isFinite(num) ? Math.abs(num) : 0;
    };

    type AggRow = {
      itemId: string;
      itemName: string;
      unit?: string;
      specification?: string;
      categoryName?: string;
      inboundSum: number;
      outboundSum: number;
    };

    const aggMap = new Map<string, AggRow>();

    const wb = XLSX.utils.book_new();

    // 顶部信息 + 表头（单 sheet）
    const topInfoRows = [
      [periodLine],
      [categoryTitle],
      [''], // 空行
      headers
    ];
    const headerRowIdx = topInfoRows.length - 1; // 0-based
    const ws = XLSX.utils.aoa_to_sheet(topInfoRows);

    // 合并顶部说明整行
    ws['!merges'] = Array.from({ length: headerRowIdx }, (_, r) => ({
      s: { r, c: 0 },
      e: { r, c: headers.length - 1 },
    }));
    ws['!cols'] = [
      { wch: 20 }, // 物资ID
      { wch: 18 }, // 物资名称
      { wch: 10 }, // 单位
      { wch: 12 }, // 规格
      { wch: 14 }, // 物资种类
      { wch: 14 }, // 入库确认合计
      { wch: 12 }, // 出库合计
      { wch: 12 }, // 净变动
    ];
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: headerRowIdx, c: 0 },
        e: { r: headerRowIdx, c: headers.length - 1 }
      })
    };

    // 导出使用较大的分页，减少请求
    const pageSizeForExport = 100;

    try {
      // 第一次请求，拿 total / totalPages
      let ctrl = new AbortController();
      exportAbortRef.current = ctrl;

      // 这里“按物资汇总”需要拿到给定时间段内的所有日志，不限定事件类型
      // 因此 logType 传 undefined（或让后端返回全部类型）
      const first = await getShipLogs(
        shipId, 1, pageSizeForExport,
        startDate || undefined, endDate || undefined,
        undefined, // ⬅️ 取全部类型
        batchNo || undefined,
        selectedCategory,
        ctrl.signal
      );

      if (exportCanceledRef.current) throw new Error('EXPORT_CANCELED');

      const total = first?.data?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / pageSizeForExport));
      setExportTotalPages(totalPages);
      setExportPage(Math.min(1, totalPages));

      const processPage = (list: ShipLog[] = []) => {
        for (const r of list) {
          const itemId = String(r.itemId ?? '');
          if (!itemId) continue;

          const key = itemId;
          if (!aggMap.has(key)) {
            aggMap.set(key, {
              itemId,
              itemName: r.itemName ?? '',
              unit: r.unit ?? '',
              specification: r.specification ?? '',
              categoryName: categories.find(x => x.categoryId === r.categoryId)?.categoryName ?? '',
              inboundSum: 0,
              outboundSum: 0,
            });
          }
          const row = aggMap.get(key)!;

          // 按事件分类累计
          const et = String(r.eventType || '');
          if (INBOUND_TYPES.has(et)) {
            row.inboundSum += normalizeQty(r.quantity);
          } else if (OUTBOUND_TYPES.has(et)) {
            row.outboundSum += normalizeQty(r.quantity);
          }
        }
      };

      processPage(first?.data?.list ?? []);

      // 后续页
      for (let p = 2; p <= totalPages; p++) {
        if (exportCanceledRef.current) throw new Error('EXPORT_CANCELED');

        ctrl = new AbortController();
        exportAbortRef.current = ctrl;

        const resp = await getShipLogs(
          shipId, p, pageSizeForExport,
          startDate || undefined, endDate || undefined,
          undefined, // 全部类型
          batchNo || undefined,
          selectedCategory,
          ctrl.signal
        );

        if (exportCanceledRef.current) throw new Error('EXPORT_CANCELED');
        processPage(resp?.data?.list ?? []);
        setExportPage(p);

        // 让出事件循环，避免 UI 卡顿
        await new Promise(r => setTimeout(r, 0));
      }

      // 将聚合结果写入 Sheet
      const sorted = Array.from(aggMap.values()).sort((a, b) => a.itemId.localeCompare(b.itemId));
      const dataRows = sorted.map(r => ([
        r.itemId,
        r.itemName,
        r.unit ?? '',
        r.specification ?? '',
        r.categoryName ?? '',
        r.inboundSum,
        r.outboundSum,
        (r.inboundSum - r.outboundSum),
      ]));
      XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: -1 });

      XLSX.utils.book_append_sheet(wb, ws, '按物资汇总');

      const bookType: 'xlsx' = 'xlsx';
      XLSX.writeFile(wb, `数据汇总_${new Date().toISOString().slice(0, 10)}.${bookType}`, { bookType });
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message === 'EXPORT_CANCELED') {
        // 取消则静默
      } else {
        setErrorMsg(err?.message || '导出失败');
      }
    } finally {
      setExporting(false);
      exportAbortRef.current = null;
      exportCanceledRef.current = false;
      setExportPage(0);
      setExportTotalPages(0);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">船舶日志</h1>
      </div>

      {/* 筛选栏 */}
      <div
        className={`mb-4 grid grid-cols-1 ${showBatch ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-3 items-end`}
      >
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
            disabled={loading || primaryType === 'ALL'}
          >
            {SECONDARY_OPTIONS_BY_PRIMARY[primaryType].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 批次号 */}
        {showBatch && (
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">批次号</label>
            <input
              type="text"
              className="border rounded-md px-3 py-2"
              placeholder="输入批次号"
              value={batchNo} onChange={(e) => setBatchNo(e.target.value)}
            />
          </div>
        )}

        {/* 类别 */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">物资类别</label>
          <select
            className="border rounded-md px-3 py-2"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          >
            {[{ categoryId: '', categoryName: '全部', categoryNameEn: 'All' } as Category, ...categories].map((cat, index) => (
              <option key={index} value={cat.categoryId}>{cat.categoryName}</option>
            ))}
          </select>
        </div>

        {/* 开始日期 */}
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

        {/* 结束日期 */}
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

        {/* 操作按钮 */}
        <div className="flex items-end gap-2 justify-self-start">
          <button
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50 whitespace-nowrap"
            onClick={resetFilters}
            disabled={loading}
          >
            重置
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        {/* 滚动容器：内部滚动 */}
        <div className="max-h-[63vh] overflow-auto">
          <table className="min-w-full text-sm table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr className="text-left">
                <th className="px-4 py-2 whitespace-nowrap">时间</th>
                <th className="px-4 py-2 whitespace-nowrap">事件</th>
                <th className="px-4 py-2 whitespace-nowrap">批次号</th>
                <th className="px-4 py-2 whitespace-nowrap">物资</th>
                <th className="px-4 py-2 whitespace-nowrap">规格</th>
                <th className="px-4 py-2 whitespace-nowrap">数量</th>
                <th className="px-4 py-2 whitespace-nowrap">操作人</th>
                <th className="px-4 py-2 whitespace-nowrap">备注</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    加载中…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    暂无日志
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row, idx) => (
                  <tr key={`${row.eventType}-${row.itemId}-${row.eventTime}-${idx}`} className="border-t">
                    <td className="px-4 py-2 whitespace-nowrap">{row.eventTime}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeStyleByType[row.eventType]}`}>
                        {labelByType[row.eventType]}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.batchNumber || '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">{row.itemName}</span>
                        <span className="text-xs text-gray-500">物资编号: {row.itemId}</span>
                        <span className="text-xs text-gray-500">
                          种类: {categories.find((x) => x.categoryId === row.categoryId)?.categoryName || ''}
                        </span>
                        <span className="text-xs text-gray-500">单位: {row.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{row.specification}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.actor || '-'}</td>
                    <td className="px-4 py-2">{row.remark || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* 底部栏 */}
        <div className="border-t bg-gray-50 flex flex-row justify-between">
          {/* === 导出操作区 === */}
          <div className="">
            <div className="w-fit p-4 rounded-lg shadow-sm">
              <div className="flex flex-col flex-nowrap items-center justify-between gap-3 whitespace-nowrap">
                {!exporting ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportAll}
                      disabled={loading}
                      className="px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 transition"
                    >
                      导出明细
                    </button>
                    <button
                      onClick={handleExportByItem}
                      disabled={loading}
                      className="px-4 py-2 rounded-md border border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 disabled:opacity-50 transition"
                    >
                      导出汇总
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        正在导出：第 {Math.max(1, exportPage)} / {Math.max(1, exportTotalPages)} 页
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-blue-600 rounded-full transition-all duration-200 ease-out"
                          style={{
                            width: `${exportTotalPages ? Math.round((exportPage / exportTotalPages) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCancelExport}
                      className="px-3 py-1.5 rounded-md border border-rose-400 text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition"
                    >
                      ✖ 取消导出
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 分页 */}
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            canPrev={canPrev}
            canNext={canNext}
            onChangePage={(p) => setPage(p)}
            onChangePageSize={(size) => {
              setPage(1);
              setPageSize(size);
            }}
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
