import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Alert,
  Row,
  Col,
  Divider,
  Badge,
  Progress,
  Tag,
} from "antd";
import {
  ExperimentOutlined,
  ReloadOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@/services/store/store";
import { testMultiAIConnection } from "@/services/features/marxist/philosophySlice";
import type {
  IMultiAIConnectionResponse,
  IAIProviderStatus,
} from "@/interfaces/IMarxist";

const { Title, Text, Paragraph } = Typography;

const MultiAITestPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { multiAI, loading } = useAppSelector(
    (state: RootState) => state.philosophy
  );

  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testResult, setTestResult] =
    useState<IMultiAIConnectionResponse | null>(null);

  const testConnection = async () => {
    setConnectionStatus("testing");
    setTestResult(null);
    try {
      const result = await dispatch(testMultiAIConnection()).unwrap();
      setTestResult(result);
      setConnectionStatus(result.success ? "success" : "error");
    } catch (error) {
      setConnectionStatus("error");
      console.error("Multi-AI connection test failed:", error);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "gemini":
        return <RobotOutlined style={{ color: "#4285f4" }} />;
      case "grok":
        return <ThunderboltOutlined style={{ color: "#00d4aa" }} />;
      default:
        return <ExperimentOutlined />;
    }
  };

  const getProviderStatus = (providerData: IAIProviderStatus) => {
    if (providerData.connected) {
      return { status: "success", text: "Hoạt động", icon: "✅" };
    } else {
      return { status: "error", text: "Lỗi kết nối", icon: "❌" };
    }
  };

  const getOverallStatusIcon = () => {
    switch (connectionStatus) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "testing":
        return <LoadingOutlined />;
      default:
        return "⚪";
    }
  };

  const getOverallStatusText = () => {
    if (!testResult) {
      switch (connectionStatus) {
        case "testing":
          return "Đang kiểm tra tất cả AI...";
        default:
          return "Chưa kiểm tra";
      }
    }

    const { connected, failed } = testResult.summary;
    if (connected === 2) return "Tất cả AI hoạt động";
    if (connected === 1) return `${connected}/2 AI hoạt động`;
    if (connected === 0) return "Tất cả AI lỗi";
    return `${connected}/${connected + failed} AI hoạt động`;
  };

  const getOverallStatusColor = () => {
    if (!testResult) {
      switch (connectionStatus) {
        case "success":
          return "success";
        case "error":
          return "error";
        case "testing":
          return "info";
        default:
          return "warning";
      }
    }

    const { connected, total } = testResult.summary;
    if (connected === total) return "success";
    if (connected > 0) return "warning";
    return "error";
  };

  return (
    <div className="multi-ai-test-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2 text-red-700">
          <ExperimentOutlined className="mr-2" />
          Test Multi-AI System
        </Title>
        <Paragraph className="text-gray-600">
          Kiểm tra kết nối và chức năng của hệ thống Multi-AI (Gemini + Grok4)
          để tạo câu hỏi triết học Mác-LêNin
        </Paragraph>

        {/* Quick Status Overview */}
        {multiAI.lastTest && (
          <Alert
            message={`Lần test cuối: ${new Date(
              multiAI.lastTest
            ).toLocaleString("vi-VN")}`}
            description={
              <div className="flex gap-4 mt-2">
                <Badge
                  status={multiAI.providers.gemini ? "success" : "error"}
                  text={`Gemini: ${multiAI.providers.gemini ? "Hoạt động" : "Lỗi"
                    }`}
                />
                <Badge
                  status={multiAI.providers.grok ? "success" : "error"}
                  text={`Grok4: ${multiAI.providers.grok ? "Hoạt động" : "Lỗi"
                    }`}
                />
              </div>
            }
            type={multiAI.connected ? "success" : "warning"}
            showIcon
            className="mb-6"
          />
        )}
      </div>

      {/* Overall Status */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="Tổng quan hệ thống" className="h-full">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">{getOverallStatusIcon()}</div>
              <Title level={4}>{getOverallStatusText()}</Title>
              <Button
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={testConnection}
                loading={connectionStatus === "testing" || loading}
                className="bg-red-600 hover:bg-red-700"
              >
                Kiểm tra tất cả AI
              </Button>
            </div>

            {testResult && (
              <Alert
                className="mt-4"
                type={getOverallStatusColor()}
                message={testResult.message}
                description={
                  <div className="mt-2">
                    <Progress
                      percent={Math.round(
                        (testResult.summary.connected /
                          testResult.summary.total) *
                        100
                      )}
                      strokeColor={{
                        "0%": "#ff4d4f",
                        "50%": "#faad14",
                        "100%": "#52c41a",
                      }}
                    />
                    <div className="text-sm mt-2">
                      {testResult.summary.connected}/{testResult.summary.total}{" "}
                      AI providers hoạt động
                    </div>
                  </div>
                }
                showIcon
              />
            )}
          </Card>
        </Col>

        {/* Individual AI Provider Status */}
        {testResult && (
          <>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    {getProviderIcon("gemini")}
                    <span>Google Gemini</span>
                  </div>
                }
                className="h-full"
              >
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">
                    {getProviderStatus(testResult.results.gemini).icon}
                  </div>
                  <Title level={5}>
                    {getProviderStatus(testResult.results.gemini).text}
                  </Title>

                  {testResult.results.gemini.config && (
                    <div className="mt-4 text-left">
                      <Divider />
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Model:</strong>{" "}
                          {testResult.results.gemini.config.model}
                        </div>
                        <div>
                          <strong>API Key:</strong>
                          <Tag
                            color={
                              testResult.results.gemini.config.apiKeyStatus ===
                                "Present"
                                ? "green"
                                : "red"
                            }
                          >
                            {testResult.results.gemini.config.apiKeyStatus}
                          </Tag>
                        </div>
                        <div>
                          <strong>Source:</strong>{" "}
                          {testResult.results.gemini.config.source}
                        </div>
                        {testResult.results.gemini.usage && (
                          <div>
                            <strong>Tokens:</strong>{" "}
                            {testResult.results.gemini.usage.total_tokens ||
                              "N/A"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    {getProviderIcon("grok")}
                    <span>Grok4 (OpenRouter)</span>
                  </div>
                }
                className="h-full"
              >
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">
                    {getProviderStatus(testResult.results.grok).icon}
                  </div>
                  <Title level={5}>
                    {getProviderStatus(testResult.results.grok).text}
                  </Title>

                  {testResult.results.grok.config && (
                    <div className="mt-4 text-left">
                      <Divider />
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Model:</strong>{" "}
                          {testResult.results.grok.config.model}
                        </div>
                        <div>
                          <strong>API Key:</strong>
                          <Tag
                            color={
                              testResult.results.grok.config.apiKeyStatus ===
                                "Present"
                                ? "green"
                                : "red"
                            }
                          >
                            {testResult.results.grok.config.apiKeyStatus}
                          </Tag>
                        </div>
                        <div>
                          <strong>Source:</strong>{" "}
                          {testResult.results.grok.config.source}
                        </div>
                        {testResult.results.grok.usage && (
                          <div>
                            <strong>Tokens:</strong>{" "}
                            {testResult.results.grok.usage.total_tokens ||
                              "N/A"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Documentation */}
      <Card title="Hướng dẫn sử dụng Multi-AI System">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={5}>🤖 Multi-AI Load Balancer</Title>
            <Paragraph>
              Hệ thống sử dụng Load Balancer để phân bổ tải giữa Gemini và Grok4
              (OpenRouter), đảm bảo tính ổn định và hiệu suất cao.
            </Paragraph>

            <Title level={5}>🔍 Kiểm tra kết nối</Title>
            <Paragraph>
              Sử dụng nút "Kiểm tra tất cả AI" để verify rằng cả hai AI
              providers đang hoạt động bình thường.
            </Paragraph>
          </Col>

          <Col xs={24} md={12}>
            <Title level={5}>⚙️ Load Balancing Strategies</Title>
            <ul>
              <li>
                <Text code>weighted</Text>: Phân bổ theo trọng số (50/50)
              </li>
              <li>
                <Text code>failover</Text>: Chuyển đổi khi lỗi
              </li>
              <li>
                <Text code>least_loaded</Text>: Chọn AI ít tải nhất
              </li>
            </ul>

            <Title level={5}>📊 Monitoring & Quality</Title>
            <ul>
              <li>Circuit breaker khi quá 3 lỗi liên tiếp</li>
              <li>Rate limiting và queue management</li>
              <li>Automatic failover giữa providers</li>
              <li>Advanced JSON repair cho Grok4</li>
              <li>Real-time response cleaning</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MultiAITestPage;
