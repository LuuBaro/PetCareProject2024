import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiHome, FiUser, FiBox, FiPackage, FiLayers } from "react-icons/fi"; // Import icons

const SidebarMenu = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const toggleProductDropdown = () => {
        setIsProductDropdownOpen(!isProductDropdownOpen);
    };

    return (
        <>
            <div className="p-6 text-3xl font-bold text-white bg-indigo-600 shadow-lg">
                Petcare
            </div>
            <nav className="bg-gray-900 text-gray-200 h-full">
                <ul className="space-y-1 p-4">
                    <li className="flex items-center p-3 rounded-md hover:bg-indigo-600 hover:text-white transition duration-300">
                        <FiHome className="mr-3" />
                        <Link to="/" className="w-full">Dashboard</Link>
                    </li>

                    {/* User Management Dropdown */}
                    <li className="p-3">
                        <div
                            className="flex items-center justify-between cursor-pointer hover:bg-indigo-600 hover:text-white transition duration-300 p-3 rounded-md"
                            onClick={toggleUserDropdown}
                        >
                            <div className="flex items-center">
                                <FiUser className="mr-3" />
                                <span>Quản lý người dùng</span>
                            </div>
                            {isUserDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        {isUserDropdownOpen && (
                            <ul className="ml-6 mt-2 space-y-2">
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/user" className="w-full">Quản lý users</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/roles" className="w-full">Quản lý Role</Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Product Management Dropdown */}
                    <li className="p-3">
                        <div
                            className="flex items-center justify-between cursor-pointer hover:bg-indigo-600 hover:text-white transition duration-300 p-3 rounded-md"
                            onClick={toggleProductDropdown}
                        >
                            <div className="flex items-center">
                                <FiBox className="mr-3" />
                                <span>Quản lý sản phẩm</span>
                            </div>
                            {isProductDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        {isProductDropdownOpen && (
                            <ul className="ml-6 mt-2 space-y-2">
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/products" className="w-full">Quản lý sản phẩm</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/product-details" className="w-full">Quản lý CTSP</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/brands" className="w-full">Quản lý Brand</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/product-color" className="w-full">Quản lý color</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/product-image" className="w-full">Quản lý img</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/product-size" className="w-full">Quản lý sizes</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/product-weights" className="w-full">Quản lý weights</Link>
                                </li>
                                <li className="flex items-center p-3 hover:bg-indigo-500 rounded-md transition duration-300">
                                    <Link to="/product-categories" className="w-full">Quản lý loại SP</Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Order Management Link */}
                    <li className="flex items-center p-3 rounded-md hover:bg-indigo-600 hover:text-white transition duration-300">
                        <FiPackage className="mr-3" />
                        <Link to="/product-inventory" className="w-full">Quản lý đơn hàng</Link>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default SidebarMenu;
