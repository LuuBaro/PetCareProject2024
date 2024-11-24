import axios from "axios";

const BASE_URL = "http://localhost:8080/api/product-details";

const ProductDetailService = {
  // Create or Update a ProductDetail
  createProductDetail: async (productDetail) => {
    try {
      const response = await axios.post(BASE_URL, productDetail);
      return response.data;
    } catch (error) {
      console.error("Error creating product detail:", error);
      throw error;
    }
  },

  updateProductDetail: async (id, productDetail) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, productDetail);
      return response.data;
    } catch (error) {
      console.error("Error updating product detail:", error);
      throw error;
    }
  },

  // Get all ProductDetails
  getAllProductDetails: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  },

  // Get a ProductDetail by ID
  getProductDetailById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail by ID:", error);
      throw error;
    }
  },

  // Delete a ProductDetail by ID
  deleteProductDetail: async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error("Error deleting product detail:", error);
      throw error;
    }
  },

  // Get all ProductDetails by Product ID
  getAllProductDetailsByProductId: async (productId) => {
    try {
      const response = await axios.get(`${BASE_URL}/by-product/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product details by product ID:", error);
      throw error;
    }
  },
};

export default ProductDetailService;
