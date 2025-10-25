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
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Library Transactions</h1>
                <div className="space-x-4">
                    <button
                        onClick={() => setShowIssueModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Issue Book
                    </button>
                    <button
                        onClick={() => setShowReturnModal(true)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Return Book
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Book</th>
                            <th className="px-4 py-2">Member</th>
                            <th className="px-4 py-2">Issue Date</th>
                            <th className="px-4 py-2">Due Date</th>
                            <th className="px-4 py-2">Return Date</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Staff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((trans, index) => (
                            <tr
                                key={trans.transaction_id}
                                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                            >
                                <td className="px-4 py-2">{trans.transaction_id}</td>
                                <td className="px-4 py-2">{trans.book_title}</td>
                                <td className="px-4 py-2">{trans.member_name}</td>
                                <td className="px-4 py-2">{new Date(trans.issue_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2">{new Date(trans.due_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2">
                                    {trans.return_date
                                        ? new Date(trans.return_date).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td className="px-4 py-2">
                                    <span
                                        className={`px-2 py-1 rounded text-white ${
                                            trans.status.toLowerCase() === 'issued'
                                                ? 'bg-blue-500'
                                                : 'bg-green-500'
                                        }`}
                                    >
                                        {trans.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{trans.staff_name || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Issue Book Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Issue Book</h2>
                            <button
                                onClick={() => setShowIssueModal(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleIssueBook}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Select Book *</label>
                                <select
                                    value={issueFormData.book_id}
                                    onChange={(e) =>
                                        setIssueFormData({ ...issueFormData, book_id: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2"
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
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Select Member *</label>
                                <select
                                    value={issueFormData.member_id}
                                    onChange={(e) =>
                                        setIssueFormData({ ...issueFormData, member_id: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2"
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
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Loan Period (days) *</label>
                                <input
                                    type="number"
                                    value={issueFormData.days}
                                    onChange={(e) =>
                                        setIssueFormData({ ...issueFormData, days: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    min="1"
                                    max="90"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowIssueModal(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Issue Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Return Book Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Return Book</h2>
                            <button
                                onClick={() => setShowReturnModal(false)}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleReturnBook}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Transaction ID *</label>
                                <input
                                    type="number"
                                    value={returnFormData.transaction_id}
                                    onChange={(e) =>
                                        setReturnFormData({ transaction_id: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="Enter transaction ID"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowReturnModal(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
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