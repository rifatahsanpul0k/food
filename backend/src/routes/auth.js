import { Router } from 'express';
import pool from '../db.js';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow('', null).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Signup
router.post('/signup', async (req, res, next) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [value.email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [value.name, value.email, value.phone || null, hashedPassword, 'user']
    );

    const token = jwt.sign(
      { userId: result.insertId, email: value.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: result.insertId,
        name: value.name,
        email: value.email,
        role: 'user'
      }
    });
  } catch (err) {
    next(err);
  }
});

// Delivery person signup
router.post('/delivery-signup', async (req, res, next) => {
  try {
    const { name, email, password, phone, vehicleType, licenseNumber } = req.body;
    
    // Validate input
    if (!name || !email || !password || !phone || !vehicleType || !licenseNumber) {
      return res.status(400).json({ error: 'All fields are required for delivery person registration' });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create delivery person with pending status
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role, vehicle_type, license_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, 'delivery', vehicleType, licenseNumber, 'pending']
    );

    res.status(201).json({
      message: 'Delivery person application submitted successfully. Please wait for admin approval.',
      applicationId: result.insertId,
      status: 'pending'
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [value.email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(value.password, user.password || '');
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check delivery person status
    if (user.role === 'delivery') {
      if (user.status === 'pending') {
        return res.status(403).json({ 
          error: 'Your delivery person application is pending admin approval. Please wait for approval before logging in.',
          status: 'pending'
        });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ 
          error: 'Your delivery person account has been suspended. Please contact admin.',
          status: 'suspended'
        });
      }
      if (user.status !== 'active') {
        return res.status(403).json({ 
          error: 'Your delivery person account is not active. Please contact admin.',
          status: user.status
        });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
});

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin middleware
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get current user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, address, city, profile_image, admin_title, department, bio, created_at FROM users WHERE id = ?', 
      [req.user.userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(users[0]);
  } catch (err) {
    next(err);
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('profileImage'), async (req, res, next) => {
  try {
    const { name, phone, address, city, adminTitle, department, bio } = req.body;
    
    // Build update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }
    
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address || null);
    }
    
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city || null);
    }
    
    // Admin-specific fields
    if (req.user.role === 'admin') {
      if (adminTitle !== undefined) {
        updateFields.push('admin_title = ?');
        updateValues.push(adminTitle || null);
      }
      
      if (department !== undefined) {
        updateFields.push('department = ?');
        updateValues.push(department || null);
      }
      
      if (bio !== undefined) {
        updateFields.push('bio = ?');
        updateValues.push(bio || null);
      }
    }
    
    // Handle profile image upload
    if (req.file) {
      updateFields.push('profile_image = ?');
      updateValues.push(req.file.filename);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Add user ID for WHERE clause
    updateValues.push(req.user.userId);
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.query(updateQuery, updateValues);
    
    // Fetch updated user data
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, address, city, profile_image, admin_title, department, bio, created_at FROM users WHERE id = ?', 
      [req.user.userId]
    );
    
    res.json({
      message: 'Profile updated successfully',
      ...users[0]
    });
  } catch (err) {
    next(err);
  }
});

// Database setup endpoint (for development only)
router.post('/setup-db', async (req, res, next) => {
  try {
    // Add password and role columns if they don't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN password VARCHAR(255),
        ADD COLUMN role ENUM('user', 'admin', 'delivery') DEFAULT 'user'
      `);
      console.log('Database columns added successfully');
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
      console.log('Database columns already exist');
    }
    
    // Add profile columns if they don't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN address TEXT,
        ADD COLUMN city VARCHAR(100),
        ADD COLUMN profile_image VARCHAR(255),
        ADD COLUMN admin_title VARCHAR(100),
        ADD COLUMN department VARCHAR(100),
        ADD COLUMN bio TEXT
      `);
      console.log('Profile columns added successfully');
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
      console.log('Profile columns already exist');
    }
    
    // Add delivery person columns if they don't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN vehicle_type VARCHAR(50),
        ADD COLUMN license_number VARCHAR(50),
        ADD COLUMN delivery_notes TEXT,
        ADD COLUMN status ENUM('pending', 'active', 'suspended') DEFAULT 'active'
      `);
      console.log('Delivery person columns added successfully');
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
      console.log('Delivery person columns already exist');
    }
    
    // Add delivery person assignment to orders table
    try {
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN delivery_person_id INT,
        ADD FOREIGN KEY (delivery_person_id) REFERENCES users(id)
      `);
      console.log('Orders delivery person column added successfully');
    } catch (err) {
      if (!err.message.includes('Duplicate column name') && !err.message.includes('Duplicate key name')) {
        throw err;
      }
      console.log('Orders delivery person column already exists');
    }
    
    try {
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN customer_name VARCHAR(255),
        ADD COLUMN customer_phone VARCHAR(50),
        ADD COLUMN delivery_address TEXT,
        ADD COLUMN city VARCHAR(100)
      `);
      console.log('Orders table customer columns added successfully');
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
      console.log('Orders table customer columns already exist');
    }
    
    // Create admin user if it doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 10);
    try {
      await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@mealmate.com', '999-999-9999', hashedPassword, 'admin']
      );
      console.log('Admin user created');
    } catch (err) {
      if (!err.message.includes('Duplicate entry')) {
        throw err;
      }
      console.log('Admin user already exists');
    }
    
    res.json({ message: 'Database setup complete' });
  } catch (err) {
    next(err);
  }
});
export default router;
