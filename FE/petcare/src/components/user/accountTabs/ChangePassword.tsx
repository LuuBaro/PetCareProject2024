import React from "react";

function ChangePassword({
                            currentPassword,
                            newPassword,
                            confirmPassword,
                            currentPasswordError,
                            newPasswordError,
                            confirmPasswordError,
                            onChangeCurrentPassword,
                            onChangeNewPassword,
                            onChangeConfirmPassword,
                            onSave,
                        }) {
    return (
        <div className="items-center">
            <h3 className="text-4xl font-extrabold mb-6 mt-3 text-gray-700">Đổi Mật Khẩu</h3>
            <div>
                <label className="block text-lg font-bold text-gray-700">Mật khẩu hiện tại</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={onChangeCurrentPassword}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    placeholder="Nhập mật khẩu hiện tại"
                />
            </div>
            <div>
                <label className="block text-lg font-bold text-gray-700">Mật khẩu mới</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={onChangeNewPassword}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-2"
                    placeholder="Nhập mật khẩu mới"
                />
                {newPasswordError && <span className="text-red-500">{newPasswordError}</span>}
            </div>
            <div>
                <label className="block text-lg font-bold text-gray-700">Xác nhận mật khẩu mới</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={onChangeConfirmPassword}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Xác nhận mật khẩu mới"
                />
                {confirmPasswordError && <span className="text-red-500">{confirmPasswordError}</span>}
            </div>
            <button onClick={onSave} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6">Lưu</button>
        </div>
    );
}

export default ChangePassword;
