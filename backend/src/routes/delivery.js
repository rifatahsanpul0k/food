import { Router } from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify delivery person token and status
const verifyDeliveryToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "delivery"', [decoded.userId]);
    
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid delivery person token' });
    
    const deliveryPerson = rows[0];
    
    // Check if delivery person is approved/active
    if (deliveryPerson.status !== 'active') {
      return res.status(403).json({ 
        error: 'Delivery person account is not active',
        status: deliveryPerson.status,
        message: deliveryPerson.status === 'pending' 
          ? 'Your account is pending admin approval' 
          : 'Your account has been suspended'
      });
    }
    
    req.deliveryPerson = deliveryPerson;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get available orders for delivery (orders that are ready for pickup)
router.get('/available-orders', verifyDeliveryToken, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, r.name as restaurant_name, r.location as restaurant_location
      FROM orders o 
      JOIN restaurants r ON o.restaurant_id = r.id 
      WHERE o.status IN ('CONFIRMED', 'PREPARING', 'READY') 
      AND (o.delivery_person_id IS NULL OR o.delivery_person_id = ?)
      ORDER BY o.created_at ASC
    `, [req.deliveryPerson.id]);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assigned orders for delivery person
router.get('/my-orders', verifyDeliveryToken, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, r.name as restaurant_name, r.location as restaurant_location
      FROM orders o 
      JOIN restaurants r ON o.restaurant_id = r.id 
      WHERE o.delivery_person_id = ?
      ORDER BY o.created_at DESC
    `, [req.deliveryPerson.id]);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept an order for delivery
router.put('/accept-order/:orderId', verifyDeliveryToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if order is available for pickup
    const [orderCheck] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND status IN ("CONFIRMED", "PREPARING", "READY") AND delivery_person_id IS NULL',
      [orderId]
    );
    
    if (orderCheck.length === 0) {
      return res.status(400).json({ error: 'Order not available for pickup' });
    }

    // Assign delivery person to order
    await pool.query(
      'UPDATE orders SET delivery_person_id = ?, status = "OUT_FOR_DELIVERY" WHERE id = ?',
      [req.deliveryPerson.id, orderId]
    );

    res.json({ message: 'Order accepted for delivery' });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status during delivery
router.put('/update-status/:orderId', verifyDeliveryToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if order belongs to this delivery person
    const [orderCheck] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND delivery_person_id = ?',
      [orderId, req.deliveryPerson.id]
    );
    
    if (orderCheck.length === 0) {
      return res.status(400).json({ error: 'Order not assigned to you' });
    }

    // Update order status
    await pool.query(
      'UPDATE orders SET status = ?, delivery_notes = ? WHERE id = ?',
      [status, notes || null, orderId]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get delivery person stats
router.get('/stats', verifyDeliveryToken, async (req, res) => {
  try {
    const [totalDeliveries] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE delivery_person_id = ? AND status = "DELIVERED"',
      [req.deliveryPerson.id]
    );

    const [todayDeliveries] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE delivery_person_id = ? AND status = "DELIVERED" AND DATE(updated_at) = CURDATE()',
      [req.deliveryPerson.id]
    );

    const [activeOrders] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE delivery_person_id = ? AND status = "OUT_FOR_DELIVERY"',
      [req.deliveryPerson.id]
    );

    const [earnings] = await pool.query(
      'SELECT SUM(total * 0.1) as earnings FROM orders WHERE delivery_person_id = ? AND status = "DELIVERED"',
      [req.deliveryPerson.id]
    );

    res.json({
      totalDeliveries: totalDeliveries[0].count,
      todayDeliveries: todayDeliveries[0].count,
      activeOrders: activeOrders[0].count,
      totalEarnings: earnings[0].earnings || 0
    });
  } catch (error) {
    console.error('Error fetching delivery stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
