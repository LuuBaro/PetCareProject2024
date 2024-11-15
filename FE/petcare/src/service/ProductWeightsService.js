import axios from 'axios';

// Base URL của API ProductWeight
const BASE_URL = 'http://localhost:8080/api/product-weights';

const ProductWeightService = {
  // Lấy danh sách tất cả các ProductWeight
  getAllProductWeights: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching product weights:', error);
      throw error;
    }
  },

  // Lấy thông tin ProductWeight theo ID
  getProductWeightById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product weight with ID ${id}:`, error);
      throw error;
    }
  },

  // Tạo mới ProductWeight
  createProductWeight: async (productWeight) => {
    try {
      const response = await axios.post(BASE_URL, productWeight);
      return response.data;
    } catch (error) {
      console.error('Error creating product weight:', error);
      throw error;
    }
  },

  // Cập nhật ProductWeight theo ID
  updateProductWeight: async (id, updatedProductWeight) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, updatedProductWeight);
      return response.data;
    } catch (error) {
      console.error(`Error updating product weight with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa ProductWeight theo ID
  deleteProductWeight: async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting product weight with ID ${id}:`, error);
      throw error;
    }
  },
};

export default ProductWeightService;
