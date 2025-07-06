import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/services/store/store";
import { resetPassword } from "@/services/features/auth/authSlice";

interface ResetPasswordFormProps {
    token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (confirmPassword && confirmPassword !== e.target.value) {
            setError("Mật khẩu không khớp");
        } else {
            setError("");
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (password && password !== e.target.value) {
            setError("Mật khẩu không khớp");
        } else {
            setError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Mật khẩu không khớp");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await dispatch(resetPassword({ token, password })).unwrap();
            if (result.success) {
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            }
        } catch (error) {
            if (error && typeof error === "object" && "message" in error) {
                setError((error as { message: string }).message);
            } else {
                setError("Đặt lại mật khẩu thất bại");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <header className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold font-baloo">Đặt lại mật khẩu</header>

            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 font-baloo">
                Vui lòng nhập mật khẩu mới của bạn
            </p>

            <div className="w-full rounded-2xl bg-gray-50 px-3 sm:px-4 ring-2 ring-gray-200 focus-within:ring-red-400">
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Mật khẩu mới"
                    className="my-3 w-full border-none bg-transparent outline-none focus:outline-none text-sm sm:text-base font-baloo"
                    required
                    minLength={6}
                />
            </div>

            <div className="w-full rounded-2xl bg-gray-50 px-3 sm:px-4 ring-2 ring-gray-200 focus-within:ring-red-400">
                <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Xác nhận mật khẩu"
                    className="my-3 w-full border-none bg-transparent outline-none focus:outline-none text-sm sm:text-base font-baloo"
                    required
                    minLength={6}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading || password !== confirmPassword}
                className="w-full rounded-2xl border-b-4 border-b-red-700 bg-red-600 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white hover:bg-red-500 active:translate-y-[0.125rem] active:border-b-red-500 disabled:opacity-70 disabled:cursor-not-allowed font-baloo"
                title={error ? error : ""}
            >
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
        </form>
    );
};

export default ResetPasswordForm; 