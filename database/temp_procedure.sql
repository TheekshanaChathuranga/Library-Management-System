USE LibraryManagementSystem;
DELIMITER //

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

DELIMITER ;