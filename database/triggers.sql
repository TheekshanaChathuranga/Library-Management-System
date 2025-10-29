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
   UPDATE books
   SET available_copies = available_copies + 1
   WHERE book_id = NEW.book_id;
END $$