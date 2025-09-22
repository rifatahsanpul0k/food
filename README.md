# 🍔 MealMate - Food Ordering System

A comprehensive full-stack food delivery platform similar to FoodPanda with multi-role support for Customers, Admins, and Delivery Persons. Built with **Node.js/Express**, **React/Vite**, and **MySQL**.

![MealMate](https://img.shields.io/badge/Status-Active-brightgreen)
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
