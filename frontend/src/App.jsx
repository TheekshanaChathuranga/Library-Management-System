import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './components/auth/Login';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return children;
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6 md:ml-64">
                    {children}
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/books" element={<PrivateRoute><Books /></PrivateRoute>} />
                        <Route path="/members" element={<PrivateRoute><Members /></PrivateRoute>} />
                        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
                        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                    </Routes>
                </AppLayout>
            </Router>
            <ToastContainer position="top-right" autoClose={3000} />
        </AuthProvider>
    );
}

export default App;