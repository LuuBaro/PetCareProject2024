import React, { useState, useEffect } from "react";
import Header from "../header/Header";
import axios from "axios";
import ProgressBar from "../user/ProgressBar"; // Import ProgressBar component
import {
    faClock,
    faTruck,
    faCheckCircle,
    faBan,
    faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../user/Modal"; // Import Modal component for showing product details

const User: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [statusOrders, setStatusOrders] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
    const userId = localStorage.getItem("userId");
    const [statusIndex, setStatusIndex] = useState<number>(2);
    const statusLabels = [
        { label: "Chờ xác nhận", icon: faClock },
        { label: "Chờ vận chuyển", icon: faTruck },
        { label: "Đang giao hàng", icon: faClipboardCheck },
        { label: "Hoàn thành", icon: faCheckCircle },
    ];
    console.log("Selected Order Details:", selectedOrderDetails);

    const handleStatusClick = (index: number) => {
        setStatusIndex(index);
    };

    const fetchOrders = async () => {
        if (!userId) {
            console.error("User ID không tồn tại.");
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/user/${userId}`
            );
            console.log("Fetched orders:", response.data);

            if (Array.isArray(response.data)) {
                const sortedOrders = response.data.sort(
                    (a, b) =>
                        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                );
                setOrders(sortedOrders);
            } else {
                console.error("Dữ liệu không phải là mảng:", response.data);
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchStatusOrders = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/status-orders`
            );
            console.log("Fetched status orders:", response.data);
            setStatusOrders(response.data);
        } catch (error) {
            console.error("Error fetching status orders:", error);
        }
    };

    const checkForStatusChange = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/status-orders`
            );
            const currentOrders = response.data;

            for (let i = 0; i < orders.length; i++) {
                if (orders[i].statusOrderId !== currentOrders[i].statusOrderId) {
                    window.location.reload();
                    break;
                }
            }
        } catch (error) {
            console.error("Error checking order status:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchStatusOrders();

        renderOrders();
        const interval = setInterval(() => {
            checkForStatusChange();
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    const renderOrders = () => {
        const statusOrdersMap = new Map(
            statusOrders.map((status) => [status.statusOrderId, status.statusName])
        );

        if (orders.length === 0) {
            return <div className="text-gray-500">Bạn chưa có đơn hàng nào.</div>;
        }

        return orders.map((order) => {
            const shippingAddress = order.shippingAddress;
            const namePattern = /Họ và tên:\s*([^\n]*)/;
            const phonePattern = /Số điện thoại:\s*([^\n]*)/;
            const addressPattern = /Địa chỉ:\s*([^\n]*)/;

            const fullName = namePattern.exec(shippingAddress)?.[1] || "Không có thông tin";
            const phoneNumber = phonePattern.exec(shippingAddress)?.[1] || "Không có thông tin";
            const address = addressPattern.exec(shippingAddress)?.[1] || "Không có thông tin";

            const statusName =
                statusOrdersMap.get(order.statusOrderId) || "Chưa xác định";

            const statusIndex =
                statusOrders.length > 0
                    ? statusOrders.findIndex(
                        (status) => status.statusOrderId === order.statusOrderId
                    )
                    : -1;

            const isCancelled = statusName === "Đã hủy";

            return (
                <div
                    key={order.orderId}
                    className="border border-gray-300 p-6 mb-4 w-full bg-white shadow-lg rounded-lg transition-shadow hover:shadow-xl"
                >
                    {isCancelled ? (
                        <div className="flex items-center justify-center p-4 mb-4 border border-red-600 bg-red-100 text-red-800 rounded-lg shadow-lg">
              <span className="text-lg font-bold animate-bounce">
                Đơn hàng đã hủy
              </span>
                        </div>
                    ) : (
                        <ProgressBar
                            statusIndex={statusIndex}
                            onStatusClick={handleStatusClick}
                            statusLabels={statusLabels}
                        />
                    )}

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#00b7c0]">
                            Đơn hàng #{order.orderId}
                        </h3>
                        <span className="text-sm text-gray-500">
              {new Date(order.orderDate).toLocaleString()}
            </span>
                    </div>

                    <div className="mb-4 p-4 border border-gray-200 rounded bg-gray-50">
                        <p className="font-semibold mb-2">
                            Họ tên: <span className="font-normal">{fullName}</span>
                        </p>
                        <p className="font-semibold mb-2">
                            Email: <span className="font-normal">{order.email}</span>
                        </p>
                        <p className="font-semibold mb-2">
                            Số điện thoại:{" "}
                            <span className="font-normal">{phoneNumber}</span>
                        </p>
                        <p className="font-semibold mb-2">
                            Địa chỉ: <span className="font-normal">{address}</span>
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm">
                            Trạng thái:{" "}
                            <span
                                className={`font-semibold ${
                                    isCancelled ? "text-red-600" : "text-green-600"
                                }`}
                            >
                {order.status}
              </span>
                        </p>
                        <p className="text-sm">
                            Tổng tiền:{" "}
                            <span className="font-semibold text-blue-600">
                {order.totalAmount
                    ? order.totalAmount.toLocaleString()
                    : "N/A"}{" "}
                                VNĐ
              </span>
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedOrderDetails(order.orderDetails);
                            setIsModalOpen(true);
                        }}
                        className="bg-[#00b7c0] text-white px-4 py-2 rounded-lg mt-4"
                    >
                        Xem chi tiết sản phẩm
                    </button>
                </div>
            );
        });
    };

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-6">
                {renderOrders()}

                {isModalOpen && selectedOrderDetails && (
                    <Modal onClose={() => setIsModalOpen(false)}>
                        <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng #{selectedOrderDetails[0]?.orderId}</h2>
                        <div>
                            <div className="flex flex-wrap">
                                {selectedOrderDetails.map((item: any) => (
                                    <div key={item.productDetailId} className="w-full sm:w-1/2 p-2">
                                        <div className="border rounded-lg p-4">
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="w-32 h-32 object-cover mb-4"
                                            />
                                            <p className="text-md font-semibold">{item.productName}</p>
                                            <p className="text-sm text-gray-600">Loại: {item.productCategory}</p>
                                            <p className="text-sm text-gray-600">Thương hiệu: {item.productBrand}</p>
                                            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                            <p className="text-sm text-gray-600">Giá: {item.productPrice.toLocaleString()} VNĐ</p>
                                            <p className="text-sm text-gray-600">Màu: {item.productColor}</p>
                                            <p className="text-sm text-gray-600">Kích thước: {item.productSize}</p>
                                            <p className="text-sm text-gray-600">Trọng lượng: {item.productWeightvalue}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
};

export default User;
