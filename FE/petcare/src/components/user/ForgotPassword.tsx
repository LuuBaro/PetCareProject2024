import React, { useState, useEffect } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle, Cancel } from "@mui/icons-material";
import Header from "../header/Header";
import Footer from '../footer/Footer';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLocation} from 'react-router-dom';

const ResetPassword = () => {
    
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        specialChar: false,
    });
    const [resetToken, setResetToken] = useState(""); // For storing the token from the URL

    const location = useLocation(); // To get query params from the URL
    

    useEffect(() => {
        // Extract the reset token from the URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            setResetToken(token);
        }
    }, [location]);

    const handleClickShowPassword = () => setShowPassword((prev) => !prev);

    const handlePasswordChange = (event) => {
        const password = event.target.value;
        setNewPassword(password);

        // Check password requirements
        setPasswordRequirements({
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            specialChar: /[0-9!@#$%^&*()_+{}":;'<>?/.,`~]/.test(password),
        });

   
    };

    const handleSubmit = async () => {
        try {
            if (!resetToken) {
                alert('Invalid reset token');
                return;
            }

            // Make the API call to reset the password
            const response = await axios.post('http://localhost:8080/api/auth/reset-sendmailpassword', {
                token: resetToken, // Send the token
                newPassword: newPassword // Send the new password
            });

            if (response.status === 200) {
                Swal.fire('Success', 'Password reset successfully!', 'success');
                // Redirect to the login page after successful password reset
                
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Swal.fire('Error', 'Invalid or expired token', 'error');
            } else {
                Swal.fire('Error', 'Failed to reset password', 'error');
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-col justify-center items-center max-w-sm mx-auto p-6">
                <span className="text-lg font-semibold mb-2">Thiết Lập Mật Khẩu</span>
               
                <TextField
                    label="Mật khẩu"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={newPassword}
                    onChange={handlePasswordChange}
                    error={!!passwordError}
                    helperText={passwordError}
                    className="mb-5"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClickShowPassword}>
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                 <div className="w-full text-left mb-5">
                    <span className={`text-sm flex items-center ${passwordRequirements.length ? "text-green-500" : "text-red-500"}`}>
                        Ít nhất 8 ký tự
                        {passwordRequirements.length ? (
                            <CheckCircle className="ml-2 text-green-500" />
                        ) : (
                            <Cancel className="ml-2 text-red-500" />
                        )}
                    </span>
                    <span className={`text-sm flex items-center ${passwordRequirements.lowercase ? "text-green-500" : "text-red-500"}`}>
                        Ít nhất một ký tự viết thường
                        {passwordRequirements.lowercase ? (
                            <CheckCircle className="ml-2 text-green-500" />
                        ) : (
                            <Cancel className="ml-2 text-red-500" />
                        )}
                    </span>
                    <span className={`text-sm flex items-center ${passwordRequirements.uppercase ? "text-green-500" : "text-red-500"}`}>
                        Ít nhất một ký tự viết hoa
                        {passwordRequirements.uppercase ? (
                            <CheckCircle className="ml-2 text-green-500" />
                        ) : (
                            <Cancel className="ml-2 text-red-500" />
                        )}
                    </span>
                    <span className={`text-sm flex items-center ${passwordRequirements.specialChar ? "text-green-500" : "text-red-500"}`}>
                        Ít nhất một ký tự đặc biệt hoặc số
                        {passwordRequirements.specialChar ? (
                            <CheckCircle className="ml-2 text-green-500" />
                        ) : (
                            <Cancel className="ml-2 text-red-500" />
                        )}
                    </span>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={passwordError}
                >
                    TIẾP TỤC
                </Button>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPassword;
