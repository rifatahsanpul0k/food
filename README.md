# 🍔 MealMate - Food Ordering System

A comprehensive full-stack food delivery platform similar to FoodPanda with multi-role support for Customers, Admins, and Delivery Persons. Built with **Node.js/Express**, **React/Vite**, and **MySQL**.

![MealMate](https://img.shields.io/badge/Status-Active-brightgreen)

## 🚀 Quick Setup for New PC

### Prerequisites
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### 📋 Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mealmate.git
cd mealmate
```

#### 2. Database Setup

**Create MySQL Database:**
```sql
CREATE DATABASE food_ordering;
USE food_ordering;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password VARCHAR(255),
  role ENUM('user', 'admin', 'delivery') DEFAULT 'user',
  address TEXT,
  city VARCHAR(100),
  profile_image VARCHAR(255),
  admin_title VARCHAR(100),
  department VARCHAR(100),
  bio TEXT,
  vehicle_type VARCHAR(50),
  license_number VARCHAR(50),
  delivery_notes TEXT,
  status ENUM('pending', 'active', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING','CONFIRMED','PREPARING','DELIVERED','CANCELLED') DEFAULT 'PENDING',
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  delivery_address TEXT,
  city VARCHAR(100),
  delivery_person_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (delivery_person_id) REFERENCES users(id)
);

-- Create order_items table
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
```

**Insert Sample Data:**
```sql
-- Sample restaurants
INSERT INTO restaurants (name, location, rating) VALUES
('Pasta Palace','Downtown',4.5),
('Burger Barn','Uptown',4.2),
('Sushi Central','Midtown',4.8),
('Pizza Corner','Downtown',4.3);

-- Sample menu items
INSERT INTO menu_items (restaurant_id, name, price, category, description, is_available) VALUES
(1,'Spaghetti Carbonara',12.99,'Pasta','Classic Roman pasta',true),
(1,'Fettuccine Alfredo',11.49,'Pasta','Creamy alfredo sauce',true),
(2,'Cheeseburger',8.99,'Burger','Beef, cheese, lettuce',true),
(2,'Veggie Burger',7.99,'Burger','Plant-based patty',true),
(3,'Salmon Nigiri',10.49,'Sushi','Fresh salmon',true),
(3,'California Roll',6.99,'Sushi','Crab, avocado, cucumber',true),
(4,'Margherita Pizza',14.99,'Pizza','Fresh mozzarella and basil',true),
(4,'Pepperoni Pizza',16.99,'Pizza','Classic pepperoni',true);

-- Sample users
INSERT INTO users (name, email, phone, password, role) VALUES
('John Doe','john@example.com','1234567890', '$2b$10$example', 'user'),
('Jane Smith','jane@example.com','2345678901', '$2b$10$example', 'user'),
('Mike Johnson','mike@example.com','3456789012', '$2b$10$example', 'user');
```

#### 3. Backend Setup

```bash
cd backend
npm install
```

**Create .env file in backend folder:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=food_ordering

# Server Configuration
PORT=4000

# JWT Secret (change this to a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

**Start Backend Server:**
```bash
npm start
```

#### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

**Create .env file in frontend folder (optional):**
```env
VITE_API_URL=http://localhost:4000/api
```

**Start Frontend Server:**
```bash
npm run dev
```

#### 5. Initialize Database with Sample Data

After both servers are running, visit:
```
http://localhost:4000/api/auth/setup-db
```

This will create the admin user and initialize all necessary database columns.

### 🔐 Default Login Credentials

**Admin Account:**
- Email: `admin@mealmate.com`
- Password: `admin123`

**Test User Accounts:**
- Email: `john@example.com`, Password: `password123`
- Email: `jane@example.com`, Password: `password123`

### 🌐 Access URLs

- **Frontend**: http://localhost:5173 (or 5174 if 5173 is busy)
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

### 📁 Project Structure

```
mealmate/
├── backend/
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── db.js          # Database connection
│   │   └── server.js      # Express server
│   ├── uploads/           # File uploads
│   ├── package.json
│   └── .env              # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # React components
│   │   └── context/       # React context
│   ├── package.json
│   └── .env              # Frontend environment variables
└── README.md
```

### 🔧 Important Environment Variables

**Backend (.env):**
```env
DB_HOST=localhost          # MySQL host
DB_PORT=3306              # MySQL port
DB_USER=root              # MySQL username
DB_PASSWORD=your_password  # MySQL password
DB_NAME=food_ordering     # Database name
PORT=4000                 # Backend server port
JWT_SECRET=your_secret    # JWT signing secret
```

**Frontend (.env - optional):**
```env
VITE_API_URL=http://localhost:4000/api
```

### 🚨 Troubleshooting

**Common Issues:**

1. **MySQL Connection Error:**
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Create database if it doesn't exist

2. **Port Already in Use:**
   - Change PORT in backend `.env`
   - Kill existing processes on ports 4000/5173

3. **CORS Issues:**
   - Ensure frontend runs on localhost
   - Check API URL in frontend

4. **Database Tables Missing:**
   - Run database setup: POST to `/api/auth/setup-db`
   - Manually create tables using SQL above

### 📝 Development Notes

- Backend runs on **Express.js** with **ES6 modules**
- Frontend uses **React 18** with **Vite**
- Database: **MySQL** with proper foreign key relationships
- Authentication: **JWT tokens** with role-based access
- File uploads: **Multer** for profile images

---

## 🎯 Features Overview

### 👥 User Roles

**🛍️ Customer Features:**
- Browse restaurants and menus
- Add items to cart and place orders
- Track order status in real-time
- Manage profile with image upload
- View order history
- Cancel pending orders

**👨‍💼 Admin Features:**
- Complete dashboard with analytics
- Manage all orders and users
- Approve/reject delivery person applications
- View comprehensive statistics
- Manage delivery person status (suspend/activate)
- Access to all system data

**🚚 Delivery Person Features:**
- Separate signup with vehicle details
- Admin approval required for activation
- View assigned delivery orders
- Update delivery status
- ❌ **Cannot order food** (delivery-only role)

### 🔧 System Features

- **Multi-role Authentication** with JWT tokens
- **Real-time Order Management** with status updates
- **File Upload System** for profile images
- **Responsive Design** with Tailwind CSS
- **Role-based Access Control** for secure operations
- **Database Relations** with proper foreign keys

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Customer registration |
| POST | `/api/auth/delivery-signup` | Delivery person registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |
| POST | `/api/auth/setup-db` | Initialize database |

### 🏪 Restaurant & Menu Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | Get all restaurants |
| GET | `/api/restaurants/:id` | Get restaurant details |
| GET | `/api/menu/:restaurantId` | Get restaurant menu |
| POST | `/api/menu` | Add menu item (Admin) |
| PUT | `/api/menu/:id` | Update menu item (Admin) |

### 📦 Order Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user orders (or all for admin) |
| POST | `/api/orders` | Place new order |
| PUT | `/api/orders/:id/status` | Update order status |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| POST | `/api/orders/:id/assign` | Assign delivery person |

### 👨‍💼 Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/delivery-applications` | Get pending applications |
| GET | `/api/admin/delivery-persons` | Get all delivery persons |
| POST | `/api/admin/approve-delivery/:id` | Approve delivery person |
| POST | `/api/admin/reject-delivery/:id` | Reject application |
| POST | `/api/admin/suspend-delivery/:id` | Suspend delivery person |

### 🚚 Delivery Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery/orders` | Get assigned delivery orders |
| PUT | `/api/delivery/orders/:id/status` | Update delivery status |

### 📊 Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/popular-dishes` | Get popular dishes |
| GET | `/api/analytics/revenue` | Get revenue analytics |
| GET | `/api/analytics/orders` | Get order analytics |

## 🗄️ Database Schema

### Users Table
```sql
users (
  id, name, email, phone, password, role,
  address, city, profile_image, admin_title,
  department, bio, vehicle_type, license_number,
  delivery_notes, status, created_at, updated_at
)
```

### Orders Table
```sql
orders (
  id, user_id, restaurant_id, total, status,
  customer_name, customer_phone, delivery_address,
  city, delivery_person_id, created_at, updated_at
)
```

### Other Tables
- `restaurants` (id, name, location, rating)
- `menu_items` (id, restaurant_id, name, price, category, description)
- `order_items` (id, order_id, menu_item_id, quantity, price)

## 🔒 Security Features

- **Password Hashing** with bcrypt
- **JWT Authentication** with role-based access
- **Input Validation** with Joi schemas
- **File Upload Security** with mimetype checking
- **Protected Routes** on both frontend and backend

## 📞 Support

- Email: support@mealmate.com
- Repository: [GitHub Repository](https://github.com/yourusername/mealmate)

**Built with ❤️ for the food delivery community** 🍕🚚
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)

## 🎯 Key Features

### 👥 **Multi-Role User System**
- **Customer**: Browse restaurants, place orders, track deliveries
- **Admin**: Manage restaurants, approve delivery persons, view analytics
- **Delivery Person**: Accept orders, update delivery status, track earnings

### 🏪 **Restaurant & Menu Management**
- Dynamic restaurant listings with ratings
- Category-based menu organization
- Real-time availability status
- Image upload support for profiles

### 📦 **Advanced Order Management**
- Authenticated and guest ordering
- Real-time order tracking: Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered
- Order cancellation and modification
- Customer information capture for delivery

### 🚚 **Delivery Management System**
- **Admin approval required** for delivery person registration
- Vehicle information and license verification
- Order assignment based on location
- Delivery status updates with notifications
- Earnings tracking and statistics

### 📊 **Analytics Dashboard**
- Top restaurants by order volume
- Popular dishes and categories
- Revenue reports per restaurant
- Active user statistics
- Average order value analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/mealmate.git
cd mealmate
```

### 2. Database Setup
```sql
CREATE DATABASE food_ordering;
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=food_ordering
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

Start backend server:
```bash
npm run dev
# or
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000/api
```

Start frontend server:
```bash
npm run dev
```

### 5. Initialize Database
Visit: `http://localhost:4000/api/auth/setup-db` (POST request) to create tables and admin user.

## 🔗 API Documentation

### Base URL: `http://localhost:4000/api`

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Customer registration |
| `POST` | `/auth/delivery-signup` | Delivery person application |
| `POST` | `/auth/login` | Login (all roles) |
| `GET` | `/auth/profile` | Get user profile |
| `PUT` | `/auth/profile` | Update profile + image upload |

### 🏪 Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/restaurants` | List all restaurants |
| `GET` | `/restaurants/:id` | Get restaurant details |
| `GET` | `/restaurants/:id/menu` | Get restaurant menu |
| `POST` | `/restaurants` | Create restaurant |
| `PUT` | `/restaurants/:id/rating` | Update rating |

### 📦 Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create authenticated order |
| `POST` | `/orders/guest` | Create guest order |
| `GET` | `/orders` | Get user's orders |
| `GET` | `/orders/:id` | Get order details |
| `PUT` | `/orders/:id/cancel` | Cancel order |
| `PUT` | `/orders/:id/status` | Update order status |

### 🚚 Delivery (Requires Delivery Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/delivery/available-orders` | Get orders for pickup |
| `GET` | `/delivery/my-orders` | Get assigned orders |
| `PUT` | `/delivery/accept-order/:id` | Accept delivery |
| `PUT` | `/delivery/update-status/:id` | Update delivery status |
| `GET` | `/delivery/stats` | Get delivery statistics |

### 👑 Admin (Requires Admin Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/delivery-applications` | Pending applications |
| `POST` | `/admin/approve-delivery/:id` | Approve delivery person |
| `POST` | `/admin/reject-delivery/:id` | Reject application |
| `POST` | `/admin/suspend-delivery/:id` | Suspend delivery person |

### 📊 Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/top-restaurants` | Top restaurants |
| `GET` | `/analytics/popular-dishes` | Popular dishes |
| `GET` | `/analytics/revenue-per-restaurant` | Revenue reports |
| `GET` | `/analytics/active-users` | User statistics |

## 🗄️ Database Schema

### Core Tables
- **`users`** - Multi-role user management with delivery person fields
- **`restaurants`** - Restaurant information and ratings
- **`menu_items`** - Menu items linked to restaurants
- **`orders`** - Order management with delivery tracking
- **`order_items`** - Order line items

### Key Fields
```sql
users:
- role: ENUM('user', 'admin', 'delivery')
- status: ENUM('active', 'pending', 'suspended')
- vehicle_type, license_number (for delivery persons)

orders:
- status: ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')
- delivery_person_id: Foreign key to users table
```

## 🎭 User Roles & Access

### 👤 Customer
- ✅ Browse restaurants and menus
- ✅ Place and track orders
- ✅ Manage profile and order history
- ❌ Cannot access admin/delivery features

### 🚚 Delivery Person
- ⚠️ **Requires admin approval** to activate account
- ✅ View and accept delivery orders
- ✅ Update delivery status and track earnings
- ❌ **Cannot order food** (delivery-only role)

### 👑 Admin
- ✅ Full system access
- ✅ Approve/reject delivery applications
- ✅ View analytics and manage all content
- ✅ Monitor orders and users

## 🔒 Security Features

- **JWT Authentication** with 24-hour expiration
- **Password hashing** with bcrypt (10 rounds)
- **Role-based access control** on all protected routes
- **Input validation** using Joi schemas
- **File upload security** with multer
- **CORS protection** configured

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MySQL** with mysql2 driver
- **JWT** for authentication
- **Bcrypt** for password security
- **Multer** for file uploads
- **Joi** for validation
- **Winston** for logging

### Frontend
- **React 18** with Vite build tool
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Context API** for state management
- **Axios** for API communication

## 📱 Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home - Browse restaurants |
| `/login` | Public | User authentication |
| `/signup` | Public | Customer registration |
| `/delivery-signup` | Public | Delivery person application |
| `/restaurant/:id` | Public | Restaurant menu and ordering |
| `/cart` | Customer | Shopping cart management |
| `/checkout` | Customer | Order placement |
| `/orders` | Customer | Order history |
| `/dashboard` | Customer | Customer dashboard |
| `/admin` | Admin | Admin dashboard |
| `/analytics` | Admin | Business analytics |
| `/delivery-management` | Admin | Manage delivery persons |
| `/delivery-dashboard` | Delivery | Delivery operations |

## 🎮 Demo Accounts

### Admin Access
- **Email**: `admin@mealmate.com`
- **Password**: `admin123`

### Test Delivery Person (Pending Approval)
1. Register via `/delivery-signup`
2. Admin must approve via `/delivery-management`
3. Then delivery person can login

## 🚧 Development

### Project Structure
```
mealmate/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── db.js           # Database connection
│   │   └── server.js       # Express server
│   ├── uploads/            # File uploads
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context
│   │   └── main.jsx        # Entry point
│   └── package.json
└── README.md
```

### Environment Variables

**Backend (.env)**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=food_ordering
JWT_SECRET=your-secret-key
PORT=4000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:4000/api
```

## 📝 API Response Examples

### Successful Login
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Order Status
```json
{
  "id": 1,
  "status": "OUT_FOR_DELIVERY",
  "total": 25.99,
  "delivery_person_id": 5,
  "customer_name": "Jane Smith",
  "delivery_address": "123 Main St"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Check frontend `.env` has correct API URL
   - Ensure backend CORS is configured

3. **Delivery Person Can't Login**
   - Account must be approved by admin first
   - Check status in delivery management panel

4. **File Upload Issues**
   - Check `uploads/` directory permissions
   - Verify multer configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@mealmate.com

---

**Built with ❤️ for the food delivery community** 🍕🚚
