import { Router } from 'express';
import pool from '../db.js';
import Joi from 'joi';
import { authenticateToken, requireAdmin } from './auth.js';

const router = Router();

const authOrderSchema = Joi.object({
  customerName: Joi.string().required(),
  customerPhone: Joi.string().required(),
  deliveryAddress: Joi.string().required(),
  city: Joi.string().optional(),
  items: Joi.array()
    .items(Joi.object({ 
      menuItemId: Joi.number().integer().required(), 
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    }))
    .min(1)
    .required(),
  totalAmount: Joi.number().positive().required()
});

const placeOrderSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  restaurant_id: Joi.number().integer().required(),
  items: Joi.array()
    .items(Joi.object({ menu_item_id: Joi.number().integer().required(), quantity: Joi.number().integer().min(1).required() }))
    .min(1)
    .required(),
});

const guestOrderSchema = Joi.object({
  customerName: Joi.string().required(),
  customerPhone: Joi.string().required(),
  deliveryAddress: Joi.string().required(),
  city: Joi.string().optional(),
  items: Joi.array()
    .items(Joi.object({ 
      menuItemId: Joi.number().integer().required(), 
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    }))
    .min(1)
    .required(),
  totalAmount: Joi.number().positive().required()
});

const allowedStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'];
const nextStatusMap = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

router.post('/', authenticateToken, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { error, value } = authOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    await conn.beginTransaction();

    // Use default restaurant ID (1) since it's the first restaurant
    const restaurantId = 1;

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, restaurant_id, total, status, customer_name, customer_phone, delivery_address, city) VALUES (?, ?, ?, "PENDING", ?, ?, ?, ?)',
      [req.user.userId, restaurantId, value.totalAmount, value.customerName, value.customerPhone, value.deliveryAddress, value.city || 'N/A']
    );

    const orderId = orderResult.insertId;

    for (const item of value.items) {
      await conn.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.menuItemId, item.quantity, item.price]
      );
    }

    await conn.commit();

    res.status(201).json({ 
      orderId: orderId,
      message: 'Order placed successfully',
      status: 'PENDING',
      total: value.totalAmount 
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// Guest order endpoint - allows orders without user accounts
router.post('/guest', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { error, value } = guestOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    await conn.beginTransaction();

    // Create a basic order record (using existing user_id and restaurant_id for guest orders)
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, restaurant_id, total, status) VALUES (?, ?, ?, ?)',
      [7, 7, value.totalAmount, 'PENDING']
    );

    const orderId = orderResult.insertId;

    // Add order items
    for (const item of value.items) {
      await conn.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.menuItemId, item.quantity, item.price]
      );
    }

    await conn.commit();

    res.status(201).json({ 
      orderId: orderId,
      status: 'PENDING',
      total: value.totalAmount,
      message: 'Order placed successfully',
      customerInfo: {
        name: value.customerName,
        phone: value.customerPhone,
        address: value.deliveryAddress,
        city: value.city
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Guest order error:', err);
    next(err);
  } finally {
    conn.release();
  }
});

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // If admin, return all orders; if user, return only their orders
    let query, params;
    if (req.user.role === 'admin') {
      query = 'SELECT * FROM orders ORDER BY id DESC';
      params = [];
    } else {
      query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC';
      params = [req.user.userId];
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Place before "/:id" to avoid route shadowing
router.get('/user/:userId', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderRows[0];
    const [[user]] = await pool.query('SELECT id, name, email, phone FROM users WHERE id = ?', [order.user_id]);
    const [[restaurant]] = await pool.query('SELECT id, name, location, rating FROM restaurants WHERE id = ?', [order.restaurant_id]);
    const [items] = await pool.query(
      `SELECT oi.menu_item_id, mi.name, oi.quantity, oi.price
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    res.json({ ...order, user, restaurant, items });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    
    // Get the order to check ownership and current status
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderRows[0];
    
    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }
    
    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ 
        error: `Cannot cancel order in ${order.status} status. Only PENDING and CONFIRMED orders can be cancelled.` 
      });
    }
    
    // Update order status to CANCELLED
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['CANCELLED', orderId]);
    
    // Get updated order
    const [updatedRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    
    res.json({
      message: 'Order cancelled successfully',
      order: updatedRows[0]
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', async (req, res, next) => {
  try {
    const schema = Joi.object({ status: Joi.string().valid(...allowedStatuses).required() });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const [[order]] = await pool.query('SELECT status FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!nextStatusMap[order.status].includes(value.status)) {
      return res.status(400).json({ error: `Invalid transition from ${order.status} to ${value.status}` });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [value.status, req.params.id]);
    const [[updated]] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    const [result] = await conn.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

export default router;
