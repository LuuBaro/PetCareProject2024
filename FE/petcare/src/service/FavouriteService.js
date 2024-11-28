import axios from 'axios';

const BASE_URL = '/api/favourites'; // Base URL for Favourite API

const FavouriteService = {
    getFavouritesByUser: async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching favourites by user:', error);
            throw error;
        }
    },

    getFavouritesByProduct: async (productId) => {
        try {
            const response = await axios.get(`${BASE_URL}/product/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching favourites by product:', error);
            throw error;
        }
    },

    getFavouriteByUserAndProduct: async (userId, productId) => {
        try {
            const response = await axios.get(`${BASE_URL}/user/${userId}/product/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching favourite by user and product:', error);
            throw error;
        }
    },

    addFavourite: async (favourite) => {
        try {
            const response = await axios.post(BASE_URL, favourite);
            return response.data;
        } catch (error) {
            console.error('Error adding favourite:', error);
            throw error;
        }
    },

    removeFavouriteById: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            console.error('Error removing favourite by ID:', error);
            throw error;
        }
    },

    removeFavouriteByUserAndProduct: async (userId, productId) => {
        try {
            await axios.delete(`${BASE_URL}/user/${userId}/product/${productId}`);
        } catch (error) {
            console.error('Error removing favourite by user and product:', error);
            throw error;
        }
    },

    getFavoritesFromLocalStorage: () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites;
    },

    saveFavoritesToLocalStorage: (favorites) => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
};

export default FavouriteService;
