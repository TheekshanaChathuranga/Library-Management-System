import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Login from "./components/auth/Login";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

// Pages
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";

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
        <main className="flex-1 p-6 md:ml-64">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

function AppRouter() {
  const router = createBrowserRouter(
    [
      {
        path: "/login",
        element: (
          <AppLayout>
            <Login />
          </AppLayout>
        ),
      },
      {
        path: "/",
        element: (
          <AppLayout>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </AppLayout>
        ),
      },
      {
        path: "/books",
        element: (
          <AppLayout>
            <PrivateRoute>
              <Books />
            </PrivateRoute>
          </AppLayout>
        ),
      },
      {
        path: "/members",
        element: (
          <AppLayout>
            <PrivateRoute>
              <Members />
            </PrivateRoute>
          </AppLayout>
        ),
      },
      {
        path: "/transactions",
        element: (
          <AppLayout>
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          </AppLayout>
        ),
      },
      {
        path: "/reports",
        element: (
          <AppLayout>
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          </AppLayout>
        ),
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
