import { useState, useRef } from "react";
import { useAppDispatch } from "@/services/store/store";
import { forgotPassword } from "@/services/features/auth/authSlice";
import { Link } from "react-router-dom";
import { message } from "antd";
import ReCAPTCHA from "react-google-recaptcha";

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const recaptchaToken = recaptchaRef.current?.getValue();
        if (!recaptchaToken) {
            message.error("Vui lòng xác nhận bạn không phải robot");
            return;
        }

        console.log("Forgot Password - reCAPTCHA Token Length:", recaptchaToken.length);
        console.log("Forgot Password - reCAPTCHA Token First 10 chars:", recaptchaToken.substring(0, 10));

        setIsLoading(true);

        try {
            // Chỉ gửi email và recaptchaToken
            const requestPayload = {
                email,
                recaptchaToken
            };
            console.log("Forgot Password - Request Payload:", {
                ...requestPayload,
                recaptchaToken: `${recaptchaToken.substring(0, 20)}...`
            });

            const result = await dispatch(forgotPassword(requestPayload)).unwrap();

            if (result.success) {
                message.success(result.message || "Email đã được gửi thành công!");
                setEmail(""); // Clear email after successful submission
            } else {
                message.warning(result.message || "Không thể gửi email. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Forgot password failed:", error);
            if (error && typeof error === 'object') {
                console.log("Error details:", JSON.stringify(error, null, 2));
                console.log("Last request details:", {
                    email,
                    tokenLength: recaptchaToken.length
                });
            }
            message.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
            recaptchaRef.current?.reset();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <header className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold font-baloo">Quên mật khẩu</header>

            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 font-baloo">
                Nhập email của bạn và chúng tôi sẽ gửi cho bạn hướng dẫn để đặt lại mật khẩu.
            </p>

            <div className="w-full rounded-2xl bg-gray-50 px-3 sm:px-4 ring-2 ring-gray-200 focus-within:ring-red-400">
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="my-3 w-full border-none bg-transparent outline-none focus:outline-none text-sm sm:text-base font-baloo"
                    required
                />
            </div>

            <div className="flex justify-center">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LfwkVkrAAAAALC3Ayznv0qxjpAz61XKtza0DuPb"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl border-b-4 border-b-red-700 bg-red-600 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white hover:bg-red-500 active:translate-y-[0.125rem] active:border-b-red-500 disabled:opacity-70 disabled:cursor-not-allowed font-baloo"
            >
                {isLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
            </button>

            <div className="text-center">
                <Link
                    to="/login"
                    className="text-sm font-medium text-red-600 hover:text-red-700 font-baloo"
                >
                    Quay lại đăng nhập
                </Link>
            </div>
        </form>
    );
};

export default ForgotPasswordForm; 