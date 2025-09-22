import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken, requireAdmin } from './auth.js';

const router = Router();

// Get all pending delivery applications
router.get('/delivery-applications', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    // First check if status column exists, if not, select without it
    let query;
    try {
      const [applications] = await pool.query(`
        SELECT id, name, email, phone, vehicle_type, license_number, status, created_at
        FROM users 
        WHERE role = 'delivery' AND (status = 'pending' OR status IS NULL)
        ORDER BY created_at DESC
      `);
      res.json(applications);
    } catch (statusError) {
      // Fallback query without status column
      const [applications] = await pool.query(`
        SELECT id, name, email, phone, vehicle_type, license_number, created_at, 'pending' as status
        FROM users 
        WHERE role = 'delivery'
        ORDER BY created_at DESC
      `);
      res.json(applications);
    }
  } catch (err) {
    next(err);
  }
});

// Get all delivery persons (approved, pending, suspended)
router.get('/delivery-persons', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    // First try with status column
    try {
      const [deliveryPersons] = await pool.query(`
        SELECT id, name, email, phone, vehicle_type, license_number, status, created_at
        FROM users 
        WHERE role = 'delivery'
        ORDER BY status, created_at DESC
      `);
      res.json(deliveryPersons);
    } catch (statusError) {
      // Fallback query without status column
      const [deliveryPersons] = await pool.query(`
        SELECT id, name, email, phone, vehicle_type, license_number, created_at, 'active' as status
        FROM users 
        WHERE role = 'delivery'
        ORDER BY created_at DESC
      `);
      res.json(deliveryPersons);
    }
  } catch (err) {
    next(err);
  }
});

// Approve delivery person application
router.post('/approve-delivery/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Update status to active
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      ['active', id, 'delivery']
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    // Get updated user info
    const [users] = await pool.query(
      'SELECT id, name, email, status FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Delivery person approved successfully',
      user: users[0]
    });
  } catch (err) {
    next(err);
  }
});

// Reject delivery person application
router.post('/reject-delivery/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Delete the application (or you could set status to 'rejected' if you want to keep records)
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND role = ? AND status = ?',
      [id, 'delivery', 'pending']
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pending delivery application not found' });
    }
    
    res.json({
      message: 'Delivery person application rejected',
      reason: reason || 'No reason provided'
    });
  } catch (err) {
    next(err);
  }
});

// Suspend delivery person
router.post('/suspend-delivery/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      ['suspended', id, 'delivery']
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }
    
    res.json({
      message: 'Delivery person suspended',
      reason: reason || 'No reason provided'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
