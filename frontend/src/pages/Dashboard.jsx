import React, { useState, useEffect } from 'react';
import { reportAPI, transactionAPI } from '../services/api';
import { toast } from 'react-toastify';
const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, transactionsRes] = await Promise.all([
                reportAPI.getStatistics(),
                transactionAPI.getAll({ limit: 5 })
            ]);

            setStats(statsRes.data.data);
            setRecentTransactions(transactionsRes.data.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                    <span className="text-white text-xl">📚</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Books Issued Today</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.today_issues || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <span className="text-white text-xl">📖</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Books Returned Today</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.today_returns || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                    <span className="text-white text-xl">👥</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Currently Issued</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.currently_issued || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                    <span className="text-white text-xl">🏃</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Active Members</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.active_members || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                    <span className="text-white text-xl">📚</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Available Books</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.available_books || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                                    <span className="text-white text-xl">💰</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_books || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                    </div>
                    <div className="mt-4 flex flex-col">
                        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Book</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Member</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Issue Date</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {recentTransactions.map((trans) => (
                                                <tr key={trans.transaction_id}>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{trans.transaction_id}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trans.book_title}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trans.member_name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {new Date(trans.issue_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {new Date(trans.due_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                                                            ${trans.status.toLowerCase() === 'issued' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                            ${trans.status.toLowerCase() === 'returned' ? 'bg-green-100 text-green-800' : ''}
                                                            ${trans.status.toLowerCase() === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                                                        `}>
                                                            {trans.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;