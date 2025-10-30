const db = require('../config/database');

// Search books (uses stored procedure)
exports.searchBooks = async (req, res) => {
    try {
        const { q = '' } = req.query;
        const [books] = await db.query('CALL SearchBooks(?)', [q]);
        
        res.json({
            success: true,
            data: books[0],
            count: books[0].length
        });
    } catch (error) {
        console.error('Search books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search books',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT 
                b.book_id,
                b.ISBN,
                b.title,
                c.category_name,
                b.publisher,
                b.publication_year,
                b.total_copies,
                b.available_copies,
                b.price,
                GROUP_CONCAT(DISTINCT a.author_name ORDER BY a.author_name) as authors
            FROM Books b
            LEFT JOIN Categories c ON b.category_id = c.category_id
            LEFT JOIN Book_Authors ba ON b.book_id = ba.book_id
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            GROUP BY b.book_id, b.ISBN, b.title, c.category_name, b.publisher, 
                     b.publication_year, b.total_copies, b.available_copies, b.price
            ORDER BY b.book_id DESC
        `);

        res.json({
            success: true,
            data: books,
            count: books.length
        });
    } catch (error) {
        console.error('Get all books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve books'
        });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [books] = await db.query(`
            SELECT 
                b.*,
                c.category_name,
                GROUP_CONCAT(DISTINCT a.author_name) as authors
            FROM Books b
            LEFT JOIN Categories c ON b.category_id = c.category_id
            LEFT JOIN Book_Authors ba ON b.book_id = ba.book_id
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE b.book_id = ?
            GROUP BY b.book_id
        `, [id]);

        if (books.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.json({
            success: true,
            data: books[0]
        });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve book'
        });
    }
};

// Add new book (uses stored procedure)
exports.addBook = async (req, res) => {
    try {
        const { 
            ISBN, 
            title, 
            category_id, 
            publisher, 
            publication_year, 
            total_copies, 
            price, 
            authors 
        } = req.body;

        if (!ISBN || !title || !category_id || !total_copies || !authors) {
            return res.status(400).json({
                success: false,
                message: 'ISBN, title, category, total_copies, and authors are required'
            });
        }

        const [result] = await db.query(
            'CALL AddBook(?, ?, ?, ?, ?, ?, ?, ?)',
            [ISBN, title, category_id, publisher, publication_year, total_copies, price, authors]
        );

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: result[0][0]
        });
    } catch (error) {
        console.error('Add book error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Book with this ISBN already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add book',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update book
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            ISBN, 
            title, 
            category_id, 
            publisher, 
            publication_year, 
            total_copies, 
            price 
        } = req.body;

        const [result] = await db.query(`
            UPDATE Books 
            SET 
                ISBN = COALESCE(?, ISBN),
                title = COALESCE(?, title),
                category_id = COALESCE(?, category_id),
                publisher = COALESCE(?, publisher),
                publication_year = COALESCE(?, publication_year),
                total_copies = COALESCE(?, total_copies),
                price = COALESCE(?, price)
            WHERE book_id = ?
        `, [ISBN, title, category_id, publisher, publication_year, total_copies, price, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.json({
            success: true,
            message: 'Book updated successfully'
        });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update book'
        });
    }
};

// Delete book (uses stored procedure)
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('CALL DeleteBookWithAuthors(?)', [id]);

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete book'
        });
    }
};

// Get popular books (uses stored procedure)
exports.getPopularBooks = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const [books] = await db.query('CALL GetPopularBooks(?)', [parseInt(limit)]);

        res.json({
            success: true,
            data: books[0]
        });
    } catch (error) {
        console.error('Get popular books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve popular books'
        });
    }
};
