import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { useState } from "react";

const DonePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/marxist-economics");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spin size="large" />
            <span className="text-xl font-baloo text-gray-700">Đang chuyển hướng...</span>
          </div>
        </div>
      )}
      <main className="flex flex-col items-center justify-center gap-8 px-4 sm:px-6 h-screen max-w-[988px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-baloo">
            Chúc Mừng Bạn!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-baloo">
            Bạn đã hoàn thành việc thiết lập hồ sơ học tập. Hãy bắt đầu hành trình học tập của bạn ngay bây giờ!
          </p>
        </div>

        {/* Image and Message */}
        <div className="flex flex-col items-center gap-8">
          <img
            src="https://media.giphy.com/media/Y9D5NK4NePSxaJLsOS/giphy.gif"
            alt="MarxEdu Characters"
            className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64"
          />
          <div className="text-base bg-red-100 text-red-900 px-6 py-3 rounded-lg shadow font-baloo text-center">
            Bạn đã hoàn thành rất tốt những câu hỏi rồi !!!
          </div>
        </div>

        {/* Navigation Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleNavigate}
            disabled={isLoading}
            className="px-8 py-4 rounded-xl text-lg font-semibold font-baloo transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Đến với bài học nào ^^
          </button>
        </div>
      </main>
    </div>
  );
};

export default DonePage;
