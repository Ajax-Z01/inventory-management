const { validationResult } = require('express-validator');
const productModel = require('../models/productModel');
const ProductDTO = require('../dtos/productDTO');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await productModel.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newProduct = req.body;
    if (!ProductDTO.validate(newProduct)) {
      return res.status(400).json({ message: 'Invalid product data' });
    }

    const productId = await productModel.addProduct(newProduct);
    res.status(201).json({ id: productId });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updatedProduct = req.body;

    if (!ProductDTO.validate(updatedProduct)) {
      return res.status(400).json({ message: 'Invalid product data' });
    }

    await productModel.updateProduct(id, updatedProduct);
    res.json({ message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.deleteProduct(id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
