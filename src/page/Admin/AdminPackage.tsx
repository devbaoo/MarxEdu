import { useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/services/store/store";
import {
  createPackage,
  deletePackage,
  fetchPackages,
  updatePackage,
} from "@/services/features/admin/adminSlice";
import { IPackage, IPackageUpdateCreate } from "@/interfaces/IAdmin";
import { Modal, Form, Input } from "antd";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const AdminPackage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { packages, loading } = useSelector((state: RootState) => state.admin);
  const [editingPackage, setEditingPackage] = useState<IPackage | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  useEffect(() => {
    if (shouldReload) {
      dispatch(fetchPackages());
      setShouldReload(false);
    }
  }, [shouldReload, dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePackage(id)).unwrap();
      message.success("Package deleted successfully");
      await dispatch(fetchPackages());
    } catch {
      message.error("Failed to delete package");
    }
  };

  const handleSubmit = async (values: {
    name: string;
    description: string;
    price: number;
    duration: number;
    discount: number;
    discountEndDate: dayjs.Dayjs;
  }) => {
    try {
      const payload: IPackageUpdateCreate = {
        ...values,
        discountEndDate: values.discountEndDate.toISOString(),
        features: {
          doubleXP: true,
          unlimitedLives: true,
          premiumLessons: true, // nếu cần
        },
      };

      if (editingPackage) {
        // cập nhật giữ nguyên features
        delete payload.features;

        await dispatch(
          updatePackage({
            packageId: editingPackage._id,
            updatedPackage: payload,
          })
        ).unwrap();
        message.success("Cập nhật package thành công");
        await dispatch(fetchPackages());
      } else {
        await dispatch(createPackage(payload)).unwrap();
        message.success("Thêm package thành công");
        await dispatch(fetchPackages());
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingPackage(null);
      setShouldReload(true);
    } catch {
      message.error("Lỗi khi lưu package");
    }
  };

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (_: unknown, __: IPackage, index: number) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Duration (days)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Discount (%)",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Discount End Date",
      dataIndex: "discountEndDate",
      key: "discountEndDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: IPackage) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPackage(record);
              form.setFieldsValue({
                name: record.name,
                description: record.description,
                price: record.price,
                duration: record.duration,
                discount: record.discount,
                discountEndDate: dayjs(record.discountEndDate),
              });

              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this package?"
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
          Package Management:{" "}
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPackage(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm Package
        </Button>
      </div>
      <Modal
        title={editingPackage ? "Cập nhật topic" : "Thêm topic"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Package"
            rules={[{ required: true, message: "Vui lòng nhập tên Package!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VND)"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Thời lượng (ngày)"
            rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="discount"
            label="Giảm giá (%)"
            rules={[{ required: true, message: "Vui lòng nhập giảm giá!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="discountEndDate"
            label="Ngày kết thúc giảm giá"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <DatePicker style={{ width: "100%" }} showTime />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingPackage ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        columns={columns}
        dataSource={packages}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
};

export default AdminPackage;
