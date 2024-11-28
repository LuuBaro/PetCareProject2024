import React from "react";

function AccountInfo({
                         avatarUrl,
                         setAvatarUrl,
                         userInfo,
                         isEditing,
                         onChange,
                         onSave,
                         onCancel,
                         onEdit,
                         onAvatarUpload,
                     }) {

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const uploadedUrl = await onAvatarUpload(file); // Call parent-provided upload function
            localStorage.setItem("avatarUrl", uploadedUrl); // Optionally persist avatar in localStorage
        } catch (error) {
            console.error("Error in handleAvatarChange:", error);
        }
    };

    return (
        <><h2 className="text-4xl font-extrabold mb-6 text-gray-700 mt-2">Thông tin cá nhân</h2><p
            className="text-sm text-gray-600 mb-6 font-bold italic">
            Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
            <div className="flex items-start">
                <div className="flex flex-col items-center mr-12">
                    <div
                        className="w-36 h-36 bg-gray-200 rounded-full flex items-center justify-center relative border-2 border-blue-400">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
                        ) : (
                            <span className="text-5xl text-blue-400">👤</span>
                        )}
                        <button className="absolute bottom-1 right-1 bg-blue-500 p-2 rounded-full shadow-md">
                            <label className="cursor-pointer text-white">
                                <i className="fas fa-pencil-alt"></i>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </button>
                    </div>
                    <button onClick={() => document.getElementById("avatar-input").click()}
                            className="mt-4 text-sm text-blue-500 font-semibold">
                        Thay đổi ảnh đại diện
                    </button>
                    <input
                        id="avatar-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>

                {/* Information Section */}
                <div className="flex-grow">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Section */}
                        <div>
                            {/* Full Name */}
                            <div className="flex items-center mb-4">
                                <label className="block text-lg font-bold text-gray-700 w-32">Họ & Tên:</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={userInfo.fullName}
                                        onChange={onChange}
                                        className="text-gray-900 text-lg px-4 py-2 border border-gray-300 rounded-lg flex-grow"/>
                                ) : (
                                    <span className="text-gray-900 text-lg flex-grow">
                                        {userInfo.fullName || 'Chưa cập nhật'}
                                    </span>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex items-center">
                                <label className="block text-lg font-bold text-gray-700 w-32">Email:</label>
                                <span className="text-gray-900 text-lg flex-grow">
                                    {userInfo.email
                                        ? `*****${userInfo.email.slice(userInfo.email.indexOf('@') - 3)}`
                                        : 'Chưa cập nhật'}
                                </span>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div>
                            {/* Address */}
                            <div className="flex items-center mb-4">
                                <label className="block text-lg font-bold text-gray-700 w-32">Địa chỉ:</label>
                                <span className="text-gray-900 text-lg flex-grow">
                                    {userInfo.address || 'Chưa cập nhật'}
                                </span>
                                {/*<button*/}
                                {/*    onClick={onEdit} // Xử lý cập nhật địa chỉ*/}
                                {/*    className="text-blue-500 text-sm font-semibold ml-2"*/}
                                {/*>*/}
                                {/*    Cập nhật*/}
                                {/*</button>*/}
                            </div>

                            {/* Phone Number */}
                            <div className="flex items-center">
                                <label className="block text-lg font-bold text-gray-700 w-32">Số điện thoại:</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="phone"
                                        value={userInfo.phone || ""}
                                        onChange={onChange}
                                        className="text-gray-900 text-lg px-4 py-2 border border-gray-300 rounded-lg flex-grow"/>
                                ) : (
                                    <span className="text-gray-900 text-lg flex-grow">
                                        {userInfo.phone && userInfo.phone.trim() !== "null"
                                            ? `****${userInfo.phone.slice(-3)}`
                                            : "Chưa cập nhật"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    {isEditing ? (
                        <div className="flex space-x-4 mt-6">
                            <button
                                onClick={onCancel}
                                className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={onSave}
                                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                            >
                                Lưu
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onEdit}
                            className="mt-6 w-[150px] bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

export default AccountInfo;
