# Library Management System 📚

A complete, modern Library Management System built with **React**, **Node.js**, **Express**, and **MySQL**.

## 🌟 Features

### Core Functionality
- ✅ **Book Management** - Add, edit, delete, search books with ISBN, categories, authors
- ✅ **Member Management** - Register members with membership types and expiry tracking
- ✅ **Transaction Management** - Issue and return books with automatic fine calculation
- ✅ **Dashboard & Analytics** - Real-time statistics and insights
- ✅ **Reports** - Category stats, monthly reports, member analytics
- ✅ **Overdue Tracking** - Automatic overdue detection with LKR 5/day fine

### Technical Features
- 🔐 **JWT Authentication** with role-based access (Admin/Librarian)
- 🗄️ **MySQL Stored Procedures** for complex operations
- ⚡ **Database Triggers** for automatic book copy management
- 🎨 **Modern UI** with Tailwind CSS and responsive design
- 🔍 **Advanced Search** across books, members, and transactions
- 📊 **Real-time Statistics** dashboard

## 🗂️ Database Schema

### Main Tables
- **Staff** - Admin and Librarian users with authentication
- **Books** - Book catalog with ISBN, categories, authors
- **Members** - Library members with membership management
- **Transactions** - Book issue/return tracking
- **Categories** - Book categorization
- **Authors** - Author management (many-to-many with Books)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend folder**
   ```powershell
   cd backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env`
   - Update database credentials:
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=LibraryManagementSystem
     JWT_SECRET=your_secret_key
     ```

4. **Setup Database**
   - Create database and import schema:
   ```sql
   -- In MySQL Workbench or command line
   source database/schema.sql
   source database/procedures.sql
   source database/triggers.sql
   source database/functions.sql
   source database/sample_data.sql
   ```

5. **Start backend server**
   ```powershell
   npm run dev   # Development mode with nodemon
   # OR
   npm start     # Production mode
   ```

   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Setup environment variables**
   - Create `.env` file:
     ```env
     REACT_APP_API_URL=http://localhost:5000/api
     ```

4. **Start frontend**
   ```powershell
   npm start
   ```

   Frontend will run on `http://localhost:3000`

## 👤 Default Login Credentials

After importing sample data:

**Admin Account:**
- Username: `admin_saman`
- Password: `admin123` (You'll need to hash this - see below)

**Librarian Account:**
- Username: `nimesha_lib`
- Password: `librarian123`

### Creating Hashed Passwords

Run this in Node.js:
```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Then update the database:
```sql
UPDATE Staff SET password_hash = 'your_generated_hash' WHERE username = 'admin_saman';
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new staff (Admin only)
- `GET /api/auth/profile` - Get current user profile

### Books
- `GET /api/books` - Get all books
- `GET /api/books/search?q=query` - Search books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book (Admin only)

### Members
- `GET /api/members` - Get all members
- `GET /api/members/search?q=query` - Search members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Add new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member (Admin only)

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/overdue` - Get overdue books
- `POST /api/transactions/issue` - Issue book
- `PUT /api/transactions/:id/return` - Return book

### Statistics
- `GET /api/stats/dashboard` - Dashboard statistics
- `GET /api/stats/popular-books` - Popular books
- `GET /api/stats/categories` - Category statistics
- `GET /api/stats/monthly-report` - Monthly report

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver with promise support
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration
- **helmet** - Security headers
- **morgan** - Request logging
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **Material-UI** - UI components (optional)

### Database
- **MySQL 8.0** - Relational database
- **Stored Procedures** - Business logic
- **Triggers** - Automatic operations
- **Functions** - Reusable calculations

## 📁 Project Structure

```
Library-Management-System/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── memberController.js
│   │   ├── transactionController.js
│   │   ├── statsController.js
│   │   └── categoryController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── statsRoutes.js
│   │   └── categoryRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Table.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── Members.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Login.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookService.js
│   │   │   ├── memberService.js
│   │   │   ├── transactionService.js
│   │   │   ├── statsService.js
│   │   │   └── categoryService.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
└── database/
    ├── schema.sql
    ├── procedures.sql
    ├── triggers.sql
    ├── functions.sql
    └── sample_data.sql
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Librarian)
- Protected API routes
- SQL injection prevention with parameterized queries
- Helmet.js security headers

## 📊 Business Rules

1. **Book Issuing**
   - Member must be Active (not Expired/Suspended)
   - Member cannot have overdue books
   - Book must be available (available_copies > 0)
   - Default loan period: 14 days

2. **Fines**
   - LKR 5.00 per day for overdue books
   - Calculated automatically on return

3. **Member Status**
   - Auto-update to Expired when membership expires
   - Cannot issue books if suspended or expired

4. **Book Availability**
   - Automatically decremented on issue
   - Automatically incremented on return

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

Group 04

## 🙏 Acknowledgments

- Built as a university project for L3S2
- Uses modern web development best practices
- Implements real-world library management workflows

---

**Happy Coding! 📚✨**
