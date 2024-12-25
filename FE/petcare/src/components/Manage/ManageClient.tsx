import React, { useEffect, useState } from "react";
import UserService from "../../service/UserService";

const ClientManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 20; // Number of users per page

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userList = await UserService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Lỗi khi lấy người dùng:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const isUserRole = user.userRoles?.some(role => role.roleName === "Người dùng");
    if (!isUserRole) return false;

    if (!searchTerm.trim()) return true;

    const search = searchTerm.toLowerCase();
    const nameMatch = user.fullName?.toLowerCase()?.includes(search) || false;
    const phoneMatch = user.phone?.includes(searchTerm) || false;

    return nameMatch || phoneMatch;
  });

  // Paginate users
  const paginatedUsers = filteredUsers.slice(currentPage * usersPerPage, (currentPage + 1) * usersPerPage);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Quản Lý Người Dùng</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600">
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tên Đầy Đủ</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Số Điện Thoại</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ngày Đăng Ký</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tổng Chi Tiêu</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Trạng Thái</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ảnh</th>
              <th className="p-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vai Trò</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user, index) => (
              <tr key={user.userId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-200`}>
                <td className="p-3 whitespace-nowrap text-sm text-gray-900">{user.userId}</td>
                <td className="p-3 whitespace-nowrap text-sm text-gray-900 font-medium">{user.fullName || ''}</td>
                <td className="p-3 whitespace-nowrap text-sm text-gray-600">{user.email || ''}</td>
                <td className="p-3 whitespace-nowrap text-sm text-gray-600">{user.phone || ''}</td>
                <td className="p-3 whitespace-nowrap text-sm text-gray-600">
                  {user.registrationDate 
                    ? new Date(user.registrationDate).toLocaleDateString("vi-VN")
                    : ''}
                </td>
                <td className="p-3 whitespace-nowrap text-sm text-gray-600">
                  {user.totalSpent ? `${user.totalSpent.toLocaleString()} đ` : "0 đ"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status ? "Hoạt động" : "Vô hiệu hóa"}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Không có ảnh</span>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    {user.userRoles?.map((role) => role.roleName).join(", ") || ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md disabled:opacity-50"
        >
          Trước
        </button>
        <div>
          Trang {currentPage + 1} của {totalPages}
        </div>
        <button
          disabled={currentPage === totalPages - 1}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md disabled:opacity-50"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
};

export default ClientManagement;
