import { useState, useEffect } from 'react';

import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/services/store/store';
import { fetchTopics, createTopic, updateTopic, deleteTopic, Topic } from '@/services/features/topic/topicSlice';

const TopicsLesson = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { topics, loading } = useSelector((state: RootState) => state.topic);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [form] = Form.useForm();
  const [shouldReload, setShouldReload] = useState(false);

  // Effect for initial load
  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  // Effect for reloading data after operations
  useEffect(() => {
    if (shouldReload) {
      dispatch(fetchTopics());
      setShouldReload(false);
    }
  }, [shouldReload, dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTopic(id)).unwrap();
      message.success('Xóa topic thành công');
      setShouldReload(true);
    } catch {
      message.error('Lỗi khi xóa topic');
    }
  };

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      if (editingTopic) {
        await dispatch(updateTopic({ id: editingTopic._id, data: values })).unwrap();
        message.success('Cập nhật topic thành công');
      } else {
        await dispatch(createTopic(values)).unwrap();
        message.success('Thêm topic thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingTopic(null);
      setShouldReload(true);
    } catch {
      message.error('Lỗi khi lưu topic');
    }
  };

  const columns = [
    {
      title: 'Tên Topic',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Topic) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTopic(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Bạn chắc chắn muốn xóa topic này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Quản lý Topics</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTopic(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm topic
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={topics}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTopic ? 'Cập nhật topic' : 'Thêm topic'}
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
            label="Tên Topic"
            rules={[{ required: true, message: 'Vui lòng nhập tên topic!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTopic ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TopicsLesson;
