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
-- NOTE: Assumes there is a stored function named `CalculateFine(transaction_id)`
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
