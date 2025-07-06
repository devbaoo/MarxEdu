import LoginForm from "@/components/Auth/LoginForm/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm/RegisterForm";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/services/store/store";

interface LoginPageProps {
    isRegister?: boolean;
}

const LoginPage = ({ isRegister = false }: LoginPageProps) => {
    const [isLoginPage, setIsLoginPage] = useState(!isRegister);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const loginFormRef = useRef<{ handleGoogleLogin?: () => void }>(null);

    useEffect(() => {
        setIsLoginPage(!isRegister);
    }, [isRegister]);

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === "admin") {
                navigate("/admin", { replace: true });
            } else if (user?.role === "staff") {
                navigate("/staff", { replace: true });
            } else {
                navigate("/home", { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLoginClick = () => {
        navigate("/login");
    };

    const handleRegisterClick = () => {
        navigate("/register");
    };

    return (
        <main className="relative min-h-screen w-full bg-white">
            <div className="p-4 sm:p-6">
                <header className="flex w-full justify-between items-center">
                    <Link to="/home">
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
                    <div>
                        {isLoginPage ? (
                            <button
                                onClick={handleRegisterClick}
                                className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold text-red-600 ring-2 ring-gray-300 hover:bg-gray-200 active:translate-y-[0.125rem] active:border-b-gray-200 font-baloo"
                            >
                                Đăng Ký
                            </button>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-bold text-red-600 ring-2 ring-gray-300 hover:bg-gray-200 active:translate-y-[0.125rem] active:border-b-gray-200 font-baloo"
                            >
                                Đăng Nhập
                            </button>
                        )}
                    </div>
                </header>

                <div className="w-full px-4 sm:px-0 mx-auto max-w-sm mt-16 sm:mt-0 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:transform space-y-4 text-center">
                    {isLoginPage ? <LoginForm ref={loginFormRef} /> : <RegisterForm />}

                    <div className="flex items-center space-x-4">
                        <hr className="w-full border border-gray-300" />
                        <div className="font-semibold text-gray-400">OR</div>
                        <hr className="w-full border border-gray-300" />
                    </div>                    <footer>
                        <div className="w-full">
                            <button
                                type="button"
                                onClick={() => loginFormRef.current?.handleGoogleLogin?.()}
                                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98] transition-all duration-200 ease-in-out flex items-center justify-center gap-3 font-baloo"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Đăng nhập với Google
                            </button>
                        </div>

                        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400 font-baloo">
                            By signing in to MarxEdu, you agree to our{" "}
                            <Link to="#" className="font-medium text-gray-500 ">
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link to="#" className="font-medium text-gray-500">
                                Privacy Policy
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;
