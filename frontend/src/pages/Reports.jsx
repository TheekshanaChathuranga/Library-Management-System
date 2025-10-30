import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { getCategoryStats, getMonthlyReport, getMemberStats } from '../services/statsService';

const Reports = () => {
    const [categoryStats, setCategoryStats] = useState([]);
    const [monthlyReport, setMonthlyReport] = useState([]);
    const [memberStats, setMemberStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchReports = async () => {
        try {
            const [categoryRes, monthlyRes, memberRes] = await Promise.all([
                getCategoryStats(),
                getMonthlyReport(selectedYear),
                getMemberStats()
            ]);

            if (categoryRes.success) setCategoryStats(categoryRes.data);
            if (monthlyRes.success) setMonthlyReport(monthlyRes.data);
            if (memberRes.success) setMemberStats(memberRes.data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear]);

    if (loading) return <Loading message="Loading reports..." />;

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📈 Reports & Analytics</h1>
                    <p className="text-gray-600">Statistical insights and reports</p>
                </div>

                {/* Category Statistics */}
                <Card title="📚 Category Statistics">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryStats.map((cat, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg text-gray-900">{cat.category_name}</h3>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <p>📖 Total Books: <span className="font-medium">{cat.book_count}</span></p>
                                    <p>📚 Total Copies: <span className="font-medium">{cat.total_copies}</span></p>
                                    <p>✅ Available: <span className="font-medium text-green-600">{cat.available_copies}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Member Statistics */}
                <Card title="👥 Member Statistics">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {memberStats.map((stat, index) => (
                            <StatCard
                                key={index}
                                title={stat.membership_type}
                                value={stat.total}
                                subtitle={`Active: ${stat.active} | Expired: ${stat.expired} | Suspended: ${stat.suspended}`}
                                icon={<span className="text-2xl">👤</span>}
                                color="blue"
                            />
                        ))}
                    </div>
                </Card>

                {/* Monthly Transaction Report */}
                <Card 
                    title="📊 Monthly Transaction Report"
                    actions={
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium">Year:</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {[2024, 2025, 2026].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returns</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {monthlyReport.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            No data available for {selectedYear}
                                        </td>
                                    </tr>
                                ) : (
                                    monthlyReport.map((report, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {report.month_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                                {report.total_issues}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {report.total_returns}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                {report.overdue}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default Reports;
