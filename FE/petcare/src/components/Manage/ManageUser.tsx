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
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [usersPerPage] = useState(15);
  const [isStatus, setStatus] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToChangeStatus, setUserToChangeStatus] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);


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


  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const isDuplicateUser = (data) => {
    const duplicateEmail = users.some(
      (user) => user.email === data.email
    );
    const duplicatePhone = users.some(
      (user) => user.phone === data.phone
    );

    if (duplicateEmail) {
      setMessage("Email đã tồn tại.");
      return true;
    }

    if (duplicatePhone) {
      setMessage("Số điện thoại đã tồn tại.");
      return true;
    }

    return false;
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleUserSubmit = async (data) => {

    if (isDuplicateUser(data)) return;

    const userData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      userRoles: selectedRoles.map((roleId) => ({ roleId })),
      registrationDate: new Date().toISOString(),
      imageUrl: imagePreview || null,
      status: isStatus,
    };

    if (file) {
      setIsUploading(true);
      const fileRef = ref(storage, `user_images/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          setMessage("Lỗi khi tải ảnh lên.");
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            userData.imageUrl = downloadURL;
            await submitUserData(userData);

            // Clear image-related inputs
            setFile(null);
            setImagePreview(null);
          } catch (err) {
            setMessage("Lỗi khi hoàn tất tải lên.");
            setIsUploading(false);
          }
        }
      );
    } else {
      await submitUserData(userData); // If no image, submit directly
    }
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImagePreview(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };


  const submitUserData = async (userData) => {
    try {
      setIsSubmitting(true);
      await UserService.createUser(userData);
      setMessage("Thêm người dùng thành công.");
      await fetchUsers(); // Fetch updated user list
      handleCloseModal(); // Close modal after submit
    } catch (error) {
      setMessage("Lỗi khi lưu người dùng.");
    } finally {
      setIsSubmitting(false);
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
    setSelectedRoles([]);
    setFile(null);
    setStatus(true);
    setMessage("");
  };

  const filteredUsers = users.filter((user) => {
    // Exclude users with the "Người dùng" role
    const hasUserRole = user.userRoles.some(role => role.roleName === "Người dùng");

    return !hasUserRole && (
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm))
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
            Hoạt động
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-2 ${activeTab === "inactive" ? "bg-blue-600 text-white" : "bg-gray-200"} rounded-md transition duration-200`}
          >
            Không hoạt Động
          </button>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Thêm Nhân Viên
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-blue-600 to-blue-650">
            <th className="px-4 py-2 text-left text-white">#</th> {/* Added Row Number */}
            <th className="px-4 py-2 text-left text-white">Họ và tên</th>
            <th className="px-4 py-2 text-left text-white">Email</th>
            <th className="px-4 py-2 text-left text-white">Số điện thoại</th>
            <th className="px-4 py-2 text-left text-white">Vai trò</th>
            <th className="px-4 py-2 text-left text-white">Trạng thái</th>
            <th className="px-4 py-2 text-left text-white">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user, index) => (
            <tr
              key={user.userId}
              className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-100`}
            >
              <td className="px-4 py-2 text-gray-700 text-left">{currentPage * usersPerPage + index + 1}</td> {/* Row Number */}
              <td className="px-4 py-2 text-gray-700 text-left">{user.fullName}</td>
              <td className="px-4 py-2 text-gray-700 text-left">{user.email}</td>
              <td className="px-4 py-2 text-gray-700 text-left">{user.phone}</td>
              <td className="px-4 py-2 text-gray-500 text-left">
                {user.userRoles
                  .filter((role) => role.roleName !== "Người dùng")
                  .map((role) => (
                    <span key={role.roleId} className="mr-2">
                      {role.roleName}
                    </span>
                  ))}
              </td>
              <td className="px-4 py-2 text-gray-500 text-left">{renderStatus(user.status)}</td>
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
            <p className="text-center">Bạn có chắc chắn muốn đổi trạng thái của nhân viên này?</p>
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
            Trang {currentPage + 1}
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






      {/* Modal for Add */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-6xl"
            style={{ overflowY: "auto" }}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Thêm nhân viên</h2>

            <form onSubmit={handleSubmit(handleUserSubmit)} className="flex gap-6">
              {/* Left Column */}
              <div className="w-1/3">
                <div className="mb-6">
                  <label className="block font-medium mb-2">Ảnh</label>
                  <div className="flex items-center justify-center border border-gray-300 rounded-md p-4 relative">
                    {!imagePreview && (
                      <span className="text-gray-400 text-sm">
                        Nhấn để chọn ảnh hoặc kéo thả
                      </span>
                    )}
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="image-preview"
                        className="object-contain rounded-md w-96 h-72" // Set larger width and height
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {imagePreview && (
                    <button
                      onClick={() => {
                        setImagePreview(null); // Clear the preview
                        setFile(null); // Clear the selected file
                      }}
                      className="mt-2 bg-red-500 text-white px-3 py-1 rounded-md shadow-md"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
              </div>





              {/* Right Column */}
              <div className="w-2/3">
                <div className="mb-4">
                  <label className="block font-medium mb-2">Họ và tên</label>
                  <input
                    type="text"
                    {...register("fullName", {
                      required: "Tên đầy đủ không được để trống.",
                      maxLength: {
                        value: 50,
                        message: "Tên không được dài quá 50 ký tự.",
                      },
                      pattern: {
                        value: /^[^\d!@#$%^&*(),.?":{}|<>]*$/,
                        message: "Tên không hợp lệ",
                      },
                    })}
                    className="w-full border border-gray-300 p-3 rounded-md"
                    placeholder="Nhập đầy đủ họ và tên"
                  />
                  {errors.fullName && <span className="text-red-500">{errors.fullName.message}</span>}
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">Email</label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email không được để trống.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email không hợp lệ.",
                      },
                      validate: (value) =>
                        !users.some((user) => user.email === value) || "Email đã tồn tại.",
                    })}
                    className="w-full border border-gray-300 p-3 rounded-md"
                    placeholder="Nhập Email"
                  />
                  {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">Số điện thoại</label>
                  <input
                    type="text"
                    {...register("phone", {
                      required: "Số điện thoại không được để trống.",
                      pattern: {
                        value: /^(03|07|08|09)\d{8,9}$/,
                        message: "Số điện thoại không hợp lệ.",
                      },
                      validate: (value) =>
                        !users.some((user) => user.phone === value) || "Số điện thoại đã tồn tại.",
                    })}
                    className="w-full border border-gray-300 p-3 rounded-md"
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <span className="text-red-500">{errors.phone.message}</span>}
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">Mật khẩu</label>
                  <input
                    type="password"
                    {...register("password", {
                      required: "Mật khẩu không được để trống.",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự.",
                      },
                    })}
                    className="w-full border border-gray-300 p-3 rounded-md"
                    placeholder="Nhập mật khẩu"
                  />
                  {errors.password && <span className="text-red-500">{errors.password.message}</span>}
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">Vai trò</label>
                  <select
                    {...register("roles", {
                      required: "Vai trò không được để trống.",
                    })}
                    onChange={handleRoleChange}
                    className="w-full border border-gray-300 p-3 rounded-md"
                  >
                    <option value=""></option>
                    {roles
                      .filter((role) => role.roleName === "Nhân viên")  // Filter only "Nhân viên"
                      .map((role) => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.roleName}
                        </option>
                      ))}
                  </select>
                  {errors.roles && <span className="text-red-500">{errors.roles.message}</span>}
                </div>


                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 bg-gray-400 text-white rounded-md"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 ${isSubmitting ? "bg-gray-400" : "bg-blue-600"} text-white rounded-md`}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Lưu"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

