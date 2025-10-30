USE LibraryManagementSystem;

-- Update admin user with proper password hash
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