import axios from "axios";

const BASE_URL = "http://localhost:8080/api/product-details";  // Adjust URL as needed

const ProductDetailService = {
  // Create or Update a ProductDetail
  saveOrUpdateProductDetail: async (productDetail) => {
    try {
      const token = localStorage.getItem('token');  // Get token from localStorage
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}; // Add token to headers

      const response = productDetail.productDetailId
          ? await axios.put(`${BASE_URL}/${productDetail.productDetailId}`, productDetail, config)
          : await axios.post(BASE_URL, productDetail, config);  // Create or update the product detail

      return response.data;
    } catch (error) {
      console.error("Error saving or updating product detail:", error.response ? error.response.data : error.message);
      throw error; // Re-throw the error to handle it in your component
    }
  },

  // Get all ProductDetails
  getAllProductDetails: async () => {
    try {
      const token = localStorage.getItem('token');  // Get token from localStorage
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}; // Add token to headers

      const response = await axios.get(BASE_URL, config);  // Fetch all product details
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Get a ProductDetail by ID
  getProductDetailById: async (id) => {
    try {
      const token = localStorage.getItem('token');  // Get token from localStorage
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}; // Add token to headers

      const response = await axios.get(`${BASE_URL}/${id}`, config);  // Fetch product detail by ID
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail by ID:", error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Delete a ProductDetail by ID
  deleteProductDetail: async (id) => {
    try {
      const token = localStorage.getItem('token');  // Get token from localStorage
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}; // Add token to headers

      await axios.delete(`${BASE_URL}/${id}`, config);  // Delete product detail by ID
    } catch (error) {
      console.error("Error deleting product detail:", error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Get ProductDetails by Product ID
  getProductDetailsByProductId: async (productId) => {
    try {
      const token = localStorage.getItem('token');  // Get token from localStorage
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}; // Add token to headers

      const response = await axios.get(`${BASE_URL}/by-product/${productId}`, config);  // Fetch product details by product ID
      return response.data;
    } catch (error) {
      console.error("Error fetching product details by product ID:", error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Update Product Quantity
  updateProductQuantity: async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');  // Get token from localStorage
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}; // Add token to headers

      const response = await axios.put(`${BASE_URL}/update-quantity/${productId}`, { quantity: newQuantity }, config);  // Update product quantity
      return response.data;
    } catch (error) {
      console.error("Error updating product quantity:", error.response ? error.response.data : error.message);
      throw error;
    }
  },
};

export default ProductDetailService;
