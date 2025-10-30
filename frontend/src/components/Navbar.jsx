import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = getCurrentUser();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/books', label: 'Books', icon: '📚' },
        { path: '/members', label: 'Members', icon: '👥' },
        { path: '/transactions', label: 'Transactions', icon: '📋' },
        { path: '/reports', label: 'Reports', icon: '📈' }
    ];

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <span className="text-3xl">📚</span>
                            <span className="text-white text-xl font-bold">Library System</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive(link.path)
                                        ? 'bg-blue-900 text-white'
                                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                                }`}
                            >
                                <span className="mr-1">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-white text-sm">
                            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-blue-200">{user?.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
