import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Tag,
  Typography,
  Alert,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@/services/store/store";
import {
  getMarxistPhilosophyTopicsList,
  createMarxistPhilosophyTopic,
  updateMarxistPhilosophyTopic,
  deleteMarxistPhilosophyTopic,
  seedMarxistPhilosophyTopics,
  clearPhilosophyError,
  clearPhilosophySuccess,
} from "@/services/features/marxist/philosophySlice";
import {
  IMarxistPhilosophyTopic,
  ICreateMarxistPhilosophyTopicData,
  IUpdateMarxistPhilosophyTopicData,
} from "@/interfaces/IMarxist";

const { Title, Text } = Typography;
const { confirm } = Modal;

const PhilosophyTopicsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error, success, topics } = useAppSelector(
    (state: RootState) => state.philosophy
  );

  // Type assertion for topics
  const typedTopics = topics as IMarxistPhilosophyTopic[];
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] =
    useState<IMarxistPhilosophyTopic | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getMarxistPhilosophyTopicsList({}));
  }, [dispatch]);

  const handleCreateTopic = async (
    values: ICreateMarxistPhilosophyTopicData
  ) => {
    try {
      await dispatch(createMarxistPhilosophyTopic(values)).unwrap();
      setIsModalVisible(false);
      form.resetFields();
      dispatch(getMarxistPhilosophyTopicsList({}));
    } catch (error) {
      console.error("Error creating topic:", error);
    }
  };

  const handleUpdateTopic = async (
    values: IUpdateMarxistPhilosophyTopicData
  ) => {
    if (!editingTopic) return;

    try {
      await dispatch(
        updateMarxistPhilosophyTopic({
          id: editingTopic._id,
          data: values,
        })
      ).unwrap();
      setIsModalVisible(false);
      setEditingTopic(null);
      form.resetFields();
      dispatch(getMarxistPhilosophyTopicsList({}));
    } catch (error) {
      console.error("Error updating topic:", error);
    }
  };

  const handleDeleteTopic = (topic: IMarxistPhilosophyTopic) => {
    confirm({
      title: "⚠️ Xác nhận xóa chủ đề",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa chủ đề này không?</p>
          <p>
            <strong>Tên:</strong> {topic.title}
          </p>
          <p className="text-red-600">⚠️ Hành động này không thể hoàn tác!</p>
        </div>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await dispatch(deleteMarxistPhilosophyTopic(topic._id)).unwrap();
          dispatch(getMarxistPhilosophyTopicsList({}));
        } catch (error) {
          console.error("Error deleting topic:", error);
        }
      },
    });
  };

  const handleSeedTopics = () => {
    confirm({
      title: "🌱 Tạo dữ liệu mẫu",
      content: (
        <div>
          <p>
            Tạo các chủ đề triết học Mác-LêNin mẫu để bắt đầu sử dụng hệ thống?
          </p>
          <p className="text-blue-600">
            💡 Điều này sẽ tạo các chủ đề cơ bản về triết học Marxist-Leninist.
          </p>
        </div>
      ),
      okText: "Tạo dữ liệu mẫu",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await dispatch(seedMarxistPhilosophyTopics()).unwrap();
          dispatch(getMarxistPhilosophyTopicsList({}));
        } catch (error) {
          console.error("Error seeding topics:", error);
        }
      },
    });
  };

  const openCreateModal = () => {
    setEditingTopic(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (topic: IMarxistPhilosophyTopic) => {
    setEditingTopic(topic);
    form.setFieldsValue({
      title: topic.title,
      description: topic.description,
      keywords: topic.keywords,
      suggestedDifficulty: topic.suggestedDifficulty,
      suggestedQuestionCount: topic.suggestedQuestionCount,
      displayOrder: topic.displayOrder,
      isActive: topic.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDismissMessage = () => {
    dispatch(clearPhilosophyError());
    dispatch(clearPhilosophySuccess());
  };

  const columns = [
    {
      title: "Tên chủ đề",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: IMarxistPhilosophyTopic) => (
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-500">{record.name}</div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Từ khóa",
      dataIndex: "keywords",
      key: "keywords",
      render: (keywords: string[]) => (
        <div>
          {keywords?.map((keyword, index) => (
            <Tag key={index} color="blue" className="mb-1">
              {keyword}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Độ khó đề xuất",
      dataIndex: "suggestedDifficulty",
      key: "suggestedDifficulty",
      render: (difficulty: number) => {
        const colors = ["", "green", "blue", "orange", "red", "purple"];
        const texts = ["", "Cơ bản", "Trung bình", "Khá", "Khó", "Rất khó"];
        return <Tag color={colors[difficulty]}>{texts[difficulty]}</Tag>;
      },
    },
    {
      title: "Số câu hỏi",
      dataIndex: "suggestedQuestionCount",
      key: "suggestedQuestionCount",
    },
    {
      title: "Thống kê",
      key: "stats",
      render: (_: unknown, record: IMarxistPhilosophyTopic) => (
        <div className="text-sm">
          <div>Bài học: {record.totalLessonsGenerated}</div>
          <div>Điểm TB: {record.averageScore?.toFixed(1) || "N/A"}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: IMarxistPhilosophyTopic) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
          >
            Sửa
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTopic(record)}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>🏛️ Quản lý chủ đề triết học Mác-LêNin</Title>
        <Text className="text-gray-600">
          Quản lý các chủ đề triết học để AI tạo bài học phù hợp
        </Text>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert
          message="Thành công!"
          description={success}
          type="success"
          showIcon
          closable
          onClose={handleDismissMessage}
          className="mb-4"
        />
      )}

      {error && (
        <Alert
          message="Có lỗi xảy ra"
          description={error}
          type="error"
          showIcon
          closable
          onClose={handleDismissMessage}
          className="mb-4"
        />
      )}

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Text strong>Tổng số chủ đề: {topics?.length || 0}</Text>
          </div>
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={handleSeedTopics}
            >
              🌱 Tạo dữ liệu mẫu
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Thêm chủ đề mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={typedTopics}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} chủ đề`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTopic ? "✏️ Sửa chủ đề" : "➕ Thêm chủ đề mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTopic(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingTopic ? handleUpdateTopic : handleCreateTopic}
        >
          {!editingTopic && (
            <Form.Item
              label="Tên chủ đề (slug)"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên chủ đề!" }]}
            >
              <Input placeholder="vd: marxist-philosophy-basics" />
            </Form.Item>
          )}

          <Form.Item
            label="Tiêu đề chủ đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="vd: Cơ sở triết học Mác-LêNin" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả chi tiết về chủ đề triết học này..."
            />
          </Form.Item>

          <Form.Item
            label="Từ khóa (mỗi từ khóa trên một dòng)"
            name="keywords"
          >
            <Input.TextArea
              rows={3}
              placeholder={`vật chất\ný thức\nphép biện chứng\nchủ nghĩa duy vật`}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              label="Độ khó đề xuất"
              name="suggestedDifficulty"
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                max={5}
                placeholder="1-5"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Số câu hỏi đề xuất"
              name="suggestedQuestionCount"
              style={{ flex: 1 }}
            >
              <InputNumber
                min={5}
                max={50}
                placeholder="10"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Thứ tự hiển thị"
              name="displayOrder"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTopic ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PhilosophyTopicsPage;
