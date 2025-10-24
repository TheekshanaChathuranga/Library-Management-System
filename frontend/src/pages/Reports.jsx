import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { toast } from 'react-toastify';


const Reports = () => {
    const [statistics, setStatistics] = useState(null);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const [statsRes, overdueRes, popularRes] = await Promise.all([
                reportAPI.getStatistics(),
                reportAPI.getOverdue(),
                reportAPI.getPopular(10)
            ]);

            setStatistics(statsRes.data.data);
            setOverdueBooks(overdueRes.data.data);
            setPopularBooks(popularRes.data.data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading reports...</div>;
    }

    return (
        <div className="reports-page">
            <h1>Reports & Analytics</h1>

            {/* Statistics Section */}
            <div className="reports-grid">
                <div className="report-section">
                    <h2>📊 Today's Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Books Issued Today</h3>
                            <p className="stat-number">{statistics?.books_issued_today || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Books Returned Today</h3>
                            <p className="stat-number">{statistics?.books_returned_today || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Currently Issued</h3>
                            <p className="stat-number">{statistics?.currently_issued || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Active Members</h3>
                            <p className="stat-number">{statistics?.active_members || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Available Books</h3>
                            <p className="stat-number">{statistics?.available_books || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Pending Fines</h3>
                            <p className="stat-number">${statistics?.pending_fines || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Overdue Books Section */}
                <div className="report-section">
                    <h2>⚠️ Overdue Books ({overdueBooks.length})</h2>
                    {overdueBooks.length === 0 ? (
                        <p style={{color: '#059669', fontWeight: '600'}}>
                            ✓ No overdue books at the moment!
                        </p>
                    ) : (
                        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Book</th>
                                        <th>Member</th>
                                        <th>Due Date</th>
                                        <th>Days Overdue</th>
                                        <th>Est. Fine</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueBooks.map((book) => (
                                        <tr key={book.transaction_id}>
                                            <td>{book.transaction_id}</td>
                                            <td>{book.title}</td>
                                            <td>
                                                <div>
                                                    <strong>{book.member_name}</strong>
                                                    <br />
                                                    <small>{book.email}</small>
                                                </div>
                                            </td>
                                            <td>{new Date(book.due_date).toLocaleDateString()}</td>
                                            <td>
                                                <span className="status-badge overdue">
                                                    {book.days_overdue} days
                                                </span>
                                            </td>
                                            <td>${book.estimated_fine}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Popular Books Section */}
                <div className="report-section">
                    <h2>📚 Most Popular Books</h2>
                    {popularBooks.length === 0 ? (
                        <p>No borrowing history yet.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Title</th>
                                    <th>Authors</th>
                                    <th>Category</th>
                                    <th>Times Borrowed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {popularBooks.map((book, index) => (
                                    <tr key={book.book_id}>
                                        <td>
                                            <strong>#{index + 1}</strong>
                                        </td>
                                        <td>{book.title}</td>
                                        <td>{book.authors || 'N/A'}</td>
                                        <td>{book.category_name || 'N/A'}</td>
                                        <td>
                                            <span className="status-badge issued">
                                                {book.times_borrowed} times
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;