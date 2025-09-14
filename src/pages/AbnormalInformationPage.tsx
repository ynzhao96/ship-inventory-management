import { useEffect, useState } from "react";
import { getAbnormals } from "../services/getAbnormals";
// import Pagination from "../components/Pagination";

interface Abnormal {
  shipId?: string,
  shipName?: string,
  categoryId?: string,
  itemId?: string,
  itemName?: string,
  itemNameEn?: string,
  quantity?: string,
  threshold?: string,
  unit?: string,
}

const AbnormalInformationPage = () => {
  useEffect(() => {
    (async () => {
      const res = await getAbnormals();
      setAbnormals(res?.data || []);
    })();
  }, []);

  const [abnormals, setAbnormals] = useState<Abnormal[]>([]);

  // const [page, setPage] = useState<number>(1);
  // const [pageSize, setPageSize] = useState<number>(25);
  // const [total, setTotal] = useState<number>(0);
  // const [totalPages, setTotalPages] = useState<number>(1);

  // useEffect(() => {
  //   (async () => {
  //     const res = await getItemList(page, pageSize);
  //     setItems(res.data?.list ?? []);
  //     setTotal(res.data?.total ?? 0);
  //     setTotalPages(res.data?.totalPages ?? 1);
  //   })();
  // }, [page, pageSize]);
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">异常</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">船舶名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">船舶编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资编号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">物资英文名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">库存</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预警值</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {abnormals.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.shipName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.shipId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.itemId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.itemName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.itemNameEn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-rose-100 text-rose-700">{item.quantity}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.threshold}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        {/* 分页 */}
        {/* <div className="border-t">
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
        </div> */}
      </div>
    </div>
  )
}

export default AbnormalInformationPage;