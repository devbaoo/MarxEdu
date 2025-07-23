import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { RootState } from '@/services/store/store';
import { Link } from "react-router-dom";

const HomePage = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user?.role === "staff") {
        navigate("/staff", { replace: true });
      } else {
        if (user?.level === null) {
          navigate("/choose-topic", { replace: true });
        } else {
          navigate("/marxist-economics", { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <main className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-[80px] px-4 sm:px-6 h-screen max-w-[988px] mx-auto">
        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
          <img
            src="https://media.giphy.com/media/5me0l9ZR8SpG0N1UxZ/giphy.gif"
            alt="MarxEdu Characters"
            className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto"
          />
        </div>

        {/* Nội dung bên phải */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <h1 className="text-center text-[20px] sm:text-[22px] md:text-[26px] font-bold text-gray-700 leading-snug mb-4 sm:mb-6 font-baloo px-2">
            Học tập lý thuyết, ứng dụng thực tiễn!
          </h1>

          <div className="flex flex-col gap-4 w-full max-w-xs items-center">
            <Link to="/register" className="w-full">
              <button className="rounded-2xl border-b-2 border-b-red-300 bg-red-600 px-4 py-3 font-bold text-white ring-2 ring-red-300 hover:bg-red-500 active:translate-y-[0.125rem] active:border-b-red-200 font-baloo w-full">
                Bắt Đầu
              </button>
            </Link>
            <Link to="/login" className="w-full">
              <button className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-4 py-3 font-bold text-red-600 ring-2 ring-gray-300 hover:bg-gray-200 active:translate-y-[0.125rem] active:border-b-gray-200 font-baloo w-full">
                Tôi Đã Có Tài Khoản
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;