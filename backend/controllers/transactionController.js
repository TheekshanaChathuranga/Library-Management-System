const db = require('../config/database');

exports.getAllTransactions = async (req, res) => {
    try {
        const { status, limit } = req.query;
        
        let query = `
            SELECT 
                t.transaction_id, t.issue_date, t.due_date, t.return_date, t.status,
                b.title AS book_title, b.ISBN,
                CONCAT(m.first_name, ' ', m.last_name) AS member_name,
                m.email AS member_email,
                CONCAT(s.first_name, ' ', s.last_name) AS staff_name
            FROM Transactions t
            JOIN Books b ON t.book_id = b.book_id
            JOIN Members m ON t.member_id = m.member_id
            LEFT JOIN Staff s ON t.staff_id = s.staff_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status) {
            query += ` AND t.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY t.issue_date DESC`;
        
        if (limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(limit));
        }
        
        const [transactions] = await db.query(query, params);
        
        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions'
        });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT 
                t.*, 
                b.title AS book_title, b.ISBN,
                CONCAT(m.first_name, ' ', m.last_name) AS member_name,
                m.email AS member_email,
                f.fine_amount, f.payment_status
            FROM Transactions t
            JOIN Books b ON t.book_id = b.book_id
            JOIN Members m ON t.member_id = m.member_id
            LEFT JOIN Fines f ON t.transaction_id = f.transaction_id
            WHERE t.transaction_id = ?
        `, [req.params.id]);
        
        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: transactions[0]
        });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction'
        });
    }
};

exports.issueBook = async (req, res) => {
    try {
        const { book_id, member_id, days } = req.body;
        const staff_id = req.user.staff_id;

        if (!book_id || !member_id || !days) {
            return res.status(400).json({
                success: false,
                message: 'book_id, member_id, and days are required'
            });
        }

        // Call the stored procedure to issue the book
        const [result] = await db.query('CALL IssueBook(?, ?, ?, ?)', [book_id, member_id, staff_id, days]);

        // Ensure the stored procedure returned the expected result
        if (!result || result.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to issue book: No transaction details returned'
            });
        }

        // Respond with the transaction details
        res.status(201).json({
            success: true,
            message: 'Book issued successfully',
            data: result[0] // Transaction details
        });
    } catch (error) {
        console.error('Issue book error:', error);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while issuing the book'
        });
    }
};

exports.returnBook = async (req, res) => {
    try {
        const { transaction_id } = req.body;
        
        if (!transaction_id) {
            return res.status(400).json({
                success: false,
                message: 'transaction_id is required'
            });
        }
        
        const [result] = await db.query('CALL ReturnBook(?)', [transaction_id]);
        
        res.json({
            success: true,
            message: result[0][0].message
        });
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to return book'
        });
    }
};

exports.reserveBook = async (req, res) => {
    try {
        const { book_id, member_id } = req.body;
        
        if (!book_id || !member_id) {
            return res.status(400).json({
                success: false,
                message: 'book_id and member_id are required'
            });
        }
        
        const [result] = await db.query('CALL ReserveBook(?, ?)', [book_id, member_id]);
        
        res.status(201).json({
            success: true,
            message: result[0][0].message,
            data: result[0][0]
        });
    } catch (error) {
        console.error('Reserve book error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reserve book'
        });
    }
};
