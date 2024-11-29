import { useState, useEffect } from "react";
import React from "react";
import { Typography, Input, Button } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisiblity = () => setPasswordShown((cur) => !cur);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userRole", data.roleName); // Save user role
        localStorage.setItem("isAuthenticated", "true"); // Set authenticated status
        localStorage.setItem("fullName", data.fullName); // Lưu fullName vào localStorage
        localStorage.setItem("phone", data.phone);
        localStorage.setItem("email", data.email);
        console.log(data);

        Swal.fire({
          title: "Đăng nhập thành công!",
          text: `Xin chào ${data.fullName}`,
          icon: "success",
          confirmButtonText: "OK",
        });

        const userRole = localStorage.getItem("userRole");
        console.log("User Role:", userRole); // Kiểm tra giá trị
        if (userRole === "Admin") {
          navigate("/admin"); // Chuyển hướng ngay lập tức tới trang admin
        } else {
          navigate("/"); // Hoặc trang khác cho người dùng thông thường
        } // Navigate to the main page
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Đăng nhập thất bại!",
          text: errorData.message || "Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage(
        "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại."
      );

      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Đã xảy ra lỗi trong quá trình đăng nhập.",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const handleForgotPasswordSubmit = async () => {
    localStorage.removeItem("token"); // Xóa token khi logout
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("fullName");
    localStorage.removeItem("phone");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    try {
      const response = await fetch("http://localhost:8080/api/auth/sendemail-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
  
      if (response.ok) {
        Swal.fire({
          title: "Thành công!",
          text: "Hướng dẫn đặt lại mật khẩu đã được gửi qua email.",
          icon: "success",
          confirmButtonText: "OK",
        });
        setForgotPasswordModalOpen(false);
      } else {
        const errorData = await response.json();
  
        // Kiểm tra xem thông báo lỗi có phải là "Email không tồn tại"
        if (errorData.message && errorData.message === "Email không tồn tại") {
          setErrorMessage("Email không tồn tại. Vui lòng kiểm tra lại.");
        } else {
          Swal.fire({
            icon: "error",
            title: "Thất bại!",
            text: errorData.message || "Không thể gửi email khôi phục.",
          });
        }
      }
    } catch (error) {
      console.error("Error during forgot password:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Email không tồn tại. Vui lòng kiểm tra lại.",
      });
    }
  };
  


  // Hàm xử lý đăng nhập bằng Google
  const handleGoogleLogin = async (response) => {
    if (response && response.credential) {
      const token = response.credential;
      console.log("Google Token:", token);

      try {
        const res = await fetch("http://localhost:8080/api/auth/google-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }), // Gửi token kèm theo trong body
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("userRole", data.roleName);
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("fullName", data.fullName);
          localStorage.setItem("email", data.email);

          Swal.fire({
            title: "Đăng nhập thành công!",
            text: `Xin chào ${data.fullName}`,
            icon: "success",
            confirmButtonText: "OK",
          });

          navigate("/");
        } else {
          Swal.fire({
            icon: "error",
            title: "Đăng nhập Google thất bại!",
            text: "Vui lòng thử lại.",
          });
        }
      } catch (error) {
        console.error("Error during Google login:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Đã xảy ra lỗi trong quá trình đăng nhập Google.",
        });
      }
    } else {
      // Xử lý trường hợp không lấy được token từ Google hoặc lỗi phản hồi từ Google
      Swal.fire({
        icon: "error",
        title: "Lỗi đăng nhập!",
        text: "Không thể lấy token từ Google. Vui lòng thử lại.",
      });
    }
  };

  const handleFacebookLogin = (response) => {
    if (response.authResponse) {
      console.log("Welcome! Fetching your information....");

      // Gọi Facebook API để lấy thông tin người dùng
      window.FB.api("/me", { fields: "id,name,email" }, async function (user) {
        console.log(user);
        console.log("Successful login for: " + user.name);
        console.log("Email: " + user.email);
        console.log("User ID: " + user.id);
        // In ra accessToken để kiểm tra
        console.log("Access Token:", response.authResponse.accessToken);
        try {
          const res = await fetch(
            "http://localhost:8080/api/auth/facebook-login",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: user.id, // Thêm ID
                name: user.name,
                email: user.email,
                accessToken: response.authResponse.accessToken,
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("userRole", data.roleName);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("fullName", data.fullName);
            localStorage.setItem("email", data.email);
            console.log(data.email);
            console.log("User Role: " + data.roleName);
            Swal.fire({
              title: "Đăng nhập thành công!",
              text: `Xin chào ${data.fullName}`,
              icon: "success",
              confirmButtonText: "OK",
            });
            navigate("/");
          } else {
            const errorData = await res.json();
            Swal.fire({
              icon: "error",
              title: "Đăng nhập Facebook thất bại!",
              text: errorData.message || "Vui lòng thử lại.",
            });
          }
        } catch (error) {
          console.error("Error during Facebook login:", error);
          Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: "Đã xảy ra lỗi trong quá trình đăng nhập Facebook.",
          });
        }
      });
    } else {
      console.log("User cancelled login or did not fully authorize.");
      Swal.fire({
        icon: "warning",
        title: "Đã hủy đăng nhập!",
        text: "Vui lòng thử lại.",
      });
    }
  };

  useEffect(() => {
    // Khởi tạo Google Sign-In
    window.google.accounts.id.initialize({
      client_id:
        "854614351620-s8cmgi8ticqj4p2jlqedf4drbis3s7oj.apps.googleusercontent.com",
      callback: handleGoogleLogin,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login-button"),
      { theme: "outline", size: "large" }
    );

    // Khởi tạo Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "536613939122715", // Thay thế bằng App ID của bạn
        cookie: true, // Enable cookies để server có thể truy cập phiên
        xfbml: true, // Parse các social plugin trên trang
        version: "v16.0", // Phiên bản API của Facebook
      });
    };

    // Tải SDK của Facebook
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  return (
    <section className="grid text-center h-screen items-center p-8">
      <div className="border border-gray-250 max-w-[440px] w-full mx-auto p-10 rounded-md">
        <Typography variant="h3" color="blue-gray" className="mb-2">
          Đăng Nhập
        </Typography>
        <Typography className="mb-10 text-gray-600 font-extralight text-base">
          Nhập email và mật khẩu của bạn để đăng nhập
        </Typography>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-[24rem] text-left"
        >
          <div className="mb-6">
            <label htmlFor="email">
              <Typography
                variant="small"
                className="mb-2 block font-medium text-gray-900"
              >
                Email
              </Typography>
            </label>
            <Input
              id="email"
              color="gray"
              size="lg"
              type="email"
              name="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }} // Clear error message
              className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
              labelProps={{ className: "hidden" }}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password">
              <Typography
                variant="small"
                className="mb-2 block font-medium text-gray-900"
              >
                Mật khẩu
              </Typography>
            </label>
            <Input
              size="lg"
              placeholder="********"
              labelProps={{ className: "hidden" }}
              className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
              type={passwordShown ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }} // Clear error message
              icon={
                <i onClick={togglePasswordVisiblity}>
                  {passwordShown ? (
                    <EyeIcon
                      className="h-5 w-5 absolute"
                      style={{ transform: "translate(1650%, 60%)" }}
                    />
                  ) : (
                    <EyeSlashIcon
                      className="h-5 w-5 absolute"
                      style={{ transform: "translate(1650%, 60%)" }}
                    />
                  )}
                </i>
              }
              required
            />
          </div>
          <Button
            color="gray"
            size="lg"
            className="mt-6 p-3 bg-black"
            fullWidth
            type="submit"
          >
            Đăng nhập
          </Button>
          <div className="!mt-4 flex justify-end">
            <Typography
              as="button"
              color="blue-gray"
              variant="small"
              onClick={() => setForgotPasswordModalOpen(true)} // Open modal
            >
              Quên mật khẩu?
            </Typography>
          </div>
          {/* Nút đăng nhập với Google */}
          <button
            id="google-login-button"
            className="border border-gray-300 w-full p-3 mt-6 rounded-md font-medium hover:bg-gray-100 flex items-center justify-center gap-3"
            type="button"
            style={{ border: "1px solid #eee" }}
            onClick={() => window.google.accounts.id.prompt()} // Kích hoạt Google Sign-In
          >
            <img
              src={`https://www.material-tailwind.com/logos/logo-google.png`}
              alt="google"
              className="h-6 w-6"
            />
            Đăng nhập với Google
          </button>
          <button
            className="border border-gray-300 w-full p-3 mt-6 rounded-md font-medium hover:bg-gray-100 flex items-center justify-center gap-3"
            type="button"
            onClick={() =>
              window.FB.login(handleFacebookLogin, { scope: "email" })
            } // Kích hoạt Facebook Sign-In
          >
            <img
              src={`https://www.material-tailwind.com/logos/logo-facebook.png`}
              alt="facebook"
              className="h-6 w-6"
            />
            Đăng nhập với Facebook
          </button>

          <Typography
            variant="small"
            color="gray"
            className="!mt-4 text-center font-normal"
          >
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-medium text-gray-900">
              Đăng ký ngay
            </Link>
          </Typography>
        </form>
      </div>


      {/* Modal Quên mật khẩu */}

      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-md shadow-lg max-w-md w-full">
            <Typography variant="h5" className="mb-4">
              Quên mật khẩu
            </Typography>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>} {/* Display error message */}
            <Input
              color="gray"
              size="lg"
              type="email"
              placeholder="Nhập email của bạn"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
            />
            <div className="flex justify-end gap-4 mt-6">
              <Button
                color="gray"
                variant="text"
                onClick={() => setForgotPasswordModalOpen(false)} // Close modal
              >
                Hủy
              </Button>
              <Button color="gray" onClick={handleForgotPasswordSubmit}>
                Gửi yêu cầu
              </Button>
            </div>
          </div>
        </div>
      )}


    </section>
  );
}

export default Login;
