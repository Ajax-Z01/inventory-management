class ProductDTO {
    constructor(name, price, stock) {
      this.name = name;
      this.price = price;
      this.stock = stock;
    }
  
    // Validate product data
    static validate(data) {
      if (
        typeof data.name === 'string' && data.name.trim() !== '' &&
        typeof data.price === 'number' && data.price >= 0 &&
        Number.isInteger(data.stock) && data.stock >= 0
      ) {
        return true;
      }
      return false;
    }
  
    // Transform data to Firestore format
    static transformToFirestore(data) {
      return {
        name: data.name.trim(),
        price: data.price,
        stock: data.stock,
      };
    }
    
    // Transform data from Firestore to DTO format
    static transformFromFirestore(doc) {
      return new ProductDTO(doc.name, doc.price, doc.stock);
    }
  }
  
  module.exports = ProductDTO;
  