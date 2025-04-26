const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('firebase-admin').firestore();

// Get all products
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new product
router.post(
  '/',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newProduct = req.body;
      const docRef = await db.collection('products').add(newProduct);
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update product
router.put(
  '/:id',
  [
    check('name').optional().notEmpty().withMessage('Name cannot be empty'),
    check('price').optional().isNumeric().withMessage('Price must be a number'),
    check('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updatedProduct = req.body;
      await db.collection('products').doc(id).update(updatedProduct);
      res.json({ message: 'Product updated' });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
