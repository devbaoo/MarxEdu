import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <img
                src="https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif"
                alt="Page Not Found"
                className="w-64 h-64 mb-6"
            />
            <h1 className="text-4xl font-bold text-red-600 mb-4 text-center font-baloo">
                Ồ không! Trang không tìm thấy
            </h1>
            <p className="text-gray-600 mb-8 text-center max-w-md font-baloo text-lg">
                MarxEdu không thể tìm thấy trang bạn đang tìm kiếm. Có vẻ như bạn đã lạc đường trong hành trình học tập kinh tế chính trị này!
            </p>
            <Link to="/">
                <button className="rounded-2xl border-b-2 border-b-red-300 bg-red-600 px-6 py-3 font-bold text-white ring-2 ring-red-300 hover:bg-red-500 active:translate-y-[0.125rem] active:border-b-red-200 font-baloo">
                    Về Trang Chủ
                </button>
            </Link>
        </div>
    );
};

export default NotFoundPage; 