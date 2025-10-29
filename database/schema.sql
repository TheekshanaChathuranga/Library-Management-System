-- Drop database if exists and create new
DROP DATABASE IF EXISTS LibraryManagementSystem;
CREATE DATABASE IF NOT EXISTS LibraryManagementSystem;
USE LibraryManagementSystem;

-- Create Staff table
CREATE TABLE Staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('Admin', 'Librarian') NOT NULL DEFAULT 'Librarian',
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    hired_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL
);

-- Create Authors table
CREATE TABLE Authors (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    author_name VARCHAR(100) NOT NULL
);

-- Create Books table
CREATE TABLE Books (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    ISBN VARCHAR(13) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category_id INT,
    publisher VARCHAR(100),
    publication_year INT,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- Create Book_Authors table (Many-to-Many relationship)
CREATE TABLE Book_Authors (
    book_id INT,
    author_id INT,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES Authors(author_id)
);

-- Create Members table
CREATE TABLE Members (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    membership_type VARCHAR(50) NOT NULL DEFAULT 'General',
    join_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('Active', 'Expired', 'Suspended') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Transactions table
CREATE TABLE Transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    staff_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Issued', 'Returned', 'Overdue') NOT NULL DEFAULT 'Issued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (member_id) REFERENCES Members(member_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
);

-- ============================================
-- USEFUL FUNCTIONS
-- ============================================

DELIMITER $$

-- Function 1: Calculate fine amount for overdue books
-- Usage: SELECT CalculateFine(transaction_id)
DROP FUNCTION IF EXISTS CalculateFine$$
CREATE FUNCTION CalculateFine(p_transaction_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_days_overdue INT;
    DECLARE v_fine_amount DECIMAL(10,2);
    DECLARE v_fine_per_day DECIMAL(10,2) DEFAULT 5.00; -- LKR 5 per day
    
    SELECT DATEDIFF(IFNULL(return_date, CURDATE()), due_date)
    INTO v_days_overdue
    FROM Transactions
    WHERE transaction_id = p_transaction_id;
    
    IF v_days_overdue > 0 THEN
        SET v_fine_amount = v_days_overdue * v_fine_per_day;
    ELSE
        SET v_fine_amount = 0.00;
    END IF;
    
    RETURN v_fine_amount;
END$$

-- Function 2: Get member's active book count
-- Usage: SELECT GetMemberActiveBooks(member_id)
DROP FUNCTION IF EXISTS GetMemberActiveBooks$$
CREATE FUNCTION GetMemberActiveBooks(p_member_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_count INT;
    
    SELECT COUNT(*)
    INTO v_count
    FROM Transactions
    WHERE member_id = p_member_id 
    AND return_date IS NULL;
    
    RETURN v_count;
END$$

-- Function 3: Check if book is available
-- Usage: SELECT IsBookAvailable(book_id)
DROP FUNCTION IF EXISTS IsBookAvailable$$
CREATE FUNCTION IsBookAvailable(p_book_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_available INT;
    
    SELECT available_copies
    INTO v_available
    FROM Books
    WHERE book_id = p_book_id;
    
    RETURN (v_available > 0);
END$$

-- Function 4: Get book availability percentage
-- Usage: SELECT GetBookAvailability(book_id)
DROP FUNCTION IF EXISTS GetBookAvailability$$
CREATE FUNCTION GetBookAvailability(p_book_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total INT;
    DECLARE v_available INT;
    DECLARE v_percentage DECIMAL(5,2);
    
    SELECT total_copies, available_copies
    INTO v_total, v_available
    FROM Books
    WHERE book_id = p_book_id;
    
    IF v_total > 0 THEN
        SET v_percentage = (v_available / v_total) * 100;
    ELSE
        SET v_percentage = 0.00;
    END IF;
    
    RETURN v_percentage;
END$$

-- Function 5: Get member's total fine amount
-- Usage: SELECT GetMemberTotalFine(member_id)
DROP FUNCTION IF EXISTS GetMemberTotalFine$$
CREATE FUNCTION GetMemberTotalFine(p_member_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total_fine DECIMAL(10,2);
    
    SELECT IFNULL(SUM(fine_amount), 0.00)
    INTO v_total_fine
    FROM Transactions
    WHERE member_id = p_member_id
    AND return_date IS NULL
    AND due_date < CURDATE();
    
    RETURN v_total_fine;
END$$

-- Function 6: Check if member can borrow (max 5 books)
-- Usage: SELECT CanMemberBorrow(member_id)
DROP FUNCTION IF EXISTS CanMemberBorrow$$
CREATE FUNCTION CanMemberBorrow(p_member_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_active_books INT;
    DECLARE v_member_status VARCHAR(20);
    DECLARE v_max_books INT DEFAULT 5;
    
    SELECT status INTO v_member_status
    FROM Members
    WHERE member_id = p_member_id;
    
    SELECT GetMemberActiveBooks(p_member_id) INTO v_active_books;
    
    RETURN (v_member_status = 'Active' AND v_active_books < v_max_books);
END$$

-- Function 7: Get book's popularity score (borrow count)
-- Usage: SELECT GetBookPopularity(book_id)
DROP FUNCTION IF EXISTS GetBookPopularity$$
CREATE FUNCTION GetBookPopularity(p_book_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_borrow_count INT;
    
    SELECT COUNT(*)
    INTO v_borrow_count
    FROM Transactions
    WHERE book_id = p_book_id;
    
    RETURN v_borrow_count;
END$$

-- Function 8: Get days until membership expiry
-- Usage: SELECT GetDaysToExpiry(member_id)
DROP FUNCTION IF EXISTS GetDaysToExpiry$$
CREATE FUNCTION GetDaysToExpiry(p_member_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_expiry_date DATE;
    DECLARE v_days INT;
    
    SELECT expiry_date
    INTO v_expiry_date
    FROM Members
    WHERE member_id = p_member_id;
    
    SET v_days = DATEDIFF(v_expiry_date, CURDATE());
    
    RETURN v_days;
END$$

DELIMITER ;

-- ============================================
-- USEFUL EVENTS (Automated Tasks)
-- ============================================

-- Enable Event Scheduler
SET GLOBAL event_scheduler = ON;

DELIMITER $$

-- Event 1: Update overdue transaction status (Runs daily at midnight)
DROP EVENT IF EXISTS UpdateOverdueStatus$$
CREATE EVENT UpdateOverdueStatus
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE Transactions
    SET status = 'Overdue'
    WHERE return_date IS NULL
    AND due_date < CURDATE()
    AND status != 'Overdue';
END$$

-- Event 2: Update member status based on expiry (Runs daily at 1 AM)
DROP EVENT IF EXISTS UpdateExpiredMembers$$
CREATE EVENT UpdateExpiredMembers
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
DO
BEGIN
    UPDATE Members
    SET status = 'Expired'
    WHERE expiry_date < CURDATE()
    AND status = 'Active';
END$$

-- Event 3: Calculate and update fines for overdue books (Runs daily at 2 AM)
DROP EVENT IF EXISTS UpdateOverdueFines$$
CREATE EVENT UpdateOverdueFines
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 2 HOUR
DO
BEGIN
    UPDATE Transactions t
    SET fine_amount = CalculateFine(t.transaction_id)
    WHERE t.return_date IS NULL
    AND t.due_date < CURDATE();
END$$

-- Event 4: Send reminder notification for books due in 3 days (Runs daily at 9 AM)
-- This creates a log table for notifications
DROP TABLE IF EXISTS Notification_Log$$
CREATE TABLE Notification_Log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT,
    transaction_id INT,
    notification_type VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES Members(member_id),
    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id)
)$$

DROP EVENT IF EXISTS DueDateReminder$$
CREATE EVENT DueDateReminder
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 9 HOUR
DO
BEGIN
    INSERT INTO Notification_Log (member_id, transaction_id, notification_type, message)
    SELECT 
        t.member_id,
        t.transaction_id,
        'DUE_REMINDER',
        CONCAT('Book "', b.title, '" is due in ', DATEDIFF(t.due_date, CURDATE()), ' days')
    FROM Transactions t
    JOIN Books b ON t.book_id = b.book_id
    WHERE t.return_date IS NULL
    AND t.due_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY);
END$$

DELIMITER ;
