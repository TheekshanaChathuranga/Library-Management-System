USE LibraryManagementSystem;

-- Insert Categories
INSERT INTO Categories (category_name, description) VALUES
('Fiction', 'Fictional literature including novels and short stories'),
('Non-Fiction', 'Real-life events, biographies, and factual content'),
('Science', 'Scientific books and research materials'),
('Technology', 'Computer science, IT, and technology books'),
('History', 'Historical books and biographies'),
('Children', 'Books for children and young adults'),
('Reference', 'Dictionaries, encyclopedias, and reference materials'),
('Business', 'Business, management, and economics');

-- Insert Authors
INSERT INTO Authors (author_name, biography, country) VALUES
('J.K. Rowling', 'British author best known for Harry Potter series', 'United Kingdom'),
('George Orwell', 'English novelist and essayist', 'United Kingdom'),
('Isaac Asimov', 'American science fiction writer', 'United States'),
('Yuval Noah Harari', 'Israeli historian and author', 'Israel'),
('Stephen King', 'American author of horror and suspense novels', 'United States'),
('Agatha Christie', 'English mystery writer', 'United Kingdom'),
('Mark Twain', 'American writer and humorist', 'United States'),
('Jane Austen', 'English novelist', 'United Kingdom'),
('William Shakespeare', 'English playwright and poet', 'United Kingdom'),
('Ernest Hemingway', 'American novelist and journalist', 'United States');

-- Insert Books
INSERT INTO Books (ISBN, title, category_id, publisher, publication_year, total_copies, available_copies, price, location) VALUES
('978-0439708180', 'Harry Potter and the Sorcerer''s Stone', 1, 'Scholastic', 1998, 5, 5, 25.99, 'A-101'),
('978-0451524935', '1984', 1, 'Signet Classic', 1949, 3, 3, 15.99, 'A-205'),
('978-0553293357', 'Foundation', 3, 'Spectra', 1951, 4, 4, 18.99, 'B-150'),
('978-0062316097', 'Sapiens: A Brief History of Humankind', 5, 'Harper', 2015, 6, 6, 22.99, 'C-301'),
('978-1501142970', 'The Stand', 1, 'Anchor', 1978, 2, 2, 19.99, 'A-180'),
('978-0062073488', 'And Then There Were None', 1, 'William Morrow', 1939, 3, 3, 14.99, 'A-220'),
('978-0486280615', 'The Adventures of Tom Sawyer', 1, 'Dover Publications', 1876, 4, 4, 12.99, 'D-120'),
('978-0141439518', 'Pride and Prejudice', 1, 'Penguin Classics', 1813, 5, 5, 13.99, 'A-315'),
('978-0743273565', 'The Great Gatsby', 1, 'Scribner', 1925, 3, 3, 15.99, 'A-280'),
('978-0486264646', 'Romeo and Juliet', 1, 'Dover Publications', 1597, 4, 4, 8.99, 'E-105'),
('978-0684801223', 'The Old Man and the Sea', 1, 'Scribner', 1952, 2, 2, 16.99, 'A-340'),
('978-0062316110', 'Homo Deus', 2, 'Harper', 2017, 3, 3, 24.99, 'C-315'),
('978-0735619678', 'A Game of Thrones', 1, 'Bantam', 1996, 5, 5, 29.99, 'A-410'),
('978-0345391803', 'The Hitchhiker''s Guide to the Galaxy', 3, 'Del Rey', 1979, 3, 3, 17.99, 'B-210'),
('978-0316769174', 'The Catcher in the Rye', 1, 'Little, Brown', 1951, 4, 4, 14.99, 'A-395');

-- Link Books with Authors
INSERT INTO Book_Authors (book_id, author_id) VALUES
(1, 1),  -- Harry Potter - J.K. Rowling
(2, 2),  -- 1984 - George Orwell
(3, 3),  -- Foundation - Isaac Asimov
(4, 4),  -- Sapiens - Yuval Noah Harari
(5, 5),  -- The Stand - Stephen King
(6, 6),  -- And Then There Were None - Agatha Christie
(7, 7),  -- Tom Sawyer - Mark Twain
(8, 8),  -- Pride and Prejudice - Jane Austen
(10, 9), -- Romeo and Juliet - Shakespeare
(11, 10),-- The Old Man and the Sea - Hemingway
(12, 4); -- Homo Deus - Yuval Noah Harari

