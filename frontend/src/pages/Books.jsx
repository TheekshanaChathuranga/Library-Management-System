import React, { useState, useEffect } from 'react';
import { bookAPI } from '../services/api';
import { toast } from 'react-toastify';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        isbn: '',
        title: '',
        authors: '',
        category_id: 1,
        publisher: '',
        publication_year: new Date().getFullYear(),
        total_copies: 1,
        price: 0
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await bookAPI.getAll();
            setBooks(response.data.data);
        } catch (error) {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) {
            fetchBooks();
            return;
        }

        try {
            const response = await bookAPI.search(searchTerm);
            setBooks(response.data.data);
        } catch (error) {
            toast.error('Search failed');
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await bookAPI.create(formData);
            toast.success('Book added successfully');
            setShowAddModal(false);
            fetchBooks();
            setFormData({
                isbn: '',
                title: '',
                authors: '',
                category_id: 1,
                publisher: '',
                publication_year: new Date().getFullYear(),
                total_copies: 1,
                price: 0
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add book');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await bookAPI.delete(id);
                toast.success('Book deleted successfully');
                fetchBooks();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete book');
            }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Books Management</h1>
                    <button 
                        onClick={() => setShowAddModal(true)} 
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        + Add Book
                    </button>
                </div>

                <div className="mt-6 bg-white shadow rounded-lg p-4">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <button 
                            type="submit" 
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Search
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setSearchTerm(''); fetchBooks(); }}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Clear
                        </button>
                    </form>
                </div>

                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ISBN</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Authors</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Publisher</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Available/Total</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {books.map((book) => (
                                            <tr key={book.book_id}>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.ISBN}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{book.title}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.authors || 'N/A'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.category_name || 'N/A'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.publisher}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`${
                                                        book.available_copies > 0 
                                                            ? 'text-green-600 font-medium' 
                                                            : 'text-red-600 font-medium'
                                                    }`}>
                                                        {book.available_copies}/{book.total_copies}
                                                    </span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button 
                                                        onClick={() => handleDelete(book.book_id)}
                                                        className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                        <div className="fixed inset-0 z-10 overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            <h3 className="text-xl font-semibold leading-6 text-gray-900">Add New Book</h3>
                                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">ISBN *</label>
                                                    <input
                                                        type="text"
                                                        name="isbn"
                                                        value={formData.isbn}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Authors (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        name="authors"
                                                        value={formData.authors}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., J.K. Rowling, John Doe"
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Publisher</label>
                                                    <input
                                                        type="text"
                                                        name="publisher"
                                                        value={formData.publisher}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Publication Year</label>
                                                        <input
                                                            type="number"
                                                            name="publication_year"
                                                            value={formData.publication_year}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Total Copies *</label>
                                                        <input
                                                            type="number"
                                                            name="total_copies"
                                                            value={formData.total_copies}
                                                            onChange={handleInputChange}
                                                            min="1"
                                                            required
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            value={formData.price}
                                                            onChange={handleInputChange}
                                                            step="0.01"
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                                                    >
                                                        Add Book
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAddModal(false)}
                                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;
