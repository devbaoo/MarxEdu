import React, { useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Alert, Table, Tag } from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  PercentageOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@/services/store/store";
import {
  getMarxistPhilosophyStats,
  clearPhilosophyError,
  clearPhilosophySuccess,
} from "@/services/features/marxist/philosophySlice";
import { IMarxistPhilosophyStats } from "@/interfaces/IMarxist";

const { Title, Text } = Typography;

interface ITopicStats {
  topicId: string;
  name: string;
  title: string;
  total: number;
  completed: number;
  avgScore?: number;
}

const PhilosophyStatsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error, success, stats } = useAppSelector(
    (state: RootState) => state.philosophy
  );

  // Type assertion for stats
  const typedStats = stats as IMarxistPhilosophyStats;

  useEffect(() => {
    dispatch(getMarxistPhilosophyStats());
  }, [dispatch]);

  const handleDismissMessage = () => {
    dispatch(clearPhilosophyError());
    dispatch(clearPhilosophySuccess());
  };

  const topicColumns = [
    {
      title: "Chủ đề",
      key: "topic",
      render: (_: unknown, record: ITopicStats) => (
        <div>
          <div className="font-semibold">{record.title}</div>
          <div className="text-sm text-gray-500">{record.name}</div>
        </div>
      ),
    },
    {
      title: "Tổng bài học",
      dataIndex: "total",
      key: "total",
      sorter: (a: ITopicStats, b: ITopicStats) => a.total - b.total,
    },
    {
      title: "Đã hoàn thành",
      dataIndex: "completed",
      key: "completed",
      sorter: (a: ITopicStats, b: ITopicStats) => a.completed - b.completed,
    },
    {
      title: "Tỉ lệ hoàn thành",
      key: "completionRate",
      render: (_: unknown, record: ITopicStats) => {
        const rate =
          record.total > 0
            ? Math.round((record.completed / record.total) * 100)
            : 0;
        return (
          <Tag color={rate >= 70 ? "green" : rate >= 40 ? "orange" : "red"}>
            {rate}%
          </Tag>
        );
      },
      sorter: (a: ITopicStats, b: ITopicStats) => {
        const rateA = a.total > 0 ? (a.completed / a.total) * 100 : 0;
        const rateB = b.total > 0 ? (b.completed / b.total) * 100 : 0;
        return rateA - rateB;
      },
    },
    {
      title: "Điểm trung bình",
      dataIndex: "avgScore",
      key: "avgScore",
      render: (score: number) => (
        <Tag color={score >= 80 ? "green" : score >= 60 ? "blue" : "orange"}>
          {score || 0} điểm
        </Tag>
      ),
      sorter: (a: ITopicStats, b: ITopicStats) =>
        (a.avgScore || 0) - (b.avgScore || 0),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>📊 Thống kê triết học Mác-Lê-Nin</Title>
        <Text className="text-gray-600">
          Xem thống kê chi tiết về việc học triết học của người dùng
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

      {/* Overall Statistics */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bài học"
              value={typedStats?.totalLessons || 0}
              prefix={<BookOutlined className="text-blue-600" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={typedStats?.completedLessons || 0}
              prefix={<TrophyOutlined className="text-green-600" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỉ lệ hoàn thành"
              value={typedStats?.completionRate || 0}
              suffix="%"
              prefix={<PercentageOutlined className="text-orange-600" />}
              valueStyle={{
                color:
                  (typedStats?.completionRate || 0) >= 70
                    ? "#52c41a"
                    : (typedStats?.completionRate || 0) >= 40
                    ? "#faad14"
                    : "#ff4d4f",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Điểm TB tổng thể"
              value={typedStats?.overallAvgScore || 0}
              suffix="/100"
              prefix={<StarOutlined className="text-purple-600" />}
              valueStyle={{
                color:
                  (typedStats?.overallAvgScore || 0) >= 80
                    ? "#52c41a"
                    : (typedStats?.overallAvgScore || 0) >= 60
                    ? "#1890ff"
                    : "#faad14",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Topic Breakdown */}
      <Card
        title={
          <div className="flex items-center">
            <BookOutlined className="text-blue-600 mr-2" />
            <span>Thống kê theo chủ đề</span>
          </div>
        }
        loading={loading}
      >
        <Table
          columns={topicColumns}
          dataSource={typedStats?.topicBreakdown || []}
          rowKey="topicId"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} chủ đề`,
          }}
        />
      </Card>
    </div>
  );
};

export default PhilosophyStatsPage;