-- Insert Staff (Password: admin123 for all - hashed with bcrypt)
-- Note: You should generate real bcrypt hashes. This is example only.
INSERT INTO Staff (username, password_hash, first_name, last_name, email, role, hired_date) VALUES
('admin', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'Admin', 'User', 'admin@library.com', 'Admin', '2024-01-01'),
('librarian1', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'Sarah', 'Johnson', 'sarah@library.com', 'Librarian', '2024-01-15'),
('librarian2', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'Michael', 'Brown', 'michael@library.com', 'Librarian', '2024-02-01'),
('assistant1', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ', 'Emily', 'Davis', 'emily@library.com', 'Assistant', '2024-03-01');

-- Insert Members
INSERT INTO Members (first_name, last_name, email, phone, membership_type, join_date, expiry_date, address) VALUES
('John', 'Doe', 'john.doe@email.com', '1234567890', 'Student', '2024-01-15', '2025-01-15', '123 Main St, City, State'),
('Jane', 'Smith', 'jane.smith@email.com', '0987654321', 'Teacher', '2024-01-20', '2025-01-20', '456 Oak Ave, City, State'),
('Robert', 'Johnson', 'robert.j@email.com', '5551234567', 'General', '2024-02-01', '2025-02-01', '789 Pine Rd, City, State'),
('Emily', 'Williams', 'emily.w@email.com', '5559876543', 'Student', '2024-02-15', '2025-02-15', '321 Elm St, City, State'),
('Michael', 'Brown', 'michael.b@email.com', '5552468135', 'General', '2024-03-01', '2025-03-01', '654 Maple Dr, City, State'),
('Sarah', 'Davis', 'sarah.d@email.com', '5553691470', 'Teacher', '2024-03-10', '2025-03-10', '987 Cedar Ln, City, State'),
('David', 'Miller', 'david.m@email.com', '5557412580', 'Student', '2024-03-20', '2025-03-20', '147 Birch Ct, City, State'),
('Lisa', 'Wilson', 'lisa.w@email.com', '5558523691', 'General', '2024-04-01', '2025-04-01', '258 Spruce Way, City, State');

-- Insert some sample transactions
INSERT INTO Transactions (book_id, member_id, staff_id, issue_date, due_date, status) VALUES
(1, 1, 2, '2024-10-01', '2024-10-15', 'Returned'),
(2, 2, 2, '2024-10-05', '2024-10-19', 'Returned'),
(3, 3, 3, '2024-10-15', '2024-10-29', 'Issued'),
(4, 4, 2, '2024-10-18', '2024-11-01', 'Issued'),
(5, 5, 3, '2024-10-20', '2024-11-03', 'Issued');

-- Update return dates for returned books
UPDATE Transactions SET return_date = '2024-10-14' WHERE transaction_id = 1;
UPDATE Transactions SET return_date = '2024-10-18' WHERE transaction_id = 2;

-- Insert some fines for overdue books (example)
-- These will be auto-generated by triggers in real system
INSERT INTO Fines (transaction_id, fine_amount, payment_status) VALUES
(1, 0.00, 'Paid'),
(2, 0.00, 'Paid');

-- Create a test admin account with known password
-- Password: admin123
-- You need to generate this hash using bcrypt in Node.js first
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('admin123', 10);

-- Note: After setup, run this Node.js script to create proper admin:
/*
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'your_password',
        database: 'LibraryManagementSystem'
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(
        `UPDATE Staff SET password_hash = ? WHERE username = 'admin'`,
        [hashedPassword]
    );
    
    console.log('Admin password set successfully!');
    await connection.end();
}

createAdmin();
*/

-- Verify data
SELECT 'Categories' as TableName, COUNT(*) as Count FROM Categories
UNION ALL
SELECT 'Authors', COUNT(*) FROM Authors
UNION ALL
SELECT 'Books', COUNT(*) FROM Books
UNION ALL
SELECT 'Members', COUNT(*) FROM Members
UNION ALL
SELECT 'Staff', COUNT(*) FROM Staff
UNION ALL
SELECT 'Transactions', COUNT(*) FROM Transactions;