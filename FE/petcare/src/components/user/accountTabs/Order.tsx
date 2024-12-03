import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";


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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "chờ xác nhận":
                return "text-orange-400 font-bold"; // Màu xám đậm cho trạng thái chờ xác nhận
            case "đang vận chuyển":
                return "text-blue-500 font-bold"; // Màu xanh dương cho trạng thái đang vận chuyển
            case "chờ giao hàng":
                return "text-green-500 font-bold"; // Màu tím cho trạng thái chờ giao hàng
            case "hoàn thành":
                return "text-[#52b7c0] font-bold"; // Màu cyan cho trạng thái hoàn thành
            case "đã hủy":
                return "text-red-600 font-bold"; // Màu đỏ cho trạng thái đã hủy
            case "trả hàng":
                return "text-orange-500 font-bold"; // Màu cam cho trạng thái trả hàng
            default:
                return "text-gray-500 font-bold"; // Màu xám mặc định
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage hoặc context
                const response = await axios.get(`http://localhost:8080/api/user/${userId}/orders`);
                const sortedOrders = response.data.sort(
                    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                );
                setOrders(sortedOrders);
                console.log(sortedOrders);
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

    const columns = [
        {
            name: "Mã đơn",
            selector: (row) => row.orderId,
            sortable: true,
            center: true,
            grow: 2,
            wrap: true, // Bật tính năng hiển thị xuống dòng nếu cần
        },
        {
            name: "Người nhận",
            selector: (row) => {
                const fullName = /Họ và tên:\s*([^\n]*)/.exec(row.shippingAddress)?.[1] || "Không có thông tin";
                const phoneNumber = /Số điện thoại:\s*([^\n]*)/.exec(row.shippingAddress)?.[1] || "Không có thông tin";
                return (
                    <div>
                        <div>{fullName}</div>
                        <div>{phoneNumber}</div>
                    </div>
                );
            },
            sortable: false,
            grow: 2,
            wrap: true,
        },
        {
            name: "Địa chỉ",
            selector: (row) => /Địa chỉ:\s*([^\n]*)/.exec(row.shippingAddress)?.[1] || "Không có thông tin",
            sortable: false,
            grow: 2, // Tăng chiều rộng cột
            wrap: true,
        },
        {
            name: "Ngày đặt",
            selector: (row) => new Date(row.orderDate).toLocaleDateString("vi-VN"),
            sortable: true,
            center: true,
            grow: 2, // Tăng chiều rộng cột
        },
        {
            name: "Tổng tiền",
            selector: (row) => row.totalAmount.toLocaleString("vi-VN") + " VND",
            sortable: true,
            center: true,
            grow: 2, // Tăng chiều rộng cột
            wrap: true, // Bật tính năng hiển thị xuống dòng nếu cần
        },
        {
            name: "Trạng thái",
            selector: (row) => row.status,
            sortable: true,
            grow: 2, // Tăng chiều rộng cột
            wrap: true,
            cell: (row) => (
                <span className={getStatusColor(row.status)}>{row.status}</span>
            ),
        },
        {
            name: "Chọn",
            selector: (row) => (
                <input
                    type="checkbox"
                    checked={selectedOrders.has(row.orderId)}
                    onChange={() => handleCheckboxChange(row.orderId)}
                />
            ),
            center: true,
            grow: 0.5,
        },
        {
            name: "Chi tiết",
            selector: (row) => (
                <button
                    onClick={() => {
                        setSelectedOrderDetails(row);
                        setIsModalOpen(true);
                    }}
                    className="text-[#00b7c0] hover:text-blue-500"
                >
                    <i className="fas fa-eye"></i> Xem
                </button>
            ),
            center: true,
            grow: 0.5,
        },
    ];


    const filteredData = filteredOrders.filter((order) =>
        order.orderId?.toString().toLowerCase().includes(searchTerm?.toLowerCase() || "")
    );


    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto mt-4 p-4 bg-white shadow-lg rounded-lg">
            {/* Search and Tabs */}
            <div className="border-b-2 pb-2 mb-4">
                {/* Search Input */}
                <div className="mb-4">
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
                                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#00b7c0]"/>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */ }
            <div className="container mx-auto mt-8 p-6 bg-white shadow-xl rounded-xl">


                {/* DataTable */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    striped
                    customStyles={{
                        table: {
                            style: {
                                minWidth: "900px", // Đảm bảo bảng đủ rộng
                            },
                        },
                        headCells: {
                            style: {
                                fontSize: "1.2rem", // Tăng kích thước chữ trong tiêu đề
                                fontWeight: "bold",
                                color: "#333",
                                padding: "16px", // Thêm khoảng cách trong tiêu đề
                            },
                        },
                        cells: {
                            style: {
                                fontSize: "1rem", // Tăng kích thước chữ trong ô dữ liệu
                                padding: "12px", // Tăng khoảng cách
                            },
                        },
                    }}
                    noDataComponent={
                        <div className="text-lg font-medium text-gray-500">
                            Không tìm thấy đơn hàng nào.
                        </div>
                    }
                />
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
                                    <h3 className="text-xl font-semibold mb-4">Thông tin đơn hàng
                                        #{selectedOrderDetails.orderId}</h3>
                                    <div className="grid grid-cols-2 gap-4">

                                        <p>
                                            Ngày đặt hàng:{" "}
                                            <span className="font-medium">
                                                {new Date(selectedOrderDetails.orderDate).toLocaleDateString("vi-VN")}
                                            </span>
                                        </p>
                                        <p>Trạng thái: <span
                                            className="font-medium">{selectedOrderDetails.status}</span></p>
                                        <p>Tên người nhận: <span className="font-medium">{recipientName}</span></p>
                                        <p>Số điện thoại: <span className="font-medium">{phoneNumber}</span></p>
                                        <p>Địa chỉ: <span className="font-medium">{address}</span></p>
                                        <p>Tổng tiền: <span
                                            className="font-medium">{selectedOrderDetails.totalAmount.toLocaleString()} VNĐ</span>
                                        </p>
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
