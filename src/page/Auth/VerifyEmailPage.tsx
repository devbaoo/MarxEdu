import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "@/services/store/store";
import { logout, verifyEmail } from "@/services/features/auth/authSlice";
import { Link } from "react-router-dom";

const VerifyEmailPage = () => {
    const { token } = useParams<{ token: string }>();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setIsVerifying(false);
                setIsSuccess(false);
                setMessage("Mã xác thực không hợp lệ");
                return;
            }
            try {
                const result = await dispatch(verifyEmail(token)).unwrap();
                setIsSuccess(result.success);
                setMessage(result.message || "Xác thực email thành công");
                if (result.success) {
                    setTimeout(() => {
                        navigate("/home");
                        dispatch(logout());
                    }, 3000);
                }
            } catch (error) {
                if (error && typeof error === "object" && "message" in error) {
                    setMessage((error as { message: string }).message);
                } else {
                    setMessage("Xác thực email thất bại");
                }
                setIsSuccess(false);
            } finally {
                setIsVerifying(false);
            }
        };
        verify();
    }, [dispatch, navigate, token]);

    const handleBackToLogin = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-white px-2 py-6">
            <div className="w-full max-w-md mx-auto p-4 sm:p-8 bg-white rounded-xl shadow-md space-y-6">
                <header className="flex w-full justify-between items-center mb-2">
                    <Link to="/login" onClick={handleBackToLogin}>
                        <svg
                            className="h-6 w-6 sm:h-7 sm:w-7 cursor-pointer text-gray-400 hover:text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="currentColor"
                        >
                            <path
                                strokeWidth="1"
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </Link>
                </header>

                <div className="space-y-4 text-center">
                    <header className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold font-baloo">
                        Xác thực Email
                    </header>

                    {isVerifying ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600 font-baloo text-sm sm:text-base">
                                Đang xác thực email của bạn...
                            </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            {isSuccess ? (
                                <div>
                                    <svg
                                        className="h-16 w-16 text-green-500 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <p className="mt-4 text-gray-700 font-baloo text-base sm:text-lg">
                                        {message}
                                    </p>
                                    <p className="mt-2 text-xs sm:text-sm text-gray-500 font-baloo">
                                        Bạn sẽ được chuyển hướng đến trang chủ trong vài giây...
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <svg
                                        className="h-16 w-16 text-red-500 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <p className="mt-4 text-gray-700 font-baloo text-base sm:text-lg">
                                        {message}
                                    </p>
                                    <div className="mt-6">
                                        <Link to="/login" onClick={handleBackToLogin}>
                                            <button className="w-full rounded-2xl border-b-4 border-b-red-700 bg-red-600 px-6 py-2.5 text-sm sm:text-base font-bold text-white hover:bg-red-500 active:translate-y-[0.125rem] active:border-b-red-500 font-baloo">
                                                Quay lại đăng nhập
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default VerifyEmailPage;
