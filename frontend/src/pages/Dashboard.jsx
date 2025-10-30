import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Table from '../components/Table';
import Loading from '../components/Loading';
import { getDashboardStats, getPopularBooks } from '../services/statsService';
import { getOverdueBooks } from '../services/transactionService';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [popularBooks, setPopularBooks] = useState([]);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, popularRes, overdueRes] = await Promise.all([
                getDashboardStats(),
                getPopularBooks(5),
                getOverdueBooks()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (popularRes.success) setPopularBooks(popularRes.data);
            if (overdueRes.success) setOverdueBooks(overdueRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading message="Loading dashboard..." />;

    const popularBooksColumns = [
        { header: 'Title', accessor: 'title' },
        { header: 'Authors', accessor: 'authors' },
        { header: 'Category', accessor: 'category_name' },
        { header: 'Borrowed', accessor: 'borrow_count' },
        { 
            header: 'Availability', 
            render: (row) => `${row.available_copies} / ${row.total_copies}`
        }
    ];

    const overdueBooksColumns = [
        { header: 'Book Title', accessor: 'title' },
        { header: 'Member', accessor: 'member_name' },
        { header: 'Issue Date', render: (row) => new Date(row.issue_date).toLocaleDateString() },
        { header: 'Due Date', render: (row) => new Date(row.due_date).toLocaleDateString() },
        { 
            header: 'Days Overdue', 
            render: (row) => <span className="text-red-600 font-bold">{row.days_overdue}</span>
        }
    ];

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Overview of library statistics</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Books"
                        value={stats?.total_books || 0}
                        icon={<span className="text-2xl">📚</span>}
                        color="blue"
                        subtitle={`${stats?.available_books || 0} available`}
                    />
                    <StatCard
                        title="Active Members"
                        value={stats?.active_members || 0}
                        icon={<span className="text-2xl">👥</span>}
                        color="green"
                    />
                    <StatCard
                        title="Books Issued"
                        value={stats?.books_issued || 0}
                        icon={<span className="text-2xl">📋</span>}
                        color="purple"
                        subtitle={`${stats?.today_issues || 0} today`}
                    />
                    <StatCard
                        title="Overdue Books"
                        value={stats?.overdue_books || 0}
                        icon={<span className="text-2xl">⚠️</span>}
                        color="red"
                    />
                </div>

                {/* Popular Books */}
                <Card title="📈 Popular Books">
                    <Table 
                        columns={popularBooksColumns} 
                        data={popularBooks}
                        emptyMessage="No popular books data available"
                    />
                </Card>

                {/* Overdue Books */}
                {overdueBooks.length > 0 && (
                    <Card title="⚠️ Overdue Books">
                        <Table 
                            columns={overdueBooksColumns} 
                            data={overdueBooks}
                        />
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
