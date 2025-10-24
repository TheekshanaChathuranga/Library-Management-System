const db = require('../config/database');

exports.getOverdueBooks = async (req, res) => {
    try {
        const [books] = await db.query('CALL GetOverdueBooks()');
        
        res.json({
            success: true,
            count: books[0].length,
            data: books[0]
        });
    } catch (error) {
        console.error('Get overdue books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue books'
        });
    }
};

exports.getPopularBooks = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const [books] = await db.query('CALL GetPopularBooks(?)', [limit]);
        
        res.json({
            success: true,
            data: books[0]
        });
    } catch (error) {
        console.error('Get popular books error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular books'
        });
    }
};

exports.getDailyStatistics = async (req, res) => {
    try {
        const [stats] = await db.query('CALL GetDailyStatistics()');
        
        res.json({
            success: true,
            data: stats[0][0]
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};

exports.getRevenueReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const [revenue] = await db.query(`
            SELECT 
                DATE(f.payment_date) as date,
                COUNT(*) as transactions,
                SUM(f.fine_amount) as total_revenue
            FROM Fines f
            WHERE f.payment_status = 'Paid'
            ${start_date ? 'AND f.payment_date >= ?' : ''}
            ${end_date ? 'AND f.payment_date <= ?' : ''}
            GROUP BY DATE(f.payment_date)
            ORDER BY date DESC
        `, [start_date, end_date].filter(Boolean));
        
        res.json({
            success: true,
            data: revenue
        });
    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue report'
        });
    }
}