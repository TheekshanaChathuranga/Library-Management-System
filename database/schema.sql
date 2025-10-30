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
    status ENUM('Issued', 'Returned', 'Overdue') NOT NULL DEFAULT 'Issued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    FOREIGN KEY (member_id) REFERENCES Members(member_id),
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
);

-- ============================================
-- INDEXES for Performance Optimization
-- ============================================

-- Indexes for Books table
CREATE INDEX idx_books_title ON Books(title);
CREATE INDEX idx_books_category ON Books(category_id);
CREATE INDEX idx_books_publication_year ON Books(publication_year);

-- Indexes for Authors table
CREATE INDEX idx_authors_name ON Authors(author_name);

-- Indexes for Members table
CREATE INDEX idx_members_status ON Members(status);
CREATE INDEX idx_members_expiry_date ON Members(expiry_date);
CREATE INDEX idx_members_membership_type ON Members(membership_type);
CREATE INDEX idx_members_name ON Members(first_name, last_name);

-- Indexes for Transactions table
CREATE INDEX idx_transactions_status ON Transactions(status);
CREATE INDEX idx_transactions_issue_date ON Transactions(issue_date);
CREATE INDEX idx_transactions_due_date ON Transactions(due_date);
CREATE INDEX idx_transactions_return_date ON Transactions(return_date);
CREATE INDEX idx_transactions_dates ON Transactions(issue_date, due_date, return_date);

-- Composite index for common queries
CREATE INDEX idx_transactions_member_status ON Transactions(member_id, status);
CREATE INDEX idx_transactions_book_status ON Transactions(book_id, status);

-- Index for Staff table
CREATE INDEX idx_staff_role ON Staff(role);
CREATE INDEX idx_staff_status ON Staff(status);
