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

// Function to log stock changes
const logStockChange = async (productId, changeType, quantity, note) => {
  try {
    const timestamp = new Date();
    await db.collection('stock_changes').add({
      product_id: productId,
      change_type: changeType,
      quantity: quantity,
      timestamp: timestamp,
      note: note || ''
    });
  } catch (error) {
    console.error('Error logging stock change:', error);
  }
};

// Add stock to a product (Increase)
router.post('/add-stock/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity, note } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number' });
  }

  try {
    const productRef = db.collection('products').doc(id);
    const product = await productRef.get();

    if (!product.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedStock = product.data().stock + quantity;
    await productRef.update({ stock: updatedStock });

    // Log the stock change
    await logStockChange(id, 'add', quantity, note);

    res.json({ message: 'Stock added successfully', stock: updatedStock });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: error.message });
  }
});

// Subtract stock from a product (Decrease)
router.post('/subtract-stock/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity, note } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive number' });
  }

  try {
    const productRef = db.collection('products').doc(id);
    const product = await productRef.get();

    if (!product.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedStock = product.data().stock - quantity;
    if (updatedStock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    await productRef.update({ stock: updatedStock });

    // Log the stock change
    await logStockChange(id, 'subtract', quantity, note);

    res.json({ message: 'Stock subtracted successfully', stock: updatedStock });
  } catch (error) {
    console.error('Error subtracting stock:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get stock change history for a product
router.get('/stock-history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.collection('stock_changes').where('product_id', '==', id).orderBy('timestamp', 'desc').get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(history);
  } catch (error) {
    console.error('Error getting stock change history:', error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
