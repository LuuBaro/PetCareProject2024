import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiChevronDown,
    FiChevronUp,
    FiHome,
    FiUser,
    FiBox,
    FiPackage,
} from "react-icons/fi";
import { FaGift } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "/src/assets/logo.png";

const SidebarMenu = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập từ localStorage
        const userId = localStorage.getItem("userId");
        setIsLoggedIn(!!userId);
    }, []);

    const handleLogout = () => {
        // Xóa userId khỏi localStorage và điều hướng đến trang đăng nhập
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        navigate("/login");
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const toggleProductDropdown = () => {
        setIsProductDropdownOpen(!isProductDropdownOpen);
    };

    const dropdownVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
    };

    return (
        <div className="flex flex-col w-64 h-screen bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 text-white shadow-lg">
            {/* Logo Section */}
            <div className="flex items-center justify-center h-20 bg-gray-800 shadow-md">
                <img src={logo} alt="Logo" className="w-10/12 h-12" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                <ul className="space-y-2">
                    {/* Dashboard */}
                    <li>
                        <Link
                            to="/"
                            className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300"
                        >
                            <FiHome className="w-5 h-5 mr-3"/>
                            <span>Trang tổng quan</span>
                        </Link>
                    </li>

                    {/* User Management Dropdown */}
                    <li>
                        <div
                            className="flex items-center justify-between p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer transition duration-300"
                            onClick={toggleUserDropdown}
                        >
                            <div className="flex items-center">
                                <FiUser className="w-5 h-5 mr-3"/>
                                <span>Quản lý tài khoản</span>
                            </div>
                            {isUserDropdownOpen ? (
                                <FiChevronUp className="w-4 h-4"/>
                            ) : (
                                <FiChevronDown className="w-4 h-4"/>
                            )}
                        </div>
                        <AnimatePresence>
                            {isUserDropdownOpen && (
                                <motion.ul
                                    className="mt-2 ml-6 space-y-2"
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={dropdownVariants}
                                >
                                    <li>
                                        <Link
                                            to="/user"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Danh sách người dùng
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/roles"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Phân quyền
                                        </Link>
                                    </li>
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </li>

                    {/* Product Management Dropdown */}
                    <li>
                        <div
                            className="flex items-center justify-between p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 cursor-pointer transition duration-300"
                            onClick={toggleProductDropdown}
                        >
                            <div className="flex items-center">
                                <FiBox className="w-5 h-5 mr-3"/>
                                <span>Quản lý sản phẩm</span>
                            </div>
                            {isProductDropdownOpen ? (
                                <FiChevronUp className="w-4 h-4"/>
                            ) : (
                                <FiChevronDown className="w-4 h-4"/>
                            )}
                        </div>
                        <AnimatePresence>
                            {isProductDropdownOpen && (
                                <motion.ul
                                    className="mt-2 ml-6 space-y-2"
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={dropdownVariants}
                                >
                                    <li>
                                        <Link
                                            to="/products"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Danh sách sản phẩm
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/product-details"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Quản lý biến thể
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/brands"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Thương hiệu
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/product-color"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Màu sắc
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/product-image"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Hình ảnh
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/product-size"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Kích thước
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/product-weights"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Cân nặng
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/product-categories"
                                            className="block p-2 rounded-lg hover:bg-gray-500 transition duration-300"
                                        >
                                            Danh mục
                                        </Link>
                                    </li>
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </li>

                    {/* Order Management */}
                    <li>
                        <Link
                            to="/product-inventory"
                            className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300"
                        >
                            <FiPackage className="w-5 h-5 mr-3"/>
                            <span>Quản lý đơn hàng</span>
                        </Link>
                    </li>

                    {/* Voucher management*/}
                    <li>
                        <Link
                            to="/voucher-management"
                            className="flex items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300"
                        >
                            <FaGift className="w-5 h-5 mr-3"/>
                            <span>Quản lý Voucher</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 bg-gray-800">

                    <a
                        href="/"
                        className="block text-center text-gray-400 hover:underline"
                    >
                        Trang chủ
                    </a>
            </div>
        </div>
    );
};

export default SidebarMenu;
