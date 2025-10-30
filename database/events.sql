

-- Enable Event Scheduler-- Enable Event Scheduler

SET GLOBAL event_scheduler = ON;SET GLOBAL event_scheduler = ON;



DELIMITER $$DELIMITER $$



-- Event 1: Update overdue transaction status (Runs daily at midnight)-- Event 1: Update overdue transaction status (Runs daily at midnight)

DROP EVENT IF EXISTS UpdateOverdueStatus$$DROP EVENT IF EXISTS UpdateOverdueStatus$$

CREATE EVENT UpdateOverdueStatusCREATE EVENT UpdateOverdueStatus

ON SCHEDULE EVERY 1 DAYON SCHEDULE EVERY 1 DAY

STARTS CURRENT_TIMESTAMPSTARTS CURRENT_TIMESTAMP

DODO

BEGINBEGIN

    UPDATE Transactions    UPDATE Transactions

    SET status = 'Overdue'    SET status = 'Overdue'

    WHERE return_date IS NULL    WHERE return_date IS NULL

    AND due_date < CURDATE()    AND due_date < CURDATE()

    AND status != 'Overdue';    AND status != 'Overdue';

END$$END$$



-- Event 2: Update member status based on expiry (Runs daily at 1 AM)-- Event 2: Update member status based on expiry (Runs daily at 1 AM)

DROP EVENT IF EXISTS UpdateExpiredMembers$$DROP EVENT IF EXISTS UpdateExpiredMembers$$

CREATE EVENT UpdateExpiredMembersCREATE EVENT UpdateExpiredMembers

ON SCHEDULE EVERY 1 DAYON SCHEDULE EVERY 1 DAY

STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOURSTARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR

DODO

BEGINBEGIN

    UPDATE Members    UPDATE Members

    SET status = 'Expired'    SET status = 'Expired'

    WHERE expiry_date < CURDATE()    WHERE expiry_date < CURDATE()

    AND status = 'Active';    AND status = 'Active';

END$$END$$



-- Event 3: Calculate and update fines for overdue books (Runs daily at 2 AM)-- Event 3: Calculate and update fines for overdue books (Runs daily at 2 AM)

DROP EVENT IF EXISTS UpdateOverdueFines$$DROP EVENT IF EXISTS UpdateOverdueFines$$

CREATE EVENT UpdateOverdueFinesCREATE EVENT UpdateOverdueFines

ON SCHEDULE EVERY 1 DAYON SCHEDULE EVERY 1 DAY

STARTS CURRENT_TIMESTAMP + INTERVAL 2 HOURSTARTS CURRENT_TIMESTAMP + INTERVAL 2 HOUR

DODO

BEGINBEGIN

    UPDATE Transactions t    UPDATE Transactions t

    SET fine_amount = CalculateFine(t.transaction_id)    SET fine_amount = CalculateFine(t.transaction_id)

    WHERE t.return_date IS NULL    WHERE t.return_date IS NULL

    AND t.due_date < CURDATE();    AND t.due_date < CURDATE();

END$$END$$



-- Event 4: Send reminder notification for books due in 3 days (Runs daily at 9 AM)-- Event 4: Send reminder notification for books due in 3 days (Runs daily at 9 AM)

-- This creates a log table for notifications-- This creates a log table for notifications

DROP TABLE IF EXISTS Notification_Log$$DROP TABLE IF EXISTS Notification_Log$$

CREATE TABLE Notification_Log (CREATE TABLE Notification_Log (

    log_id INT PRIMARY KEY AUTO_INCREMENT,    log_id INT PRIMARY KEY AUTO_INCREMENT,

    member_id INT,    member_id INT,

    transaction_id INT,    transaction_id INT,

    notification_type VARCHAR(50),    notification_type VARCHAR(50),

    message TEXT,    message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id) REFERENCES Members(member_id),    FOREIGN KEY (member_id) REFERENCES Members(member_id),

    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id)    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id)

)$$)$$



DROP EVENT IF EXISTS DueDateReminder$$DROP EVENT IF EXISTS DueDateReminder$$

CREATE EVENT DueDateReminderCREATE EVENT DueDateReminder

ON SCHEDULE EVERY 1 DAYON SCHEDULE EVERY 1 DAY

STARTS CURRENT_TIMESTAMP + INTERVAL 9 HOURSTARTS CURRENT_TIMESTAMP + INTERVAL 9 HOUR

DODO

BEGINBEGIN

    INSERT INTO Notification_Log (member_id, transaction_id, notification_type, message)    INSERT INTO Notification_Log (member_id, transaction_id, notification_type, message)

    SELECT     SELECT 

        t.member_id,        t.member_id,

        t.transaction_id,        t.transaction_id,

        'DUE_REMINDER',        'DUE_REMINDER',

        CONCAT('Book "', b.title, '" is due in ', DATEDIFF(t.due_date, CURDATE()), ' days')        CONCAT('Book "', b.title, '" is due in ', DATEDIFF(t.due_date, CURDATE()), ' days')

    FROM Transactions t    FROM Transactions t

    JOIN Books b ON t.book_id = b.book_id    JOIN Books b ON t.book_id = b.book_id

    WHERE t.return_date IS NULL    WHERE t.return_date IS NULL

    AND t.due_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY);    AND t.due_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY);

END$$END$$



DELIMITER ;DELIMITER ;

