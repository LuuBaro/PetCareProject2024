import React from "react";
import {
    FaUser,
    FaLock,
    FaHistory,
    FaHeart,
    FaStar,
    FaGift,
    FaCoins,
    FaHeadset,
} from "react-icons/fa";

const Sidebar = ({setActiveTab }) => {
    return (
        <div className="w-1/4 pr-8 bg-gray-300 p-6">
            <div className="w-full flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">👤</span>
                </div>
                <div className="flex flex-col justify-center ml-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        Tài khoản của
                    </h3>
                    <span className="text-base font-medium text-gray-900">
            {localStorage.getItem("fullName")}
          </span>
                </div>
            </div>
            <ul className="space-y-4 text-sm text-gray-700">
                <li
                    className="flex items-center text-gray-800 hover:text-blue-600 cursor-pointer text-lg font-bold"
                    onClick={() => setActiveTab("account")}
                >
                    <FaUser className="mr-3" />
                    <span>Tài Khoản Của Tôi</span>
                </li>
                <li
                    className="flex items-center text-gray-800 hover:text-green-600 cursor-pointer text-lg font-bold"
                    onClick={() => setActiveTab("changePassword")}
                >
                    <FaLock className="mr-3" />
                    <span>Đổi Mật Khẩu</span>
                </li>
                <li
                    className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold"
                    onClick={() => setActiveTab("orderHistory")}
                >
                    <FaHistory className="mr-3" />
                    <span>Lịch Sử Mua Hàng</span>
                </li>
                <li
                    className="flex items-center text-gray-700 hover:text-pink-500 cursor-pointer text-lg font-bold"
                    onClick={() => setActiveTab("favorites")}
                >
                    <FaHeart className="mr-3" />
                    <span>Sản Phẩm Yêu Thích</span>
                </li>
                {/*<li*/}
                {/*    className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold"*/}
                {/*    onClick={() => setActiveTab("reviews")}*/}
                {/*>*/}
                {/*    <FaStar className="mr-3" />*/}
                {/*    <span>Đánh Giá Sản Phẩm</span>*/}
                {/*</li>*/}
                {/*<li*/}
                {/*    className="flex items-center text-gray-800 hover:text-orange-600 cursor-pointer text-lg font-bold"*/}
                {/*    onClick={() => setActiveTab("vouchers")}*/}
                {/*>*/}
                {/*    <FaGift className="mr-3" />*/}
                {/*    <span>Kho Voucher</span>*/}
                {/*</li>*/}
                {/*<li*/}
                {/*    className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold"*/}
                {/*    onClick={() => setActiveTab("petcareXu")}*/}
                {/*>*/}
                {/*    <FaCoins className="mr-3" />*/}
                {/*    <span>Petcare Xu</span>*/}
                {/*</li>*/}
                {/*<li*/}
                {/*    className="flex items-center text-gray-700 hover:text-yellow-500 cursor-pointer text-lg font-bold"*/}
                {/*    onClick={() => setActiveTab("support")}*/}
                {/*>*/}
                {/*    <FaHeadset className="mr-3" />*/}
                {/*    <span>Hỗ Trợ Khách Hàng</span>*/}
                {/*</li>*/}
            </ul>
        </div>
    );
};

export default Sidebar;
