import { Router } from 'express';
import pool from '../db.js';
import Joi from 'joi';

const router = Router();

const restaurantSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  location: Joi.string().min(2).max(255).required(),
  rating: Joi.number().min(0).max(5).default(0),
});

router.post('/', async (req, res, next) => {
  try {
    const { error, value } = restaurantSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const [result] = await pool.query(
      'INSERT INTO restaurants (name, location, rating) VALUES (?, ?, ?)',
      [value.name, value.location, value.rating]
    );
    const [rows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM restaurants ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// New: fetch menu for a restaurant (alias for /api/menu/restaurant/:restaurantId)
router.get('/:id/menu', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/rating', async (req, res, next) => {
  try {
    const schema = Joi.object({ rating: Joi.number().min(0).max(5).required() });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const [result] = await pool.query('UPDATE restaurants SET rating = ? WHERE id = ?', [value.rating, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Restaurant not found' });

    const [rows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM restaurants WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
