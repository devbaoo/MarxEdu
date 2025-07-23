import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  Tag,
  Space,
  Card,
  Typography,
  Row,
  Col,
  InputNumber,
  message,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  SendOutlined
} from '@ant-design/icons';
import { RootState, useAppDispatch, useAppSelector } from '@/services/store/store';
import {
  getMarxistTopicsList,
  createMarxistTopic,
  updateMarxistTopic,
  deleteMarxistTopic,
  seedMarxistTopics,
  clearMarxistError,
  clearMarxistSuccess
} from '@/services/features/marxist/marxistSlice';
import { IMarxistTopic, ICreateMarxistTopicData, IUpdateMarxistTopicData } from '@/interfaces/IMarxist';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MarxistTopicsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    topics,
    topicsLoading,
    loading,
    error,
    successMessage,
    pagination
  } = useAppSelector((state: RootState) => state.marxist);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<IMarxistTopic | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getMarxistTopicsList({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearMarxistSuccess());
      setIsModalVisible(false);
      form.resetFields();
      setEditingTopic(null);
      dispatch(getMarxistTopicsList({ page: pagination.currentPage, limit: pagination.pageSize }));
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearMarxistError());
    }
  }, [error]);

  const handleCreate = () => {
    setEditingTopic(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (topic: IMarxistTopic) => {
    setEditingTopic(topic);
    form.setFieldsValue({
      name: topic.name,
      title: topic.title,
      description: topic.description,
      keywords: topic.keywords,
      suggestedDifficulty: topic.suggestedDifficulty,
      suggestedQuestionCount: topic.suggestedQuestionCount,
      displayOrder: topic.displayOrder,
      isActive: topic.isActive
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteMarxistTopic(id)).unwrap();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (editingTopic) {
        // Update existing topic
        const updateData: IUpdateMarxistTopicData = {
          title: values.title as string,
          description: values.description as string,
          keywords: (values.keywords as string[]) || [],
          suggestedDifficulty: values.suggestedDifficulty as number,
          suggestedQuestionCount: values.suggestedQuestionCount as number,
          displayOrder: values.displayOrder as number,
          isActive: values.isActive as boolean
        };
        await dispatch(updateMarxistTopic({ id: editingTopic._id, data: updateData })).unwrap();
      } else {
        // Create new topic
        const createData: ICreateMarxistTopicData = {
          name: values.name as string,
          title: values.title as string,
          description: values.description as string,
          keywords: (values.keywords as string[]) || [],
          suggestedDifficulty: (values.suggestedDifficulty as number) || 2,
          suggestedQuestionCount: (values.suggestedQuestionCount as number) || 30,
          displayOrder: (values.displayOrder as number) || 0
        };
        await dispatch(createMarxistTopic(createData)).unwrap();
      }
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleSeedTopics = async () => {
    try {
      await dispatch(seedMarxistTopics()).unwrap();
    } catch (error) {
      console.error('Seed failed:', error);
    }
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    dispatch(getMarxistTopicsList({ 
      page, 
      limit: pageSize || pagination.pageSize 
    }));
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'orange';
      case 4: return 'red';
      case 5: return 'purple';
      default: return 'default';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung bình';
      case 3: return 'Khá';
      case 4: return 'Khó';
      case 5: return 'Rất khó';
      default: return 'Không xác định';
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => 
        (pagination.currentPage - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Tên định danh',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <code>{text}</code>
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Từ khóa',
      dataIndex: 'keywords',
      key: 'keywords',
      width: 200,
      render: (keywords: string[]) => (
        <div>
          {keywords.map((keyword, index) => (
            <Tag key={index}>{keyword}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Độ khó',
      dataIndex: 'suggestedDifficulty',
      key: 'suggestedDifficulty',
      width: 100,
      render: (level: number) => (
        <Tag color={getDifficultyColor(level)}>
          {getDifficultyText(level)}
        </Tag>
      ),
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'suggestedQuestionCount',
      key: 'suggestedQuestionCount',
      width: 100,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
    },
    {
      title: 'Bài học đã tạo',
      dataIndex: 'totalLessonsGenerated',
      key: 'totalLessonsGenerated',
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: IMarxistTopic) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa chủ đề này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="marxist-topics-page p-6">
      <Card>
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Title level={3} className="m-0">
              <BookOutlined className="mr-2" />
              Quản lý chủ đề Marxist
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SendOutlined />}
                onClick={handleSeedTopics}
                loading={loading}
              >
                Tạo dữ liệu mẫu
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                className="bg-red-600 hover:bg-red-700"
              >
                Thêm chủ đề
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={topics}
          rowKey="_id"
          loading={topicsLoading}
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.totalItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} chủ đề`,
            onChange: handleTableChange,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTopic ? "Chỉnh sửa chủ đề" : "Thêm chủ đề mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTopic(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            suggestedDifficulty: 2,
            suggestedQuestionCount: 30,
            displayOrder: 0,
            isActive: true
          }}
        >
          {!editingTopic && (
            <Form.Item
              label="Tên định danh"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên định danh' },
                { pattern: /^[a-z_]+$/, message: 'Chỉ được dùng chữ thường và dấu gạch dưới' }
              ]}
              help="Ví dú: chu_nghia_tu_ban, gia_tri_thang_du"
            >
              <Input placeholder="chu_nghia_tu_ban" />
            </Form.Item>
          )}

          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Chủ nghĩa tư bản" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea 
              rows={3}
              placeholder="Lý thuyết về chế độ tư bản chủ nghĩa, mâu thuẫn cơ bản của chủ nghĩa tư bản..."
            />
          </Form.Item>

          <Form.Item
            label="Từ khóa"
            name="keywords"
            help="Nhập từ khóa, cách nhau bằng dấu phẩy"
          >
            <Select
              mode="tags"
              placeholder="tư bản, công nhân, bóc lột, thặng dư..."
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Độ khó đề xuất"
                name="suggestedDifficulty"
              >
                <Select>
                  <Option value={1}>Cơ bản</Option>
                  <Option value={2}>Trung bình</Option>
                  <Option value={3}>Khá</Option>
                  <Option value={4}>Khó</Option>
                  <Option value={5}>Rất khó</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Số câu hỏi đề xuất"
                name="suggestedQuestionCount"
              >
                <InputNumber min={10} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Thứ tự hiển thị"
                name="displayOrder"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {editingTopic && (
            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Hoạt động" 
                unCheckedChildren="Tạm dừng" 
              />
            </Form.Item>
          )}

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {editingTopic ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MarxistTopicsPage; 