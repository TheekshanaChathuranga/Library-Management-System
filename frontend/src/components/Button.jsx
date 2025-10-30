import React from 'react';

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    size = 'md',
    disabled = false,
    className = '',
    ...props 
}) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
        success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };
    
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
