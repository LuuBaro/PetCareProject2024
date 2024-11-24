import axios from 'axios';

// Base URL của API
const BASE_URL = 'http://localhost:8080/api/product-colors';

const ProductColorService = {
  // Lấy danh sách tất cả các ProductColor
  getAllProductColors: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching product colors:', error);
      throw error;
    }
  },

  // Lấy thông tin ProductColor theo ID
  getProductColorById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product color with ID ${id}:`, error);
      throw error;
    }
  },

  // Thêm mới ProductColor
  createProductColor: async (productColor) => {
    try {
      const response = await axios.post(BASE_URL, productColor);
      return response.data;
    } catch (error) {
      console.error('Error creating product color:', error);
      throw error;
    }
  },

  // Cập nhật ProductColor theo ID
  updateProductColor: async (id, productColor) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, productColor);
      return response.data;
    } catch (error) {
      console.error(`Error updating product color with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa ProductColor theo ID
  deleteProductColor: async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting product color with ID ${id}:`, error);
      throw error;
    }
  },
};

export default ProductColorService;
