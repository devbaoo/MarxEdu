import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/features/auth/authSlice";
import { Link } from "react-router-dom";
import {
  SettingOutlined,
  TrophyOutlined,
  GiftOutlined,
  UserOutlined,
  ReadOutlined,
} from "@ant-design/icons";

const menuItems = [
  {
    icon: "https://d35aaqx5ub95lt.cloudfront.net/vendor/784035717e2ff1d448c0f6cc4efc89fb.svg",
    label: "Học Triết học Mác-LêNin",
    href: "/marxist-economics",
  },
  {
    iconElement: (
      <TrophyOutlined style={{ fontSize: "24px", color: "#FFD700" }} />
    ),
    label: "Bảng xếp hạng",
    href: "/rank",
  },
  {
    iconElement: (
      <ReadOutlined style={{ fontSize: "24px", color: "#2563eb" }} />
    ),
    label: "Flashcards",
    href: "/flashcards",
  },
  {
    iconElement: <GiftOutlined />,
    label: "Gói đăng ký",
    href: "/packages",
  },
  {
    iconElement: <UserOutlined style={{ fontSize: "24px", color: "#666" }} />,
    label: "Hồ sơ",
    href: "/profile",
  },
  {
    iconElement: <SettingOutlined />,
    label: "Cài đặt",
    href: "/setting",
  },
  {
    icon: "https://d35aaqx5ub95lt.cloudfront.net/vendor/7159c0b5d4250a5aea4f396d53f17f0c.svg",
    label: "Xem thêm",
    href: "#",
    hasDropdown: true,
  },
];

export default function Sidebar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-[220] lg:hidden bg-white p-2 rounded-lg shadow-md"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[200] lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r-2 border-gray-200 px-4 py-6 overflow-y-auto z-[210] transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
                w-[280px] sm:w-[224px]`}
      >
        <nav className="flex flex-col gap-3">
          <Link
            to="/learn"
            className="mb-5 ml-5 mt-5 text-2xl sm:text-3xl font-bold text-red-600"
          >
            MarxEdu
          </Link>
          {menuItems.map((item, index) => (
            <div key={index} className="relative">
              <a
                href={item.href}
                onClick={(e) => {
                  if (item.hasDropdown) {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                  if (isMobileMenuOpen) {
                    toggleMobileMenu();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold 
                                ${item.href === window.location.pathname
                    ? "bg-gray-100 text-red-600 border border-red-300"
                    : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                  ) : item.iconElement ? (
                    <div className="text-lg text-gray-600">
                      {item.iconElement}
                    </div>
                  ) : (
                    <div className="bg-gray-200 text-gray-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs"></div>
                  )}
                </div>
                <span>{item.label}</span>
              </a>

              {/* Dropdown Menu */}
              {item.hasDropdown && isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      handleLogout();
                      if (isMobileMenuOpen) {
                        toggleMobileMenu();
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 font-bold"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
