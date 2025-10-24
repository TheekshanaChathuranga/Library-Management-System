import React from 'react';
import { NavLink } from 'react-router-dom';
const Sidebar = () => {
    const menuItems = [
        { path: '/', label: '📊 Dashboard', icon: '📊' },
        { path: '/books', label: '📚 Books', icon: '📚' },
        { path: '/members', label: '👥 Members', icon: '👥' },
        { path: '/transactions', label: '🔄 Transactions', icon: '🔄' },
        { path: '/reports', label: '📈 Reports', icon: '📈' }
    ];

    return (
        <aside className="fixed left-0 z-40 w-64 h-screen bg-white border-r border-gray-200">
            <div className="h-full px-3 py-4 overflow-y-auto">
                <ul className="space-y-2 font-medium">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink 
                                to={item.path} 
                                className={({ isActive }) => `
                                    flex items-center p-3 text-gray-900 rounded-lg transition-colors
                                    ${isActive 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'hover:bg-gray-100'
                                    }
                                `}
                                end={item.path === '/'}
                            >
                                <span className="flex-shrink-0 w-6 h-6 text-center">
                                    {item.icon}
                                </span>
                                <span className="flex-1 ml-3 whitespace-nowrap">
                                    {item.label.replace(/[📊📚👥🔄📈]\s/, '')}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;