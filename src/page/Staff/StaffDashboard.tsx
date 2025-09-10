import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Typography, Statistic } from "antd";
import {
  BookOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { RootState, useAppSelector } from "@/services/store/store";

const { Title, Text, Paragraph } = Typography;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.role !== "staff") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  const quickStats = [
    { title: "Chủ đề Marxist", value: "10", icon: <BookOutlined /> },
    { title: "Bài học AI đã tạo", value: "45", icon: <ReadOutlined /> },
    { title: "Học viên hoạt động", value: "156", icon: <UserOutlined /> },
    {
      title: "Multi-AI System",
      value: "2 AI",
      icon: <ExperimentOutlined />,
      color: "#722ed1",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="mb-2 text-red-700">
          🚩 Dashboard Giảng viên
        </Title>
        <Paragraph className="text-gray-600">
          Quản lý hệ thống học tập Triết học Mác-Lê-Nin
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <Row gutter={[24, 24]} className="mb-8">
        {quickStats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color || "#dc2626" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Management Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        {/* Marxist Topics Management */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full"
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <BookOutlined className="text-4xl text-red-600 mb-4" />
            <Title level={4} className="mb-3">
              Chủ đề Marxist
            </Title>
            <Text type="secondary" className="block mb-4">
              Quản lý các chủ đề triết học Mác-Lê-Nin
            </Text>
            <Button
              type="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => navigate("/staff/marxist-topics")}
            >
              Quản lý chủ đề
            </Button>
          </Card>
        </Col>

        {/* AI Lessons Management */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full"
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <ReadOutlined className="text-4xl text-blue-600 mb-4" />
            <Title level={4} className="mb-3">
              Bài học AI
            </Title>
            <Text type="secondary" className="block mb-4">
              Xem và quản lý các bài học được tạo bởi AI
            </Text>
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/staff/marxist-lessons")}
            >
              Xem bài học
            </Button>
          </Card>
        </Col>

        {/* Learning Statistics */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full"
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <BarChartOutlined className="text-4xl text-green-600 mb-4" />
            <Title level={4} className="mb-3">
              Thống kê học tập
            </Title>
            <Text type="secondary" className="block mb-4">
              Báo cáo tiến độ học tập của học viên
            </Text>
            <Button
              type="primary"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/staff/marxist-stats")}
            >
              Xem thống kê
            </Button>
          </Card>
        </Col>

        {/* Multi-AI System Testing */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className="h-full"
            bodyStyle={{ padding: "24px", textAlign: "center" }}
          >
            <ExperimentOutlined className="text-4xl text-purple-600 mb-4" />
            <Title level={4} className="mb-3">
              Test Multi-AI System
            </Title>
            <Text type="secondary" className="block mb-4">
              Kiểm tra Gemini + DeepSeek Load Balancer
            </Text>
            <Button
              type="primary"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate("/staff/gemini-test")}
            >
              Test Multi-AI
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0">
        <Title level={3} className="text-white mb-3">
          🌟 Chào mừng, {user?.firstName}!
        </Title>
        <Paragraph className="text-white text-lg mb-0">
          Bạn đang quản lý hệ thống học tập Triết học Mác-Lê-Nin với Multi-AI
          System (Gemini + DeepSeek). Sử dụng các công cụ trên để hỗ trợ học
          viên và phát triển nội dung học tập chất lượng cao.
        </Paragraph>
      </Card>
    </div>
  );
};

export default StaffDashboard;
