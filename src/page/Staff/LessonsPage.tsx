import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Alert } from "antd";

const { Title, Text } = Typography;

const LessonsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate("/staff/marxist-lessons");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="p-6">
      <Card>
        <Alert
          message="⚠️ Trang này đã được di chuyển"
          description="Trang quản lý bài học tiếng Anh đã được thay thế bằng trang quản lý bài học Kinh tế chính trị Mác-Lê-Nin."
          type="warning"
          showIcon
          className="mb-4"
        />
        
        <div className="text-center">
          <Title level={3} className="text-red-700 mb-4">
            🚩 MarxEdu - Quản lý bài học Marxist
          </Title>
          <Text type="secondary" className="block mb-6">
            Bạn sẽ được chuyển hướng tự động trong 3 giây...
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/staff/marxist-lessons")}
            className="bg-red-600 hover:bg-red-700"
          >
            Đi đến trang quản lý bài học Marxist ngay
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LessonsPage;
