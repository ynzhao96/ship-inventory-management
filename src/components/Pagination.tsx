import React from 'react';

interface Props {
  page: number;
  pageSize: number;
  total?: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  onChangePage: (page: number) => void;
  onChangePageSize: (size: number) => void;
}

const Pagination: React.FC<Props> = ({
  page, pageSize, total = 0, totalPages,
  canPrev, canNext, onChangePage, onChangePageSize
}) => {
  return (
    <div className="flex items-center justify-end gap-3 py-3">
      <span className="text-sm text-gray-500">
        显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} / 共 {total}
      </span>

      {/* 修改 pageSize 会自动重置到第 1 页 */}
      <select
        value={pageSize}
        onChange={e => {
          const size = Number(e.target.value);
          onChangePageSize(size);
          onChangePage(1);
        }}
      >
        {[10, 25, 50, 100].map(n =>
          <option key={n} value={n}>{n}/页</option>
        )}
      </select>

      <button disabled={!canPrev} onClick={() => onChangePage(page - 1)}>
        上一页
      </button>

      <span>{page} / {totalPages}</span>

      <button disabled={!canNext} onClick={() => onChangePage(page + 1)}>
        下一页
      </button>
    </div>
  )
};

export default Pagination;
