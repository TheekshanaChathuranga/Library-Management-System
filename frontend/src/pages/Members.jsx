import React, { useState, useEffect } from 'react';
import { memberAPI } from '../services/api';
import { toast } from 'react-toastify';


const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        membership_type: 'General',
        address: ''
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await memberAPI.getAll();
            setMembers(response.data.data);
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
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
            await memberAPI.create(formData);
            toast.success('Member added successfully');
            setShowAddModal(false);
            fetchMembers();
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                membership_type: 'General',
                address: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await memberAPI.delete(id);
                toast.success('Member deleted successfully');
                fetchMembers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete member');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="members-page">
            <div className="page-header">
                <h1>Members Management</h1>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    + Add Member
                </button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Join Date</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        <tr key={member.member_id}>
                            <td>{member.member_id}</td>
                            <td>{member.first_name} {member.last_name}</td>
                            <td>{member.email}</td>
                            <td>{member.phone || 'N/A'}</td>
                            <td>{member.membership_type}</td>
                            <td>{new Date(member.join_date).toLocaleDateString()}</td>
                            <td>{new Date(member.expiry_date).toLocaleDateString()}</td>
                            <td>
                                <span className={`status-badge ${member.status.toLowerCase()}`}>
                                    {member.status}
                                </span>
                            </td>
                            <td>
                                <button 
                                    onClick={() => handleDelete(member.member_id)}
                                    className="btn-delete"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showAddModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Member</h2>
                            <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Membership Type</label>
                                <select
                                    name="membership_type"
                                    value={formData.membership_type}
                                    onChange={handleInputChange}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;