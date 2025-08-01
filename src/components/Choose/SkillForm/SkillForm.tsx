import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Typography } from "antd";

const { Title, Text } = Typography;

const SkillForm: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <div className="text-center">
          <Title level={2} className="text-red-700 mb-4">
            🚩 MarxEdu - Kinh tế chính trị Mác-Lê-Nin
          </Title>
          <Text type="secondary" className="block mb-6">
            Ứng dụng này hiện tại chỉ tập trung vào việc học kinh tế chính trị Mác-Lê-Nin.
            Các tùy chọn kỹ năng trước đây đã được thay thế bằng hệ thống AI tự động.
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/marxist-economics")}
            className="bg-red-600 hover:bg-red-700"
          >
            Bắt đầu học Kinh tế chính trị Mác-Lê-Nin
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SkillForm;
