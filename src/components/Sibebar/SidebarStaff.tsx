import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {



  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,

  TagsOutlined,
  BulbOutlined,
  RiseOutlined,
  DashboardOutlined,


} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/services/features/auth/authSlice';

const { Sider } = Layout;

const SidebarStaff = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getSelectedKeys = () => [location.pathname];

  return (
    <Sider
      collapsible
      trigger={null}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      className="shadow relative"
      style={{
        background: 'linear-gradient(to bottom, #dc2626, #991b1b)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* Top: Toggle + Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          gap: 12,
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: 'white', fontSize: 18 }}
        />
        {!collapsed && (
          <div style={{ fontSize: 20, fontWeight: 'bold', color: 'white', fontFamily: "'Baloo 2', cursive" }}>
            MarxEdu Staff
          </div>
        )}
      </div>

      {/* Middle: Menu */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          theme="light"
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: "'Baloo 2', cursive"
          }}
        >
          <Menu.Item key="/staff" icon={<DashboardOutlined />}>
            <Link to="/staff">Dashboard</Link>
          </Menu.Item>


          <Menu.Item key="/staff/topics" icon={<TagsOutlined />}>
            <Link to="/staff/topics">Topics</Link>
          </Menu.Item>
          <Menu.Item key="/staff/skills" icon={<BulbOutlined />}>
            <Link to="/staff/skills">Skills</Link>
          </Menu.Item>
          <Menu.Item key="/staff/lesson" icon={<ReadOutlined />}>
            <Link to="/staff/lesson">Lesson</Link>
          </Menu.Item>
          <Menu.Item key="/staff/levels" icon={<RiseOutlined />}>
            <Link to="/staff/levels">Levels</Link>
          </Menu.Item>
          {/* <Menu.Item key="/staff/speaking" icon={<AudioOutlined />}>
              <Link to="/staff/speaking">Speaking</Link>
            </Menu.Item> */}





        </Menu>
      </div>

      {/* Bottom: Logout */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}
      >
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ color: 'black', fontSize: 16, fontFamily: "'Baloo 2', cursive" }}
        >
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </Sider>
  );
};

export default SidebarStaff;
