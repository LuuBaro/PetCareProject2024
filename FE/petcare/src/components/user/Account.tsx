import React, {useState} from 'react';
import Header from "../header/Header";
import Footer from '../footer/Footer';
import axios from 'axios';
import Sidebar from "../user/Sidebar";
import $ from "jquery";
import Swal from "sweetalert2";

export function Account() {
    const [activeTab, setActiveTab] = useState("account");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: localStorage.getItem('fullName'),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
    });

    const handleEditClick = () => {
        setIsEditing(true); // Switch to edit mode
    };

    const updateUser = async (id, updatedInfo) => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token is missing');
                return; // If token is missing, don't continue
            }

            // Make the API request
            const response = await axios.put(
                `http://localhost:8080/api/users/update/${id}`,
                updatedInfo, // Send the updated user info
                {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Add token to the header
                    }
                }
            );

            console.log('User updated successfully:', response.data);

            // Update localStorage with the new user data
            localStorage.setItem('fullName', response.data.fullName);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('phone', response.data.phone);

            // Update the userInfo state with the new data from the response
            setUserInfo({
                fullName: response.data.fullName,
                email: response.data.email,
                phone: response.data.phone,
            });

        } catch (error) {
            console.error('Error updating user:', error);
            if (error.response && error.response.status === 403) {
                console.error('Forbidden: Check your authorization');
            }
        }
    };

    const handleSaveClick = () => {
        const updatedInfo = {
            fullName: userInfo.fullName,
            email: userInfo.email,
            phone: userInfo.phone,
        };

        const userId = localStorage.getItem('userId');
        updateUser(userId, updatedInfo); // Call updateUser with the new data
        setIsEditing(false); // Switch to view mode after saving
    };

    const handleCancelClick = () => {
        // Reset the userInfo to the original values from localStorage
        setUserInfo({
            fullName: localStorage.getItem('fullName'),
            email: localStorage.getItem('email'),
            phone: localStorage.getItem('phone'),
        });
        setIsEditing(false); // Switch to view mode after canceling
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUserInfo((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateNewPassword = (password) => {
        if (password === currentPassword) {
            setNewPasswordError("Mật khẩu mới không được giống với mật khẩu hiện tại!");
        } else if (password.length < 6) {
            setNewPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự!");
        } else {
            setNewPasswordError(""); // Không có lỗi
        }
    };

    const validateConfirmPassword = (password) => {
        if (password !== newPassword) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp!");
        } else {
            setConfirmPasswordError(""); // Không có lỗi
        }
    };

    const validateInputs = () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId) {
            return "Không tìm thấy thông tin người dùng!";
        }

        if (!token) {
            return "Vui lòng đăng nhập lại để tiếp tục!";
        }

        if (!currentPassword) {
            return "Vui lòng nhập mật khẩu hiện tại!";
        }

        if (!newPassword || newPassword.length < 6) {
            return "Mật khẩu mới phải có ít nhất 6 ký tự!";
        }

        if (newPassword === currentPassword) {
            return "Mật khẩu mới không được giống với mật khẩu hiện tại!";
        }

        if (newPassword !== confirmPassword) {
            return "Mật khẩu mới và xác nhận mật khẩu không khớp!";
        }

        return null; // Không có lỗi
    };

    const handleSave = async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        // Kiểm tra lỗi đầu vào
        const error = validateInputs();
        if (error) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: error,
                confirmButtonText: "OK",
            });
            return;
        }

        // Gửi yêu cầu đổi mật khẩu
        try {
            const response = await axios.put(
                "http://localhost:8080/api/users/change-password",
                {
                    userId, // Đảm bảo gửi đúng định dạng userId mà API yêu cầu
                    currentPassword,
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Hiển thị thông báo thành công
            Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: "Đổi mật khẩu thành công!",
                confirmButtonText: "OK",
            });

            // Reset dữ liệu sau khi thành công
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            // Xử lý lỗi trả về từ API
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: errorMessage,
                confirmButtonText: "OK",
            });
            console.error("Error changing password:", error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "account":
                return (
                    <div className="items-center">
                        <h2 className="text-4xl font-extrabold mb-6 mt-3 text-gray-700">Thông tin cá nhân</h2>
                        <p className="text-sm text-gray-600 mb-6 font-bold italic">
                            Quản lý thông tin hồ sơ để bảo mật tài khoản
                        </p>

                        <div className="flex items-start">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center mr-12">
                                <div
                                    className="w-36 h-36 bg-gray-200 rounded-full flex items-center justify-center relative border-2 border-blue-400">
                                    <span className="text-5xl text-blue-400">👤</span>
                                    <button className="absolute bottom-1 right-1 bg-blue-500 p-2 rounded-full">
                                        <i className="fas fa-pencil-alt text-white"></i>
                                    </button>
                                </div>
                                <button className="mt-4 text-sm text-blue-500 font-semibold">
                                    Thay đổi ảnh đại diện
                                </button>
                            </div>

                            {/* Information Section */}
                            <div className="flex-grow">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Left Section */}
                                    <div>
                                        {/* Full Name */}
                                        <div className="flex items-center mb-4">
                                            <label className="block text-lg font-bold text-gray-700 w-32">Họ &
                                                Tên:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={userInfo.fullName}
                                                    onChange={handleChange}
                                                    className="text-gray-900 text-lg px-4 py-2 border border-gray-300 rounded-lg flex-grow"
                                                />
                                            ) : (
                                                <span className="text-gray-900 text-lg flex-grow">
                                                        {userInfo.fullName || 'Chưa cập nhật'}
                                                    </span>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="flex items-center">
                                            <label
                                                className="block text-lg font-bold text-gray-700 w-32">Email:</label>
                                            <span className="text-gray-900 text-lg flex-grow">
                                                    {userInfo.email
                                                        ? `*****${userInfo.email.slice(userInfo.email.indexOf('@') - 3)}`
                                                        : 'Chưa cập nhật'}
                                                </span>
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div>
                                        {/* Address */}
                                        <div className="flex items-center mb-4">
                                            <label className="block text-lg font-bold text-gray-700 w-32">Địa
                                                chỉ:</label>
                                            <span className="text-gray-900 text-lg flex-grow">
                                                    {userInfo.address || 'Chưa cập nhật'}
                                                </span>
                                            <button
                                                onClick={() => handleUpdateField('address')}
                                                className="text-blue-500 text-sm font-semibold ml-2"
                                            >
                                                Cập nhật
                                            </button>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="flex items-center">
                                            <label className="block text-lg font-bold text-gray-700 w-32">Số điện
                                                thoại:</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={userInfo.phone}
                                                    onChange={handleChange}
                                                    className="text-gray-900 text-lg px-4 py-2 border border-gray-300 rounded-lg flex-grow"
                                                />
                                            ) : (
                                                <span className="text-gray-900 text-lg flex-grow">
                                                        {userInfo.phone ? `****${userInfo.phone.slice(-3)}` : 'Chưa cập nhật'}
                                                    </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                {isEditing ? (
                                    <div className="flex space-x-4 mt-6">
                                        <button
                                            onClick={handleCancelClick}
                                            className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveClick}
                                            className="w-full bg-blue-500 text-white py-3 rounded-lg"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEditClick}
                                        className="mt-6 w-[150px] bg-blue-500 text-white py-3 rounded-lg"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case "changePassword":
                return (
                    <div className="items-center">
                        <h3 className="text-4xl font-extrabold mb-6 mt-3 text-gray-700">Đổi Mật Khẩu</h3>

                        <div id="passwordSuccess" className="hidden text-green-500 font-semibold mb-4"></div>
                        {/* Mật khẩu hiện tại */}
                        <div>
                            <label
                                htmlFor="currentPassword"
                                className="block text-lg font-bold text-gray-700 mb-1"
                            >
                                Mật khẩu hiện tại
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                                placeholder="Nhập mật khẩu hiện tại"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        {/* Mật khẩu mới */}
                        <div>
                            <label
                                htmlFor="newPassword"
                                className="block text-lg font-bold text-gray-700 mb-1"
                            >
                                Mật khẩu mới
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-2"
                                placeholder="Nhập mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    validateNewPassword(e.target.value);
                                }}
                            />
                            {newPasswordError && (
                                <span className="text-red-500 text-sm">{newPasswordError}</span>
                            )}
                        </div>

                        {/* Xác nhận mật khẩu mới */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-lg font-bold text-gray-700 mb-1"
                            >
                                Xác nhận mật khẩu mới
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="Xác nhận mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    validateConfirmPassword(e.target.value);
                                }}
                            />
                            {confirmPasswordError && (
                                <span className="text-red-500 text-sm">{confirmPasswordError}</span>
                            )}
                        </div>

                        {/* Nút lưu */}
                        <div className="mt-6 flex">
                            <button
                                onClick={handleSave}
                                className="w-1/3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>

                );
            case "orderHistory":
                return <div>Lịch Sử Mua Hàng</div>;
            case "favorites":
                return <div>Sản Phẩm Yêu Thích</div>;
            case "reviews":
                return <div>Đánh Giá Sản Phẩm</div>;
            case "vouchers":
                return <div>Kho Voucher</div>;
            case "petcareXu":
                return <div>Petcare Xu</div>;
            case "support":
                return <div>Hỗ Trợ Khách Hàng</div>;
            default:
                return <div>Chọn một mục bên trái để xem nội dung</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header/>

            <div className="flex-grow mx-32 p-10 bg-white rounded-lg flex mt-5">
                <Sidebar
                    setActiveTab={setActiveTab}
                />
                <div
                    className="w-3/4 pl-10 bg-gray-100"
                    style={{minHeight: '70vh', display: 'flex', flexDirection: 'column'}}
                >
                    {renderContent()}</div>
            </div>
            <Footer/>
        </div>
    );
}