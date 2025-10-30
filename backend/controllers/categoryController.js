const db = require('../config/database');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM Categories ORDER BY category_name');

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories'
        });
    }
};

// Add category
exports.addCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const [result] = await db.query(
            'INSERT INTO Categories (category_name) VALUES (?)',
            [category_name]
        );

        res.status(201).json({
            success: true,
            message: 'Category added successfully',
            data: {
                category_id: result.insertId,
                category_name
            }
        });
    } catch (error) {
        console.error('Add category error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add category'
        });
    }
};
