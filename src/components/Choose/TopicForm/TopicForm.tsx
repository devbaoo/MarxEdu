import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Typography } from "antd";

const { Title, Text } = Typography;

const TopicForm: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <div className="text-center">
          <Title level={2} className="text-red-700 mb-4">
            🚩 MarxEdu - Triết học Mác-LêNin
          </Title>
          <Text type="secondary" className="block mb-6">
            Ứng dụng này hiện tại chỉ tập trung vào việc học triết học
            Mác-LêNin. Các tùy chọn chủ đề trước đây đã được thay thế bằng hệ
            thống AI tự động.
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/marxist-economics")}
            className="bg-red-600 hover:bg-red-700"
          >
            Bắt đầu học Triết học Mác-LêNin
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TopicForm;
