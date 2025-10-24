import React, { useState, useEffect } from 'react';
import { transactionAPI, bookAPI, memberAPI } from '../services/api';
import { toast } from 'react-toastify';


const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [issueFormData, setIssueFormData] = useState({
        book_id: '',
        member_id: '',
        days: 14
    });
    const [returnFormData, setReturnFormData] = useState({
        transaction_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transRes, booksRes, membersRes] = await Promise.all([
                transactionAPI.getAll({ limit: 50 }),
                bookAPI.getAll({ available: 'true' }),
                memberAPI.getAll({ status: 'Active' })
            ]);
            setTransactions(transRes.data.data);
            setBooks(booksRes.data.data);
            setMembers(membersRes.data.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleIssueBook = async (e) => {
        e.preventDefault();
        try {
            await transactionAPI.issueBook(issueFormData);
            toast.success('Book issued successfully');
            setShowIssueModal(false);
            fetchData();
            setIssueFormData({ book_id: '', member_id: '', days: 14 });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to issue book');
        }
    };

    const handleReturnBook = async (e) => {
        e.preventDefault();
        try {
            await transactionAPI.returnBook(returnFormData);
            toast.success('Book returned successfully');
            setShowReturnModal(false);
            fetchData();
            setReturnFormData({ transaction_id: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to return book');
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="transactions-page">
            <div className="page-header">
                <h1>Transactions</h1>
                <div>
                    <button onClick={() => setShowIssueModal(true)} className="btn-primary">
                        Issue Book
                    </button>
                    <button onClick={() => setShowReturnModal(true)} className="btn-secondary">
                        Return Book
                    </button>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Book</th>
                        <th>Member</th>
                        <th>Issue Date</th>
                        <th>Due Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                        <th>Staff</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((trans) => (
                        <tr key={trans.transaction_id}>
                            <td>{trans.transaction_id}</td>
                            <td>{trans.book_title}</td>
                            <td>{trans.member_name}</td>
                            <td>{new Date(trans.issue_date).toLocaleDateString()}</td>
                            <td>{new Date(trans.due_date).toLocaleDateString()}</td>
                            <td>{trans.return_date ? new Date(trans.return_date).toLocaleDateString() : '-'}</td>
                            <td>
                                <span className={`status-badge ${trans.status.toLowerCase()}`}>
                                    {trans.status}
                                </span>
                            </td>
                            <td>{trans.staff_name || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Issue Book Modal */}
            {showIssueModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Issue Book</h2>
                            <button onClick={() => setShowIssueModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={handleIssueBook}>
                            <div className="form-group">
                                <label>Select Book *</label>
                                <select
                                    value={issueFormData.book_id}
                                    onChange={(e) => setIssueFormData({...issueFormData, book_id: e.target.value})}
                                    required
                                >
                                    <option value="">Choose a book...</option>
                                    {books.map((book) => (
                                        <option key={book.book_id} value={book.book_id}>
                                            {book.title} ({book.available_copies} available)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Member *</label>
                                <select
                                    value={issueFormData.member_id}
                                    onChange={(e) => setIssueFormData({...issueFormData, member_id: e.target.value})}
                                    required
                                >
                                    <option value="">Choose a member...</option>
                                    {members.map((member) => (
                                        <option key={member.member_id} value={member.member_id}>
                                            {member.first_name} {member.last_name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Loan Period (days) *</label>
                                <input
                                    type="number"
                                    value={issueFormData.days}
                                    onChange={(e) => setIssueFormData({...issueFormData, days: e.target.value})}
                                    min="1"
                                    max="90"
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowIssueModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Issue Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Return Book Modal */}
            {showReturnModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Return Book</h2>
                            <button onClick={() => setShowReturnModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={handleReturnBook}>
                            <div className="form-group">
                                <label>Transaction ID *</label>
                                <input
                                    type="number"
                                    value={returnFormData.transaction_id}
                                    onChange={(e) => setReturnFormData({transaction_id: e.target.value})}
                                    placeholder="Enter transaction ID"
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowReturnModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Return Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;