const db = require('../config/database');

exports.getAllMembers = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT 
                member_id, first_name, last_name, email, phone,
                membership_type, join_date, expiry_date, status
            FROM Members
            WHERE 1=1
        `;
        
        const params = [];
        
        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY last_name, first_name`;
        
        const [members] = await db.query(query, params);
        
        res.json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch members'
        });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const [members] = await db.query(
            'SELECT * FROM Members WHERE member_id = ?',
            [req.params.id]
        );
        
        if (members.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            data: members[0]
        });
    } catch (error) {
        console.error('Get member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch member'
        });
    }
};

exports.getMemberHistory = async (req, res) => {
    try {
        const [history] = await db.query('CALL GetMemberHistory(?)', [req.params.id]);
        
        res.json({
            success: true,
            data: history[0]
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch member history'
        });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, membership_type, address } = req.body;
        
        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and email are required'
            });
        }
        
        const join_date = new Date();
        const expiry_date = new Date();
        expiry_date.setFullYear(expiry_date.getFullYear() + 1);
        
        const [result] = await db.query(`
            INSERT INTO Members (first_name, last_name, email, phone, 
                                membership_type, join_date, expiry_date, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [first_name, last_name, email, phone, membership_type || 'General', 
            join_date, expiry_date, address]);
        
        res.status(201).json({
            success: true,
            message: 'Member added successfully',
            data: { member_id: result.insertId }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add member'
        });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, membership_type, status, address } = req.body;
        
        const [result] = await db.query(`
            UPDATE Members 
            SET first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                membership_type = COALESCE(?, membership_type),
                status = COALESCE(?, status),
                address = COALESCE(?, address)
            WHERE member_id = ?
        `, [first_name, last_name, email, phone, membership_type, status, address, req.params.id]);
        
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

exports.deleteMember = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Members WHERE member_id = ?', [req.params.id]);
        
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
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete member with existing transactions'
            });
        }
        console.error('Delete member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete member'
        });
    }
};
