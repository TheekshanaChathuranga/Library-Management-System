USE LibraryManagementSystem;

-- Add missing columns to Categories table
ALTER TABLE Categories ADD COLUMN description TEXT;

-- Add missing columns to Books table
ALTER TABLE Books ADD COLUMN location VARCHAR(50);

-- Add missing columns to Authors table
ALTER TABLE Authors ADD COLUMN IF NOT EXISTS biography TEXT;
ALTER TABLE Authors ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Create Fines table if it doesn't exist
CREATE TABLE IF NOT EXISTS Fines (
    fine_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id)
);

-- Create admin user with proper password hash
-- Password: admin123
INSERT INTO Staff (username, password_hash, first_name, last_name, email, role, hired_date)
VALUES (
    'admin',
    '$2a$10$PkP0h.Y5znYPZHXw7Kdb8umQAHhTG9YuPAP6Ob6hKvNw6hX9Z4zFa',
    'Admin',
    'User',
    'admin@library.com',
    'Admin',
    CURDATE()
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$10$PkP0h.Y5znYPZHXw7Kdb8umQAHhTG9YuPAP6Ob6hKvNw6hX9Z4zFa';