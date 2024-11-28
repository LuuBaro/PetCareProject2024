import React, { useEffect, useState } from "react";
import UserService from "../../service/UserService";
import RoleService from "../../service/RoleService";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebaseConfig";
import { useForm } from "react-hook-form";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formMode, setFormMode] = useState("add");
  const [userToEdit, setUserToEdit] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [usersPerPage] = useState(10);
  const [isStatus, setStatus] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleEdit = (user) => {
    setUserToEdit(user);
    setFormMode("edit");
    setSelectedRoles(user.userRoles.map((role) => role.roleId));
    setStatus(user.status);
    setIsModalOpen(true);
    reset({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    });
  };


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await UserService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      setMessage("Lỗi khi lấy danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const roleList = await RoleService.getAllRoles();
      setRoles(roleList);
    } catch (error) {
      setMessage("Lỗi khi lấy danh sách vai trò.");
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const isDuplicateUser = (data) => {
    return users.some(user =>
      (user.email === data.email && user.userId !== (userToEdit?.userId || null)) ||
      (user.phone === data.phone && user.userId !== (userToEdit?.userId || null))
    );
  };

  const handleUserSubmit = async (data) => {
    const userData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      totalSpent: userToEdit?.totalSpent || 0,
      password: data.password || undefined, // If password is not provided, it will be undefined
      userRoles: selectedRoles.map((roleId) => ({ roleId })),
      registrationDate: formMode === "edit" ? userToEdit.registrationDate : new Date().toISOString(),
      imageUrl: userToEdit?.imageUrl || null,
      status: isStatus,
    };

    if (file) {
      const fileRef = ref(storage, `user_images/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          setMessage("Lỗi khi tải ảnh lên.");
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            userData.imageUrl = downloadURL;
            await submitUserData(userData);
          } catch (err) {
            setMessage("Lỗi khi hoàn tất tải lên.");
          }
        }
      );
    } else {
      await submitUserData(userData);
    }
  };

  const submitUserData = async (userData) => {
    try {
      if (formMode === "edit") {
        await UserService.updateUser(userToEdit.userId, userData);
        setMessage("Cập nhật người dùng thành công.");
      } else {
        await UserService.createUser(userData);
        setMessage("Thêm người dùng thành công.");
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      setMessage("Lỗi khi lưu người dùng.");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        await UserService.deleteUser(userId);
        fetchUsers();
        setMessage("Xóa người dùng thành công.");
      } catch (error) {
        setMessage("Lỗi khi xóa người dùng.");
      }
    }
  };

  const handleRoleChange = (e) => {
    const options = e.target.options;
    const value = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedRoles(value);
  };

  const resetForm = () => {
    reset({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      roles: [],
    });

    setUserToEdit(null);
    setFormMode("add");
    setSelectedRoles([]); // If you're using checkboxes or a multi-select
    setFile(null);
    setStatus(true); // Reset status to true (active)
    setMessage(""); // Clear any messages


  };

  const filteredUsers = users.filter((user) => {
    const hasUserRole = user.userRoles.some(role => role.roleName === "Người dùng");
    return (
      !hasUserRole && // Exclude users with the role "Người dùng"
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Nhân viên</h1>
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
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Thêm Người Dùng
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{formMode === "add" ? "Thêm Người Dùng" : "Chỉnh Sửa Người Dùng"}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 "
                aria-label="Close"
              >
                &times; {/* Close icon */}
              </button>
            </div>
            <form onSubmit={handleSubmit(handleUserSubmit)}>
              <div className="flex gap-6">
                <div className="w-full sm:w-1/3">
                  <label className="block font-medium mb-1">Hình ảnh</label>
                  <div className="relative w-[275px] h-[300px] border border-gray-300 rounded-md overflow-hidden">
                    {userToEdit && userToEdit.imageUrl ? (
                      <img
                        src={userToEdit.imageUrl}
                        alt="User"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">Chưa có ảnh</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border border-blue-500 p-3 rounded-md mt-2"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
                <div className="w-full sm:w-2/3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-medium mb-1">Tên Đầy Đủ</label>
                      <input
                        type="text"
                        {...register("fullName", {
                          required: "Tên đầy đủ không được để trống.",
                          pattern: {
                            value: /^[^\d!@#$%^&*()_+=-]+$/,
                            message: "Tên không được chứa ký tự đặc biệt hoặc số."
                          }
                        })}
                        className="w-full border border-gray-300 p-2 rounded-md"
                      />
                      {errors.fullName && <div className="text-red-600 text-sm">{errors.fullName.message}</div>}
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Email</label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email không được để trống.",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Email không đúng định dạng."
                          }
                        })}
                        className="w-full border border-gray-300 p-2 rounded-md"
                      />
                      {errors.email && <div className="text-red-600 text-sm">{errors.email.message}</div>}
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Mật Khẩu</label>
                      <input
                        type="password"
                        {...register("password", {
                          required: formMode === "add" ? "Mật khẩu không được để trống." : false,
                          minLength: {
                            value: 8,
                            message: "Mật khẩu phải từ 8 ký tự trở lên."
                          }
                        })}
                        className="w-full border border-gray-300 p-2 rounded-md"
                      />
                      {errors.password && <div className="text-red-600 text-sm">{errors.password.message}</div>}
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Số Điện Thoại</label>
                      <input
                        type="text"
                        {...register("phone", {
                          required: "Số điện thoại không được để trống.",
                          pattern: {
                            value: /^0\d{9}$/, // Must start with 0 and followed by 9 digits
                            message: "Số điện thoại không hợp lệ!"
                          }
                        })}
                        className="w-full border border-gray-300 p-2 rounded-md"
                      />
                      {errors.phone && <div className="text-red-600 text-sm">{errors.phone.message}</div>}
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Vai Trò</label>
                      <select
                        {...register("roles", { required: "Phải chọn vai trò." })}
                        className="w-full border border-gray-300 p-2 rounded-md"
                        value={selectedRoles}
                        onChange={handleRoleChange}
                      >
                        {roles
                          .filter(role => role.roleName !== "Người dùng")
                          .map((role) => (
                            <option key={role.roleId} value={role.roleId}>
                              {role.roleName}
                            </option>
                          ))}
                      </select>
                      {errors.roles && <div className="text-red-600 text-sm">{errors.roles.message}</div>}
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Trạng Thái</label>
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer mr-3">
                          <input
                            type="radio"
                            name="status"
                            value="true"
                            checked={isStatus === true}
                            onChange={() => setStatus(true)}
                            className="w-4 h-4 mr-2"
                          />
                          Hoạt Động
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="false"
                            checked={isStatus === false}
                            onChange={() => setStatus(false)}
                            className="w-4 h-4 mr-2"
                          />
                          Không Hoạt Động
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  {formMode === "add" ? "Thêm Người Dùng" : "Cập Nhật Người Dùng"}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Hủy
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {message && <div className="mb-4 p-3 bg-gray-200 text-center">{message}</div>}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Tên Đầy Đủ</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Số Điện Thoại</th>
              <th className="px-4 py-2">Vai Trò</th>
              <th className="px-4 py-2">Trạng Thái</th>
              <th className="px-4 py-2">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers
              .map((user) => (
                <tr key={user.userId}>
                  <td className="px-4 py-2">{user.fullName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.phone}</td>
                  <td className="px-4 py-2">
                    {user.userRoles && user.userRoles.map((role) => role.roleName).join(", ")}
                  </td>
                  <td className="px-4 py-2">{renderStatus(user.status)}</td>
                  <td className="px-4 py-2">
                    {user.userRoles.some(role => role.roleName === "Admin") ? null : (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="bg-blue-500 text-white p-2 rounded-md mr-2 hover:bg-blue-600 transition duration-200"
                        >
                          Chỉnh Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user.userId)}
                          className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition duration-200"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={currentPage === 0}
          onClick={() => handlePageChange(currentPage - 1)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md disabled:opacity-50"
        >
          Trước
        </button>
        <div className="flex items-center">
          Trang {currentPage + 1} của {totalPages}
        </div>
        <button
          disabled={currentPage === totalPages - 1}
          onClick={() => handlePageChange(currentPage + 1)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md disabled:opacity-50"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
};

export default UserManagement;