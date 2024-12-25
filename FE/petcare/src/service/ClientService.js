import axios from "axios";

const UserService = {
  getAllUsers: async () => {
    const response = await axios.get("/api/users"); // Replace with your actual endpoint
    return response.data; // Ensure the backend returns user data in the correct format
  },
};

export default UserService;
