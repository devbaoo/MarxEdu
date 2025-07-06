import React, { useEffect, useState } from "react";
import { Typography, Spin, Avatar } from "antd";
import { UserOutlined, CrownFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/services/store/store";
import { UserProfile } from "@/interfaces/IUser";
import { apiMethods } from "@/services/constant/axiosInstance";
import { ApiResponse } from "@/services/constant/axiosInstance";
import { GET_LEADERBOARD_ENDPOINT } from "@/services/constant/apiConfig";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const GRADIENTS = [
    "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",  // Gold gradient
    "linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)",  // Silver gradient
    "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)"   // Bronze gradient
];

interface RankUser {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    totalScore: number;
    completedLessons: number;
    email?: string;
}

const InfoBox = () => (
    <div
        className="max-w-sm bg-gradient-to-r from-[#2d4b6b] to-[#1a2b3c] text-white p-6 rounded-xl shadow-lg animate-fadeIn mb-4"
        style={{
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
        }}
    >
        <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                    <path d="M2 17L12 22L22 17" fill="currentColor" />
                    <path d="M2 12L12 17L22 12" fill="currentColor" />
                </svg>
            </div>
            <h3 className="text-lg font-bold m-0">BẢNG XẾP HẠNG LÀ GÌ?</h3>
        </div>
        <div className="relative">
            <div className="absolute -top-6 -right-4 w-20 h-20 bg-white opacity-5 rounded-full blur-2xl"></div>
            <p className="text-red-300 font-medium mb-3 relative z-10">
                Học tập. Thi đua. Kiếm điểm.
            </p>
            <p className="text-gray-300 text-sm relative z-10">
                Làm thật nhiều bài, kiếm thật nhiều điểm từ các bài học để thi đua với những người học khác trên bảng xếp hạng.
            </p>
        </div>
        <style>
            {`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
                animation: fadeIn 0.5s ease-out;
            }
            `}
        </style>
    </div>
);

const EarnPointsBox = () => {
    const navigate = useNavigate();

    return (
        <div
            className="max-w-sm bg-gradient-to-r from-red-600 to-red-500 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/packages')}
            style={{
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" fill="currentColor" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold m-0">KIẾM THÊM ĐIỂM</h3>
            </div>
            <p className="text-white text-sm mb-4">
                Mua gói premium để mở khóa thêm nhiều bài học và cơ hội kiếm điểm!
            </p>
            <button
                className="w-full py-2 px-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-opacity-90 transition-colors duration-200"
            >
                Mua Gói Premium Ngay
            </button>
        </div>
    );
};

const Rank: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState<RankUser[]>([]);
    const currentUser = useSelector((state: RootState) => state.user.profile) as UserProfile | null;

    const getCurrentUserId = () => {
        return currentUser?.id || '';
    };

    const isInTop3 = (userId: string) => {
        return top3.some(user => user._id === userId);
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const { data } = await apiMethods.get<ApiResponse<RankUser[]>>(GET_LEADERBOARD_ENDPOINT);
                if (data.success && Array.isArray(data.data)) {
                    setLeaderboardData(data.data);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const top3 = leaderboardData.slice(0, 3);
    const others = leaderboardData.slice(3);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #1a2b3c 0%, #2d4b6b 100%)",
                padding: "40px 20px",
                position: "relative"
            }}
        >
            <div style={{
                maxWidth: 1200,
                margin: "0 auto",
                display: "flex",
                gap: "40px",
                justifyContent: "center"
            }}>
                {/* Main leaderboard content */}
                <div style={{
                    flex: "0 1 720px",
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: "24px",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)"
                }}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1">
                            <div
                                style={{
                                    background: "linear-gradient(90deg, #1677ff 0%, #40a9ff 100%)",
                                    borderRadius: 20,
                                    padding: "16px 24px",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                                    <svg viewBox="0 0 100 100" fill="none">
                                        <path d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <Title level={3} style={{ margin: 0, color: "#fff", letterSpacing: 2, display: "flex", alignItems: "center", gap: "12px" }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 0L22.3923 6V18L12 24L1.60769 18V6L12 0Z" fill="white" />
                                        <path d="M12 3L18.1962 6.75V14.25L12 18L5.80385 14.25V6.75L12 3Z" fill="#40a9ff" />
                                    </svg>
                                    BẢNG XẾP HẠNG
                                </Title>
                            </div>
                        </div>
                    </div>

                    <Spin spinning={loading}>
                        {/* Top 3 */}
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            gap: 34,
                            padding: "32px 24px",
                            background: "#f8fafc",
                            borderRadius: 20,
                            marginBottom: 20,
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)",
                            border: "1px solid rgba(0,0,0,0.05)"
                        }}>
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                opacity: 0.03,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.857 8.485 15.272 9.9l7.9-7.9h-.83zm5.657 0L19.514 8.485 20.93 9.9l8.485-8.485h-1.415zM32.372 0L22.343 10.03 23.758 11.444l10.03-10.03h-1.415zm-1.414 0L19.514 11.444l1.414 1.414 11.444-11.444h-1.414zM32.372 0L21.93 10.444 23.343 11.858 33.787 1.414 32.37 0zm-5.657 0L15.272 11.444l1.414 1.414L28.13 1.414 26.714 0zM22.343 0L12.9 9.444l1.414 1.414L24.757 0h-2.414zm-5.657 0L6.243 10.444l1.415 1.414L19.1 0h-2.413zM16.686 0L7.243 9.444l1.414 1.414L19.1 0h-2.414zm-5.657 0L0 11.03l1.414 1.414L13.857 0H11.03z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                            }} />
                            {[1, 0, 2].map((orderIdx) => {
                                const user = top3[orderIdx];
                                if (!user) return null;

                                const isCurrent = getCurrentUserId() === user._id;
                                const position = orderIdx === 0 ? "1st" : orderIdx === 1 ? "2nd" : "3rd";
                                return (
                                    <div key={user._id} style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        width: 160,
                                        marginBottom: orderIdx === 0 ? 0 : 16,
                                        position: "relative",
                                    }}>
                                        <div style={{
                                            position: "relative",
                                            marginBottom: 6,
                                            padding: 4,
                                            background: GRADIENTS[orderIdx],
                                            borderRadius: "50%",
                                            animation: "pulse 2s infinite",
                                        }}>
                                            <style>
                                                {`
                                                @keyframes pulse {
                                                    0% { box-shadow: 0 0 0 0 ${COLORS[orderIdx]}66; }
                                                    70% { box-shadow: 0 0 0 10px ${COLORS[orderIdx]}00; }
                                                    100% { box-shadow: 0 0 0 0 ${COLORS[orderIdx]}00; }
                                                }
                                                `}
                                            </style>
                                            <Avatar
                                                src={user.avatar || undefined}
                                                icon={!user.avatar && <UserOutlined style={{ color: '#fff' }} />}
                                                size={orderIdx === 0 ? 80 : 64}
                                                style={{
                                                    border: `3px solid ${COLORS[orderIdx]}`,
                                                    background: !user.avatar ? '#40a9ff' : "#fff",
                                                    boxShadow: `0 0 12px ${COLORS[orderIdx]}55`,
                                                }}
                                            />
                                            <CrownFilled style={{
                                                position: "absolute",
                                                top: -18,
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                color: COLORS[orderIdx],
                                                fontSize: 28,
                                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                                                animation: "float 3s ease-in-out infinite",
                                            }} />
                                            <style>
                                                {`
                                                @keyframes float {
                                                    0% { transform: translateX(-50%) translateY(0px); }
                                                    50% { transform: translateX(-50%) translateY(-5px); }
                                                    100% { transform: translateX(-50%) translateY(0px); }
                                                }
                                                `}
                                            </style>
                                        </div>
                                        <div style={{
                                            fontWeight: isCurrent ? 700 : 600,
                                            color: "#1e293b",
                                            fontSize: orderIdx === 0 ? 18 : 16,
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: 160,
                                            marginTop: 8,
                                            padding: "0 4px",
                                        }}>
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div style={{
                                            fontWeight: 700,
                                            color: COLORS[orderIdx],
                                            fontSize: 18,
                                            marginTop: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            textShadow: `0 0 10px ${COLORS[orderIdx]}66`,
                                        }}>
                                            <span style={{ marginRight: 4 }}>{user.totalScore}</span>
                                            <span style={{ fontSize: 18, color: COLORS[orderIdx] }}>★</span>
                                        </div>
                                        <div style={{
                                            fontWeight: 600,
                                            color: "#9CA3AF",
                                            fontSize: 16,
                                            marginTop: 2,
                                            background: GRADIENTS[orderIdx],
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                                            {position}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Others */}
                        <div style={{ padding: "0 12px" }}>
                            {others.map((user, idx) => {
                                const isCurrent = getCurrentUserId() === user._id;
                                const showBadge = isCurrent && !isInTop3(user._id);

                                return (
                                    <div
                                        key={user._id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            background: isCurrent
                                                ? "rgba(24, 144, 255, 0.15)"
                                                : "#f8fafc",
                                            borderRadius: 16,
                                            margin: "10px 0",
                                            border: isCurrent
                                                ? "1px solid rgba(24, 144, 255, 0.3)"
                                                : "1px solid rgba(0, 0, 0, 0.1)",
                                            minHeight: 56,
                                            padding: "6px 16px",
                                        }}
                                    >
                                        <span style={{
                                            fontWeight: 500,
                                            fontSize: 16,
                                            color: "#64748b",
                                            width: 44,
                                            textAlign: "center"
                                        }}>{idx + 4}.</span>
                                        <Avatar
                                            src={user.avatar || undefined}
                                            icon={!user.avatar && <UserOutlined style={{ color: '#fff' }} />}
                                            size={44}
                                            style={{
                                                background: !user.avatar ? '#40a9ff' : "#fff",
                                                marginRight: 18,
                                                marginLeft: 4,
                                                border: isCurrent ? "2px solid #40a9ff" : "1px solid rgba(255,255,255,0.1)",
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: isCurrent ? 600 : 500,
                                                fontSize: 16,
                                                color: isCurrent ? "#1677ff" : "#1e293b",
                                                display: "flex",
                                                alignItems: "center"
                                            }}>
                                                {user.firstName} {user.lastName}
                                                {showBadge && <span style={{
                                                    background: "#40a9ff",
                                                    color: "#ffffff",
                                                    borderRadius: 8,
                                                    padding: "2px 8px",
                                                    marginLeft: 8,
                                                    fontSize: 12
                                                }}>Bạn</span>}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: 16,
                                            color: "#64748b",
                                            marginRight: 8,
                                            minWidth: 60,
                                            textAlign: "right",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end"
                                        }}>
                                            <span style={{ marginRight: 4 }}>{user.totalScore}</span>
                                            <span style={{ fontSize: 16, color: "#64748b" }}>★</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Spin>
                </div>

                {/* Right sidebar with InfoBox and EarnPointsBox */}
                <div style={{
                    width: "360px",
                    position: "sticky",
                    top: "24px",
                    alignSelf: "flex-start",
                    height: "fit-content"
                }}>
                    <InfoBox />
                    <EarnPointsBox />
                </div>
            </div>
        </div>
    );
};

export default Rank;