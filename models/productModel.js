const db = require('firebase-admin').firestore();
const ProductDTO = require('../dtos/productDTO');

const getProducts = async () => {
  const snapshot = await db.collection('products').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const addProduct = async (productData) => {
  const product = new ProductDTO(productData.name, productData.price, productData.stock);
  const transformedProduct = ProductDTO.transformToFirestore(product);
  const docRef = await db.collection('products').add(transformedProduct);
  return docRef.id;
};

const updateProduct = async (id, productData) => {
  const product = new ProductDTO(productData.name, productData.price, productData.stock);
  const transformedProduct = ProductDTO.transformToFirestore(product);
  await db.collection('products').doc(id).update(transformedProduct);
};

const deleteProduct = async (id) => {
  await db.collection('products').doc(id).delete();
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
