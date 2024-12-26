import React, { useEffect, useState } from "react";
import UserService from "../../service/UserService";
import { useForm } from "react-hook-form";

const ManageClient = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [usersPerPage] = useState(15);
  const [activeTab, setActiveTab] = useState("active");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToChangeStatus, setUserToChangeStatus] = useState(null);

  const { reset } = useForm();


  const handleOpenConfirmModal = (user) => {
    setUserToChangeStatus(user);
    setConfirmModalOpen(true);
  };

  const handleConfirmChangeStatus = async () => {
    if (userToChangeStatus) {
      await handleChangeStatus(userToChangeStatus);
      setConfirmModalOpen(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await UserService.getAllUsers();
      // Filter users whose roleName is "Người dùng"
      const filteredUsers = userList.filter(user =>
        user.userRoles && user.userRoles.some(role => role.roleName === "Người dùng")
      );
      setUsers(filteredUsers);
    } catch (error) {
      setMessage("Lỗi khi lấy danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      ((user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm)))
    );
  });

  const activeUsers = filteredUsers.filter(user => user.status === true);
  const inactiveUsers = filteredUsers.filter(user => user.status === false);

  const paginatedUsers = (activeTab === "active" ? activeUsers : inactiveUsers).slice(currentPage * usersPerPage, (currentPage + 1) * usersPerPage);
  const totalPages = Math.ceil((activeTab === "active" ? activeUsers.length : inactiveUsers.length) / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderStatus = (status) => {
    return status ? "Hoạt động" : "Không hoạt động";
  };

  const handleChangeStatus = async (user) => {
    try {
      const updatedUser = { ...user, status: !user.status };
      await UserService.updateUser(user.userId, updatedUser);
      setMessage("Trạng thái người dùng đã thay đổi.");
      await fetchUsers();
    } catch (error) {
      setMessage("Lỗi khi thay đổi trạng thái.");
    }
  };

  const getRoleName = (userRoles) => {
    if (userRoles && userRoles.length > 0) {
      return userRoles[0].roleName || "Người dùng";
    }
    return "Người dùng";  // Default role if no role is found
  };

  return (
    <div className="container mx-auto px-4 py-8 w-[80%]">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Người dùng</h1>
      <div className="mb-4">
        <input
          type="text"
          className="w-full border border-gray-300 p-3 rounded-md shadow-sm"
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 ${activeTab === "active" ? "bg-blue-600 text-white" : "bg-gray-200"} rounded-md transition duration-200`}
          >
            Hoạt Động
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-2 ${activeTab === "inactive" ? "bg-blue-600 text-white" : "bg-gray-200"} rounded-md transition duration-200`}
          >
            Không Hoạt Động
          </button>
        </div>
      </div>

      {/* User Table */}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-blue-600 to-blue-650">
            <th className="px-4 py-2 text-left text-white ">Họ và tên</th>
            <th className="px-4 py-2 text-left text-white">Email</th>
            <th className="px-4 py-2 text-left text-white">Số điện thoại</th>
            <th className="px-4 py-2 text-left text-white">Ngày đăng ký</th>
            <th className="px-4 py-2 text-left text-white">Tổng chi tiêu</th>
            <th className="px-4 py-2 text-left text-white">Trạng thái</th>
            <th className="px-4 py-2 text-left text-white">Vai trò</th>
            <th className="px-4 py-2 text-left text-white">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user, index) => (
            <tr
              key={user.userId}
              className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-100`}
            >
              <td className="px-4 py-2 text-gray-700">{user.fullName}</td>
              <td className="px-4 py-2 text-gray-700">{user.email}</td>
              <td className="px-4 py-2 text-gray-700">{user.phone}</td>
              <td className="px-4 py-2 text-gray-500">
                {new Date(user.registrationDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-gray-500">{user.totalSpent}</td>
              <td className="px-4 py-2 text-left">
                <span
                  className={`font-bold ${user.status === true ? "text-green-600" : user.status === false ? "text-red-600" : "text-gray-500"}`}
                >
                  {renderStatus(user.status)}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-500">{getRoleName(user.userRoles)}</td> {/* Get role name dynamically */}
              <td className="px-4 py-2 text-left">
                {user.userRoles.some((role) => role.roleName === "Admin") ? (
                  <span className="text-gray-400"></span>
                ) : (
                  <button
                    onClick={() => handleOpenConfirmModal(user)}
                    className="ml-2 bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-md shadow-md"
                  >
                    Đổi Trạng Thái
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-1/3">
            <h2 className="text-xl font-bold mb-4 text-center">Xác Nhận</h2>
            <p className="text-center">Bạn có chắc chắn muốn đổi trạng thái của người dùng này?</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleConfirmChangeStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-md mr-2"
              >
                Có
              </button>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        {/* Pagination Buttons */}
        <div className="flex items-center space-x-3">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg 
        ${currentPage === 0 ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'} 
        transition-colors duration-300`}
          >
            Sau
          </button>

          {/* Current Page Number */}
          <span className="text-gray-600 font-medium">
            Trang {currentPage + 1} / {totalPages}
          </span>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg 
        ${currentPage === totalPages - 1 ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'} 
        transition-colors duration-300`}
          >
            Tiếp
          </button>
        </div>
      </div>


    </div>
  );
};

export default ManageClient;
