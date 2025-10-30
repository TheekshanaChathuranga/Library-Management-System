## 🚀 QUICK START - 5 Minutes Setup

### Step 1: Database (MySQL Workbench)
```sql
source D:/project/L3S2 project/Library-Management-System/database/schema.sql;
source D:/project/L3S2 project/Library-Management-System/database/procedures.sql;
source D:/project/L3S2 project/Library-Management-System/database/triggers.sql;
source D:/project/L3S2 project/Library-Management-System/database/functions.sql;
source D:/project/L3S2 project/Library-Management-System/database/sample_data.sql;
```

### Step 2: Hash Passwords
```powershell
cd backend
node scripts/hashPassword.js
```
Copy SQL UPDATE statements → Run in MySQL

### Step 3: Start Backend
```powershell
cd backend
npm install
npm run dev
```
✅ Backend: http://localhost:5000

### Step 4: Start Frontend (NEW TERMINAL)
```powershell
cd frontend
npm install
npm start
```
✅ Frontend: http://localhost:3000

### Step 5: Login
- Username: `admin_saman`
- Password: `admin123`

---

## 📁 What You Got

### ✅ Backend (Complete)
- Authentication (JWT)
- Books CRUD
- Members CRUD
- Transactions (Issue/Return)
- Statistics & Reports
- Role-based Authorization

### ✅ Frontend (Complete)
- Dashboard with live stats
- Books Management (Add/Edit/Delete/Search)
- Members Management (Add/Edit/Delete/Search)
- Transactions (Issue/Return with fine calculation)
- Reports & Analytics
- Beautiful Modern UI

### ✅ Database (Complete)
- 6 Tables with relationships
- Stored Procedures
- Triggers (auto copy management)
- Functions (fine calculation)
- Sample Data

---

## 🎯 Quick Test

1. Login as admin
2. Dashboard → Check stats
3. Books → Add a book
4. Members → Add a member
5. Transactions → Issue book
6. Transactions → Return book (see fine if overdue)
7. Reports → View analytics

---

## 🐛 Common Issues

**Backend won't start?**
- Check MySQL is running
- Update `backend/.env` DB_PASSWORD

**Can't login?**
- Run password hash script
- Check Staff table has hashed passwords

**Frontend won't connect?**
- Backend must be running on :5000
- Check `frontend/.env`

---

## 📞 Files to Check

- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `PROJECT_SUMMARY.md` - Complete overview
- `backend/.env` - Backend config
- `frontend/.env` - Frontend config

---

**That's it! System eka ready! 🎉**
