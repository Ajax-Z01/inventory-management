const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('firebase-admin').firestore();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new category
router.post(
  '/',
  [
    check('name').notEmpty().withMessage('Category name is required'),
    check('description').optional().isString().withMessage('Description must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newCategory = req.body;
      const docRef = await db.collection('categories').add(newCategory);
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update category
router.put(
  '/:id',
  [
    check('name').optional().notEmpty().withMessage('Category name cannot be empty'),
    check('description').optional().isString().withMessage('Description must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updatedCategory = req.body;
      await db.collection('categories').doc(id).update(updatedCategory);
      res.json({ message: 'Category updated' });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('categories').doc(id).delete();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
