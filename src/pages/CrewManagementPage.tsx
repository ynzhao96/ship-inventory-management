import { useState } from 'react';

const CrewManagementPage = () => {
    // 模拟船员数据
    const mockCrewData = [
        {
            position: '船长',
            name: '张三'
        },
        {
            position: '大副',
            name: '李四'
        },
    ]
    const [crewMembers, setCrewMembers] = useState<{ position: string; name: string }[]>(mockCrewData);

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

    const handleSubmitCrewMembers = () => {
        console.log('提交船员信息:', crewMembers);
    };

    return (
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
    );
};

export default CrewManagementPage;