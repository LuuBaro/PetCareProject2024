import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Header from "../header/Header";
import Modal from "react-modal";
import Swal from "sweetalert2";
import axios from "axios";
import AddressModal from "./AddressModal";
import {getProvinces, getDistricts, getWards, addAddress} from '../../service/AddressService';

const API_BASE_URL = 'https://online-gateway.ghn.vn/shiip/public-api'; // Base URL của API Giao Hàng Nhanh
const TOKEN = '0fe4c8c9-71cd-11ef-9839-ea1b8b4124d2'; // Thay bằng token thật của bạn
const SHOP_ID = '5321275'; // Thay bằng shop ID của bạn

interface Product {
    productId: number;
    productDetailId: number; // Thêm productDetailId
    image: string;
    productName: string;
    price: number;
    quantity: number;
    color: string;  // Thêm màu sắc
    weight: number; // Thêm cân nặng
    size: string; // Thêm kích thước
}
interface AddressFormProps {
    onSubmit: (newAddress: any) => void;
    onCancel: () => void;
    userId: string | null;
}

Modal.setAppElement('#root');
const Checkout: React.FC<AddressFormProps> = ({onSubmit, onCancel}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const products: Product[] = location.state?.products || [];
    const total: number = location.state?.total || 0;
    const [shippingFee, setShippingFee] = useState(0); // Khởi tạo phí vận chuyển
    const [refreshCheckout, setRefreshCheckout] = useState(0);
    // const [shippingFee, setShippingFee] = useState<number>(0);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId) {
        throw new Error("User ID is missing from local storage");
    }

    const [address, setAddress] = useState<any | null>(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [vnpResponseCode, setVnpResponseCode] = useState<string | null>(null);

    //API GHN
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '', // Thêm họ và tên
        phone: '', // Thêm số điện thoại
        ward: '',
        address: '',
        isDefault: false
    });

    const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(true);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
    const [isLoadingWards, setIsLoadingWards] = useState<boolean>(false);


    const [vouchers, setVouchers] = useState([]); // Lưu danh sách voucher
    const [selectedVoucher, setSelectedVoucher] = useState(null); // Mã voucher được chọn
    const [isVoucherListOpen, setIsVoucherListOpen] = useState(false); // Trạng thái mở/đóng danh sách voucher
    const [discountPercent, setDiscountPercent] = useState(0); // Phần trăm giảm giá từ voucher
    const [discountAmount, setDiscountAmount] = useState(0); // Số tiền được giảm
    const [finalTotal, setFinalTotal] = useState(total - shippingFee);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedDistrictObj = districts.find(d => d.DistrictID === parseInt(selectedDistrict, 10));
        const selectedWardObj = wards.find(w => w.WardCode === formData.ward);

        const addressData = {
            fullAddress: `Họ và tên: ${formData.name}\nSố điện thoại: ${formData.phone}\nĐịa chỉ: ${formData.address}, ${selectedWardObj?.WardName}, ${selectedDistrictObj?.DistrictName}, ${selectedProvince}`,
            street: formData.address,
            province: selectedProvince,
            district: selectedDistrictObj ? selectedDistrictObj.DistrictName : '',
            ward: selectedWardObj ? selectedWardObj.WardName : '',
            userId: { id: userId }
        };

        try {
            const result = await addAddress(addressData);
            if (result) {
                onSubmit(result);
            } else {
                console.error('Invalid address data');
            }
        } catch (error) {
            console.error('Error adding address:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const data = await getProvinces();
                setProvinces(data);
            } catch (error) {
                console.error('Error fetching provinces:', error);
            } finally {
                setIsLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedProvince) {
                setIsLoadingDistricts(true);
                const selectedProvinceData = provinces.find(p => p.ProvinceName === selectedProvince);
                const provinceId = selectedProvinceData ? selectedProvinceData.ProvinceID : null;

                if (provinceId) {
                    try {
                        const data = await getDistricts(provinceId);
                        setDistricts(data);
                    } catch (error) {
                        console.error('Error fetching districts:', error);
                        setDistricts([]);
                    }
                }
            } else {
                setDistricts([]);
            }
            setIsLoadingDistricts(false);
        };
        fetchDistricts();
    }, [selectedProvince, provinces]);

    useEffect(() => {
        const fetchWards = async () => {
            if (selectedDistrict) {
                setIsLoadingWards(true);
                const districtId = parseInt(selectedDistrict, 10);
                try {
                    const data = await getWards(districtId);
                    setWards(data);
                } catch (error) {
                    console.error('Error fetching wards:', error);
                    setWards([]);
                }
                setIsLoadingWards(false);
            } else {
                setWards([]);
            }
        };
        fetchWards();
    }, [selectedDistrict]);

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const clearCartAfterCheckout = () => {
        localStorage.removeItem("cartItems");
        console.log("Giỏ hàng đã được xóa sau khi thanh toán thành công.");
    };


