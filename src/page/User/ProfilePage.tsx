import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchUserProfile, uploadAvatar, updateProfile } from "@/services/features/user/userSlice";
import Sidebar from "@/components/Layout/SidebarUser";
import { FaPlus, FaMedal, FaStar, FaUserGraduate, FaHeart, FaCamera, FaCrown, FaGift, FaUser, FaEdit } from "react-icons/fa";
import { message, Input, Button } from "antd";
import { ActivePackage } from "@/interfaces/IUser";

const cardColor = "bg-white border border-gray-200 shadow-lg rounded-xl";



const PremiumBanner = ({ package: premiumPackage }: { package: ActivePackage }) => {
    const daysRemaining = premiumPackage.daysRemaining;
    const isExpiringSoon = premiumPackage.isExpiringSoon;

    return (
        <div className="w-full mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-4 sm:p-6 shadow-lg">
                <div className="absolute -right-8 -top-8 h-24 w-24 sm:h-32 sm:w-32 rotate-12 transform opacity-20">
                    <FaCrown className="h-full w-full text-white" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="rounded-full bg-white/20 p-2 sm:p-3">
                            <FaGift className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white font-baloo">Gói Premium</h3>
                            <p className="text-sm sm:text-base text-red-100">{premiumPackage.name}</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className="text-xs sm:text-sm text-red-100">
                            Hiệu lực: {new Date(premiumPackage.startDate).toLocaleDateString()} - {new Date(premiumPackage.endDate).toLocaleDateString()}
                        </div>
                        <div className="mt-1 flex items-center sm:justify-end gap-2">
                            <span className="text-base sm:text-lg font-bold text-white">
                                Còn lại: {daysRemaining} ngày
                            </span>
                            {isExpiringSoon && (
                                <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                    Sắp hết hạn!
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MemberBanner = () => {
    return (
        <div className="w-full mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 p-4 sm:p-6 shadow-lg">
                <div className="absolute -right-8 -top-8 h-24 w-24 sm:h-32 sm:w-32 rotate-12 transform opacity-20">
                    <FaUser className="h-full w-full text-white" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="rounded-full bg-white/20 p-2 sm:p-3">
                            <FaUser className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white font-baloo">Member</h3>
                            <p className="text-sm sm:text-base text-gray-100">Tài khoản thường</p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className="text-xs sm:text-sm text-gray-100">
                            Nâng cấp lên Premium để nhận nhiều ưu đãi
                        </div>
                        <div className="mt-1">
                            <span className="text-base sm:text-lg font-bold text-white">
                                Khám phá ngay
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const dispatch = useAppDispatch();
    const { profile, loading, error, avatarUploading } = useAppSelector((state) => state.user);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState({ firstName: '', lastName: '' });

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setEditedName({
                firstName: profile.firstName,
                lastName: profile.lastName
            });
        }
    }, [profile]);

    const handleClickAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            message.error('Vui lòng chọn file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            message.error('Kích thước file không được vượt quá 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setIsSpinning(true);
            await dispatch(uploadAvatar(formData)).unwrap();
            await dispatch(fetchUserProfile());
            message.success('Cập nhật ảnh đại diện thành công');
        } catch {
            message.error('Cập nhật ảnh đại diện thất bại');
        } finally {
            setTimeout(() => setIsSpinning(false), 500);
        }
    };

    const handleNameEdit = () => {
        setIsEditingName(true);
    };

    const handleNameSave = async () => {
        try {
            await dispatch(updateProfile({
                firstName: editedName.firstName,
                lastName: editedName.lastName
            })).unwrap();
            await dispatch(fetchUserProfile());
            message.success('Cập nhật tên thành công');
            setIsEditingName(false);
        } catch {
            message.error('Cập nhật tên thất bại');
        }
    };

    const handleNameCancel = () => {
        if (profile) {
            setEditedName({
                firstName: profile.firstName,
                lastName: profile.lastName
            });
        }
        setIsEditingName(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-10">Lỗi: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <div className="flex-1 ml-0 lg:ml-[224px] flex justify-center lg:justify-start px-4 sm:px-6 lg:px-8 lg:pl-12 py-6 sm:py-8 lg:py-12">
                {profile && (
                    <div className={`${cardColor} max-w-4xl w-full p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 lg:space-y-10`}>
                        {profile.activePackage ? <PremiumBanner package={profile.activePackage} /> : <MemberBanner />}
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6 sm:gap-8">
                            <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-6 lg:w-1/3">
                                <div className="relative group">
                                    <div
                                        onClick={handleClickAvatar}
                                        className={`relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-red-200 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${avatarUploading ? 'opacity-50' : 'hover:border-red-400'} ${avatarUploading || isSpinning ? 'animate-spin' : ''}`}
                                    >
                                        {profile.avatar ? (
                                            <img
                                                src={profile.avatar}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaPlus className="text-red-400 text-2xl sm:text-3xl" />
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                            <FaCamera className="text-white text-2xl sm:text-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                        </div>
                                    </div>
                                    {profile.activePackage && (
                                        <div className="absolute -top-2 -right-2 transform rotate-12">
                                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
                                                <FaCrown className="text-yellow-300" />
                                                <span>VIP</span>
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm text-red-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        Nhấn để đổi ảnh
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="text-center lg:text-left">
                                    {isEditingName ? (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={editedName.firstName}
                                                    onChange={(e) => setEditedName(prev => ({ ...prev, firstName: e.target.value }))}
                                                    placeholder="Tên"
                                                    className="font-baloo"
                                                />
                                                <Input
                                                    value={editedName.lastName}
                                                    onChange={(e) => setEditedName(prev => ({ ...prev, lastName: e.target.value }))}
                                                    placeholder="Họ"
                                                    className="font-baloo"
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-center lg:justify-start">
                                                <Button
                                                    type="primary"
                                                    onClick={handleNameSave}
                                                    className="font-baloo"
                                                >
                                                    Lưu
                                                </Button>
                                                <Button
                                                    onClick={handleNameCancel}
                                                    className="font-baloo"
                                                >
                                                    Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-baloo inline-flex items-center gap-2">
                                                {profile.firstName} {profile.lastName}
                                                <button
                                                    onClick={handleNameEdit}
                                                >
                                                    <FaEdit className="text-red-600 hover:text-red-700" />
                                                </button>
                                            </h2>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                                        <p className="text-sm sm:text-base text-gray-600 font-semibold">{profile.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-2/3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 font-baloo">Hồ sơ cá nhân</h1>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className={`${cardColor} p-3 sm:p-4 flex flex-col items-center hover:shadow-md transition-shadow`}>
                                        <FaMedal className="text-amber-500 text-xl sm:text-2xl mb-1" />
                                        <div className="font-baloo text-sm sm:text-base text-gray-700">Cấp độ</div>
                                        <div className="font-bold text-base sm:text-lg text-gray-800">{profile.userLevel}</div>
                                    </div>
                                    <div className={`${cardColor} p-3 sm:p-4 flex flex-col items-center hover:shadow-md transition-shadow`}>
                                        <FaStar className="text-yellow-500 text-xl sm:text-2xl mb-1" />
                                        <div className="font-baloo text-sm sm:text-base text-gray-700">XP</div>
                                        <div className="font-bold text-base sm:text-lg text-gray-800">{profile.xp}</div>
                                    </div>
                                    <div className={`${cardColor} p-3 sm:p-4 flex flex-col items-center hover:shadow-md transition-shadow`}>
                                        <FaHeart className="text-pink-500 text-xl sm:text-2xl mb-1" />
                                        <div className="font-baloo text-sm sm:text-base text-gray-700">Lives</div>
                                        <div className="font-bold text-base sm:text-lg text-gray-800">{profile.lives}</div>
                                    </div>
                                    <div className={`${cardColor} p-3 sm:p-4 flex flex-col items-center hover:shadow-md transition-shadow`}>
                                        <FaUserGraduate className="text-orange-500 text-xl sm:text-2xl mb-1" />
                                        <div className="font-baloo text-sm sm:text-base text-gray-700">Trình độ</div>
                                        <div className="font-bold text-base sm:text-lg text-gray-800 capitalize">{profile.level}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;