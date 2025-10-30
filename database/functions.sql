

DELIMITER $$DELIMITER $$



-- Function 1: Calculate fine amount for overdue books-- Function 1: Calculate fine amount for overdue books

-- Usage: SELECT CalculateFine(transaction_id)-- Usage: SELECT CalculateFine(transaction_id)

DROP FUNCTION IF EXISTS CalculateFine$$DROP FUNCTION IF EXISTS CalculateFine$$

CREATE FUNCTION CalculateFine(p_transaction_id INT)CREATE FUNCTION CalculateFine(p_transaction_id INT)

RETURNS DECIMAL(10,2)RETURNS DECIMAL(10,2)

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_days_overdue INT;    DECLARE v_days_overdue INT;

    DECLARE v_fine_amount DECIMAL(10,2);    DECLARE v_fine_amount DECIMAL(10,2);

    DECLARE v_fine_per_day DECIMAL(10,2) DEFAULT 5.00; -- LKR 5 per day    DECLARE v_fine_per_day DECIMAL(10,2) DEFAULT 5.00; -- LKR 5 per day

        

    SELECT DATEDIFF(IFNULL(return_date, CURDATE()), due_date)    SELECT DATEDIFF(IFNULL(return_date, CURDATE()), due_date)

    INTO v_days_overdue    INTO v_days_overdue

    FROM Transactions    FROM Transactions

    WHERE transaction_id = p_transaction_id;    WHERE transaction_id = p_transaction_id;

        

    IF v_days_overdue > 0 THEN    IF v_days_overdue > 0 THEN

        SET v_fine_amount = v_days_overdue * v_fine_per_day;        SET v_fine_amount = v_days_overdue * v_fine_per_day;

    ELSE    ELSE

        SET v_fine_amount = 0.00;        SET v_fine_amount = 0.00;

    END IF;    END IF;

        

    RETURN v_fine_amount;    RETURN v_fine_amount;

END$$END$$



-- Function 2: Get member's active book count-- Function 2: Get member's active book count

-- Usage: SELECT GetMemberActiveBooks(member_id)-- Usage: SELECT GetMemberActiveBooks(member_id)

DROP FUNCTION IF EXISTS GetMemberActiveBooks$$DROP FUNCTION IF EXISTS GetMemberActiveBooks$$

CREATE FUNCTION GetMemberActiveBooks(p_member_id INT)CREATE FUNCTION GetMemberActiveBooks(p_member_id INT)

RETURNS INTRETURNS INT

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_count INT;    DECLARE v_count INT;

        

    SELECT COUNT(*)    SELECT COUNT(*)

    INTO v_count    INTO v_count

    FROM Transactions    FROM Transactions

    WHERE member_id = p_member_id     WHERE member_id = p_member_id 

    AND return_date IS NULL;    AND return_date IS NULL;

        

    RETURN v_count;    RETURN v_count;

END$$END$$



-- Function 3: Check if book is available-- Function 3: Check if book is available

-- Usage: SELECT IsBookAvailable(book_id)-- Usage: SELECT IsBookAvailable(book_id)

DROP FUNCTION IF EXISTS IsBookAvailable$$DROP FUNCTION IF EXISTS IsBookAvailable$$

CREATE FUNCTION IsBookAvailable(p_book_id INT)CREATE FUNCTION IsBookAvailable(p_book_id INT)

RETURNS BOOLEANRETURNS BOOLEAN

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_available INT;    DECLARE v_available INT;

        

    SELECT available_copies    SELECT available_copies

    INTO v_available    INTO v_available

    FROM Books    FROM Books

    WHERE book_id = p_book_id;    WHERE book_id = p_book_id;

        

    RETURN (v_available > 0);    RETURN (v_available > 0);

END$$END$$



-- Function 4: Get book availability percentage-- Function 4: Get book availability percentage

-- Usage: SELECT GetBookAvailability(book_id)-- Usage: SELECT GetBookAvailability(book_id)

DROP FUNCTION IF EXISTS GetBookAvailability$$DROP FUNCTION IF EXISTS GetBookAvailability$$

CREATE FUNCTION GetBookAvailability(p_book_id INT)CREATE FUNCTION GetBookAvailability(p_book_id INT)

RETURNS DECIMAL(5,2)RETURNS DECIMAL(5,2)

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_total INT;    DECLARE v_total INT;

    DECLARE v_available INT;    DECLARE v_available INT;

    DECLARE v_percentage DECIMAL(5,2);    DECLARE v_percentage DECIMAL(5,2);

        

    SELECT total_copies, available_copies    SELECT total_copies, available_copies

    INTO v_total, v_available    INTO v_total, v_available

    FROM Books    FROM Books

    WHERE book_id = p_book_id;    WHERE book_id = p_book_id;

        

    IF v_total > 0 THEN    IF v_total > 0 THEN

        SET v_percentage = (v_available / v_total) * 100;        SET v_percentage = (v_available / v_total) * 100;

    ELSE    ELSE

        SET v_percentage = 0.00;        SET v_percentage = 0.00;

    END IF;    END IF;

        

    RETURN v_percentage;    RETURN v_percentage;

