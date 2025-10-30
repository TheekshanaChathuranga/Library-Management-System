import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import { getAllMembers, searchMembers, addMember, updateMember, deleteMember } from '../services/memberService';
import { getCurrentUser } from '../services/authService';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const user = getCurrentUser();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        membership_type: 'General',
        join_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await getAllMembers();
            if (response.success) {
                setMembers(response.data);
            }
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchMembers();
            return;
        }

        try {
            const response = await searchMembers(searchQuery);
            if (response.success) {
                setMembers(response.data);
                toast.success(`Found ${response.count} members`);
            }
        } catch (error) {
            toast.error('Search failed');
        }
    };

    const handleAddMember = () => {
        setEditingMember(null);
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address: '',
            membership_type: 'General',
            join_date: new Date().toISOString().split('T')[0],
            expiry_date: oneYearLater.toISOString().split('T')[0],
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleEditMember = (member) => {
        setEditingMember(member);
        setFormData({
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone || '',
            address: member.address || '',
            membership_type: member.membership_type,
            join_date: member.join_date?.split('T')[0],
            expiry_date: member.expiry_date?.split('T')[0],
            status: member.status
        });
        setIsModalOpen(true);
    };

    const handleDeleteMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to delete this member?')) return;

        try {
            const response = await deleteMember(memberId);
            if (response.success) {
                toast.success('Member deleted successfully');
                fetchMembers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete member');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingMember) {
                const response = await updateMember(editingMember.member_id, formData);
                if (response.success) {
                    toast.success('Member updated successfully');
                }
            } else {
                const response = await addMember(formData);
                if (response.success) {
                    toast.success('Member added successfully');
                }
            }
            setIsModalOpen(false);
            fetchMembers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getStatusBadge = (status) => {
        const variants = {
            Active: 'success',
            Expired: 'warning',
            Suspended: 'danger'
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
    };

    const columns = [
        { header: 'ID', accessor: 'member_id' },
        { 
            header: 'Name', 
            render: (row) => `${row.first_name} ${row.last_name}`
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Membership Type', accessor: 'membership_type' },
        { 
            header: 'Expiry Date', 
            render: (row) => new Date(row.expiry_date).toLocaleDateString()
        },
        {
            header: 'Status',
            render: (row) => getStatusBadge(row.status)
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex space-x-2">
                    {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <>
                            <Button size="sm" variant="primary" onClick={() => handleEditMember(row)}>
                                Edit
                            </Button>
                            {user?.role === 'Admin' && (
                                <Button size="sm" variant="danger" onClick={() => handleDeleteMember(row.member_id)}>
                                    Delete
                                </Button>
                            )}
                        </>
                    )}
                </div>
            )
        }
    ];

    if (loading) return <Loading message="Loading members..." />;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">👥 Members</h1>
                        <p className="text-gray-600">Manage library members</p>
                    </div>
                    {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                        <Button onClick={handleAddMember}>
                            + Add New Member
                        </Button>
                    )}
                </div>

                {/* Search Bar */}
                <Card>
                    <div className="flex space-x-2">
                        <Input
                            placeholder="Search by name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="mb-0"
                        />
                        <Button onClick={handleSearch}>Search</Button>
                        <Button variant="secondary" onClick={fetchMembers}>Clear</Button>
                    </div>
                </Card>

                {/* Members Table */}
                <Card>
                    <Table columns={columns} data={members} emptyMessage="No members found" />
                </Card>

                {/* Add/Edit Member Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingMember ? 'Edit Member' : 'Add New Member'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Membership Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="membership_type"
                                    value={formData.membership_type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="General">General</option>
                                    <option value="Student">Student</option>
                                    <option value="Premium">Premium</option>
                                </select>
                            </div>
                            
                            {editingMember && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Join Date"
                                name="join_date"
                                type="date"
                                value={formData.join_date}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Expiry Date"
                                name="expiry_date"
                                type="date"
                                value={formData.expiry_date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingMember ? 'Update Member' : 'Add Member'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </Layout>
    );
};

export default Members;
