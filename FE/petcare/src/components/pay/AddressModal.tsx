import React, { useEffect, useState } from "react";
import AddressForm from "./AddressForm"; // Import component Form thêm địa chỉ
import { getAddresses, updateAddress } from "../../service/AddressService"; // Các API call để lấy và cập nhật địa chỉ

// Định nghĩa kiểu cho props của Modal
interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null; // ID người dùng
    onAddressSelected: (addressId: number) => void; // Callback khi chọn địa chỉ
    currentCheckoutAddressId: number | null; // ID của địa chỉ hiện tại đang chọn
}

const AddressModal: React.FC<AddressModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       userId,
                                                       onAddressSelected,
                                                       currentCheckoutAddressId,
                                                   }) => {
    const [addresses, setAddresses] = useState<any[]>([]); // Lưu danh sách địa chỉ
    const [isLoading, setIsLoading] = useState(false); // Trạng thái đang tải
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null); // ID địa chỉ đang được chọn
    const [showForm, setShowForm] = useState(false); // Trạng thái hiển thị form thêm địa chỉ
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trạng thái để trigger lại việc fetch địa chỉ

    // Khi Modal mở hoặc thay đổi địa chỉ đang checkout, fetch lại địa chỉ
    useEffect(() => {
        if (isOpen) {
            fetchAddresses(); // Fetch addresses khi modal mở
        }
    }, [isOpen, currentCheckoutAddressId, refreshTrigger]);

    // Hàm gọi API để lấy danh sách địa chỉ của người dùng
    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const response = await getAddresses(userId); // Gọi API lấy địa chỉ
            setAddresses(response); // Lưu vào state
            console.log("Dữ liệu trả về từ API:", response);

            // Tìm địa chỉ hiện tại nếu có
            const currentAddress = response.find(
                (address: any) => address.addressId === currentCheckoutAddressId
            );

            // Nếu có địa chỉ hiện tại, set nó là địa chỉ đã chọn
            if (currentAddress) {
                setSelectedAddressId(currentAddress.addressId);
            } else if (response.length > 0) {
                // Nếu không có địa chỉ hiện tại, chọn địa chỉ mặc định nếu có
                const defaultAddress = response.find((address: any) => address.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.addressId);
                } else {
                    setSelectedAddressId(response[0].addressId); // Chọn địa chỉ đầu tiên nếu không có mặc định
                }
            }
        } catch (error) {
            console.error("Error fetching addresses:", error); // Xử lý lỗi khi fetch địa chỉ
        } finally {
            setIsLoading(false); // Đổi trạng thái khi hoàn thành
        }
    };

    // Hàm kiểm tra ID địa chỉ đang được chọn
    useEffect(() => {
        console.log("Selected Address ID:", selectedAddressId); // Log ra ID địa chỉ chọn
    }, [selectedAddressId]);

    // Hàm thêm một địa chỉ mới vào danh sách
    const handleAddAddress = (newAddress: any) => {
        setAddresses((prev) => [...prev, newAddress]); // Thêm địa chỉ mới vào mảng
        setShowForm(false); // Ẩn form
        setRefreshTrigger((prevTrigger) => prevTrigger + 1); // Trigger refresh
    };

    // Hàm cập nhật địa chỉ đã chọn thành địa chỉ mặc định
    const handleUpdateAddress = async (addressId: number) => {
        try {
            const addressToUpdate = addresses.find(
                (address) => address.addressId === addressId
            );
            if (!addressToUpdate) {
                console.error("Address not found");
                return;
            }

            // Cập nhật địa chỉ đã chọn thành mặc định
            const updatedAddress = { ...addressToUpdate, isDefault: true };

            // Gọi API cập nhật địa chỉ
            const response = await updateAddress(addressId, updatedAddress);

            // Nếu thành công, cập nhật lại danh sách địa chỉ
            if (response) {
                setAddresses((prev) =>
                    prev.map((address) =>
                        address.addressId === addressId ? response : address
                    )
                );
                setRefreshTrigger((prevTrigger) => prevTrigger + 1);
            } else {
                console.error("Failed to update address");
            }
        } catch (error) {
            console.error("Error updating address:", error); // Xử lý lỗi khi cập nhật địa chỉ
        }
    };

    // Hàm chọn địa chỉ
    const handleAddressSelection = (id: number) => {
        setSelectedAddressId(id); // Lưu ID địa chỉ đã chọn
    };

    // Hàm xác nhận địa chỉ đã chọn
    const handleConfirm = () => {
        if (selectedAddressId !== null) {
            // Nếu có địa chỉ đã chọn, gọi callback và đóng modal
            onAddressSelected(selectedAddressId);
            onClose();
        } else {
            // Nếu chưa chọn địa chỉ, cảnh báo người dùng
            alert("Vui lòng chọn địa chỉ giao hàng.");
        }
    };

    // Tách thông tin họ tên và số điện thoại từ fullAddress
    const parseFullAddress = (fullAddress: string) => {
        const lines = fullAddress.split("\n");
        const nameLine = lines[0]?.split(": ")[1]; // Lấy phần sau "Họ và tên: "
        const phoneLine = lines[1]?.split(": ")[1]; // Lấy phần sau "Số điện thoại: "
        const addressLine = lines[2]?.split(": ")[1]; // Lấy phần sau "Địa chỉ: "

        return { name: nameLine, phone: phoneLine, address: addressLine };
    };

    return (
        <div
            className={`modal max-w-md mx-auto bg-white p-4 rounded-md ${isOpen ? "open" : ""}`}
        >
            <h2 className="text-lg font-semibold mb-4">Địa Chỉ Của Tôi</h2>
            {addresses.map((address) => {
                const { name, phone, address: fullAddress } = parseFullAddress(address.fullAddress);
                return (
                    <div key={address.addressId} className="border-b pb-4 mb-4">
                        <div className="flex items-start mb-2">
                            <input
                                type="radio"
                                name="address"
                                className="mt-1 mr-2"
                                id={`address-${address.addressId}`}
                                checked={selectedAddressId === address.addressId}
                                onChange={() => handleAddressSelection(address.addressId)} // Chọn địa chỉ
                            />
                            <label
                                htmlFor={`address-${address.addressId}`}
                                className="flex-grow"
                            >
                                {/* Hiển thị thông tin địa chỉ */}
                                <p className="text-sm text-gray-600 font-semibold">
                                    {name}
                                </p>
                                <p className="text-sm text-gray-600 font-semibold">
                                   {phone}
                                </p>
                                <p className="text-sm text-gray-600">{fullAddress}</p>
                            </label>
                            <button
                                onClick={() => handleUpdateAddress(address.addressId)}
                                className="text-blue-500"
                            >
                                Mặc định
                            </button>
                        </div>
                        {address.isDefault && (
                            <span
                                className="inline-block bg-red-100 text-red-500 border border-red-500 rounded px-2 py-1 text-xs mt-2"
                            >
                                Mặc định
                            </span>
                        )}
                    </div>
                );
            })}

            <button
                onClick={() => setShowForm(true)}
                className="flex items-center text-blue-500 text-sm mb-4"
            >
                <i className="fas fa-plus mr-2"></i> Thêm Địa Chỉ Mới
            </button>
            {showForm && (
                <AddressForm
                    onSubmit={handleAddAddress}
                    onCancel={() => setShowForm(false)}
                    userId={userId}
                />
            )}
            <div className="flex justify-end mt-2">
                <button
                    onClick={onClose}
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                >
                    Hủy
                </button>
                <button
                    onClick={handleConfirm}
                    className="bg-[#00b7c0] text-white px-4 py-2 rounded"
                >
                    Xác nhận
                </button>
            </div>
        </div>
    );
};

export default AddressModal;
