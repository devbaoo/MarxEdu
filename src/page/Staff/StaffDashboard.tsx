import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/services/store/store';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user?.role !== 'staff') {
            navigate('/unauthorized');
        }
    }, [user, navigate]);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 font-baloo">Staff Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Package Management Card */}
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 font-baloo">Quản lý gói học</h2>
                    <p className="text-gray-600 mb-4 font-baloo">Xem và quản lý các gói học phí của người dùng</p>
                    <button
                        onClick={() => navigate('/staff/packages')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-baloo"
                    >
                        Xem chi tiết
                    </button>
                </div>

                {/* User Support Card */}
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 font-baloo">Hỗ trợ người dùng</h2>
                    <p className="text-gray-600 mb-4 font-baloo">Giải đáp thắc mắc và hỗ trợ người dùng</p>
                    <button
                        onClick={() => navigate('/staff/support')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-baloo"
                    >
                        Xem chi tiết
                    </button>
                </div>

                {/* Analytics Card */}
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 font-baloo">Thống kê</h2>
                    <p className="text-gray-600 mb-4 font-baloo">Xem báo cáo và thống kê hoạt động</p>
                    <button
                        onClick={() => navigate('/staff/analytics')}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-baloo"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 font-baloo">Chào mừng, {user?.firstName}!</h2>
                <p className="font-baloo">Đây là trang quản lý dành cho nhân viên. Bạn có thể sử dụng các tính năng trên để hỗ trợ người dùng và quản lý hệ thống.</p>
            </div>
        </div>
    );
};

export default StaffDashboard; 