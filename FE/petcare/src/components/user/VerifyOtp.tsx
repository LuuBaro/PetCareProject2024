import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import swal from "sweetalert2";
import axios from "axios";
import Header from "../header/Header";
import Footer from "../footer/Footer";

// Component riêng cho OTPInput
const OtpInput = ({ otp, setOtp }) => {
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Chỉ cho phép nhập số
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Chuyển focus đến ô tiếp theo
    if (value !== "" && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  return (
      <div
          className="grid grid-cols-6 gap-2 mb-6"
          onPaste={(e) => {
            const pasteData = e.clipboardData.getData("Text").replace(/[^0-9]/g, "");
            const otpArray = pasteData.split("").slice(0, otp.length);
            setOtp(otpArray);
          }}
      >
        {otp.map((digit, index) => (
            <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="w-full h-14 text-center border-2 border-gray-300 rounded-lg text-xl font-semibold focus:ring-2 focus:ring-teal-500 transition duration-300 focus:outline-none"
            />
        ))}
      </div>
  );
};

export function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const { state } = useLocation();

  // Lấy email từ URL query string hoặc từ location.state (trong trường hợp người dùng vào từ một màn hình khác)
  const queryParams = new URLSearchParams(window.location.search);
  const emailFromUrl = queryParams.get("email");
  const email = emailFromUrl || state?.email;
  // Đếm ngược thời gian
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Xử lý xác minh OTP
  const handleVerifyOtp = async () => {
    if (otp.some((digit) => digit === "")) {
      swal.fire("Lỗi", "Vui lòng nhập đầy đủ mã OTP.", "warning");
      return;
    }

    console.log("OTP gửi lên: ", otp.join("")); // In ra giá trị OTP để kiểm tra

    try {
      const response = await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email,
        otp: otp.join(""),
      });

      if (response.status === 200) {
        swal.fire("Thành công!", "Xác thực OTP thành công!", "success");
        navigate("/login");
      } else {
        swal.fire("Lỗi", "Mã OTP không hợp lệ.", "error");
      }
    } catch (error) {
      swal.fire(
          "Lỗi",
          error.response?.data || "Đã xảy ra lỗi. Vui lòng thử lại.",
          "error"
      );
    }
  };

  // Xử lý gửi lại OTP
  const handleResendOtp = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/resend-otp", { email });
      swal.fire(
          "Thành công!",
          "Mã OTP đã được gửi lại. Vui lòng kiểm tra email.",
          "success"
      );
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
    } catch (error) {
      swal.fire(
          "Lỗi",
          error.response?.data || "Đã xảy ra lỗi khi gửi lại mã OTP.",
          "error"
      );
    }
  };

  // Định dạng thời gian
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
      <>
        <Header />
        <div className="h-screen flex items-center justify-center bg-gradient-to-br">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full border-t-4 border-t-teal-500">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Xác nhận OTP
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Nhập mã OTP đã được gửi đến email: {email}
            </p>

            {/* Component nhập OTP */}
            <OtpInput otp={otp} setOtp={setOtp} />

            <div className={`text-center mb-6 ${timer <= 10 ? "text-red-500" : "text-gray-600"}`}>
              <p className="text-lg font-medium">Thời gian còn lại: {formatTime(timer)}</p>
            </div>

            <button
                onClick={handleVerifyOtp}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-300 ease-in-out"
            >
              Xác nhận
            </button>

            {timer === 0 && (
                <p
                    onClick={handleResendOtp}
                    className="text-center text-sm text-teal-500 cursor-pointer mt-2 hover:underline"
                >
                  Gửi lại mã OTP
                </p>
            )}
          </div>
        </div>
        <Footer />
      </>
  );
}

export default OTPVerification;
