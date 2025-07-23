import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Alert } from "antd";

const { Title, Text } = Typography;

const SkillsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/staff/marxist-topics");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="p-6">
      <Card>
        <Alert
          message="⚠️ Trang này đã được thay thế"
          description="Quản lý kỹ năng tiếng Anh đã được thay thế bằng hệ thống chủ đề Marxist tự động."
          type="warning"
          showIcon
          className="mb-4"
        />
        
        <div className="text-center">
          <Title level={3} className="text-red-700 mb-4">
            🚩 MarxEdu - Chủ đề Marxist
          </Title>
          <Text type="secondary" className="block mb-6">
            Chuyển hướng tự động trong 3 giây...
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/staff/marxist-topics")}
            className="bg-red-600 hover:bg-red-700"
          >
            Đi đến quản lý chủ đề Marxist
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SkillsPage;
