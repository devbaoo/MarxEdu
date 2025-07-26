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
                    <footer>


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
