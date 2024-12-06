// src/service/ClientService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/users"; // Replace with your actual API base URL

// Function to update user status
const updateUserStatus = async (userId, updatedUser) => {
  try {
    const response = await axios.patch(`${API_URL}/update-status/${userId}`, updatedUser);
    return response.data; // Return updated user data
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

export default {
  updateUserStatus,
};
