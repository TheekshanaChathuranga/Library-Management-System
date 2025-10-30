--After issue book
DELIMITER $$

CREATE TRIGGER after_issue_book
AFTER INSERT
ON transactions
FOR EACH ROW
BEGIN
   UPDATE books
   SET available_copies = available_copies - 1
   WHERE book_id = NEW.book_id;
END $$

DELIMITER ;


--After return book
DELIMITER $$
CREATE TRIGGER after_return_book
AFTER UPDATE
ON transactions
FOR EACH ROW
BEGIN
   IF OLD.return_date IS NULL AND NEW.return_date IS NOT NULL THEN
      UPDATE books
      SET available_copies = available_copies + 1
      WHERE book_id = NEW.book_id;
   END IF;
END $$

DELIMITER ;


-- Prevent book issue if member has overdue books
DELIMITER $$
CREATE TRIGGER prevent_overdue_issue
BEFORE INSERT
ON transactions
FOR EACH ROW
BEGIN
   DECLARE overdue_count INT;
   
   -- Check if member has any overdue books
   SELECT COUNT(*) INTO overdue_count
   FROM transactions
   WHERE member_id = NEW.member_id
   AND return_date IS NULL
   AND due_date < CURDATE();
   
   IF overdue_count > 0 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot issue book: Member has overdue books. Please return them first.';
   END IF;
END $$

DELIMITER ;


-- Auto update member status when checking membership
DELIMITER $$
CREATE TRIGGER check_member_expiry
BEFORE INSERT
ON transactions
FOR EACH ROW
BEGIN
   DECLARE member_expiry DATE;
   DECLARE member_current_status VARCHAR(20);
   
   -- Get member expiry date and current status
   SELECT expiry_date, status INTO member_expiry, member_current_status
   FROM members
   WHERE member_id = NEW.member_id;
   
   -- Update member status if expired
   IF member_expiry < CURDATE() AND member_current_status != 'Expired' THEN
      UPDATE members
      SET status = 'Expired'
      WHERE member_id = NEW.member_id;
      
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot issue book: Member membership has expired.';
   END IF;
   
   -- Also check if member is suspended
   IF member_current_status = 'Suspended' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot issue book: Member account is suspended.';
   END IF;
END $$