END$$END$$



-- Function 5: Get member's total fine amount-- Function 5: Get member's total fine amount

-- Usage: SELECT GetMemberTotalFine(member_id)-- Usage: SELECT GetMemberTotalFine(member_id)

DROP FUNCTION IF EXISTS GetMemberTotalFine$$DROP FUNCTION IF EXISTS GetMemberTotalFine$$

CREATE FUNCTION GetMemberTotalFine(p_member_id INT)CREATE FUNCTION GetMemberTotalFine(p_member_id INT)

RETURNS DECIMAL(10,2)RETURNS DECIMAL(10,2)

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_total_fine DECIMAL(10,2);    DECLARE v_total_fine DECIMAL(10,2);

        

    SELECT IFNULL(SUM(fine_amount), 0.00)    SELECT IFNULL(SUM(fine_amount), 0.00)

    INTO v_total_fine    INTO v_total_fine

    FROM Transactions    FROM Transactions

    WHERE member_id = p_member_id    WHERE member_id = p_member_id

    AND return_date IS NULL    AND return_date IS NULL

    AND due_date < CURDATE();    AND due_date < CURDATE();

        

    RETURN v_total_fine;    RETURN v_total_fine;

END$$END$$



-- Function 6: Check if member can borrow (max 5 books)-- Function 6: Check if member can borrow (max 5 books)

-- Usage: SELECT CanMemberBorrow(member_id)-- Usage: SELECT CanMemberBorrow(member_id)

DROP FUNCTION IF EXISTS CanMemberBorrow$$DROP FUNCTION IF EXISTS CanMemberBorrow$$

CREATE FUNCTION CanMemberBorrow(p_member_id INT)CREATE FUNCTION CanMemberBorrow(p_member_id INT)

RETURNS BOOLEANRETURNS BOOLEAN

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_active_books INT;    DECLARE v_active_books INT;

    DECLARE v_member_status VARCHAR(20);    DECLARE v_member_status VARCHAR(20);

    DECLARE v_max_books INT DEFAULT 5;    DECLARE v_max_books INT DEFAULT 5;

        

    SELECT status INTO v_member_status    SELECT status INTO v_member_status

    FROM Members    FROM Members

    WHERE member_id = p_member_id;    WHERE member_id = p_member_id;

        

    SELECT GetMemberActiveBooks(p_member_id) INTO v_active_books;    SELECT GetMemberActiveBooks(p_member_id) INTO v_active_books;

        

    RETURN (v_member_status = 'Active' AND v_active_books < v_max_books);    RETURN (v_member_status = 'Active' AND v_active_books < v_max_books);

END$$END$$



-- Function 7: Get book's popularity score (borrow count)-- Function 7: Get book's popularity score (borrow count)

-- Usage: SELECT GetBookPopularity(book_id)-- Usage: SELECT GetBookPopularity(book_id)

DROP FUNCTION IF EXISTS GetBookPopularity$$DROP FUNCTION IF EXISTS GetBookPopularity$$

CREATE FUNCTION GetBookPopularity(p_book_id INT)CREATE FUNCTION GetBookPopularity(p_book_id INT)

RETURNS INTRETURNS INT

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_borrow_count INT;    DECLARE v_borrow_count INT;

        

    SELECT COUNT(*)    SELECT COUNT(*)

    INTO v_borrow_count    INTO v_borrow_count

    FROM Transactions    FROM Transactions

    WHERE book_id = p_book_id;    WHERE book_id = p_book_id;

        

    RETURN v_borrow_count;    RETURN v_borrow_count;

END$$END$$



-- Function 8: Get days until membership expiry-- Function 8: Get days until membership expiry

-- Usage: SELECT GetDaysToExpiry(member_id)-- Usage: SELECT GetDaysToExpiry(member_id)

DROP FUNCTION IF EXISTS GetDaysToExpiry$$DROP FUNCTION IF EXISTS GetDaysToExpiry$$

CREATE FUNCTION GetDaysToExpiry(p_member_id INT)CREATE FUNCTION GetDaysToExpiry(p_member_id INT)

RETURNS INTRETURNS INT

DETERMINISTICDETERMINISTIC

READS SQL DATAREADS SQL DATA

BEGINBEGIN

    DECLARE v_expiry_date DATE;    DECLARE v_expiry_date DATE;

    DECLARE v_days INT;    DECLARE v_days INT;

        

    SELECT expiry_date    SELECT expiry_date

    INTO v_expiry_date    INTO v_expiry_date

    FROM Members    FROM Members

    WHERE member_id = p_member_id;    WHERE member_id = p_member_id;

        

    SET v_days = DATEDIFF(v_expiry_date, CURDATE());    SET v_days = DATEDIFF(v_expiry_date, CURDATE());

        

    RETURN v_days;    RETURN v_days;

END$$END$$



DELIMITER ;DELIMITER ;

