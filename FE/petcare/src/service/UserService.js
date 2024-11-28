import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/users';

const UserService = {
  
  // Lấy tất cả người dùng
  getAllUsers: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Lấy người dùng theo ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },

  // Tạo mới người dùng
  createUser: async (user) => {
    try {
      const response = await axios.post(BASE_URL, user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Cập nhật người dùng
  updateUser: async (id, updatedUser) => {
    try {
      // Kiểm tra ID và dữ liệu cập nhật có hợp lệ không
      if (!id) throw new Error('User ID is required');
      if (!updatedUser || typeof updatedUser !== 'object') {
        throw new Error('Updated user data must be provided as an object');
      }

      const response = await axios.put(`${BASE_URL}/${id}`, updatedUser, {
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần thêm token:
          // Authorization: `Bearer ${yourAuthToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error?.response?.data || error.message);
      // Quăng lỗi để xử lý thêm ở nơi gọi hàm
      throw error.response?.data || error;
    }
  },

  // Xóa người dùng
  deleteUser: async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  },
};

export default UserService;
