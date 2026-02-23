import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/merchant/dashboard
 * Merchant dashboard statistics
 */
router.get('/dashboard', protect, (req, res) => {
  res.json({ message: 'Merchant dashboard endpoint' });
});

/**
 * POST /api/merchant/products
 * Create product
 */
router.post('/products', protect, (req, res) => {
  res.json({ message: 'Create product endpoint' });
});

/**
 * GET /api/merchant/products
 * Get merchant products
 */
router.get('/products', protect, (req, res) => {
  res.json({ message: 'Get products endpoint' });
});

/**
 * PUT /api/merchant/products/:id
 * Update product
 */
router.put('/products/:id', protect, (req, res) => {
  res.json({ message: 'Update product endpoint' });
});

/**
 * DELETE /api/merchant/products/:id
 * Delete product
 */
router.delete('/products/:id', protect, (req, res) => {
  res.json({ message: 'Delete product endpoint' });
});

/**
 * GET /api/merchant/sales
 * Get sales statistics
 */
router.get('/sales', protect, (req, res) => {
  res.json({ message: 'Get sales endpoint' });
});

/**
 * GET /api/merchant/payouts
 * Get payouts
 */
router.get('/payouts', protect, (req, res) => {
  res.json({ message: 'Get payouts endpoint' });
});

export default router;
