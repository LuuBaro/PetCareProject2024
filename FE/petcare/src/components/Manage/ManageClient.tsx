import React, { useEffect, useState } from "react";
import UserService from "../../service/UserService";
import RoleService from "../../service/RoleService";

const ClientManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const userList = await UserService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Lỗi khi lấy người dùng:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const roleList = await RoleService.getAllRoles();
      setRoles(roleList);
    } catch (error) {
      console.error("Lỗi khi lấy vai trò:", error);
    }
  };

  // Lọc người dùng theo vai trò "Người dùng"
  const filteredUsers = users.filter((user) => 
    user.userRoles.some(role => role.roleName === "Người dùng") &&
    (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.phone.includes(searchTerm))
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản Lý Người Dùng</h1>

      {/* Thanh Tìm Kiếm */}
      <div className="mb-6">
        <input
          type="text"
          className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng Người Dùng */}
      <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-left text-sm font-semibold">
            <th className="p-3 border-b">ID</th>
            <th className="p-3 border-b">Tên Đầy Đủ</th>
            <th className="p-3 border-b">Email</th>
            <th className="p-3 border-b">Số Điện Thoại</th>
            <th className="p-3 border-b">Ngày Đăng Ký</th>
            <th className="p-3 border-b">Tổng Chi Tiêu</th>
            <th className="p-3 border-b">Trạng Thái</th>
            <th className="p-3 border-b">Ảnh</th>
            <th className="p-3 border-b">Vai Trò</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.userId} className="hover:bg-gray-100 transition duration-200">
              <td className="p-3 border-b">{user.userId}</td>
              <td className="p-3 border-b">{user.fullName}</td>
              <td className="p-3 border-b">{user.email}</td>
              <td className="p-3 border-b">{user.phone}</td>
              <td className="p-3 border-b">{new Date(user.registrationDate).toLocaleDateString("vi-VN")}</td>
              <td className="p-3 border-b">{user.totalSpent ? user.totalSpent.toFixed(2) : "0.00"}</td>
              <td className="p-3 border-b">{user.status ? "Hoạt động" : "Vô hiệu hóa"}</td>
              <td className="p-3 border-b">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  "Không có ảnh"
                )}
              </td>
              <td className="p-3 border-b">
                {user.userRoles.map((role) => role.roleName).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientManagement;