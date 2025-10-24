USE LibraryManagementSystem;

DELIMITER //

-- Get Overdue Books
DROP PROCEDURE IF EXISTS GetOverdueBooks//
CREATE PROCEDURE GetOverdueBooks()
BEGIN
    SELECT 
        t.transaction_id,
        b.book_id,
        b.title,
        m.member_id,
        CONCAT(m.first_name, ' ', m.last_name) as member_name,
        t.issue_date,
        t.due_date,
        DATEDIFF(CURDATE(), t.due_date) as days_overdue
    FROM Transactions t
    JOIN Books b ON t.book_id = b.book_id
    JOIN Members m ON t.member_id = m.member_id
    WHERE t.return_date IS NULL 
    AND t.due_date < CURDATE()
    ORDER BY days_overdue DESC;
END//

-- Get Popular Books
DROP PROCEDURE IF EXISTS GetPopularBooks//
CREATE PROCEDURE GetPopularBooks(IN limit_count INT)
BEGIN
    SELECT 
        b.book_id,
        b.title,
        COUNT(t.transaction_id) as borrow_count,
        b.available_copies,
        b.total_copies,
        c.category_name,
        GROUP_CONCAT(DISTINCT a.author_name) as authors
    FROM Books b
    LEFT JOIN Transactions t ON b.book_id = t.book_id
    LEFT JOIN Categories c ON b.category_id = c.category_id
    LEFT JOIN Book_Authors ba ON b.book_id = ba.book_id
    LEFT JOIN Authors a ON ba.author_id = a.author_id
    GROUP BY b.book_id, b.title, b.available_copies, b.total_copies, c.category_name
    ORDER BY borrow_count DESC
    LIMIT limit_count;
END//

-- Get Daily Statistics
DROP PROCEDURE IF EXISTS GetDailyStatistics//
CREATE PROCEDURE GetDailyStatistics()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM Members WHERE status = 'Active') as active_members,
        (SELECT COUNT(*) FROM Books) as total_books,
        (SELECT SUM(available_copies) FROM Books) as available_books,
        (SELECT COUNT(*) FROM Transactions WHERE return_date IS NULL) as books_issued,
        (SELECT COUNT(*) FROM Transactions WHERE return_date IS NULL AND due_date < CURDATE()) as overdue_books,
        (SELECT COUNT(*) FROM Transactions WHERE DATE(issue_date) = CURDATE()) as today_issues,
        (SELECT COUNT(*) FROM Transactions WHERE DATE(return_date) = CURDATE()) as today_returns;
END//

-- Search Books
DROP PROCEDURE IF EXISTS SearchBooks//
CREATE PROCEDURE SearchBooks(IN search_term VARCHAR(255))
BEGIN
    SELECT 
        b.book_id,
        b.ISBN,
        b.title,
        c.category_name,
        b.publisher,
        b.publication_year,
        b.total_copies,
        b.available_copies,
        GROUP_CONCAT(DISTINCT a.author_name) as authors
    FROM Books b
    LEFT JOIN Categories c ON b.category_id = c.category_id
    LEFT JOIN Book_Authors ba ON b.book_id = ba.book_id
    LEFT JOIN Authors a ON ba.author_id = a.author_id
    WHERE 
        b.title LIKE CONCAT('%', search_term, '%')
        OR b.ISBN LIKE CONCAT('%', search_term, '%')
        OR c.category_name LIKE CONCAT('%', search_term, '%')
        OR b.publisher LIKE CONCAT('%', search_term, '%')
        OR EXISTS (
            SELECT 1 FROM Authors a2 
            JOIN Book_Authors ba2 ON a2.author_id = ba2.author_id 
            WHERE ba2.book_id = b.book_id 
            AND a2.author_name LIKE CONCAT('%', search_term, '%')
        )
    GROUP BY b.book_id, b.ISBN, b.title, c.category_name, b.publisher, b.publication_year, b.total_copies, b.available_copies;
END//

-- Add Book with Authors
DROP PROCEDURE IF EXISTS AddBook//
CREATE PROCEDURE AddBook(
    IN p_isbn VARCHAR(13),
    IN p_title VARCHAR(255),
    IN p_category_id INT,
    IN p_publisher VARCHAR(100),
    IN p_publication_year INT,
    IN p_total_copies INT,
    IN p_price DECIMAL(10,2),
    IN p_authors TEXT
)
BEGIN
    DECLARE v_book_id INT;
    DECLARE v_author_name VARCHAR(100);
    DECLARE v_author_id INT;
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_authors_cursor CURSOR FOR 
        SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p_authors, ',', numbers.n), ',', -1)) author_name
        FROM (SELECT 1 + units.i + tens.i * 10 n
              FROM (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) units,
                   (SELECT 0 i UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) tens
              WHERE 1 + units.i + tens.i * 10 <= (LENGTH(p_authors) - LENGTH(REPLACE(p_authors, ',', '')) + 1)
             ) numbers;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- Insert book
    INSERT INTO Books (ISBN, title, category_id, publisher, publication_year, total_copies, available_copies, price)
    VALUES (p_isbn, p_title, p_category_id, p_publisher, p_publication_year, p_total_copies, p_total_copies, p_price);

    SET v_book_id = LAST_INSERT_ID();

    -- Process authors
    OPEN v_authors_cursor;
    authors_loop: LOOP
        FETCH v_authors_cursor INTO v_author_name;
        IF v_done THEN
            LEAVE authors_loop;
        END IF;

        -- Get or create author
        SELECT author_id INTO v_author_id FROM Authors WHERE author_name = TRIM(v_author_name);
        IF v_author_id IS NULL THEN
            INSERT INTO Authors (author_name) VALUES (TRIM(v_author_name));
            SET v_author_id = LAST_INSERT_ID();
        END IF;

        -- Link author to book
        INSERT INTO Book_Authors (book_id, author_id) VALUES (v_book_id, v_author_id);
    END LOOP;
    CLOSE v_authors_cursor;

    -- Return the created book
    SELECT 
        b.book_id,
        b.ISBN,
        b.title,
        c.category_name,
        b.publisher,
        b.publication_year,
        b.total_copies,
        b.available_copies,
        GROUP_CONCAT(a.author_name) as authors
    FROM Books b
    LEFT JOIN Categories c ON b.category_id = c.category_id
    LEFT JOIN Book_Authors ba ON b.book_id = ba.book_id
    LEFT JOIN Authors a ON ba.author_id = a.author_id
    WHERE b.book_id = v_book_id
    GROUP BY b.book_id, b.ISBN, b.title, c.category_name, b.publisher, b.publication_year, b.total_copies, b.available_copies;
END//

DELIMITER ;
