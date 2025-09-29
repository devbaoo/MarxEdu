import LoginForm from "@/components/Auth/LoginForm/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm/RegisterForm";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/services/store/store";
import { auth, googleProvider } from "@/services/constant/firebase";
import { signInWithPopup } from "firebase/auth";
import axiosInstance from "@/services/constant/axiosInstance";
import { loginWithGoogle } from "@/services/features/auth/authSlice";
import { fetchUserProfile } from "@/services/features/user/userSlice";

interface LoginPageProps {
    isRegister?: boolean;
}

const LoginPage = ({ isRegister = false }: LoginPageProps) => {
    const [isLoginPage, setIsLoginPage] = useState(!isRegister);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const loginFormRef = useRef<{ handleGoogleLogin?: () => void }>(null);
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

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

    // Google login for register view (direct in page)
    const saveTokens = (accessToken: string, refreshToken: string) => {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    };

    const handleNavigateAfterLogin = (
        u: { role?: string } | null,
        profileResult?: { level?: string; preferredSkills?: unknown[] }
    ) => {
        if (u?.role === "admin") {
            navigate("/admin");
        } else if (u?.role === "staff") {
            navigate("/staff");
        } else if (profileResult && (!profileResult.level || !profileResult.preferredSkills || profileResult.preferredSkills.length === 0)) {
            navigate("/choose-topic");
        } else {
            navigate("/marxist-economics");
        }
    };

    const handleGoogleLoginRegister = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const { email, displayName, photoURL } = result.user;
            const response = await axiosInstance.post("/auth/google-login", {
                email,
                name: displayName,
                picture: photoURL,
            });
            const data = response.data;
            if (data.success) {
                saveTokens(data.accessToken, data.refreshToken);
                dispatch(loginWithGoogle({
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                }));
                let profileResult = undefined;
                try {
                    profileResult = await dispatch(fetchUserProfile()).unwrap();
                } catch {
                    // ignore
                }
                handleNavigateAfterLogin(data.user, profileResult);
            } else {
                alert(data.message || "Đăng nhập Google thất bại");
            }
        } catch {
            alert("Đăng nhập Google thất bại");
        } finally {
            setIsLoading(false);
        }
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
                    {isLoginPage && (
                        <button
                            onClick={() => loginFormRef.current?.handleGoogleLogin && loginFormRef.current.handleGoogleLogin()}
                            className="w-full rounded-2xl border-b-2 border-b-red-300 bg-white py-2.5 sm:py-3 text-sm sm:text-base font-bold text-red-600 ring-2 ring-red-300 hover:bg-red-50 active:translate-y-[0.125rem] active:border-b-red-200 font-baloo flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.197-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.54,5.036C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-3.894,5.565c0.001-0.001,0.002-0.001,0.003-0.002l6.197,5.238C36.973,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            {isLoading ? "Đang xử lý..." : "Đăng nhập với Google"}
                        </button>
                    )}
                    {!isLoginPage && (
                        <button
                            onClick={handleGoogleLoginRegister}
                            className="w-full rounded-2xl border-b-2 border-b-red-300 bg-white py-2.5 sm:py-3 text-sm sm:text-base font-bold text-red-600 ring-2 ring-red-300 hover:bg-red-50 active:translate-y-[0.125rem] active:border-b-red-200 font-baloo flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.197-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.54,5.036C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-3.894,5.565c0.001-0.001,0.002-0.001,0.003-0.002l6.197,5.238C36.973,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            {isLoading ? "Đang xử lý..." : "Đăng ký nhanh với Google"}
                        </button>
                    )}
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
