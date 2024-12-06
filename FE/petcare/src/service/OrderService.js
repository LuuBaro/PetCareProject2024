import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // Đường dẫn API backend của bạn

export const OrderService = {
    // Hàm lấy tất cả đơn hàng
    getAllOrders: async () => {
        return await axios.get(API_URL);
    },

    // Hàm lấy đơn hàng của một user cụ thể
    getUserOrders: async (userId) => {
        return await axios.get(`${API_URL}/user/${userId}`);
    },

    // Hàm lấy chi tiết một đơn hàng
    getOrderDetails: async (orderId) => {
        return await axios.get(`${API_URL}/${orderId}`);
    },

    getRevenueBetweenDates: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${API_URL}/revenue`, {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching revenue from ${startDate} to ${endDate}:`, error);
            throw error;
        }
    },

    getLast12MonthsRevenue: async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(`${API_URL}/revenue/last-12-months`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Đặt token trong Header
                },
            });

            // Xử lý dữ liệu trả về từ API nếu cần
            const formattedData = response.data.map(item => ({
                year: item.year,
                month: item.month,
                totalRevenue: item.totalRevenue.toFixed(2), // Định dạng số liệu
            }));

            return formattedData;
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            throw new Error('Unable to fetch revenue data. Please try again later.');
        }
    },
};
