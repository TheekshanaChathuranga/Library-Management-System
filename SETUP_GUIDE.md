# 🚀 Library Management System - Quick Setup Guide

## Prerequisites Checklist
- ✅ Node.js installed (v14+)
- ✅ MySQL installed and running (v8.0+)
- ✅ npm or yarn installed

---

## 📋 Step-by-Step Setup

### 1️⃣ Database Setup (MUST DO FIRST!)

Open **MySQL Workbench** or MySQL command line:

```sql
-- 1. Create and setup database
source D:/project/L3S2 project/Library-Management-System/database/schema.sql
source D:/project/L3S2 project/Library-Management-System/database/procedures.sql
source D:/project/L3S2 project/Library-Management-System/database/triggers.sql
source D:/project/L3S2 project/Library-Management-System/database/functions.sql
source D:/project/L3S2 project/Library-Management-System/database/sample_data.sql
```

**OR use this single command:**
```sql
source D:/project/L3S2 project/Library-Management-System/database/schema.sql;
source D:/project/L3S2 project/Library-Management-System/database/procedures.sql;
source D:/project/L3S2 project/Library-Management-System/database/triggers.sql;
source D:/project/L3S2 project/Library-Management-System/database/functions.sql;
source D:/project/L3S2 project/Library-Management-System/database/sample_data.sql;
```

### 2️⃣ Hash Passwords for Login

```powershell
cd backend
node scripts/hashPassword.js
```

Copy the SQL UPDATE statements and run them in MySQL.

### 3️⃣ Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Update .env with your MySQL password
# The file is already created, just update DB_PASSWORD

# Start backend server
npm run dev
```

✅ Backend should be running on `http://localhost:5000`

### 4️⃣ Frontend Setup

**Open NEW terminal:**

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

✅ Frontend should open automatically on `http://localhost:3000`

---

## 🔐 Login Credentials

**Admin:**
- Username: `admin_saman`
- Password: `admin123`

**Librarian:**
- Username: `nimesha_lib`
- Password: `librarian123`

---

## 🎯 Quick Test Checklist

After both servers are running:

1. ✅ Go to `http://localhost:3000`
2. ✅ Login with admin credentials
3. ✅ Check Dashboard - should show statistics
4. ✅ Go to Books - should show sample books
5. ✅ Go to Members - should show sample members
6. ✅ Try issuing a book (Transactions page)
7. ✅ Check Reports page

---

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `backend/.env`
- Make sure database is created and tables exist

### Frontend won't connect
- Verify backend is running on port 5000
- Check `frontend/.env` has correct API URL
- Clear browser cache and reload

### Can't login
- Make sure you ran the password hashing script
- Check Staff table has users with hashed passwords
- Verify JWT_SECRET is set in backend/.env

---

## 📞 Need Help?

Check the main README.md for detailed documentation!

**Happy Coding! 📚✨**
