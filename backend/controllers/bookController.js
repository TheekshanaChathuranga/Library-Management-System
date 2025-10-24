const db = require('../config/database');

exports.getAllBooks = async (req, res) => {
    try {
        const { category, available } = req.query;
        
        let query = `
            SELECT 
                b.book_id, b.ISBN, b.title, b.publisher, 
                b.publication_year, b.total_copies, b.available_copies, b.price,
                c.category_name,
                GROUP_CONCAT(a.author_name SEPARATOR ', ') AS authors
            FROM Books b
            LEFT JOIN Categories c ON b.category_id = c.category_id
            LEFT JOIN Book_Authors ba ON b.book_id = ba.book_id
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (category) {
            query += ` AND c.category_name = ?`;
            params.push(category);
        }
        
        if (available === 'true') {
            query += ` AND b.available_copies > 0`;
        }
        
        query += ` GROUP BY b.book_id ORDER BY b.title`;
        
        const [books] = await db.query(query, params);
        
        res.json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch books'
        });
    }
};

exports.searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        const [books] = await db.query('CALL SearchBooks(?)', [q]);
        
        res.json({
            success: true,
            count: books[0].length,
            data: books[0]
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const [books] = await db.query(`
            SELECT 
                b.*, c.category_name,
                GROUP_CONCAT(a.author_name SEPARATOR ', ') AS authors
            FROM Books b
            LEFT JOIN Categories c ON b.category_id = c.category_id
            LEFT JOIN Book_Authors ba ON b.book_id = ba.book_id
            LEFT JOIN Authors a ON ba.author_id = a.author_id
            WHERE b.book_id = ?
            GROUP BY b.book_id
        `, [req.params.id]);
        
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
            message: 'Failed to fetch book'
        });
    }
};

exports.addBook = async (req, res) => {
    try {
        const { isbn, title, category_id, publisher, publication_year, 
                total_copies, price, authors } = req.body;
        
        if (!isbn || !title || !total_copies) {
            return res.status(400).json({
                success: false,
                message: 'ISBN, title, and total_copies are required'
            });
        }
        
        const authorsString = Array.isArray(authors) ? authors.join(',') : authors || '';
        
        const [result] = await db.query('CALL AddBook(?, ?, ?, ?, ?, ?, ?, ?)', 
            [isbn, title, category_id, publisher, publication_year, 
             total_copies, price, authorsString]);
        
        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: result[0][0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Book with this ISBN already exists'
            });
        }
        console.error('Add book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add book'
        });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const { title, category_id, publisher, publication_year, 
                total_copies, available_copies, price } = req.body;
        
        const [result] = await db.query(`
            UPDATE Books 
            SET title = COALESCE(?, title),
                category_id = COALESCE(?, category_id),
                publisher = COALESCE(?, publisher),
                publication_year = COALESCE(?, publication_year),
                total_copies = COALESCE(?, total_copies),
                available_copies = COALESCE(?, available_copies),
                price = COALESCE(?, price)
            WHERE book_id = ?
        `, [title, category_id, publisher, publication_year, 
            total_copies, available_copies, price, req.params.id]);
        
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

exports.deleteBook = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Books WHERE book_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete book with existing transactions'
            });
        }
        console.error('Delete book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete book'
        });
    }
};
