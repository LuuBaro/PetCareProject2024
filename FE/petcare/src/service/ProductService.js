// ProductService.js

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/products';

class ProductService {
  // Fetch all products
  getAllProducts() {
    return axios.get(API_URL);
  }

  // Fetch a product by ID
  getProductById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  // Create a new product
  createProduct(product) {
    return axios.post(API_URL, {
      productName: product.productName,
      productQuantity: product.productQuantity,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      brand: product.brand,
      status: product.status
    });
  }

  // Update an existing product
  updateProduct(id, product) {
    return axios.put(`${API_URL}/${id}`, {
      productName: product.productName,
      productQuantity: product.productQuantity,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      brand: product.brand,
      status: product.status
    });
  }

  // Delete a product by ID
  deleteProduct(id) {
    return axios.delete(`${API_URL}/${id}`);
  }



  getTopSellingProducts() {
    return axios.get(`${API_URL}/top-selling`); // API để lấy sản phẩm bán chạy nhất
}

  getProductsByCategory(categoryId) {
    return axios.get(`${API_URL}/category/${categoryId}`)
        .then(response => {
          // Return the product list from the response
          return response.data;
        })
        .catch(error => {
          // Handle any errors that occur during the API call
          console.error("There was an error fetching products by category:", error);
          throw error; // You may want to handle this error further in your UI
        });
  }
}

export default new ProductService();
