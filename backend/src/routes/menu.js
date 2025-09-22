import { Router } from 'express';
import pool from '../db.js';
import Joi from 'joi';

const router = Router();

const menuSchema = Joi.object({
  restaurant_id: Joi.number().integer().required(),
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().precision(2).positive().required(),
  category: Joi.string().min(2).max(50).required(),
  description: Joi.string().allow('').default(''),
  is_available: Joi.boolean().default(true),
});

router.post('/', async (req, res, next) => {
  try {
    const { error, value } = menuSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const [result] = await pool.query(
      'INSERT INTO menu_items (restaurant_id, name, price, category, description, is_available) VALUES (?, ?, ?, ?, ?, ?)',
      [value.restaurant_id, value.name, value.price, value.category, value.description, value.is_available]
    );
    const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/restaurant/:restaurantId', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [req.params.restaurantId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Menu item not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const schema = Joi.object({
      price: Joi.number().precision(2).positive(),
      is_available: Joi.boolean(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const fields = [];
    const params = [];
    if (value.price !== undefined) {
      fields.push('price = ?');
      params.push(value.price);
    }
    if (value.is_available !== undefined) {
      fields.push('is_available = ?');
      params.push(value.is_available);
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(req.params.id);

    const [result] = await pool.query(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Menu item not found' });

    const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
