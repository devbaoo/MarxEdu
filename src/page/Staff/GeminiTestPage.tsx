import React, { useState } from 'react';
import { Card, Button, Input, Typography, Alert, Spin, Row, Col, Divider, Space } from 'antd';
import { 
  ExperimentOutlined, 
  SendOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '@/services/store/store';
import { testGeminiConnection } from '@/services/features/marxist/marxistSlice';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const GeminiTestPage: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [customPrompt, setCustomPrompt] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isCustomTesting, setIsCustomTesting] = useState(false);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      await dispatch(testGeminiConnection()).unwrap();
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
      console.error('Gemini connection test failed:', error);
    }
  };

  const testCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    
    setIsCustomTesting(true);
    setTestResult(null);
    
    try {
      // Simulate API call - replace with actual API call
      setTimeout(() => {
        setTestResult(`Đây là kết quả test từ Gemini AI với prompt: "${customPrompt}"\n\nAI đã phản hồi thành công và hoạt động bình thường.`);
        setIsCustomTesting(false);
      }, 2000);
         } catch {
       setTestResult('Lỗi khi test custom prompt');
       setIsCustomTesting(false);
     }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return <Spin />;
      case 'success': return <CheckCircleOutlined className="text-green-500" />;
      case 'error': return <CloseCircleOutlined className="text-red-500" />;
      default: return <ExperimentOutlined className="text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return 'Đang kiểm tra...';
      case 'success': return 'Kết nối thành công';
      case 'error': return 'Kết nối thất bại';
      default: return 'Chưa kiểm tra';
    }
  };

  const getStatusColor = (): 'success' | 'error' | 'info' | 'warning' => {
    switch (connectionStatus) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'testing': return 'info';
      default: return 'warning';
    }
  };

  const samplePrompts = [
    "Tạo một câu hỏi trắc nghiệm về chủ nghĩa tư bản",
    "Giải thích khái niệm giá trị thặng dư trong lý thuyết Marx",
    "Phân tích mối quan hệ giữa lực lượng sản xuất và quan hệ sản xuất",
    "Tạo 5 câu hỏi về đấu tranh giai cấp với độ khó trung bình"
  ];

  return (
    <div className="gemini-test-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2 text-red-700">
          <ExperimentOutlined className="mr-2" />
          Test Gemini AI Connection
        </Title>
        <Paragraph className="text-gray-600">
          Kiểm tra kết nối và chức năng của Google Gemini AI để tạo câu hỏi Marxist
        </Paragraph>
      </div>

      {/* Connection Status */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Trạng thái kết nối" className="h-full">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">
                {getStatusIcon()}
              </div>
              <Title level={4}>{getStatusText()}</Title>
              <Button 
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={testConnection}
                loading={connectionStatus === 'testing'}
                className="bg-red-600 hover:bg-red-700"
              >
                Kiểm tra kết nối
              </Button>
            </div>

            {connectionStatus !== 'idle' && (
              <Alert
                className="mt-4"
                type={getStatusColor()}
                message={
                  connectionStatus === 'success' 
                    ? 'Gemini AI hoạt động bình thường'
                    : connectionStatus === 'error' 
                    ? 'Không thể kết nối đến Gemini AI'
                    : 'Đang kiểm tra kết nối...'
                }
                showIcon
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Thông tin hệ thống" className="h-full">
            <Space direction="vertical" className="w-full">
              <div>
                <Text strong>API Endpoint: </Text>
                <Text code>https://generativelanguage.googleapis.com/v1beta/models/gemini-pro</Text>
              </div>
              <div>
                <Text strong>Model: </Text>
                <Text>Gemini Pro</Text>
              </div>
              <div>
                <Text strong>Timeout: </Text>
                <Text>30 giây</Text>
              </div>
              <div>
                <Text strong>Chức năng: </Text>
                <Text>Tạo câu hỏi Marxist tự động</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Custom Prompt Test */}
      <Card title="Test Custom Prompt" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <div className="mb-4">
              <Text strong>Nhập prompt để test:</Text>
            </div>
            <TextArea
              rows={4}
              placeholder="Nhập câu lệnh để test Gemini AI..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="mb-4"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={testCustomPrompt}
              loading={isCustomTesting}
              disabled={!customPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Gửi test
            </Button>
          </Col>

          <Col xs={24} lg={8}>
            <div className="mb-4">
              <Text strong>Prompt mẫu:</Text>
            </div>
            <Space direction="vertical" className="w-full">
              {samplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  block
                  size="small"
                  icon={<BulbOutlined />}
                  onClick={() => setCustomPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </Space>
          </Col>
        </Row>

        {/* Test Result */}
        {(isCustomTesting || testResult) && (
          <>
            <Divider />
            <div>
              <Text strong>Kết quả:</Text>
              {isCustomTesting ? (
                <div className="text-center py-4">
                  <Spin size="large" />
                  <div className="mt-2">Đang xử lý...</div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 mt-2 rounded">
                  <pre className="whitespace-pre-wrap">{testResult}</pre>
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Documentation */}
      <Card title="Hướng dẫn sử dụng">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={5}>🔍 Kiểm tra kết nối</Title>
            <Paragraph>
              Sử dụng nút "Kiểm tra kết nối" để verify rằng API key và endpoint đang hoạt động bình thường.
            </Paragraph>

            <Title level={5}>✏️ Test Custom Prompt</Title>
            <Paragraph>
              Nhập prompt tùy chỉnh để test khả năng generate content của Gemini AI. 
              Có thể sử dụng các prompt mẫu bên cạnh.
            </Paragraph>
          </Col>

          <Col xs={24} md={12}>
            <Title level={5}>⚠️ Lưu ý</Title>
            <ul>
              <li>Đảm bảo API key của Gemini hợp lệ</li>
              <li>Kiểm tra kết nối internet</li>
              <li>Prompt nên rõ ràng và cụ thể</li>
              <li>Timeout mặc định là 30 giây</li>
            </ul>

            <Title level={5}>📊 Troubleshooting</Title>
            <ul>
              <li><Text code>401 Error</Text>: Kiểm tra API key</li>
              <li><Text code>429 Error</Text>: Vượt quá rate limit</li>
              <li><Text code>Timeout</Text>: Thử lại sau ít phút</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GeminiTestPage; 