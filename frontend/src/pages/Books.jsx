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
import { getAllBooks, searchBooks, addBook, updateBook, deleteBook } from '../services/bookService';
import { getAllCategories } from '../services/categoryService';
import { getCurrentUser } from '../services/authService';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const user = getCurrentUser();

    const [formData, setFormData] = useState({
        ISBN: '',
        title: '',
        category_id: '',
        publisher: '',
        publication_year: '',
        total_copies: '',
        price: '',
        authors: ''
    });

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await getAllBooks();
            if (response.success) {
                setBooks(response.data);
            }
        } catch (error) {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            toast.error('Failed to load categories');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchBooks();
            return;
        }

        try {
            const response = await searchBooks(searchQuery);
            if (response.success) {
                setBooks(response.data);
                toast.success(`Found ${response.count} books`);
            }
        } catch (error) {
            toast.error('Search failed');
        }
    };

    const handleAddBook = () => {
        setEditingBook(null);
        setFormData({
            ISBN: '',
            title: '',
            category_id: '',
            publisher: '',
            publication_year: '',
            total_copies: '',
            price: '',
            authors: ''
        });
        setIsModalOpen(true);
    };

    const handleEditBook = (book) => {
        setEditingBook(book);
        setFormData({
            ISBN: book.ISBN,
            title: book.title,
            category_id: book.category_id || '',
            publisher: book.publisher || '',
            publication_year: book.publication_year || '',
            total_copies: book.total_copies,
            price: book.price || '',
            authors: book.authors || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            const response = await deleteBook(bookId);
            if (response.success) {
                toast.success('Book deleted successfully');
                fetchBooks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete book');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBook) {
                const response = await updateBook(editingBook.book_id, formData);
                if (response.success) {
                    toast.success('Book updated successfully');
                }
            } else {
                const response = await addBook(formData);
                if (response.success) {
                    toast.success('Book added successfully');
                }
            }
            setIsModalOpen(false);
            fetchBooks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const columns = [
        { header: 'ISBN', accessor: 'ISBN' },
        { header: 'Title', accessor: 'title' },
        { header: 'Authors', accessor: 'authors' },
        { header: 'Category', accessor: 'category_name' },
        { header: 'Publisher', accessor: 'publisher' },
        { header: 'Year', accessor: 'publication_year' },
        {
            header: 'Availability',
            render: (row) => (
                <div>
                    <Badge variant={row.available_copies > 0 ? 'success' : 'danger'}>
                        {row.available_copies} / {row.total_copies}
                    </Badge>
                </div>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex space-x-2">
                    {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <>
                            <Button size="sm" variant="primary" onClick={() => handleEditBook(row)}>
                                Edit
                            </Button>
                            {user?.role === 'Admin' && (
                                <Button size="sm" variant="danger" onClick={() => handleDeleteBook(row.book_id)}>
                                    Delete
                                </Button>
                            )}
                        </>
                    )}
                </div>
            )
        }
    ];

    if (loading) return <Loading message="Loading books..." />;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📚 Books</h1>
                        <p className="text-gray-600">Manage library books</p>
                    </div>
                    {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <Button onClick={handleAddBook}>
                            + Add New Book
                        </Button>
                    )}
                </div>

                {/* Search Bar */}
                <Card>
                    <div className="flex space-x-2">
                        <Input
                            placeholder="Search by title, ISBN, author, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="mb-0"
                        />
                        <Button onClick={handleSearch}>Search</Button>
                        <Button variant="secondary" onClick={fetchBooks}>Clear</Button>
                    </div>
                </Card>

                {/* Books Table */}
                <Card>
                    <Table columns={columns} data={books} emptyMessage="No books found" />
                </Card>

                {/* Add/Edit Book Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingBook ? 'Edit Book' : 'Add New Book'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="ISBN"
                                name="ISBN"
                                value={formData.ISBN}
                                onChange={handleChange}
                                required
                                disabled={!!editingBook}
                            />
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.category_id} value={cat.category_id}>
                                            {cat.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Publisher"
                                name="publisher"
                                value={formData.publisher}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="Publication Year"
                                name="publication_year"
                                type="number"
                                value={formData.publication_year}
                                onChange={handleChange}
                            />
                            <Input
                                label="Total Copies"
                                name="total_copies"
                                type="number"
                                value={formData.total_copies}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Price (LKR)"
                                name="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label="Authors (comma-separated)"
                            name="authors"
                            value={formData.authors}
                            onChange={handleChange}
                            required={!editingBook}
                            placeholder="e.g., Martin Wickramasinghe, Author Name"
                            disabled={!!editingBook}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingBook ? 'Update Book' : 'Add Book'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </Layout>
    );
};

export default Books;
