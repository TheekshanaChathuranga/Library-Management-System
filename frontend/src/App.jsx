import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
        },
        {
            path: "/login",
            element: <Login />,
        },
        {
            path: "/dashboard",
            element: <PrivateRoute><Dashboard /></PrivateRoute>,
        },
        {
            path: "/books",
            element: <PrivateRoute><Books /></PrivateRoute>,
        },
        {
            path: "/members",
            element: <PrivateRoute><Members /></PrivateRoute>,
        },
        {
            path: "/transactions",
            element: <PrivateRoute><Transactions /></PrivateRoute>,
        },
        {
            path: "/reports",
            element: <PrivateRoute><Reports /></PrivateRoute>,
        },
        {
            path: "*",
            element: <Navigate to="/dashboard" replace />,
        }
    ], {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }
    });

    return (
        <div className="App">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

                <RouterProvider router={router} />
            </div>
    );
}

export default App;
