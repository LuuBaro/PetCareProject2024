import React, { useState, useEffect } from "react";
import axios from "axios";

interface OrderDetail {
    productDetailId: number;
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
}

interface Order {
    orderId: number;
    orderDate: string;
    totalAmount: number;
    status: string;
    statusOrderId: number;
    paymentMethod: string;
    shippingAddress: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    orderDetails: OrderDetail[];
}

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>("");
    const [selectedCancelReason, setSelectedCancelReason] = useState<string>("");
    const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);


    const cancelReasons = [
        "Hết hàng",
        "Giao hàng không thành công",
        "Khách hàng không thanh toán",
        "Khác",
    ];

    const tabs = [
        { id: "all", label: "Tất cả" },
        { id: "Chờ xác nhận", label: "Chờ xác nhận" },
        { id: "Đang vận chuyển", label: "Đang vận chuyển" },
        { id: "Chờ giao hàng", label: "Chờ giao hàng" },
        { id: "Hoàn thành", label: "Hoàn thành" },
        { id: "Đã hủy", label: "Đã hủy" },
        { id: "Trả hàng", label: "Trả hàng/Hoàn tiền" },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/api/all`);
                const sortedOrders = response.data.sort(
                    (a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                );
                setOrders(sortedOrders);
                console.log(sortedOrders)
            } catch (error) {
                console.error("Lỗi khi tìm nạp đơn đặt hàng", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };
    console.log(selectedOrderDetails);
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "all") return true;
        return order.status.toLowerCase() === activeTab.toLowerCase();
    });

    const handleCheckboxChange = (orderId: number) => {
        setSelectedOrders((prev) => {
            const updated = new Set(prev);
            if (updated.has(orderId)) {
                updated.delete(orderId);
            } else {
                updated.add(orderId);
            }
            return updated;
        });
    };

    const handleCancel = () => {
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (!selectedCancelReason && !cancelReason) return alert("Please provide a reason!");

        setIsSendingEmail(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert("Order(s) canceled successfully!");
            setShowCancelModal(false);
            setSelectedOrders(new Set());
        } catch (error) {
            console.error("Failed to cancel orders:", error);
        } finally {
            setIsSendingEmail(false);
        }
    };

    //hàm xem chi tiết sản phẩm
    const handleViewDetails = (order: Order) => {
        setSelectedOrderDetails(order);  // Đảm bảo rằng order được truyền vào chính xác
        setIsModalOpen(true);  // Mở modal khi nhấp vào "Xem"
    };


    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto mt-4 p-4 bg-white shadow-lg rounded-lg">
            {/* Search and Tabs */}
            <div className="border-b-2 pb-2 mb-4">
                <div className="flex justify-between mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 w-full"
                    />
                </div>
                <div className="flex justify-around">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`text-lg p-2 transition-all rounded-md relative ${activeTab === tab.id
                                ? "text-[#00b7c0]"
                                : "text-gray-500"
                                }`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#00b7c0]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {filteredOrders.length === 0 ? (
                    <div className="text-center text-gray-600  py-4">
                        Không tìm thấy đơn hàng nào.
                    </div>
                ) : (
                    <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
                        <thead className="bg-gray-100 text-gray-600 text-sm">
                            <tr>
                                <th className="border p-3 text-center">Mã đơn hàng</th>
                                <th className="border p-3 text-center">Họ tên - Số điện thoại</th>
                                <th className="border p-3 text-center">Địa chỉ</th>
                                <th className="border p-3 text-center">Ngày đặt</th>
                                <th className="border p-3 text-center">Tổng tiền</th>
                                <th className="border p-3 text-center">Trạng thái</th>
                                <th className="border p-3 text-center">Chọn</th>
                                <th className="border p-3 text-center">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => {
                                // Tách thông tin họ tên, số điện thoại và địa chỉ từ shippingAddress
                                const namePattern = /Họ và tên:\s*([^\n]*)/;
                                const phonePattern = /Số điện thoại:\s*([^\n]*)/;
                                const addressPattern = /Địa chỉ:\s*([^\n]*)/;

                                const fullName = namePattern.exec(order.shippingAddress)?.[1] || "Không có thông tin";
                                const phoneNumber = phonePattern.exec(order.shippingAddress)?.[1] || "Không có thông tin";
                                const addressMatch = addressPattern.exec(order.shippingAddress);
                                const address = addressMatch ? addressMatch[1] : "Không có thông tin";

                                return (
                                    <tr key={order.orderId}>
                                        <td className="border p-3 text-center">{order.orderId}</td>
                                        <td className="border p-3">
                                            <div className="flex flex-col space-y-1">
                                                <span className="font-medium">{fullName}</span>
                                                <span>{phoneNumber}</span>
                                            </div>
                                        </td>
                                        {/* Chỉ hiển thị địa chỉ */}
                                        <td className="border p-3">{address}</td>
                                        <td className="border p-3">{new Date(order.orderDate).toLocaleString("vi-VN")}</td>
                                        <td className="border p-3">
                                            {order.totalAmount.toLocaleString("vi-VN")} VND
                                        </td>
                                        <td className="border p-3">{order.status}</td>
                                        <td className="border p-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.has(order.orderId)}
                                                onChange={() => handleCheckboxChange(order.orderId)}
                                            />
                                        </td>
                                        <td className="border p-3 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrderDetails(order); // Lưu thông tin chi tiết đơn hàng
                                                    setIsModalOpen(true); // Mở modal
                                                }}
                                                className="text-[#00b7c0] hover:text-blue-500"
                                            >
                                                <i className="fas fa-eye"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>


            {/* MODAL Hiển thị chi tiết sản phẩm */}
            {isModalOpen && selectedOrderDetails && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    onClick={() => setIsModalOpen(false)} // Đóng modal khi click bên ngoài
                >
                    <div
                        className="bg-white p-8 rounded-lg w-[80%] max-w-4xl shadow-lg"
                        onClick={(e) => e.stopPropagation()} // Ngừng sự kiện click để không đóng modal khi click vào trong modal
                    >
                        <button
                            onClick={() => setIsModalOpen(false)} // Đóng modal khi bấm nút X
                            className="text-white bg-red-500 px-4 py-2 rounded-full float-right"
                        >
                            X
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-center">Chi tiết đơn hàng</h2>

                        {/* Thông tin đơn hàng */}
                        {(() => {
                            const shippingInfo = selectedOrderDetails.shippingAddress.split('\n');
                            const recipientName = shippingInfo[0].replace('Họ và tên: ', '').trim();
                            const phoneNumber = shippingInfo[1].replace('Số điện thoại: ', '').trim();
                            const address = shippingInfo[2].replace('Địa chỉ: ', '').trim();

                            return (
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-4">Thông tin đơn hàng #{selectedOrderDetails.orderId}</h3>
                                    <div className="grid grid-cols-2 gap-4">

                                        <p>
                                            Ngày đặt hàng:{" "}
                                            <span className="font-medium">
                                                {new Date(selectedOrderDetails.orderDate).toLocaleDateString("vi-VN")}
                                            </span>
                                        </p>
                                        <p>Trạng thái: <span className="font-medium">{selectedOrderDetails.status}</span></p>
                                        <p>Tên người nhận: <span className="font-medium">{recipientName}</span></p>
                                        <p>Số điện thoại: <span className="font-medium">{phoneNumber}</span></p>
                                        <p>Địa chỉ: <span className="font-medium">{address}</span></p>
                                        <p>Tổng tiền: <span className="font-medium">{selectedOrderDetails.totalAmount.toLocaleString()} VNĐ</span></p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Thông tin sản phẩm */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Thông tin sản phẩm</h3>
                            {selectedOrderDetails.orderDetails && selectedOrderDetails.orderDetails.length > 0 ? (
                                <div className="overflow-y-auto max-h-96">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100 text-left">
                                                <th className="border border-gray-300 p-2">Hình ảnh</th>
                                                <th className="border border-gray-300 p-2">Tên sản phẩm</th>
                                                <th className="border border-gray-300 p-2">Màu</th>
                                                <th className="border border-gray-300 p-2">Size</th>
                                                <th className="border border-gray-300 p-2">Số lượng</th>
                                                <th className="border border-gray-300 p-2">Giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrderDetails.orderDetails.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 p-2">
                                                        <img
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            className="w-16 h-16 object-cover"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 p-2">{item.productName}</td>
                                                    <td className="border border-gray-300 p-2">{item.productColor}</td>
                                                    <td className="border border-gray-300 p-2">{item.productSize}</td>
                                                    <td className="border border-gray-300 p-2">{item.quantity}</td>
                                                    <td className="border border-gray-300 p-2">{item.price.toLocaleString()} VNĐ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p>Không có sản phẩm.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded shadow-lg">
                        <h2 className="text-lg mb-4">Hủy đơn hàng</h2>
                        <select
                            className="border p-2 w-full mb-4"
                            value={selectedCancelReason}
                            onChange={(e) => setSelectedCancelReason(e.target.value)}
                        >
                            <option value="">Chọn lý do hủy</option>
                            {cancelReasons.map((reason, index) => (
                                <option key={index} value={reason}>
                                    {reason}
                                </option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Lý do khác..."
                            className="border p-2 w-full"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="mr-2 px-4 py-2 border rounded text-gray-600"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                disabled={isSendingEmail}
                            >
                                {isSendingEmail ? "Đang gửi..." : "Xác nhận hủy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
