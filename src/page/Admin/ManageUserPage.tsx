import { useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Select } from "antd";
import { DeleteOutlined, DashOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/services/store/store";
import { fetchUsers, deleteUser } from "@/services/features/admin/adminSlice";
import { IAdmin } from "@/interfaces/IAdmin";
import { apiMethods } from "@/services/constant/axiosInstance";
import { UPDATE_USER_ROLE_ENDPOINT } from "@/services/constant/apiConfig";

const ManageUserPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.admin);
  const roles = ["admin", "user", "staff"];
  const [localUsers, setLocalUsers] = useState<IAdmin[]>([]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success("User deleted successfully");
    } catch {
      message.error("Failed to delete user");
    }
  };

  const handleRoleChange = async (newRole: string, userId: string) => {
    try {
      const response = await apiMethods.patch(
        UPDATE_USER_ROLE_ENDPOINT(userId),
        { role: newRole }
      );

      const data = response.data as {
        user: {
          id: string;
          role: string;
        };
      };

      const updatedRole = data.user.role;
      const updatedUserId = data.user.id;
      setLocalUsers((prev) =>
        prev.map((user) =>
          user._id === updatedUserId ? { ...user, role: updatedRole } : user
        )
      );

      message.success("User role updated successfully");
    } catch (error) {
      console.error("Failed to update role:", error);
      message.error("Failed to update user role");
    }
  };

  const columns = [
    {
      title: (
        <span style={{ fontFamily: "'Baloo 2', cursive" }}>First Name</span>
      ),
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: (
        <span style={{ fontFamily: "'Baloo 2', cursive" }}>Last Name</span>
      ),
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: <span style={{ fontFamily: "'Baloo 2', cursive" }}>Email</span>,
      dataIndex: "email",
      key: "email",
    },
    {
      title: <span style={{ fontFamily: "'Baloo 2', cursive" }}>Role</span>,
      dataIndex: "role",
      key: "role",
      render: (text: string, record: IAdmin) => (
        <Select
          value={text}
          onChange={(value) => handleRoleChange(value, record._id)}
          style={{ width: 140 }}
        >
          {roles.map((role) => (
            <Select.Option key={role} value={role}>
              {role}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: (
        <span style={{ fontFamily: "'Baloo 2', cursive" }}>Last Login</span>
      ),
      dataIndex: "lastLoginDate",
      key: "lastLoginDate",
      render: (date: string | null) =>
        date ? new Date(date).toLocaleDateString() : <DashOutlined />,
    },
    {
      title: <span style={{ fontFamily: "'Baloo 2', cursive" }}>Actions</span>,
      key: "actions",
      render: (_: unknown, record: IAdmin) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          User Management
        </h1>
      </div>

      <Table
        columns={columns}
        dataSource={localUsers}
        rowKey="_id"
        loading={loading}
        className="font-baloo"
      />
    </div>
  );
};

export default ManageUserPage;
