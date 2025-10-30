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
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('transaction_id');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
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

    const handleViewTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setIsViewModalOpen(true);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = searchQuery.toLowerCase() === '' ||
            transaction.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.ISBN.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
    }).sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'transaction_id') return (a.transaction_id - b.transaction_id) * order;
        if (sortBy === 'due_date') return (new Date(a.due_date) - new Date(b.due_date)) * order;
        return String(a[sortBy]).localeCompare(String(b[sortBy])) * order;
    });

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
        { 
            header: () => (
                <div 
                    className="cursor-pointer flex items-center"
                    onClick={() => handleSort('transaction_id')}
                >
                    ID {sortBy === 'transaction_id' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </div>
            ),
            accessor: 'transaction_id',
            className: 'font-medium'
        },
        { 
            header: () => (
                <div 
                    className="cursor-pointer flex items-center"
                    onClick={() => handleSort('book_title')}
                >
                    Book Title {sortBy === 'book_title' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </div>
            ),
            render: (row) => (
                <div>
                    <div className="font-medium">{row.book_title}</div>
                    <div className="text-sm text-gray-500">ISBN: {row.ISBN}</div>
                </div>
            )
        },
        { 
            header: () => (
                <div 
                    className="cursor-pointer flex items-center"
                    onClick={() => handleSort('member_name')}
                >
                    Member {sortBy === 'member_name' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </div>
            ),
            render: (row) => (
                <div>
                    <div className="font-medium">{row.member_name}</div>
                    <div className="text-sm text-gray-500">Staff: {row.staff_name}</div>
                </div>
            )
        },
        { 
            header: () => (
                <div 
                    className="cursor-pointer flex items-center"
                    onClick={() => handleSort('due_date')}
                >
                    Dates {sortBy === 'due_date' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </div>
            ),
            render: (row) => (
                <div className="space-y-1">
                    <div className="text-sm">
                        <span className="font-medium">Issued:</span> {new Date(row.issue_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                        <span className="font-medium">Due:</span> {new Date(row.due_date).toLocaleDateString()}
                    </div>
                    {row.return_date && (
                        <div className="text-sm">
                            <span className="font-medium">Returned:</span> {new Date(row.return_date).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: () => (
                <div 
                    className="cursor-pointer flex items-center"
                    onClick={() => handleSort('status')}
                >
                    Status {sortBy === 'status' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                </div>
            ),
            render: (row) => (
                <div>
                    {getStatusBadge(row.status)}
                    {row.status === 'Overdue' && row.days_overdue > 0 && (
                        <div className="text-sm text-red-600 font-medium mt-1">
                            {row.days_overdue} days overdue
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex flex-col space-y-2">
                    <Button 
                        size="sm"
                        variant="primary"
                        className="w-full flex items-center justify-center"
                        onClick={() => handleViewTransaction(row)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View Details
                    </Button>
                    {row.status === 'Issued' && (user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <Button 
                            size="sm" 
                            variant="success"
                            className="w-full flex items-center justify-center"
                            onClick={() => handleReturnBook(row.transaction_id)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Return Book
                        </Button>
                    )}
                </div>
            ),
            className: 'w-[140px]'
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

                {/* Search and Filter Section */}
                <Card>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 max-w-md">
                                <Input
                                    type="text"
                                    placeholder="Search by book title, member name, or ISBN..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <Button 
                                    variant={filterStatus === '' ? 'primary' : 'outline'}
                                    onClick={() => handleFilterChange('')}
                                    className="flex items-center"
                                >
                                    <span className="mr-1">All</span>
                                    {filterStatus === '' && <span className="text-sm">({filteredTransactions.length})</span>}
                                </Button>
                                <Button 
                                    variant={filterStatus === 'Issued' ? 'primary' : 'outline'}
                                    onClick={() => handleFilterChange('Issued')}
                                    className="flex items-center"
                                >
                                    <span className="mr-1">Issued</span>
                                    {filterStatus === 'Issued' && <span className="text-sm">({filteredTransactions.length})</span>}
                                </Button>
                                <Button 
                                    variant={filterStatus === 'Returned' ? 'primary' : 'outline'}
                                    onClick={() => handleFilterChange('Returned')}
                                    className="flex items-center"
                                >
                                    <span className="mr-1">Returned</span>
                                    {filterStatus === 'Returned' && <span className="text-sm">({filteredTransactions.length})</span>}
                                </Button>
                                <Button 
                                    variant={filterStatus === 'Overdue' ? 'primary' : 'outline'}
                                    onClick={() => handleFilterChange('Overdue')}
                                    className="flex items-center text-red-600"
                                >
                                    <span className="mr-1">Overdue</span>
                                    {filterStatus === 'Overdue' && <span className="text-sm">({filteredTransactions.length})</span>}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table 
                            columns={columns} 
                            data={filteredTransactions} 
                            emptyMessage={
                                searchQuery
                                    ? "No transactions found matching your search"
                                    : "No transactions found"
                            }
                        />
                    </div>
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

                {/* View Transaction Modal */}
                <Modal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Transaction Details"
                    size="lg"
                >
                    {selectedTransaction && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                                    <p className="mt-1">{selectedTransaction.transaction_id}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Book Title</h3>
                                    <p className="mt-1">{selectedTransaction.book_title}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                                    <p className="mt-1">{selectedTransaction.ISBN}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Member</h3>
                                    <p className="mt-1">{selectedTransaction.member_name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Staff</h3>
                                    <p className="mt-1">{selectedTransaction.staff_name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Issue Date</h3>
                                    <p className="mt-1">{new Date(selectedTransaction.issue_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                                    <p className="mt-1">{new Date(selectedTransaction.due_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Return Date</h3>
                                    <p className="mt-1">
                                        {selectedTransaction.return_date 
                                            ? new Date(selectedTransaction.return_date).toLocaleDateString() 
                                            : '-'}
                                    </p>
                                </div>
                                {selectedTransaction.status === 'Overdue' && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Days Overdue</h3>
                                        <p className="mt-1 text-red-600 font-bold">
                                            {selectedTransaction.days_overdue}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                {selectedTransaction.status === 'Issued' && 
                                (user?.role === 'Admin' || user?.role === 'Librarian') && (
                                    <Button 
                                        variant="success"
                                        onClick={() => {
                                            handleReturnBook(selectedTransaction.transaction_id);
                                            setIsViewModalOpen(false);
                                        }}
                                    >
                                        Return Book
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </Layout>
    );
};

export default Transactions;
