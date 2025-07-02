'use client';

import { useState } from 'react';
import { getTeamsForDate } from '@/data/teams';

export default function LineTestSimplePage() {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedRole, setSelectedRole] = useState<'班長' | '班員' | ''>('');
    const [selectedMember, setSelectedMember] = useState('');
    const [result, setResult] = useState('');

    const teams = getTeamsForDate(new Date());

    const handleTeamChange = (team: string) => {
        setSelectedTeam(team);
        setSelectedRole('');
        setSelectedMember('');
    };

    const handleRoleChange = (role: '班長' | '班員') => {
        setSelectedRole(role);
        setSelectedMember('');
    };

    const getAvailableMembers = () => {
        if (!selectedTeam || !selectedRole) return [];
        return teams[selectedTeam]?.members.filter(member => member.role === selectedRole) || [];
    };

    const handleSubmit = async () => {
        if (!selectedTeam || !selectedRole || !selectedMember) {
            setResult('請完整填寫所有欄位');
            return;
        }

        setResult(`選擇結果：${selectedTeam}班 ${selectedRole} ${selectedMember}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
                        測試身份選擇界面
                    </h1>

                    <div className="space-y-4">
                        {/* 選擇班級 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                選擇班級
                            </label>
                            <select
                                value={selectedTeam}
                                onChange={(e) => handleTeamChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">請選擇班級</option>
                                {Object.keys(teams).map(team => (
                                    <option key={team} value={team}>{team}班</option>
                                ))}
                            </select>
                        </div>

                        {/* 選擇角色 */}
                        {selectedTeam && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    選擇角色
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => handleRoleChange(e.target.value as '班長' | '班員')}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">請選擇角色</option>
                                    <option value="班長">班長</option>
                                    <option value="班員">班員</option>
                                </select>
                            </div>
                        )}

                        {/* 選擇成員 */}
                        {selectedTeam && selectedRole && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    選擇您的姓名
                                </label>
                                <select
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">請選擇姓名</option>
                                    {getAvailableMembers().map(member => (
                                        <option key={member.name} value={member.name}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!selectedTeam || !selectedRole || !selectedMember}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            確認選擇
                        </button>

                        {result && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-green-600 text-sm">{result}</p>
                            </div>
                        )}

                        {/* 調試資訊 */}
                        <div className="mt-6 p-3 bg-gray-50 rounded-md">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">調試資訊：</h3>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>可用班級：{Object.keys(teams).join(', ')}</p>
                                <p>選擇的班級：{selectedTeam || '未選擇'}</p>
                                <p>選擇的角色：{selectedRole || '未選擇'}</p>
                                <p>可用成員：{getAvailableMembers().map(m => m.name).join(', ') || '無'}</p>
                                <p>選擇的成員：{selectedMember || '未選擇'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
