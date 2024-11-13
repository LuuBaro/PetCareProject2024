import React, { useState } from 'react';
import Header from "../header/Header";
import Footer from '../footer/Footer';
import { FaUser, FaTicketAlt, FaDollarSign, FaLock } from 'react-icons/fa';

export function Account() {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null); // Track open dropdown (day, month, year)
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    const closeModal = () => setShowChangePassword(false);

    // Generate arrays for day, month, and year options
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 106 }, (_, i) => 1920 + i);

    // Handle selection of date parts
    const handleDateSelect = (type, value) => {
        if (type === 'day') {
            setSelectedDay(value);
            setOpenDropdown(null); // Close dropdown after selection
        }
        if (type === 'month') {
            setSelectedMonth(value);
            setOpenDropdown(null); // Close dropdown after selection
        }
        if (type === 'year') {
            setSelectedYear(value);
            setOpenDropdown(null); // Close dropdown after selection
        }
    };

    return (


        <>
            <Header />

            <div className="mx-32 p-10 bg-white shadow-lg rounded-lg flex">
                {/* Sidebar Menu */}
                <div className="w-1/4 pr-8 border-r">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <span className="text-gray-400 text-5xl">👤</span>
                        </div>
                        <h3 className="text-lg font-semibold">minhkung</h3>
                    </div>
                    <ul className="space-y-5">
                        <li className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer" onClick={() => setShowChangePassword(false)}>
                            <FaUser className="mr-3" />
                            <span>Tài Khoản Của Tôi</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer" onClick={() => setShowChangePassword(true)}>
                            <FaLock className="mr-3" />
                            <span>Đổi Mật Khẩu</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer">
                            <FaTicketAlt className="mr-3" />
                            <span>Kho Voucher</span>
                        </li>
                        <li className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer">
                            <FaDollarSign className="mr-3" />
                            <span>Shopee Xu</span>
                        </li>
                    </ul>
                </div>

                {/* Main Content */}
                <div className="w-3/4 pl-10">
                    <div>
                        <h2 className="text-2xl font-semibold mb-6">Hồ Sơ Của Tôi</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Quản lý thông tin hồ sơ để bảo mật tài khoản
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Profile fields */}
                            <div className="space-y-5">
                                <div className="flex justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                                    <p className="text-gray-900">minhkung</p>
                                </div>

                                <div className="flex justify-between">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tên"
                                    />
                                </div>
                                <div className="flex items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mx-2">Email</label>
                                    <button className="text-blue-600 cursor-pointer">Thêm</button>
                                </div>

                                <div className="flex justify-between">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                    <button className="text-gray-900">
                                        ********64 <span className="text-blue-600 cursor-pointer">Thay Đổi</span>
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                                    <div className="flex items-center space-x-6">
                                        <label className="flex items-center">
                                            <input type="radio" name="gender" className="mr-2" /> Nam
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="gender" className="mr-2" /> Nữ
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="gender" className="mr-2" /> Khác
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="text-sm text-gray-700">Ngày sinh</label>

                                    {/* Button cho Ngày */}
                                    <div className="relative">
                                        <button className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-left" onClick={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}>
                                            {selectedDay ? `Ngày ${selectedDay}` : 'Ngày'}
                                        </button>
                                        {openDropdown === 'day' && (
                                            <div className="absolute top-full left-0 w-24 max-h-32 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                                                {days.map(day => (
                                                    <div key={day} className="p-2 cursor-pointer hover:bg-blue-100" onClick={() => handleDateSelect('day', day)}>{day}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Button cho Tháng */}
                                    <div className="relative">
                                        <button className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-left" onClick={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}>
                                            {selectedMonth ? `Tháng ${selectedMonth}` : 'Tháng'}
                                        </button>
                                        {openDropdown === 'month' && (
                                            <div className="absolute top-full left-0 w-24 max-h-32 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                                                {months.map(month => (
                                                    <div key={month} className="p-2 cursor-pointer hover:bg-blue-100" onClick={() => handleDateSelect('month', month)}>Tháng {month}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Button cho Năm */}
                                    <div className="relative">
                                        <button className="w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-left" onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}>
                                            {selectedYear ? `Năm ${selectedYear}` : 'Năm'}
                                        </button>
                                        {openDropdown === 'year' && (
                                            <div className="absolute top-full left-0 w-24 max-h-32 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                                                {years.map(year => (
                                                    <div key={year} className="p-2 cursor-pointer hover:bg-blue-100" onClick={() => handleDateSelect('year', year)}>{year}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button className="mt-6 w-full bg-[#00b7c0] text-white py-3 rounded-lg">
                                    Lưu
                                </button>
                            </div>

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center space-y-6">
                                <div className="w-36 h-36 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-400 text-6xl">👤</span>
                                </div>
                                <button className="bg-blue-500 text-white py-2 px-6 rounded-lg bg-blue-600">
                                    Thay Đổi
                                </button>
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
        </>
    );

}

export default Account;
