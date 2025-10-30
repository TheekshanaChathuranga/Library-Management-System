const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const [staff] = await db.query(
      'SELECT * FROM Staff WHERE username = ? AND status = "Active"',
      [username]
    );

    if (staff.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      staff[0].password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        staff_id: staff[0].staff_id,
        username: staff[0].username,
        role: staff[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          staff_id: staff[0].staff_id,
          username: staff[0].username,
          first_name: staff[0].first_name,
          last_name: staff[0].last_name,
          email: staff[0].email,
          role: staff[0].role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    console.log("Login attempt:", {
      username,
      hashedPasswordFromDB: staff?.[0]?.password_hash,
      compareResult: isValidPassword,
    });
    res.status(500).json({
      success: false,
      message: "Login failed: " + error.message,
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, first_name, last_name, email, role } = req.body;

    if (!username || !password || !first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );

    const [result] = await db.query(
      `INSERT INTO Staff (username, password_hash, first_name, last_name, email, role, hired_date)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        username,
        hashedPassword,
        first_name,
        last_name,
        email,
        role || "Librarian",
      ]
    );

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      data: { staff_id: result.insertId },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [staff] = await db.query(
      "SELECT staff_id, username, first_name, last_name, email, role FROM Staff WHERE staff_id = ?",
      [req.user.staff_id]
    );

    res.json({
      success: true,
      data: staff[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
};

exports.authenticate = require("../middleware/auth").authenticate;
