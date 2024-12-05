import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
const VoucherManagement: React.FC = () => {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        quantity: "",
        percents: "",
        condition: "",
    });

    // Fetch vouchers on component mount
    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/vouchers");
            setVouchers(response.data);
        } catch (error) {
            console.error("Error fetching vouchers:", error);
        }
    };

    const handleAddOrUpdateVoucher = async () => {
        try {
            // Kiểm tra form không được bỏ trống
            if (!formData.name || !formData.startDate || !formData.endDate || !formData.quantity || !formData.percents || formData.condition === "") {
                await Swal.fire({
                    icon: "warning",
                    title: "Thông báo",
                    text: "Vui lòng điền đầy đủ thông tin.",
                });
                return;
            }

            // Kiểm tra ngày bắt đầu phải nhỏ hơn ngày kết thúc
            if (new Date(formData.startDate) >= new Date(formData.endDate)) {
                await Swal.fire({
                    icon: "error",
                    title: "Lỗi ngày tháng",
                    text: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.",
                });
                return;
            }

            // Kiểm tra số lượng không được là số âm hoặc nhỏ hơn 0
            if (formData.quantity <= 0) {
                await Swal.fire({
                    icon: "error",
                    title: "Lỗi số lượng",
                    text: "Số lượng phải lớn hơn 0.",
                });
                return;
            }

            // Kiểm tra giá giảm không được bằng 0 hoặc số âm

            if (formData.percents <= 0) {
                await Swal.fire({
                    icon: "error",
                    title: "Lỗi giảm giá",
                    text: "Giảm giá phải lớn hơn 0.",
                });
                return;
            }

            // Kiểm tra giá giảm không được quá 70%
            if (formData.percents > 70) {
                await Swal.fire({
                    icon: "error",
                    title: "Lỗi giảm giá",
                    text: "Giảm giá không được lớn hơn 70%.",
                });
                return;
            }


            // Kiểm tra điều kiện không được là số âm
            if (formData.condition < 0) {
                await Swal.fire({
                    icon: "error",
                    title: "Lỗi điều kiện",
                    text: "Điều kiện không được là số âm.",
                });
                return;
            }

            // Xử lý thêm hoặc cập nhật voucher
            if (isEditing && selectedVoucherId !== null) {
                await axios.put(`http://localhost:8080/api/vouchers/${selectedVoucherId}`, formData);
                setVouchers((prev) =>
                    prev.map((voucher) =>
                        voucher.voucherId === selectedVoucherId
                            ? { ...voucher, ...formData }
                            : voucher
                    )
                );
                await Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: "Voucher đã được cập nhật.",
                });
            } else {
                const response = await axios.post("http://localhost:8080/api/vouchers", formData);
                setVouchers((prev) => [...prev, response.data]);
                await Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: "Voucher mới đã được thêm.",
                });
            }
            closeModal();
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Lỗi hệ thống",
                text: "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.",
            });
        }
    };



    const handleDeleteVoucher = async (voucherId: number) => {
        try {


            if (voucherId !== undefined && voucherId !== null) {
                // Hiển thị hộp thoại xác nhận bằng SweetAlert2
                const confirmDelete = await Swal.fire({
                    title: "Bạn có chắc chắn?",
                    text: "Thao tác này không thể hoàn tác!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Xóa",
                    cancelButtonText: "Hủy",
                    reverseButtons: true,
                });

                if (confirmDelete.isConfirmed) {
                    // Xóa voucher nếu người dùng xác nhận
                    await axios.delete(`http://localhost:8080/api/vouchers/${voucherId}`);
                    setVouchers((prev) =>
                        prev.filter((voucher) => voucher.voucherId !== voucherId)
                    );

                    // Hiển thị thông báo thành công
                    Swal.fire({
                        title: "Đã xóa!",
                        text: "Voucher đã được xóa thành công.",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                }
            } else {

                Swal.fire({
                    title: "Lỗi",
                    text: "ID voucher không hợp lệ. Vui lòng thử lại.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            // Hiển thị thông báo lỗi khi xảy ra lỗi
            Swal.fire({
                title: "Lỗi",
                text: "Có lỗi xảy ra khi xóa voucher. Vui lòng thử lại.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };


    const openEditModal = (voucher: any) => {
        setFormData({
            name: voucher.name,
            startDate: voucher.startDate.split("T")[0], // Lấy phần ngày từ chuỗi ISO
            endDate: voucher.endDate.split("T")[0],    // Lấy phần ngày từ chuỗi ISO
            quantity: voucher.quantity,
            percents: voucher.percents,
            condition: voucher.condition,
        });
        setSelectedVoucherId(voucher.voucherId); // Sử dụng voucherId thay vì id
        setIsEditing(true);
        setShowModal(true);
    };


    const closeModal = () => {
        setFormData({
            name: "",
            startDate: "",
            endDate: "",
            quantity: "",
            percents: "",
            condition: "",
        });
        setSelectedVoucherId(null);
        setIsEditing(false);
        setShowModal(false);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("vi-VN");
    };


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-700 mb-6">Quản lý Voucher</h1>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr className="bg-gray-200 text-gray-600 text-left text-sm uppercase font-semibold">
                            <th className="py-3 px-6">#</th>
                            <th className="py-3 px-6">Tên Voucher</th>
                            <th className="py-3 px-6">Ngày bắt đầu</th>
                            <th className="py-3 px-6">Ngày kết thúc</th>
                            <th className="py-3 px-6">Số lượng</th>
                            <th className="py-3 px-6">Giảm giá (%)</th>
                            <th className="py-3 px-6">Điều kiện</th>
                            <th className="py-3 px-6 text-center">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {vouchers.map((voucher, index) => (
                            <tr key={voucher.id} className="border-t border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6">{index + 1}</td>
                                <td className="py-3 px-6">{voucher.name}</td>
                                <td className="py-3 px-6">{formatDate(voucher.startDate)}</td>
                                <td className="py-3 px-6">{formatDate(voucher.endDate)}</td>
                                <td className="py-3 px-6">{voucher.quantity}</td>
                                <td className="py-3 px-6">{voucher.percents}</td>
                                <td className="py-3 px-6">{voucher.condition}</td>
                                <td className="py-3 px-6 text-center">
                                    <button
                                        onClick={() => openEditModal(voucher)}
                                        className="text-blue-500 hover:text-blue-700 font-medium mr-3"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVoucher(voucher.voucherId)}
                                        className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>

                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
                    >
                        Thêm Voucher
                    </button>
                </div>
            </div>

            {/* Modal thêm hoặc sửa Voucher */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">
                            {isEditing ? "Cập nhật Voucher" : "Thêm Voucher"}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-600 text-sm font-medium">Tên Voucher</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-sm font-medium">Ngày bắt đầu</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startDate: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-sm font-medium">Ngày kết thúc</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endDate: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-sm font-medium">Số lượng</label>
                                <input
                                    type="text"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quantity: parseInt(e.target.value, 10) || 0,
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-sm font-medium">Giảm giá (%)</label>
                                <input
                                    type="text"
                                    value={formData.percents}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            percents: parseInt(e.target.value, 10) || 0,
                                        })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-sm font-medium">Điều kiện</label>
                                <input
                                    type="text"
                                    value={formData.condition}
                                    onChange={(e) =>
                                        setFormData({ ...formData, condition: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg mr-3"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddOrUpdateVoucher}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                {isEditing ? "Cập nhật" : "Thêm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VoucherManagement;
