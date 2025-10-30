import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import { getAllTransactions, issueBook, returnBook } from '../services/transactionService';
import { getAllBooks } from '../services/bookService';
import { getAllMembers } from '../services/memberService';
import { getCurrentUser } from '../services/authService';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const user = getCurrentUser();

    const [issueFormData, setIssueFormData] = useState({
        book_id: '',
        member_id: '',
        days: '14'
    });

    useEffect(() => {
        fetchTransactions();
        fetchBooks();
        fetchMembers();
    }, []);

    const fetchTransactions = async (status = '') => {
        try {
            const filters = status ? { status } : {};
            const response = await getAllTransactions(filters);
            if (response.success) {
                setTransactions(response.data);
            }
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await getAllBooks();
            if (response.success) {
                // Filter only available books
                setBooks(response.data.filter(book => book.available_copies > 0));
            }
        } catch (error) {
            console.error('Failed to load books');
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await getAllMembers('Active');
            if (response.success) {
                setMembers(response.data);
            }
        } catch (error) {
            console.error('Failed to load members');
        }
    };

    const handleIssueBook = () => {
        setIssueFormData({
            book_id: '',
            member_id: '',
            days: '14'
        });
        setIsIssueModalOpen(true);
    };

    const handleIssueSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await issueBook({
                book_id: parseInt(issueFormData.book_id),
                member_id: parseInt(issueFormData.member_id),
                days: parseInt(issueFormData.days)
            });

            if (response.success) {
                toast.success('Book issued successfully');
                setIsIssueModalOpen(false);
                fetchTransactions();
                fetchBooks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to issue book');
        }
    };

    const handleReturnBook = async (transactionId) => {
        if (!window.confirm('Confirm book return?')) return;

        try {
            const response = await returnBook(transactionId);
            if (response.success) {
                const fineAmount = response.data.fine_amount || 0;
                if (fineAmount > 0) {
                    toast.warning(`Book returned! Fine: LKR ${fineAmount.toFixed(2)}`);
                } else {
                    toast.success('Book returned successfully');
                }
                fetchTransactions();
                fetchBooks();
            }
        } catch (error) {
            toast.error('Failed to return book');
        }
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        fetchTransactions(status);
    };

    const handleIssueFormChange = (e) => {
        setIssueFormData({ ...issueFormData, [e.target.name]: e.target.value });
    };

    const getStatusBadge = (status) => {
        const variants = {
            Issued: 'info',
            Returned: 'success',
            Overdue: 'danger'
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
    };

    const columns = [
        { header: 'ID', accessor: 'transaction_id' },
        { header: 'Book Title', accessor: 'book_title' },
        { header: 'ISBN', accessor: 'ISBN' },
        { header: 'Member', accessor: 'member_name' },
        { header: 'Staff', accessor: 'staff_name' },
        { 
            header: 'Issue Date', 
            render: (row) => new Date(row.issue_date).toLocaleDateString()
        },
        { 
            header: 'Due Date', 
            render: (row) => new Date(row.due_date).toLocaleDateString()
        },
        { 
            header: 'Return Date', 
            render: (row) => row.return_date ? new Date(row.return_date).toLocaleDateString() : '-'
        },
        {
            header: 'Status',
            render: (row) => getStatusBadge(row.status)
        },
        {
            header: 'Days Overdue',
            render: (row) => {
                if (row.status === 'Returned' || !row.days_overdue || row.days_overdue <= 0) {
                    return '-';
                }
                return <span className="text-red-600 font-bold">{row.days_overdue}</span>;
            }
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex space-x-2">
                    {row.status === 'Issued' && (user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <Button 
                            size="sm" 
                            variant="success" 
                            onClick={() => handleReturnBook(row.transaction_id)}
                        >
                            Return
                        </Button>
                    )}
                </div>
            )
        }
    ];

    if (loading) return <Loading message="Loading transactions..." />;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📋 Transactions</h1>
                        <p className="text-gray-600">Manage book issue and return</p>
                    </div>
                    {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <Button onClick={handleIssueBook}>
                            + Issue Book
                        </Button>
                    )}
                </div>

                {/* Filter Buttons */}
                <Card>
                    <div className="flex space-x-2">
                        <Button 
                            variant={filterStatus === '' ? 'primary' : 'outline'}
                            onClick={() => handleFilterChange('')}
                        >
                            All
                        </Button>
                        <Button 
                            variant={filterStatus === 'Issued' ? 'primary' : 'outline'}
                            onClick={() => handleFilterChange('Issued')}
                        >
                            Issued
                        </Button>
                        <Button 
                            variant={filterStatus === 'Returned' ? 'primary' : 'outline'}
                            onClick={() => handleFilterChange('Returned')}
                        >
                            Returned
                        </Button>
                        <Button 
                            variant={filterStatus === 'Overdue' ? 'primary' : 'outline'}
                            onClick={() => handleFilterChange('Overdue')}
                        >
                            Overdue
                        </Button>
                    </div>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <Table columns={columns} data={transactions} emptyMessage="No transactions found" />
                </Card>

                {/* Issue Book Modal */}
                <Modal
                    isOpen={isIssueModalOpen}
                    onClose={() => setIsIssueModalOpen(false)}
                    title="Issue Book"
                    size="md"
                >
                    <form onSubmit={handleIssueSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Book <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="book_id"
                                value={issueFormData.book_id}
                                onChange={handleIssueFormChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a book</option>
                                {books.map((book) => (
                                    <option key={book.book_id} value={book.book_id}>
                                        {book.title} - {book.ISBN} (Available: {book.available_copies})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Member <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="member_id"
                                value={issueFormData.member_id}
                                onChange={handleIssueFormChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a member</option>
                                {members.map((member) => (
                                    <option key={member.member_id} value={member.member_id}>
                                        {member.first_name} {member.last_name} - {member.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Loan Period (Days)"
                            name="days"
                            type="number"
                            value={issueFormData.days}
                            onChange={handleIssueFormChange}
                            required
                            min="1"
                            max="90"
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsIssueModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Issue Book
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </Layout>
    );
};

export default Transactions;
