import { useEffect, useState } from 'react';
import { getCrewList, updateCrews } from '../api';

interface Props {
    shipId?: string;
}

const CrewManagementPage: React.FC<Props> = ({ shipId }) => {
    const [crewMembers, setCrewMembers] = useState<{ position: string; name: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError('');

                const result = await getCrewList(shipId);
                if (!result.success) {
                    throw new Error(result.error || '获取船员信息失败');
                }

                setCrewMembers(result.data as any);
            } catch (e: any) {
                if (e?.name !== 'AbortError') {
                    setError(e?.message || '获取船员信息失败');
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleAddCrewMember = () => {
        setCrewMembers([...crewMembers, { position: '', name: '' }]);
    };

    const handleUpdateCrewMember = (index: number, field: string, value: string) => {
        const updatedCrewMembers = [...crewMembers];
        updatedCrewMembers[index] = { ...updatedCrewMembers[index], [field]: value };
        setCrewMembers(updatedCrewMembers);
    };

    const handleDeleteCrewMember = (index: number) => {
        if (crewMembers.length > 1) {
            setCrewMembers(crewMembers.filter((_, i) => i !== index));
        }
    };

    const handleSubmitCrewMembers = async () => {
        if (!shipId) return;
        const r = await updateCrews(shipId, crewMembers);
        if (!r.success) { setError(r.message || '保存失败'); return; }
        setCrewMembers(r.data || []); // 覆盖为后端回写（含新生成的 id）
    };

    return (
        <>
            {/* 加载/错误/空态 */}
            {loading && (
                <div className="text-gray-500">加载中...</div>
            )}
            {!loading && error && (
                <div className="text-red-600">加载失败：{error}</div>
            )}

            {!loading && !error && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6">船员管理</h2>
                    <button onClick={handleAddCrewMember} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">添加船员</button>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职位</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {crewMembers.map((member, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={member.position}
                                                onChange={(e) => handleUpdateCrewMember(index, 'position', e.target.value)}
                                                placeholder="请输入职位"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={member.name}
                                                onChange={(e) => handleUpdateCrewMember(index, 'name', e.target.value)}
                                                placeholder="请输入姓名"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => handleDeleteCrewMember(index)}
                                                disabled={crewMembers.length === 1}
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={handleSubmitCrewMembers}
                        >
                            提交
                        </button>
                    </div>
                </div>
            )}

        </>
    );
};

export default CrewManagementPage;