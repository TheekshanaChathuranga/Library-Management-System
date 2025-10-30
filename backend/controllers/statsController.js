const db = require('../config/database');

// Get dashboard statistics (uses stored procedure)
exports.getDashboardStats = async (req, res) => {
    try {
        const [stats] = await db.query('CALL GetDailyStatistics()');

        res.json({
            success: true,
            data: stats[0][0]
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve statistics'
        });
    }
};

// Get popular books
exports.getPopularBooks = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
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

// Get category statistics
exports.getCategoryStats = async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT 
                c.category_name,
                COUNT(b.book_id) as book_count,
                SUM(b.total_copies) as total_copies,
                SUM(b.available_copies) as available_copies
            FROM Categories c
            LEFT JOIN Books b ON c.category_id = b.category_id
            GROUP BY c.category_id, c.category_name
            ORDER BY book_count DESC
        `);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get category stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve category statistics'
        });
    }
};

// Get monthly transaction report
exports.getMonthlyReport = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const [report] = await db.query(`
            SELECT 
                MONTH(issue_date) as month,
                MONTHNAME(issue_date) as month_name,
                COUNT(*) as total_issues,
                COUNT(CASE WHEN return_date IS NOT NULL THEN 1 END) as total_returns,
                COUNT(CASE WHEN return_date IS NULL AND due_date < CURDATE() THEN 1 END) as overdue
            FROM Transactions
            WHERE YEAR(issue_date) = ?
            GROUP BY MONTH(issue_date), MONTHNAME(issue_date)
            ORDER BY MONTH(issue_date)
        `, [year]);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Get monthly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve monthly report'
        });
    }
};

// Get member statistics
exports.getMemberStats = async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT 
                membership_type,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired,
                SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) as suspended
            FROM Members
            GROUP BY membership_type
        `);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get member stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve member statistics'
        });
    }
};
