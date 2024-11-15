import axios from 'axios';

// Base URL của API ProductSize
const BASE_URL = 'http://localhost:8080/api/product-sizes';

const ProductSizeService = {
    // Lấy danh sách tất cả các ProductSize
    getAllProductSizes: async () => {
        try {
            const response = await axios.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching product sizes:', error);
            throw error;
        }
    },

    // Lấy thông tin ProductSize theo ID
    getProductSizeById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product size with ID ${id}:`, error);
            throw error;
        }
    },

    // Thêm mới ProductSize
    createProductSize: async (productSize) => {
        try {
            const response = await axios.post(BASE_URL, productSize);
            return response.data;
        } catch (error) {
            console.error('Error creating product size:', error);
            throw error;
        }
    },

    // Cập nhật ProductSize theo ID
    updateProductSize: async (id, updatedProductSize) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, updatedProductSize);
            return response.data;
        } catch (error) {
            console.error(`Error updating product size with ID ${id}:`, error);
            throw error;
        }
    },

    // Xóa ProductSize theo ID
    deleteProductSize: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            console.error(`Error deleting product size with ID ${id}:`, error);
            throw error;
        }
    },
};

export default ProductSizeService;
