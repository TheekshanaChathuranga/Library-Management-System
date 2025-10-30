import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import Badge from "../components/Badge";
import {
  getAllBooks,
  searchBooks,
  addBook,
  updateBook,
  deleteBook,
} from "../services/bookService";
import { getAllCategories } from "../services/categoryService";
import { getCurrentUser } from "../services/authService";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const user = getCurrentUser();

  const [formData, setFormData] = useState({
    ISBN: "",
    title: "",
    category_id: "",
    publisher: "",
    publication_year: "",
    total_copies: "",
    price: "",
    authors: "",
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
      toast.error("Failed to load books");
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
      toast.error("Failed to load categories");
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
      toast.error("Search failed");
    }
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setFormData({
      ISBN: "",
      title: "",
      category_id: "",
      publisher: "",
      publication_year: "",
      total_copies: "",
      price: "",
      authors: "",
    });
    setIsModalOpen(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      ISBN: book.ISBN,
      title: book.title,
      category_id: book.category_id || "",
      publisher: book.publisher || "",
      publication_year: book.publication_year || "",
      total_copies: book.total_copies,
      price: book.price || "",
      authors: book.authors || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await deleteBook(bookId);
      if (response.success) {
        toast.success("Book deleted successfully");
        fetchBooks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete book");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBook) {
        const response = await updateBook(editingBook.book_id, formData);
        if (response.success) {
          toast.success("Book updated successfully");
        }
      } else {
        const response = await addBook(formData);
        if (response.success) {
          toast.success("Book added successfully");
        }
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    {
      header: "Book Details",
      className: "px-6 py-4",
      render: (row) => (
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-16 bg-gray-100 flex items-center justify-center rounded-lg">
            📖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate">
              {row.title}
            </p>
            <p className="text-sm text-gray-500 mt-1">ISBN: {row.ISBN}</p>
            <p className="text-sm text-gray-500">By: {row.authors}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Category & Publisher",
      className: "px-6 py-4",
      render: (row) => (
        <div className="space-y-1">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {row.category_name}
          </div>
          <p className="text-sm text-gray-600 mt-1">{row.publisher}</p>
          <p className="text-sm text-gray-500">
            Published: {row.publication_year}
          </p>
        </div>
      ),
    },
    {
      header: "Status & Actions",
      className: "px-6 py-4",
      render: (row) => (
        <div className="space-y-4">
          {/* Availability Status */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  row.available_copies > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm font-medium">
                {row.available_copies > 0 ? "Available" : "Out of Stock"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    row.available_copies > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{
                    width: `${
                      (row.available_copies / row.total_copies) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {row.available_copies}/{row.total_copies}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {(user?.role === "Admin" || user?.role === "Librarian") && (
            <div className="flex flex-col space-y-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleEditBook(row)}
                className="w-full flex justify-center items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Details
              </Button>
              {user?.role === "Admin" && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteBook(row.book_id)}
                  className="w-full flex justify-center items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove Book
                </Button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loading message="Loading books..." />;

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-4xl">📚</span>
                <span>Books Management</span>
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and organize your library collection efficiently
              </p>
            </div>
            {(user?.role === "Admin" || user?.role === "Librarian") && (
              <div className="mt-4 sm:mt-0">
                <Button
                  onClick={handleAddBook}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add New Book
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <Card className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <Input
                  placeholder="Search by title, ISBN, author, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 mb-0 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  className="min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Search
                </Button>
                <Button
                  variant="secondary"
                  onClick={fetchBooks}
                  className="min-w-[100px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {books.length} book{books.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </Card>

        {/* Books Table */}
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={books}
              emptyMessage={
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">No books found</p>
                  <p className="text-sm text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              }
              className="min-w-full divide-y divide-gray-200"
            />
          </div>
        </Card>

        {/* Add/Edit Book Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBook ? "Edit Book" : "Add New Book"}
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingBook ? "Update Book" : "Add Book"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Books;
