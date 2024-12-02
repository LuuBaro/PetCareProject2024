import React, {useState} from 'react';
import Header from "../header/Header";
import Footer from '../footer/Footer';
import axios from 'axios';
import Sidebar from "../user/Sidebar";
import Swal from "sweetalert2";
import {ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import {storage} from "../../config/firebaseConfig";
import AccountInfo from "../user/accountTabs/AccountInfo";
import ChangePassword from "../user/accountTabs/ChangePassword";
import OrderHistory from "../user/accountTabs/Order";
import Favorites from "../user/accountTabs/Favorites";

export function Account() {
    const [avatarUrl, setAvatarUrl] = useState("");
    const [activeTab, setActiveTab] = useState("account");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: localStorage.getItem('fullName'),
        email: localStorage.getItem('email'),
        phone: localStorage.getItem('phone'),
    });

    const handleEditClick = () => {
        setIsEditing(true); // Switch to edit mode
    };

    const updateUser = async (id, updatedInfo) => {
        try {
            // Get the token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token is missing');
                return; // If token is missing, don't continue
            }

            // Make the API request
            const response = await axios.put(
                `http://localhost:8080/api/users/update/${id}`,
                updatedInfo, // Send the updated user info
                {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Add token to the header
                    }
                }
            );

            console.log('User updated successfully:', response.data);

            // Update localStorage with the new user data
            localStorage.setItem('fullName', response.data.fullName);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('phone', response.data.phone);

            // Update the userInfo state with the new data from the response
            setUserInfo({
                fullName: response.data.fullName,
                email: response.data.email,
                phone: response.data.phone,
            });

        } catch (error) {
            console.error('Error updating user:', error);
            if (error.response && error.response.status === 403) {
                console.error('Forbidden: Check your authorization');
            }
        }
    };

    const handleSaveClick = async () => {
        const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage
        const {...updatedInfo } = userInfo; // Loại bỏ email nếu không cần gửi

        try {
            // Gọi hàm updateUser để xử lý việc cập nhật user
            await updateUser(userId, updatedInfo);

            // Tắt chế độ chỉnh sửa
            setIsEditing(false);

            // Hiển thị thông báo thành công
            Swal.fire("Thành công", "Lưu thông tin tài khoản thành công!", "success");
        } catch (error) {
            console.error("Error updating user:", error);

            // Hiển thị thông báo lỗi
            Swal.fire("Error", "Failed to update user info. Please try again!", "error");
        }
    };

    const handleCancelClick = () => {
        // Reset the userInfo to the original values from localStorage
        setUserInfo({
            fullName: localStorage.getItem('fullName'),
            email: localStorage.getItem('email'),
            phone: localStorage.getItem('phone'),
        });
        setIsEditing(false); // Switch to view mode after canceling
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUserInfo((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateNewPassword = (password) => {
        if (password === currentPassword) {
            setNewPasswordError("Mật khẩu mới không được giống với mật khẩu hiện tại!");
        } else if (password.length < 6) {
            setNewPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự!");
        } else {
            setNewPasswordError(""); // Không có lỗi
        }
    };

    const validateConfirmPassword = (password) => {
        if (password !== newPassword) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp!");
        } else {
            setConfirmPasswordError(""); // Không có lỗi
        }
    };

    const validateInputs = () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId) {
            return "Không tìm thấy thông tin người dùng!";
        }

        if (!token) {
            return "Vui lòng đăng nhập lại để tiếp tục!";
        }

        if (!currentPassword) {
            return "Vui lòng nhập mật khẩu hiện tại!";
        }

        if (!newPassword || newPassword.length < 6) {
            return "Mật khẩu mới phải có ít nhất 6 ký tự!";
        }

        if (newPassword === currentPassword) {
            return "Mật khẩu mới không được giống với mật khẩu hiện tại!";
        }

        if (newPassword !== confirmPassword) {
            return "Mật khẩu mới và xác nhận mật khẩu không khớp!";
        }

        return null; // Không có lỗi
    };

    const handleSave = async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        // Kiểm tra lỗi đầu vào
        const error = validateInputs();
        if (error) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: error,
                confirmButtonText: "OK",
            });
            return;
        }

        // Gửi yêu cầu đổi mật khẩu
        try {
            const response = await axios.put(
                "http://localhost:8080/api/users/change-password",
                {
                    userId, // Đảm bảo gửi đúng định dạng userId mà API yêu cầu
                    currentPassword,
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Hiển thị thông báo thành công
            Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: "Đổi mật khẩu thành công!",
                confirmButtonText: "OK",
            });

            // Reset dữ liệu sau khi thành công
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            // Xử lý lỗi trả về từ API
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: errorMessage,
                confirmButtonText: "OK",
            });
            console.error("Error changing password:", error);
        }
    };

    const handleAvatarUpload = async (file) => {
        if (!file) return;

        try {
            const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => {
                        console.error("Error uploading avatar:", error);
                        Swal.fire("Error", "Failed to upload avatar. Please try again!", "error");
                        reject(error);
                    },
                    async () => {
                        try {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            setAvatarUrl(url);
                            Swal.fire("Thành công", "Tải ảnh đại diện lên thành công!", "success");
                            resolve(url);
                        } catch (error) {
                            console.error("Error getting avatar URL:", error);
                            Swal.fire("Error", "Failed to get avatar URL. Please try again!", "error");
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            console.error("Error in handleAvatarUpload:", error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "account":
                return (
                    <AccountInfo
                        avatarUrl={avatarUrl}
                        setAvatarUrl={setAvatarUrl}
                        userInfo={userInfo}
                        isEditing={isEditing}
                        onChange={handleChange}
                        onEdit={handleEditClick}
                        onSave={handleSaveClick}
                        onCancel={handleCancelClick}
                        onAvatarUpload={handleAvatarUpload}
                    />
                );
            case "changePassword":
                return (
                    <ChangePassword
                        currentPassword={currentPassword}
                        newPassword={newPassword}
                        confirmPassword={confirmPassword}
                        currentPasswordError={currentPasswordError}
                        newPasswordError={newPasswordError}
                        confirmPasswordError={confirmPasswordError}
                        onChangeCurrentPassword={(e) => setCurrentPassword(e.target.value)}
                        onChangeNewPassword={(e) => {
                            setNewPassword(e.target.value);
                            validateNewPassword(e.target.value);
                        }}
                        onChangeConfirmPassword={(e) => {
                            setConfirmPassword(e.target.value);
                            validateConfirmPassword(e.target.value);
                        }}
                        onSave={handleSave}
                    />
                );
            case "orderHistory":
                return <OrderHistory/>;
            case "favorites":
                return <Favorites/>;
            default:
                return <div>Chọn một mục bên trái để xem nội dung</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header/>

            <div className="flex-grow mx-32 p-10 bg-white rounded-lg flex mt-5">
                <Sidebar setActiveTab={setActiveTab} avatarUrl={localStorage.getItem("avatarUrl")} />
                <div
                    className="w-3/4 pl-10 bg-gray-100"
                    style={{minHeight: '70vh', display: 'flex', flexDirection: 'column'}}
                >
                    {renderContent()}</div>
            </div>
            <Footer/>
        </div>
    );
}