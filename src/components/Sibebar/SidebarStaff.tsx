import { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  ReadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/services/features/auth/authSlice";

const { Sider } = Layout;

const SidebarStaff = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getSelectedKeys = () => [location.pathname];

  // Update menu items to focus on Marxist Economics only
  // Remove deprecated items: Skills, Lessons, Levels, Speaking Lessons, Topics Lesson
  // Keep only: Dashboard, Marxist Topics, Marxist Lessons, Marxist Stats, Gemini Test

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      path: "/staff",
    },
    {
      key: "marxist-topics",
      icon: <BookOutlined />,
      label: "Chủ đề Marxist",
      path: "/staff/marxist-topics",
    },
    {
      key: "marxist-lessons",
      icon: <ReadOutlined />,
      label: "Bài học Marxist",
      path: "/staff/marxist-lessons",
    },
    {
      key: "marxist-stats",
      icon: <BarChartOutlined />,
      label: "Thống kê Marxist",
      path: "/staff/marxist-stats",
    },
    {
      key: "gemini-test",
      icon: <ExperimentOutlined />,
      label: "Gemini AI Test",
      path: "/staff/gemini-test",
    },
    {
      key: "performance-monitor",
      icon: <ThunderboltOutlined />,
      label: "⚡ Performance Monitor",
      path: "/staff/performance-monitor",
    },
  ];

  return (
    <Sider
      collapsible
      trigger={null}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      className="shadow relative"
      style={{
        background: "linear-gradient(to bottom, #dc2626, #991b1b)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}>
      {/* Top: Toggle + Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          gap: 12,
        }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: "white", fontSize: 18 }}
        />
        {!collapsed && (
          <div
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
              fontFamily: "'Baloo 2', cursive",
            }}>
            🚩 MarxEdu Staff
          </div>
        )}
      </div>

      {/* Middle: Menu */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          theme="light"
          style={{
            background: "transparent",
            border: "none",
            fontFamily: "'Baloo 2', cursive",
          }}>
          {menuItems.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>

      {/* Bottom: Logout */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
        }}>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{
            color: "black",
            fontSize: 16,
            fontFamily: "'Baloo 2', cursive",
          }}>
          {!collapsed && "Logout"}
        </Button>
      </div>
    </Sider>
  );
};

export default SidebarStaff;
