import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { toast } from 'react-toastify';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await login(formData.username, formData.password);
            if (response.success) {
                toast.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <div className="text-center text-6xl mb-4">📚</div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Library Management System
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to your account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="Username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Enter your username"
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
                <div className="text-center text-sm text-gray-600">
                    <p>Demo Credentials:</p>
                    <p className="text-xs mt-1">Username: admin_saman | Password: admin123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