// Hàm tính phí vận chuyển
    const calculateShippingFee = async ({ toDistrictId, toWardCode, weight }) => {
        try {
            const payload = {
                shop_id: SHOP_ID,
                to_district_id: toDistrictId,
                to_ward_code: toWardCode,
                weight: weight || 1000, // Trọng lượng mặc định
                service_type_id: 2, // E-Commerce Delivery
            };

            console.log("Payload gửi đến GHN:", payload);

            const response = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: TOKEN,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Lỗi từ GHN:", errorData);
                throw new Error(`Lỗi tính phí: ${errorData.message || "Không xác định"}`);
            }

            const data = await response.json();
            return data.data.total; // Trả về phí vận chuyển
        } catch (error) {
            console.error("Lỗi kết nối API GHN:", error.message);
            throw error; // Để xử lý tiếp ở phần gọi hàm
        }
    };

// Tính lại phí vận chuyển khi người dùng chọn địa chỉ mới
    useEffect(() => {
        // Kiểm tra nếu đủ thông tin quận/huyện và phường/xã
        if (selectedDistrict && formData.ward) {
            const selectedDistrictObj = districts.find(d => d.DistrictID === parseInt(selectedDistrict, 10));
            const selectedWardObj = wards.find(w => w.WardCode === formData.ward);

            // Tính phí vận chuyển
            const fetchShippingFee = async () => {
                try {
                    const fee = await calculateShippingFee({
                        toDistrictId: selectedDistrictObj.DistrictID,
                        toWardCode: selectedWardObj.WardCode,
                        weight: 1000, // Trọng lượng giả định
                    });
                    setShippingFee(fee);
                } catch (error) {
                    console.error("Không thể tính phí vận chuyển:", error.message);
                    setShippingFee(0); // Nếu có lỗi, để phí vận chuyển bằng 0
                }
            };

            fetchShippingFee();
        }
    }, [selectedDistrict, formData.ward]); // Chạy lại khi thay đổi district hoặc ward

    const handlePayment = async () => {
        const selectedDistrictObj = districts.find(d => d.DistrictID === parseInt(selectedDistrict, 10));
        const selectedWardObj = wards.find(w => w.WardCode === formData.ward);

        // Kiểm tra các thông tin cần thiết
        if (!formData.name || !formData.phone || !formData.address || !selectedProvince || !selectedDistrict || !formData.ward) {
            Swal.fire({
                icon: "warning",
                title: "Thiếu thông tin",
                text: "Vui lòng cung cấp đầy đủ thông tin địa chỉ giao hàng.",
            });
            return;
        }

        if (!selectedPaymentMethod) {
            Swal.fire({
                icon: "warning",
                title: "Thiếu phương thức thanh toán",
                text: "Vui lòng chọn phương thức thanh toán.",
            });
            return;
        }

        if (products.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Giỏ hàng trống",
                text: "Giỏ hàng trống, không thể thanh toán.",
            });
            return;
        }

        // Tính phí vận chuyển
        let shippingFee = 0;
        try {
            shippingFee = await calculateShippingFee({
                toDistrictId: selectedDistrictObj.DistrictID,
                toWardCode: selectedWardObj.WardCode,
                weight: 1000, // Trọng lượng giả định
            });
            console.log("Phí vận chuyển:", shippingFee);
        } catch (error) {
            console.error("Không thể tính phí vận chuyển:", error.message);
            Swal.fire({
                icon: "error",
                title: "Lỗi tính phí vận chuyển",
                text: "Vui lòng kiểm tra lại địa chỉ hoặc thử lại sau.",
            });
            return;
        }

        const totalWithShipping = total + shippingFee;
        const storedVoucher = JSON.parse(localStorage.getItem('selectedVoucher'));

        const orderData = {
            products: products.map((productDetail) => ({
                productDetailId: productDetail.productDetailId,
                quantity: productDetail.quantity,
                price: productDetail.price,
                productName: productDetail.productName,
            })),
            shippingCost: shippingFee,
            voucherId: selectedVoucher?.voucherId || null,
            total: finalTotal - shippingFee, // Dòng này đã trừ discountAmount nhưng `totalWithShipping` đã bao gồm phí ship trước đó.
            address: `Họ và tên: ${formData.name}\nSố điện thoại: ${formData.phone}\nĐịa chỉ: ${formData.address}, ${selectedWardObj?.WardName}, ${selectedDistrictObj?.DistrictName}, ${selectedProvince}`,
            userId: userId,
        };
        console.log("Dữ liệu đơn hàng:", orderData);

        // Trừ số lượng voucher qua API khi đặt hàng
        if (storedVoucher) {
            try {
                const decrementResponse = await fetch(`http://localhost:8080/api/vouchers/${storedVoucher.voucherId}/decrement`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!decrementResponse.ok) {
                    const errorText = await decrementResponse.text();
                    throw new Error(`${errorText}`);
                }

                console.log("Số lượng voucher đã được giảm");

            } catch (error) {
                console.error("Lỗi khi trừ số lượng voucher:", error.message);
                Swal.fire({
                    icon: "error",
                    title: "Lỗi khi trừ số lượng voucher",
                    text: error.message,
                });
                return;
            }
        }

        // Xử lý thanh toán COD
        if (selectedPaymentMethod === "cod") {
            try {
                console.log("Đang tiến hành thanh toán COD...");
                const response = await fetch("http://localhost:8080/api/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...orderData,
                        paymentMethod: "COD",
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Thanh toán thất bại: ${errorText}`);
                }

                Swal.fire({
                    title: "Thanh toán thành công!",
                    text: "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ được xử lý ngay.",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    clearCartAfterCheckout();
                    navigate("/");
                });
            } catch (error) {
                console.error("Lỗi khi thanh toán COD:", error.message);
                Swal.fire({
                    icon: "error",
                    title: "Thanh toán thất bại",
                    text: error.message,
                });
            }
        }

        // Xử lý thanh toán VNPay
        else if (selectedPaymentMethod === "vnpay") {
            try {
                const paymentResponse = await fetch("http://localhost:8080/api/pay", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount: totalWithShipping,
                        returnUrl: "http://localhost:5173/",
                    }),
                });

                if (!paymentResponse.ok) {
                    const errorText = await paymentResponse.text();
                    throw new Error(`Thanh toán VNPay thất bại: ${errorText}`);
                }

                const paymentData = await paymentResponse.json();
                const checkoutResponse = await fetch("http://localhost:8080/api/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...orderData,
                        paymentMethod: "VNPAY",
                    }),
                });

                if (!checkoutResponse.ok) {
                    const errorText = await checkoutResponse.text();
                    throw new Error(`Lỗi khi tạo đơn hàng: ${errorText}`);
                }

                window.location.href = paymentData.paymentUrl; // Chuyển hướng tới trang thanh toán VNPay
            } catch (error) {
                console.error("Lỗi khi thanh toán VNPay:", error.message);
                Swal.fire({
                    icon: "error",
                    title: "Thanh toán VNPay thất bại",
                    text: error.message,
                });
            }
        }
    };



    const handlePaymentSelect = (method) => {
        setSelectedPaymentMethod(method);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDistrictID = e.target.value;
        setSelectedDistrict(selectedDistrictID);
        setFormData(prevFormData => ({
            ...prevFormData,
            district: districts.find(d => d.DistrictID === parseInt(selectedDistrictID, 10))?.DistrictName || ''
        }));
        setWards([]);

    };

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    const saveAddress = async (newAddress: any) => {
        const formattedFullAddress = `${newAddress.street}, ${newAddress.ward}, ${newAddress.district}, ${newAddress.province}`;

        try {
            const response = await fetch("http://localhost:8080/api/addresses", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    userId,
                    fullAddress: formattedFullAddress,
                    ...newAddress,
                }),
            });

            if (!response.ok) throw new Error("Failed to save address.");

            setAddress(formattedFullAddress);
            closeModal();
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Could not save address.");
        }
    };


    // Gọi API để lấy danh sách voucher
    useEffect(() => {
        fetch('http://localhost:8080/api/vouchers')
            .then((response) => response.json())
            .then((data) => setVouchers(data))
            .catch((error) => console.error('Error fetching vouchers:', error));
    }, []);

    // Xử lý khi người dùng chọn một voucher
    const handleVoucherSelect = (voucherId) => {
        const selected = vouchers.find((voucher) => voucher.voucherId === voucherId);
        if (selected) {
            setSelectedVoucher(selected); // Lưu toàn bộ thông tin voucher
            setDiscountPercent(selected.percents); // Lưu phần trăm giảm giá
            setIsVoucherListOpen(false); // Đóng danh sách
        }
    };


// Hàm tính toán và áp dụng mã giảm giá
    const applyVoucher = () => {
        if (!selectedVoucher) {
            Swal.fire({
                icon: "warning",
                title: "Chưa chọn mã giảm giá",
                text: "Vui lòng chọn mã giảm giá để áp dụng.",
            });
            return;
        }
        // Kiểm tra nếu tổng tiền của hóa đơn <= minPurchaseAmount của voucher
        if (finalTotal > selectedVoucher.minPurchaseAmount) {
            Swal.fire({
                icon: "warning",
                title: "Không đủ điều kiện",
                text: `Đơn hàng của bạn không đủ điều kiện để áp dụng mã giảm giá này.`,
            });
            return;
        }
        const discount = (total + shippingFee) * (selectedVoucher.percents / 100);
        setDiscountPercent(selectedVoucher.percents);
        setDiscountAmount(discount);
        setFinalTotal(total + shippingFee - discount);

        Swal.fire({
            icon: "success",
            title: "Mã giảm giá áp dụng thành công",
            text: `Giảm giá: ${selectedVoucher.percents}% (${formatPrice(discount)})`,
        });
        // Lưu voucher đã chọn mà chưa trừ số lượng
        localStorage.setItem('selectedVoucher', JSON.stringify(selectedVoucher));  // Lưu voucher vào localStorage
    };


// Cập nhật giá trị tổng cộng khi phí vận chuyển hoặc tiền hàng thay đổi
    useEffect(() => {
        setFinalTotal(total + shippingFee - discountAmount);
    }, [total, shippingFee, discountAmount]);

// Hàm bỏ chọn voucher
    const removeVoucher = () => {
        setSelectedVoucher(null); // Xóa voucherId
        setDiscountPercent(0); // Đặt phần trăm giảm giá về 0
        setDiscountAmount(0); // Đặt số tiền giảm giá về 0
        setFinalTotal(total + shippingFee); // Cập nhật lại giá trị tổng cộng không giảm giá

        Swal.fire({
            icon: "info",
            title: "Voucher đã được bỏ chọn",
            text: "Đơn hàng sẽ được tính với giá gốc.",
        });
    };
    const getRemainingDays = (startDate, endDate) => {
        const today = new Date();
        const start = new Date(startDate);  // Ngày bắt đầu
        const end = new Date(endDate);      // Ngày kết thúc

        // Kiểm tra nếu ngày hiện tại trước ngày bắt đầu voucher
        if (today < start) {
            return -1;  // Trả về -1 nếu voucher chưa bắt đầu, nghĩa là không thể sử dụng
        }

        const timeDifference = end - today;
        const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return daysLeft;
    };



    return (
        <div>
            <Header />
            <div className="bg-gray-100 min-h-screen p-4 flex gap-6">
                {/* Bên trái: Thông tin địa chỉ và thanh toán */}
                <div className="w-2/4 bg-white shadow-md rounded-lg p-6">
                    {/* Địa chỉ giao hàng */}
                    <div className="border-b pb-4 mb-4">
                        <h2 className="text-xl font-bold text-[#00b7c0] mb-2">
                            Địa Chỉ Nhận Hàng
                        </h2>
                        <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
                            {/* Họ và Tên và Số điện thoại */}
                            <div className="flex mb-4 space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Họ và Tên:
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-2 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Số điện thoại:
                                    </label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-2 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Địa chỉ cụ thể */}
                            <div className="mb-4">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Địa chỉ cụ thể:
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-2 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Tỉnh/Thành phố, Quận/Huyện, Phường/Xã */}
                            <div className="flex mb-4 space-x-4">
                                <div className="flex-1">
                                    <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                                        Tỉnh/Thành phố:
                                    </label>
                                    <select
                                        id="province"
                                        name="province"
                                        value={selectedProvince}
                                        onChange={(e) => {
                                            setSelectedProvince(e.target.value);
                                            setSelectedDistrict('');
                                            setFormData((prev) => ({...prev, ward: ''}));
                                        }}
                                        className="mt-1 block w-full px-2 py-1 border border-gray-400 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Chọn tỉnh/thành phố</option>
                                        {provinces.map((province) => (
                                            <option key={province.ProvinceID} value={province.ProvinceName}>
                                                {province.ProvinceName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                                        Quận/Huyện:
                                    </label>
                                    <select
                                        id="district"
                                        name="district"
                                        value={selectedDistrict}
                                        onChange={handleDistrictChange}
                                        className="mt-1 block w-full px-2 py-1 border border-gray-400 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                        disabled={!selectedProvince}
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map((district) => (
                                            <option key={district.DistrictID} value={district.DistrictID}>
                                                {district.DistrictName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label htmlFor="ward" className="block text-sm font-medium text-gray-700">
                                        Phường/Xã:
                                    </label>
                                    <select
                                        id="ward"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-2 py-1 border border-gray-400 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        {wards.map((ward) => (
                                            <option key={ward.WardCode} value={ward.WardCode}>
                                                {ward.WardName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </form>


                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="border-b pb-4 mb-4">
                        <h2 className="text-xl font-bold text-[#00b7c0] mb-2">
                            Phương Thức Thanh Toán
                        </h2>

                        {/* Hiển thị phương thức thanh toán đã chọn */}
                        <p className="mb-4">
                            {selectedPaymentMethod === "cod"
                                ? "Thanh toán khi nhận hàng (COD)"
                                : selectedPaymentMethod === "vnpay"
                                    ? "Thanh toán bằng VNPay"
                                    : "Chưa chọn phương thức thanh toán"}
                        </p>

                        {/* Các ô chọn phương thức thanh toán */}
                        <div className="space-y-4">
                            {/* Ô chọn COD */}
                            <div
                                className={`border p-4 rounded-md cursor-pointer flex items-center ${selectedPaymentMethod === "cod" ? "border-[#00b7c0]" : "border-gray-300"
                                }`}
                                onClick={() => handlePaymentSelect("cod")}
                            >
                                <div className="custom-radio mr-2">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="paymentMethod"
                                        checked={selectedPaymentMethod === "cod"}
                                        onChange={() => handlePaymentSelect("cod")}
                                        className="hidden"
                                    />
                                    <div
                                        className={`w-5 h-5 border-2 rounded-full ${selectedPaymentMethod === "cod" ? "bg-[#00b7c0]" : "border-gray-300"}`}
                                    ></div>
                                </div>
                                <img
                                    src="https://hstatic.net/0/0/global/design/seller/image/payment/cod.svg?v=6"
                                    alt="COD"
                                    className="w-6 h-6 mr-2"
                                />
                                <label htmlFor="cod" className="font-medium">
                                    Thanh toán khi giao hàng (COD)
                                </label>
                            </div>

                            {/* Ô chọn VNPay */}
                            <div
                                className={`border p-4 rounded-md cursor-pointer flex items-center ${selectedPaymentMethod === "vnpay" ? "border-[#00b7c0]" : "border-gray-300"
                                }`}
                                onClick={() => handlePaymentSelect("vnpay")}
                            >
                                <div className="custom-radio mr-2">
                                    <input
                                        type="radio"
                                        id="vnpay"
                                        name="paymentMethod"
                                        checked={selectedPaymentMethod === "vnpay"}
                                        onChange={() => handlePaymentSelect("vnpay")}
                                        className="hidden"
                                    />
                                    <div
                                        className={`w-5 h-5 border-2 rounded-full ${selectedPaymentMethod === "vnpay" ? "bg-[#00b7c0]" : "border-gray-300"}`}
                                    ></div>
                                </div>
                                <img
                                    src="https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg"
                                    alt="VNPay"
                                    className="w-6 h-6 mr-2"
                                />
                                <label htmlFor="vnpay" className="font-medium">
                                    Thanh toán bằng VNPay
                                </label>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Bên phải: Danh sách sản phẩm */}
                <div className="w-3/4 bg-white shadow-md rounded-lg p-6">
                    {/* Danh sách sản phẩm */}
                    <div>
                        <h2 className="text-xl font-bold text-[#00b7c0] mb-4">
                            Danh Sách Sản Phẩm
                        </h2>
                        <table className="w-full table-auto mb-4">
                            <thead>
                            <tr className="border-b-2 border-[#F2BC27] font-bold text-lg">
                                <th className="p-2 text-left">Sản phẩm</th>
                                <th className="p-2 text-left">Đơn giá</th>
                                <th className="p-2 text-left">Màu sắc</th>
                                <th className="p-2 text-left">Kích thước</th>
                                <th className="p-2 text-left">Cân nặng</th>
                                <th className="p-2 text-left">Số lượng</th>
                                <th className="p-2 text-right">Thành tiền</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((product) => (
                                <tr key={product.productId} className="border-t">
                                    <td className="p-2 flex items-center">
                                        <img
                                            src={product.image}
                                            alt={product.productName}
                                            className="w-16 h-16 object-cover rounded-lg mr-4"
                                        />
                                        <span>{product.productName}</span>
                                    </td>
                                    <td className="p-2">{formatPrice(product.price)}</td>
                                    <td className="p-2">{product.color}</td>
                                    <td className="p-2">{product.size}</td>
                                    <td className="p-2">{product.weight} kg</td>
                                    <td className="p-2">{product.quantity}</td>
                                    <td className="p-2 text-right font-bold">
                                        {formatPrice(product.price * product.quantity)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mã giảm giá */}
                    <div className="border-b pb-4 mb-4">
                        <h3 className="text-lg font-bold text-[#00b7c0] mb-2">Mã Giảm Giá</h3>
                        <div className="flex">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={selectedVoucher ? selectedVoucher.name : ''} // Hiển thị tên voucher nếu đã chọn
                                    placeholder="Nhập mã giảm giá"
                                    className="border border-gray-300 rounded-lg p-2 w-full"
                                    onFocus={() => setIsVoucherListOpen(true)} // Mở danh sách khi người dùng focus vào input
                                    readOnly // Không cho phép người dùng tự gõ vào trường này
                                />
                                {/* Hiển thị danh sách voucher */}
                                {isVoucherListOpen && (
                                    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {vouchers
                                            .filter((voucher) => total >= voucher.condition) // Lọc chỉ các voucher thỏa điều kiện
                                            .map((voucher) => {
                                                const daysLeft = getRemainingDays(voucher.startDate, voucher.endDate); // Sử dụng startDate và endDate
                                                const isExpired = daysLeft <= 0;
                                                const isNotStarted = daysLeft === -1; // Nếu voucher chưa bắt đầu

                                                return (
                                                    <div
                                                        key={voucher.voucherId}
                                                        className={`p-2 cursor-pointer ${isExpired || isNotStarted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                                        onClick={() => {
                                                            if (!isExpired && !isNotStarted) handleVoucherSelect(voucher.voucherId); // Chỉ gọi khi chưa hết hạn và chưa bắt đầu
                                                        }}
                                                    >
                                                        <div className="font-semibold">{voucher.name}</div>
                                                        <div
                                                            className="text-sm text-gray-500">Giảm {voucher.percents}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">Số lượng còn
                                                            lại: {voucher.quantity}</div>
                                                        <div
                                                            className={`text-xs font-medium ${isExpired ? 'text-red-500' : (isNotStarted ? 'text-yellow-500' : 'text-green-500')}`}
                                                        >
                                                            {isExpired
                                                                ? 'Voucher đã hết hạn'
                                                                : isNotStarted
                                                                    ? 'Voucher chưa bắt đầu'
                                                                    : `${daysLeft} ngày còn lại`}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        {/* Hiển thị thông báo nếu không có voucher nào thỏa điều kiện */}
                                        {vouchers.filter((voucher) => total >= voucher.condition).length === 0 && (
                                            <div className="text-center p-2 text-gray-500">
                                                Không có voucher nào phù hợp với tổng tiền của bạn.
                                            </div>
                                        )}

                                        {/* Thông báo nếu tất cả voucher đều chưa bắt đầu */}
                                        {vouchers.filter((voucher) => total >= voucher.condition && getRemainingDays(voucher.startDate, voucher.endDate) === -1).length > 0 && (
                                            <div className="text-center p-2 text-yellow-500">
                                                Một số voucher chưa tới ngày sử dụng.
                                            </div>
                                        )}
                                    </div>
                                )}


                            </div>
                            <button
                                className="bg-[#00b7c0] text-white px-10 rounded-lg ml-2 flex-1"
                                onClick={applyVoucher}
                            >
                                Áp dụng
                            </button>
                        </div>
                        {discountPercent > 0 && (
                            <div className="mt-2 text-sm text-gray-700 flex justify-between items-center">
                                <div>
                                    Giảm giá: <strong>{discountPercent}%</strong> ({formatPrice(discountAmount)})
                                </div>
                                <button
                                    className="flex items-center bg-red-100 text-red-500 hover:bg-red-200 py-2 rounded-lg shadow-sm transition ease-in-out duration-200 px-5"
                                    onClick={() => {
                                        removeVoucher(); // Xóa giảm giá
                                        setSelectedVoucher(''); // Xóa giá trị input
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5 mr-1"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Bỏ chọn
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tổng cộng */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">Tổng tiền hàng</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">Phí vận chuyển</span>
                            <span>{formatPrice(shippingFee)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center mb-4 text-sm text-green-500">
                                <span>Giảm giá</span>
                                <span>-{formatPrice(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center font-bold text-xl text-red-500">
                            <span>Tổng cộng</span>
                            <span>{formatPrice(finalTotal)}</span>
                        </div>
                        <button
                            onClick={handlePayment}
                            className="w-full bg-[#00b7c0] text-white px-6 py-2 rounded-lg hover:bg-[#41797c] transition mt-4"
                        >
                            Đặt hàng
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;