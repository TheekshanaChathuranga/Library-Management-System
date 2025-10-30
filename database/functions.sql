
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

