import React, { useState } from 'react';
import Header from "../header/Header";
import Footer from '../footer/Footer';
import { FaUser, FaLock, FaHistory, FaHeart, FaStar, FaGift, FaCoins, FaHeadset } from 'react-icons/fa'
import axios from 'axios';

export function Account() {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: localStorage.getItem('fullName'),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
    });

    const closeModal = () => setShowChangePassword(false);

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
        const { name, value } = e.target;
        setUserInfo((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex-grow mx-32 p-10 bg-white rounded-lg flex mt-5">
                {/* Sidebar Menu */}

                <div className="w-1/4 pr-8 bg-gray-300 p-6">
                    <div className="w-full flex items-center mb-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-4xl">👤</span>
                        </div>
                        <div className="flex flex-col justify-center ml-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Tài khoản của</h3>
                            <span className="text-base font-medium text-gray-900">{localStorage.getItem('fullName')}</span>
                        </div>
                    </div>
                    <ul className="space-y-4 text-sm text-gray-700">
                        <li className="flex items-center text-gray-800 hover:text-blue-600 cursor-pointer text-lg font-bold" onClick={() => setShowChangePassword(false)}>
                            <FaUser className="mr-3" />
                            <span>Tài Khoản Của Tôi</span>
                        </li>
                        <li className="flex items-center text-gray-800 hover:text-green-600 cursor-pointer text-lg font-bold" onClick={() => setShowChangePassword(true)}>
                            <FaLock className="mr-3" />
                            <span>Đổi Mật Khẩu</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold">
                            <FaHistory className="mr-3" />
                            <span>Lịch Sử Mua Hàng</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-pink-500 cursor-pointer text-lg font-bold">
                            <FaHeart className="mr-3" />
                            <span>Sản Phẩm Yêu Thích</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold">
                            <FaStar className="mr-3" />
                            <span>Đánh Giá Sản Phẩm</span>
                        </li>
                        <li className="flex items-center text-gray-800 hover:text-orange-600 cursor-pointer text-lg font-bold">
                            <FaGift className="mr-3" />
                            <span>Kho Voucher</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold">
                            <FaCoins className="mr-3" />
                            <span>Petcare Xu</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold">
                            <FaHeadset className="mr-3" />
                            <span>Hỗ Trợ Khách Hàng</span>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="w-3/4 pl-10 bg-gray-100">
                    <div className="items-center">
                        <h2 className="text-4xl font-extrabold mb-6 text-gray-700">Thông tin cá nhân</h2>
                        <p className="text-sm text-gray-600 mb-6 font-bold italic">
                            Quản lý thông tin hồ sơ để bảo mật tài khoản
                        </p>

                        <div className="flex items-start">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center mr-12">
                                <div className="w-36 h-36 bg-gray-200 rounded-full flex items-center justify-center relative border-2 border-blue-400">
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
                                            <label className="block text-lg font-bold text-gray-700 w-32">Họ & Tên:</label>
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
                                            <label className="block text-lg font-bold text-gray-700 w-32">Email:</label>
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
                                            <label className="block text-lg font-bold text-gray-700 w-32">Địa chỉ:</label>
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
                                            <label className="block text-lg font-bold text-gray-700 w-32">Số điện thoại:</label>
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
                </div>
            </div>


            {showChangePassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-semibold mb-6">Đổi Mật Khẩu</h3>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                            <input
                                id="currentPassword"
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                            <input
                                id="newPassword"
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                                placeholder="Nhập mật khẩu mới"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="Xác nhận mật khẩu mới"
                            />
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button
                                className="w-1/3 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
                                onClick={closeModal}
                            >
                                Hủy
                            </button>
                            <button className="w-1/3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
