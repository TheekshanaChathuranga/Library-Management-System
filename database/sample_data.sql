USE LibraryManagementSystem;

-- Insert Staff
INSERT INTO Staff (username, password_hash, first_name, last_name, email, role, hired_date)
VALUES
('admin_saman', 'hashed_pwd1', 'Saman', 'Perera', 'saman.perera@library.lk', 'Admin', '2020-01-15'),
('nimesha_lib', 'hashed_pwd2', 'Nimesha', 'Fernando', 'nimesha.fernando@library.lk', 'Librarian', '2021-03-10'),
('kasun_lib', 'hashed_pwd3', 'Kasun', 'Jayasinghe', 'kasun.jayasinghe@library.lk', 'Librarian', '2022-06-05');

-- Insert Categories
INSERT INTO Categories (category_name)
VALUES
('Fiction'),
('History'),
('Technology'),
('Children'),
('Education'),
('Religion');

-- Insert Authors
INSERT INTO Authors (author_name)
VALUES
('Martin Wickramasinghe'),
('Kumar Sangakkara'),
('Arthur C. Clarke'),
('Dr. Sunil Jayantha'),
('Carl Muller'),
('Ashok Ferrey');

-- Insert Books
INSERT INTO Books (ISBN, title, category_id, publisher, publication_year, total_copies, available_copies, price)
VALUES
('9789552123456', 'Madol Doova', 1, 'Sarasa Publishers', 2018, 10, 8, 950.00),
('9789556789012', 'Playing It My Way – Cricket Memoir', 2, 'Lake House', 2021, 5, 3, 1500.00),
('9789553345678', 'The Fountains of Paradise', 3, 'Vijitha Yapa', 2015, 7, 7, 1250.00),
('9789559876543', 'Sri Lanka History for Students', 2, 'Godage International', 2019, 8, 6, 1100.00),
('9789551011122', 'Simple Science Experiments for Kids', 4, 'Sarasavi', 2022, 6, 6, 800.00),
('9789559999911', 'Teach Yourself Buddhism', 6, 'Buddhist Publication Society', 2016, 4, 4, 600.00);

-- Insert Book_Authors
INSERT INTO Book_Authors (book_id, author_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 4),
(6, 5);

-- Insert Members
INSERT INTO Members (first_name, last_name, email, phone, address, membership_type, join_date, expiry_date, status)
VALUES
('Ruwan', 'Silva', 'ruwan.silva@gmail.com', '0771234567', 'No. 23, Temple Road, Kandy', 'General', '2023-01-01', '2025-01-01', 'Active'),
('Tharushi', 'Fernando', 'tharushi.fernando@yahoo.com', '0719876543', 'No. 55, Galle Road, Colombo 06', 'Student', '2023-06-10', '2024-06-10', 'Active'),
('Dineth', 'Perera', 'dineth.perera@outlook.com', '0756543210', 'No. 78, Lake View, Kurunegala', 'Premium', '2022-05-12', '2025-05-12', 'Active'),
('Amali', 'Ranasinghe', 'amali.ranasinghe@gmail.com', '0761122334', 'No. 14, Main Street, Matara', 'General', '2021-11-05', '2023-11-05', 'Expired'),
('Chamika', 'Wijesinghe', 'chamika.wijesinghe@gmail.com', '0772233445', 'No. 10, Hill Street, Nuwara Eliya', 'Student', '2023-03-22', '2024-03-22', 'Active');

-- Insert Transactions
INSERT INTO Transactions (book_id, member_id, staff_id, issue_date, due_date, return_date, status)
VALUES
(1, 1, 2, '2024-10-01', '2024-10-15', '2024-10-14', 'Returned'),
(2, 2, 3, '2024-10-10', '2024-10-24', NULL, 'Issued'),
(3, 3, 2, '2024-09-20', '2024-10-05', '2024-10-07', 'Returned'),
(4, 4, 3, '2024-08-12', '2024-08-26', NULL, 'Overdue'),
(5, 5, 2, '2024-10-18', '2024-11-01', NULL, 'Issued');
