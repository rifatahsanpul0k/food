import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/top-restaurants', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.name, r.location, SUM(oi.quantity * oi.price) AS revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.status IN ('CONFIRMED', 'PREPARING', 'DELIVERED')
      GROUP BY r.id
      ORDER BY revenue DESC
      LIMIT 5;
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/popular-dishes', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT mi.id, mi.name, mi.category, SUM(oi.quantity) AS total_quantity
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY mi.id
      ORDER BY total_quantity DESC
      LIMIT 10;
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/revenue-per-restaurant', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.name, SUM(oi.quantity * oi.price) AS revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.status IN ('CONFIRMED', 'PREPARING', 'DELIVERED')
      GROUP BY r.id
      ORDER BY r.id;
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/active-users', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, COUNT(o.id) AS order_count
      FROM users u
      JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      HAVING order_count > 3
      ORDER BY order_count DESC;
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/avg-order-value-per-user', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, AVG(order_total) AS avg_order_value
      FROM (
        SELECT o.id, o.user_id, SUM(oi.quantity * oi.price) AS order_total
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
      ) ot
      JOIN users u ON u.id = ot.user_id
      GROUP BY u.id
      ORDER BY avg_order_value DESC;
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/popular-category', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT mi.category, SUM(oi.quantity) AS total_quantity
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY mi.category
      ORDER BY total_quantity DESC
      LIMIT 1;
    `);
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

export default router;
