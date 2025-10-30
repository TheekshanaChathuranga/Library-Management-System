const db = require("../config/database");

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, member_id, book_id } = req.query;

    let query = `
            SELECT 
                t.*,
                b.title as book_title,
                b.ISBN,
                CONCAT(m.first_name, ' ', m.last_name) as member_name,
                m.email as member_email,
                CONCAT(s.first_name, ' ', s.last_name) as staff_name,
                DATEDIFF(CURDATE(), t.due_date) as days_overdue
            FROM Transactions t
            JOIN Books b ON t.book_id = b.book_id
            JOIN Members m ON t.member_id = m.member_id
            JOIN Staff s ON t.staff_id = s.staff_id
            WHERE 1=1
        `;

    let params = [];

    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    if (member_id) {
      query += " AND t.member_id = ?";
      params.push(member_id);
    }

    if (book_id) {
      query += " AND t.book_id = ?";
      params.push(book_id);
    }

    query += " ORDER BY t.transaction_id DESC";

    const [transactions] = await db.query(query, params);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Get all transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
    });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [transactions] = await db.query(
      `
            SELECT 
                t.*,
                b.title as book_title,
                b.ISBN,
                CONCAT(m.first_name, ' ', m.last_name) as member_name,
                m.email as member_email,
                CONCAT(s.first_name, ' ', s.last_name) as staff_name
            FROM Transactions t
            JOIN Books b ON t.book_id = b.book_id
            JOIN Members m ON t.member_id = m.member_id
            JOIN Staff s ON t.staff_id = s.staff_id
            WHERE t.transaction_id = ?
        `,
      [id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transactions[0],
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction",
    });
  }
};

// Issue book (uses stored procedure)
exports.issueBook = async (req, res) => {
  try {
    const { book_id, member_id, days = 14 } = req.body;
    const staff_id = req.user.staff_id;

    if (!book_id || !member_id) {
      return res.status(400).json({
        success: false,
        message: "Book ID and Member ID are required",
      });
    }

    const [result] = await db.query("CALL IssueBook(?, ?, ?, ?)", [
      book_id,
      member_id,
      staff_id,
      days,
    ]);

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      data: result[0][0],
    });
  } catch (error) {
    console.error("Issue book error:", error);

    // Handle specific errors from triggers
    if (error.sqlMessage) {
      return res.status(400).json({
        success: false,
        message: error.sqlMessage,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to issue book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Return book (uses stored procedure)
exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if transaction exists and is not already returned
    const [transaction] = await db.query(
      "SELECT status FROM Transactions WHERE transaction_id = ?",
      [id]
    );

    if (transaction.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction[0].status === "Returned") {
      return res.status(400).json({
        success: false,
        message: "This book has already been returned",
      });
    }

    // Call ReturnBook stored procedure
    const [result] = await db.query("CALL ReturnBook(?)", [id]);
    const returnData = result[0][0];

    res.json({
      success: true,
      message: returnData.message || "Book returned successfully",
      data: returnData,
    });
  } catch (error) {
    console.error("Return book error:", error);

    // Handle specific SQL errors
    if (error.code === "ER_SP_DOES_NOT_EXIST") {
      return res.status(500).json({
        success: false,
        message: "System error: Return book procedure not found",
      });
    }

    if (error.sqlMessage) {
      return res.status(400).json({
        success: false,
        message: error.sqlMessage,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to return book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get overdue books (uses stored procedure)
exports.getOverdueBooks = async (req, res) => {
  try {
    const [books] = await db.query("CALL GetOverdueBooks()");

    res.json({
      success: true,
      data: books[0],
      count: books[0].length,
    });
  } catch (error) {
    console.error("Get overdue books error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve overdue books",
    });
  }
};

// Get member's transaction history
exports.getMemberTransactions = async (req, res) => {
  try {
    const { member_id } = req.params;

    const [transactions] = await db.query(
      `
            SELECT 
                t.*,
                b.title as book_title,
                b.ISBN,
                CONCAT(s.first_name, ' ', s.last_name) as staff_name
            FROM Transactions t
            JOIN Books b ON t.book_id = b.book_id
            JOIN Staff s ON t.staff_id = s.staff_id
            WHERE t.member_id = ?
            ORDER BY t.issue_date DESC
        `,
      [member_id]
    );

    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Get member transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve member transactions",
    });
  }
};
