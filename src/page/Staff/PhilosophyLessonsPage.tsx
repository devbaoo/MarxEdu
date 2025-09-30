import React, { useEffect } from "react";
import { Card, Table, Typography, Tag, Alert, Button } from "antd";
import { BookOutlined, EyeOutlined } from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@/services/store/store";
import {
  getMarxistPhilosophyLearningPath,
  clearPhilosophyError,
  clearPhilosophySuccess,
} from "@/services/features/marxist/philosophySlice";
import { IMarxistPhilosophyLearningPath } from "@/interfaces/IMarxist";

const { Title, Text } = Typography;

const PhilosophyLessonsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error, success, learningPath } = useAppSelector(
    (state: RootState) => state.philosophy
  );

  // Type assertion for learningPath
  const typedLearningPath = learningPath as IMarxistPhilosophyLearningPath[];

  useEffect(() => {
    // Get all lessons from all users (staff view)
    dispatch(getMarxistPhilosophyLearningPath({}));
  }, [dispatch]);

  const handleDismissMessage = () => {
    dispatch(clearPhilosophyError());
    dispatch(clearPhilosophySuccess());
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "green";
      case 2:
        return "blue";
      case 3:
        return "orange";
      case 4:
        return "red";
      case 5:
        return "purple";
      default:
        return "default";
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return "Cơ bản";
      case 2:
        return "Trung bình";
      case 3:
        return "Khá";
      case 4:
        return "Khó";
      case 5:
        return "Rất khó";
      default:
        return "📚";
    }
  };

  const formatTopicTitle = (title?: string) => {
    const normalizedTitle = title?.trim();
    if (!normalizedTitle) {
      return "Triết học";
    }
    if (normalizedTitle === "Không xác định") {
      return "📚";
    }
    return normalizedTitle;
  };

  const columns = [
    {
      title: "Tiêu đề bài học",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <div className="flex items-center">
          <BookOutlined className="text-blue-600 mr-2" />
          <span className="font-semibold">{title}</span>
        </div>
      ),
    },
    {
      title: "Chủ đề",
      key: "topic",
      render: (_: unknown, record: IMarxistPhilosophyLearningPath) => (
        <div>
          <div className="font-medium">
            {formatTopicTitle(
              (record as { marxistTopic?: { title?: string } }).marxistTopic
                ?.title
            )}
          </div>
          <div className="text-sm text-gray-500">
            {(record as { marxistTopic?: { name?: string } }).marxistTopic
              ?.name || "philosophy"}
          </div>
        </div>
      ),
    },
    {
      title: "Độ khó",
      dataIndex: "difficultyLevel",
      key: "difficultyLevel",
      render: (level: number) => (
        <Tag color={getDifficultyColor(level)}>{getDifficultyText(level)}</Tag>
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      sorter: (
        a: IMarxistPhilosophyLearningPath,
        b: IMarxistPhilosophyLearningPath
      ) => a.order - b.order,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: unknown, record: IMarxistPhilosophyLearningPath) => (
        <div>
          <Tag color={record.completed ? "green" : "orange"}>
            {record.completed ? "✅ Hoàn thành" : "⏳ Đang học"}
          </Tag>
          {record.completed && record.achievedScore && (
            <div className="text-sm text-gray-600 mt-1">
              Điểm: {record.achievedScore}/100
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Lý do đề xuất",
      dataIndex: "recommendedReason",
      key: "recommendedReason",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (
        a: IMarxistPhilosophyLearningPath,
        b: IMarxistPhilosophyLearningPath
      ) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: IMarxistPhilosophyLearningPath) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            window.open(`/philosophy-lesson/${record.pathId}`, "_blank");
          }}
          size="small"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>📚 Bài học triết học AI đã tạo</Title>
        <Text className="text-gray-600">
          Xem và quản lý tất cả các bài học triết học Mác-Lê-Nin được AI tạo ra
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
        <div className="mb-4">
          <Text strong>Tổng số bài học: {learningPath?.length || 0}</Text>
        </div>

        <Table
          columns={columns}
          dataSource={typedLearningPath}
          rowKey="pathId"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} bài học`,
            defaultPageSize: 20,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default PhilosophyLessonsPage;
