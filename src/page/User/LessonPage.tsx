import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Alert, Spin } from "antd";

const { Title, Text } = Typography;

const LessonPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 2 seconds
    const timer = setTimeout(() => {
      navigate("/marxist-economics");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <div className="text-center">
          <Alert
            message="🚩 Chuyển hướng đến MarxEdu"
            description="Bài học tiếng Anh đã được thay thế bằng hệ thống bài học Triết học Mác-Lê-Nin."
            type="info"
            showIcon
            className="mb-6"
          />

          <Title level={2} className="text-red-700 mb-4">
            MarxEdu - Bài học Marxist
          </Title>

          <div className="mb-6">
            <Spin size="large" />
            <Text type="secondary" className="block mt-4">
              Đang chuyển hướng trong 2 giây...
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/marxist-economics")}
            className="bg-red-600 hover:bg-red-700"
          >
            Đi ngay đến trang học Marxist
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LessonPage;
