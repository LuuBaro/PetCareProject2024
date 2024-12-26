import React, { useEffect, useState } from 'react';
import RoleService from '../../service/RoleService'; // Dịch vụ RoleService để gọi API

const ManageRole = () => {
  const [roles, setRoles] = useState([]); // Lưu trữ danh sách roles
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [message, setMessage] = useState(''); // Thông báo cho người dùng
  const [roleToEdit, setRoleToEdit] = useState(null); // Vai trò đang được sửa
  const [formMode, setFormMode] = useState('add'); // Chế độ form

  // Hàm gọi API để lấy danh sách roles
  const fetchRoles = async () => {
    setLoading(true); // Bắt đầu loading
    try {
      const roleList = await RoleService.getAllRoles(); // Gọi API để lấy danh sách roles
      setRoles(roleList); // Cập nhật danh sách roles
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vai trò:', error.response ? error.response.data : error.message); // Log thêm thông tin
      setMessage('Lỗi khi lấy danh sách vai trò.'); // Hiển thị thông báo lỗi
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  useEffect(() => {
    fetchRoles(); // Lấy danh sách roles khi component được render lần đầu
  }, []);

  const handleRoleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    const roleName = e.target.roleName.value.trim(); // Lấy tên vai trò từ form

    // Kiểm tra trùng lặp vai trò
    const isDuplicate = roles.some(role => role.roleName.toLowerCase() === roleName.toLowerCase());

    if (isDuplicate) {
      setMessage('Vai trò này đã tồn tại!'); // Thông báo nếu trùng lặp
      return;
    }

    const roleData = {
      roleName
    };

    try {
      if (formMode === 'edit') {
        await RoleService.updateRole(roleToEdit.roleId, roleData); // Cập nhật vai trò
        setMessage('Cập nhật vai trò thành công!'); // Thông báo thành công
      } else {
        await RoleService.createRole(roleData); // Thêm vai trò mới
        setMessage('Thêm vai trò thành công!'); // Thông báo thành công
      }
      e.target.reset(); // Reset form sau khi thêm/cập nhật thành công
      fetchRoles(); // Cập nhật danh sách vai trò
      setRoleToEdit(null); // Đặt lại form
      setFormMode('add'); // Đặt lại chế độ form
    } catch (error) {
      console.error('Lỗi khi lưu vai trò:', error);
      setMessage('Lỗi khi lưu vai trò.');
    }
  };

  const handleEdit = (role) => {
    setRoleToEdit(role); // Thiết lập vai trò để sửa
    setFormMode('edit'); // Chuyển sang chế độ sửa
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vai trò này không?')) {
      try {
        await RoleService.deleteRole(roleId); // Gọi API để xóa vai trò
        fetchRoles(); // Cập nhật danh sách roles
        setMessage('Xóa vai trò thành công!'); // Thông báo thành công
      } catch (error) {
        console.error('Lỗi khi xóa vai trò:', error);
        setMessage('Lỗi khi xóa vai trò.');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý vai trò</h1>
      {message && <div className="mb-4 text-red-600">{message}</div>} {/* Hiển thị thông báo nếu có */}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleRoleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên vai trò</label>
            <input
              name="roleName"
              type="text"
              defaultValue={roleToEdit ? roleToEdit.roleName : ''} // Nếu đang sửa, điền tên vai trò
              required
              className="border p-3 w-full text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-3 transition duration-300 ease-in-out hover:from-blue-600 hover:to-indigo-700"
          >
            {formMode === 'edit' ? 'Cập nhật' : 'Lưu'}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-gray-600">Đang tải danh sách vai trò...</p> // Hiển thị trạng thái loading
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-md">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider">Tên vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roles.map((role, index) => (
                <tr
                  key={role.roleId}
                  className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-gray-100'} hover:bg-indigo-100 transition-colors duration-200`}
                >
                  <td className="px-4 py-2 text-sm text-gray-700">{role.roleId}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{role.roleName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageRole;
