import { Typography, Dropdown, Avatar, Progress } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/services/store/store";
import { logout, changePassword } from "@/services/features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/services/features/user/userSlice";
import { useAppDispatch } from "@/services/store/store";
import ChangePasswordModal from "@/components/Modal/ChangePasswordModal";
import { FaFire, FaHeart, FaCrown } from "react-icons/fa";
import NotificationButton from "@/components/Notification/NotificationButton";
import LevelUpModal from "@/components/Modal/LevelUpModal";
import { HeartFilled } from '@ant-design/icons';

function getStreakColor(streak: number) {
  if (streak >= 25) return "#b16cff";      // tím
  if (streak >= 15) return "#ff5ecb";      // hồng
  if (streak >= 8) return "#ff4e4e";      // đ
  if (streak >= 5) return "#ff9900";      // cam đậm
  if (streak >= 2) return "#ffb300";      // cam nhạt
  return "#bdbdbd";                         // xám (chưa có streak)
}

function getRequiredXpForLevel(level: number) {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

function calculateLevelProgress(userLevel: number, xp: number) {
  const xpForCurrentLevel = getRequiredXpForLevel(userLevel);
  const progress = Math.min(Math.floor((xp / xpForCurrentLevel) * 100), 100);

  return {
    level: userLevel,
    progress,
    currentLevelXp: xp,
    xpForCurrentLevel
  };
}

const Header = () => {
  const { isAuthenticated, user: authUser } = useSelector((state: RootState) => state.auth);
  const { profile: userProfile } = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (userProfile?.userLevel && userProfile?.xp === 0) {
      const lastShownLevel = localStorage.getItem('lastShownLevel');
      const currentLevel = userProfile.userLevel.toString();

      if (!lastShownLevel || parseInt(lastShownLevel) < userProfile.userLevel) {
        setIsLevelUpModalOpen(true);
        localStorage.setItem('lastShownLevel', currentLevel);
      }
    }
  }, [userProfile?.userLevel, userProfile?.xp]);

  const isInLesson = location.pathname.startsWith('/lesson/') && !location.pathname.startsWith('/lesson/submit');

  const handleNavigation = (path: string) => {
    if (isInLesson) {
      if (window.confirm('Bạn có chắc chắn muốn rời khỏi trang? Tiến độ bài học của bạn sẽ không được lưu.')) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    if (isInLesson) {
      if (window.confirm('Bạn có chắc chắn muốn rời khỏi trang? Tiến độ bài học của bạn sẽ không được lưu.')) {
        dispatch(logout());
        navigate("/");
      }
    } else {
      dispatch(logout());
      navigate("/");
    }
  };

  // Callback to handle password change
  const handlePasswordChange = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      await dispatch(changePassword({ oldPassword, newPassword, confirmPassword })).unwrap();
      setIsPasswordModalOpen(false);
    } catch {
      // Error is handled in the slice
    }
  };

  const user = userProfile || authUser;
  const currentLives = user?.lives || 0;
  const maxLives = 5; // Default max lives
  
  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch, userProfile]);

  const levelProgress = calculateLevelProgress(userProfile?.userLevel || 1, userProfile?.xp || 0);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span className="font-baloo">Hồ sơ</span>,
      onClick: () => handleNavigation("/profile"),
    },
    {
      key: "2",
      label: <span className="font-baloo">Lịch sử giao dịch</span>,
      onClick: () => handleNavigation("/history-payment"),
    },
    {
      key: "3",
      label: <span className="font-baloo">Đổi mật khẩu</span>,
      onClick: () => setIsPasswordModalOpen(true),
    },

    ...(authUser?.role === "admin" ? [{
      key: "4",
      label: <span className="font-baloo">Admin Dashboard</span>,
      onClick: () => handleNavigation("/admin"),
    }] : []),
    {
      key: "5",
      label: <span className="font-baloo text-red-500">Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md p-4 flex justify-between items-center font-baloo">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation("/")}>
          <Typography.Title level={2} style={{ margin: 0, color: "#dc2626" }} className="font-baloo">
            MarxEdu
          </Typography.Title>
          
          {/* Lives Display - Show only for authenticated users */}
          {isAuthenticated && (
            <div className="flex items-center space-x-1 bg-red-50 px-3 py-2 rounded-lg border border-red-200 ml-4">
              <div className="flex items-center space-x-1">
                {Array.from({ length: maxLives }, (_, index) => (
                  <HeartFilled
                    key={index}
                    className={`text-lg transition-all duration-300 ${
                      index < currentLives 
                        ? 'text-red-500' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-sm font-bold ml-2 ${
                currentLives <= 1 ? 'text-red-600 animate-pulse' : currentLives <= 2 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {currentLives}/{maxLives}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex gap-6 items-center">
                <div className="flex items-center gap-2 min-w-[200px]">
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-baloo text-gray-600">Level {levelProgress.level}</span>
                      <span className="font-baloo text-xs text-gray-500">
                        {levelProgress.currentLevelXp}/{levelProgress.xpForCurrentLevel} XP
                      </span>
                    </div>
                    <Progress
                      percent={levelProgress.progress}
                      size="small"
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      showInfo={false}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, idx) => (
                      <FaHeart
                        key={idx}
                        color={(userProfile?.lives || 0) > idx ? "#ff4d6d" : "#e0e0e0"}
                        size={20}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaFire style={{ color: getStreakColor(userProfile?.streak || 0) }} size={22} />
                  <span className="font-baloo text-gray-600">Streak: {userProfile?.streak || 0}</span>
                </div>
              </div>

              <NotificationButton />

              <Dropdown menu={{ items }} placement="bottomRight">
                <div className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <Avatar
                      src={userProfile?.avatar || "https://api.dicebear.com/6.x/fun-emoji/svg?seed=" + userProfile?.firstName}
                      alt={userProfile?.firstName}
                      className="w-10 h-10 border-2 border-gray-200 group-hover:border-red-400 transition-all duration-300"
                    />
                    {userProfile?.activePackage && (
                      <div className="absolute -top-3 -right-0.5 transform rotate-12">
                        <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-1 py-[1px] rounded-full text-[10px] font-bold shadow-sm">
                          <FaCrown className="text-yellow-300 text-[8px]" />
                          <span>VIP</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-baloo hidden md:inline text-gray-700 group-hover:text-red-600 transition-colors duration-300">
                    Hi, <span className="font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{userProfile?.firstName} {userProfile?.lastName}</span>
                  </span>
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigation("/login")}
                className="rounded-2xl border-b-2 border-b-gray-300 bg-white px-4 py-2 font-bold text-red-600 ring-2 ring-gray-300 hover:bg-gray-200 active:translate-y-[0.125rem] active:border-b-gray-200 font-baloo"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => handleNavigation("/register")}
                className="rounded-2xl border-b-2 border-b-red-300 bg-red-600 px-4 py-2 font-bold text-white ring-2 ring-red-300 hover:bg-red-500 active:translate-y-[0.125rem] active:border-b-red-200 font-baloo"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </header>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />
      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        newLevel={userProfile?.userLevel || 1}
      />
    </>
  );
};

export default Header;
