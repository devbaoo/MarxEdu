import { useNavigate, useParams } from "react-router-dom";
import ResetPasswordForm from "@/components/Auth/ResetPasswordForm/ResetPasswordForm";

const ResetPasswordPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const handleBackToLogin = () => {
        navigate("/login");
    };

    return (
        <main className="relative min-h-screen w-full bg-white">
            <div className="p-4 sm:p-6">
                <header className="flex w-full justify-between items-center">
                    <button onClick={handleBackToLogin}>
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
                    </button>

                </header>

                <div className="w-full px-4 sm:px-0 mx-auto max-w-sm mt-16 sm:mt-0 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:transform space-y-4 text-center">
                    {token ? (
                        <ResetPasswordForm token={token} />
                    ) : (
                        <div className="text-center">
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
                                Mã xác thực không hợp lệ
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={handleBackToLogin}
                                    className="w-full rounded-2xl border-b-4 border-b-red-700 bg-red-600 px-6 py-2.5 text-sm sm:text-base font-bold text-white hover:bg-red-500 active:translate-y-[0.125rem] active:border-b-red-500 font-baloo"
                                >
                                    Quay lại đăng nhập
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordPage; 