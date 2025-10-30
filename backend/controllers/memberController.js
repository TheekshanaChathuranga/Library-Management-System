const db = require('../config/database');

// Get all members
exports.getAllMembers = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = 'SELECT * FROM Members';
        let params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY member_id DESC';
        
        const [members] = await db.query(query, params);

        res.json({
            success: true,
            data: members,
            count: members.length
        });
    } catch (error) {
        console.error('Get all members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve members'
        });
    }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [members] = await db.query('SELECT * FROM Members WHERE member_id = ?', [id]);

        if (members.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Get member's borrowed books
        const [borrowedBooks] = await db.query(`
            SELECT 
                t.transaction_id,
                t.issue_date,
                t.due_date,
                t.return_date,
                t.status,
                b.title,
                b.ISBN,
                DATEDIFF(CURDATE(), t.due_date) as days_overdue
            FROM Transactions t
            JOIN Books b ON t.book_id = b.book_id
            WHERE t.member_id = ? AND t.return_date IS NULL
            ORDER BY t.issue_date DESC
        `, [id]);

        res.json({
            success: true,
            data: {
                ...members[0],
                borrowed_books: borrowedBooks
            }
        });
    } catch (error) {
        console.error('Get member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve member'
        });
    }
};

// Add new member
exports.addMember = async (req, res) => {
    try {
        const { 
            first_name, 
            last_name, 
            email, 
            phone, 
            address, 
            membership_type,
            join_date,
            expiry_date 
        } = req.body;

        if (!first_name || !last_name || !email || !join_date || !expiry_date) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, email, join date, and expiry date are required'
            });
        }

        const [result] = await db.query(`
            INSERT INTO Members (first_name, last_name, email, phone, address, membership_type, join_date, expiry_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [first_name, last_name, email, phone, address, membership_type || 'General', join_date, expiry_date]);

        res.status(201).json({
            success: true,
            message: 'Member added successfully',
            data: {
                member_id: result.insertId,
                first_name,
                last_name,
                email
            }
        });
    } catch (error) {
        console.error('Add member error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Member with this email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add member'
        });
    }
};

// Update member
exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            first_name, 
            last_name, 
            email, 
            phone, 
            address, 
            membership_type,
            expiry_date,
            status 
        } = req.body;

        const [result] = await db.query(`
            UPDATE Members 
            SET 
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                address = COALESCE(?, address),
                membership_type = COALESCE(?, membership_type),
                expiry_date = COALESCE(?, expiry_date),
                status = COALESCE(?, status)
            WHERE member_id = ?
        `, [first_name, last_name, email, phone, address, membership_type, expiry_date, status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            message: 'Member updated successfully'
        });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update member'
        });
    }
};

// Delete member
exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if member has unreturned books
        const [activeTransactions] = await db.query(
            'SELECT COUNT(*) as count FROM Transactions WHERE member_id = ? AND return_date IS NULL',
            [id]
        );

        if (activeTransactions[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete member with unreturned books'
            });
        }

        const [result] = await db.query('DELETE FROM Members WHERE member_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete member'
        });
    }
};

// Search members
exports.searchMembers = async (req, res) => {
    try {
        const { q = '' } = req.query;
        
        const [members] = await db.query(`
            SELECT * FROM Members 
            WHERE 
                first_name LIKE ? OR 
                last_name LIKE ? OR 
                email LIKE ? OR
                phone LIKE ?
            ORDER BY member_id DESC
        `, [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]);

        res.json({
            success: true,
            data: members,
            count: members.length
        });
    } catch (error) {
        console.error('Search members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search members'
        });
    }
};
