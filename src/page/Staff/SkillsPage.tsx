import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchSkills, createSkill, updateSkill, deleteSkill, Skill } from "@/services/features/skill/skillSlice";
import { Table, Button, Modal, Form, Input, Select, message, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const SkillsPage = () => {
  const dispatch = useAppDispatch();
  const { skills, loading, error } = useAppSelector((state) => state.skill);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchSkills());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleCreate = () => {
    setEditingSkill(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Skill) => {
    setEditingSkill(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      supportedTypes: record.supportedTypes,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSkill(id)).unwrap();
      message.success('Xóa kỹ năng thành công');
    } catch {
      message.error('Không thể xóa kỹ năng');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingSkill) {
        await dispatch(updateSkill({ id: editingSkill._id, data: values })).unwrap();
        message.success('Cập nhật kỹ năng thành công');
      } else {
        await dispatch(createSkill(values)).unwrap();
        message.success('Thêm kỹ năng thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns = [
    { title: 'Tên kỹ năng', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Loại hỗ trợ',
      dataIndex: 'supportedTypes',
      key: 'supportedTypes',
      render: (types: string[]) => types?.join(', '),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Skill) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Quản lý kỹ năng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm kỹ năng
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={skills}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingSkill ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên kỹ năng"
            rules={[{ required: true, message: 'Vui lòng nhập tên kỹ năng' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="supportedTypes"
            label="Loại hỗ trợ"
            rules={[{ required: true, message: 'Vui lòng chọn loại hỗ trợ' }]}
          >
            <Select mode="multiple" placeholder="Chọn loại hỗ trợ">
              <Option value="multiple_choice">multiple_choice</Option>
              <Option value="text_input">text_input</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillsPage;
