USE LibraryManagementSystem;

-- Insert default admin user (password: admin123)
INSERT INTO Staff (username, password_hash, first_name, last_name, email, role, hired_date) 
VALUES ('admin', '$2a$10$IhSZ.KnOXt3TDnkVCMcMQeOUBwMjwkHYkQMTHGmNWlHxNGyKVOefq', 'System', 'Admin', 'admin@library.com', 'Admin', CURDATE());

-- Insert some categories
INSERT INTO Categories (category_name) VALUES
('Fiction'),
('Non-Fiction'),
('Science'),
('Technology'),
('History'),
('Literature');

-- Insert some authors
INSERT INTO Authors (author_name) VALUES
('J.K. Rowling'),
('George Orwell'),
('Jane Austen'),
('Stephen King'),
('William Shakespeare');

-- Insert some books
INSERT INTO Books (ISBN, title, category_id, publisher, publication_year, total_copies, available_copies, price) VALUES
('9780747532699', 'Harry Potter and the Philosopher''s Stone', 1, 'Bloomsbury', 1997, 5, 5, 29.99),
('9780452284234', '1984', 1, 'Signet Classics', 1949, 3, 3, 19.99),
('9780141439518', 'Pride and Prejudice', 1, 'Penguin Classics', 1813, 4, 4, 24.99);

-- Link books with authors
INSERT INTO Book_Authors (book_id, author_id) VALUES
(1, 1), -- Harry Potter - J.K. Rowling
(2, 2), -- 1984 - George Orwell
(3, 3); -- Pride and Prejudice - Jane Austen

-- Insert some members
INSERT INTO Members (first_name, last_name, email, phone, membership_type, join_date, expiry_date, status) VALUES
('John', 'Doe', 'john@example.com', '123-456-7890', 'Regular', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'Active'),
('Jane', 'Smith', 'jane@example.com', '098-765-4321', 'Premium', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'Active');