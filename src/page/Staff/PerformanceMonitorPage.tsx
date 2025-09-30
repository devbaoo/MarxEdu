import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Alert,
  Spin,
  Typography,
  Progress,
  Table,
  Tag,
  Space,
} from "antd";
import {
  ReloadOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAppDispatch } from "@/services/store/store";
import {
  getGenerationStats,
  getMultiAiStats,
  getRateLimiterStats,
} from "@/services/features/marxist/philosophySlice";
import type {
  IGenerationStats,
  IMultiAiStats,
  IRateLimiterStats,
} from "@/interfaces/IMarxist";

const { Title, Text } = Typography;

const PerformanceMonitorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [generationStats, setGenerationStats] =
    useState<IGenerationStats | null>(null);
  const [multiAiStats, setMultiAiStats] = useState<IMultiAiStats | null>(null);
  const [rateLimiterStats, setRateLimiterStats] =
    useState<IRateLimiterStats | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAllStats = React.useCallback(async () => {
    setLoading(true);
    try {
      const [genResult, aiResult, rateLimitResult] = await Promise.all([
        dispatch(getGenerationStats()).unwrap(),
        dispatch(getMultiAiStats()).unwrap(),
        dispatch(getRateLimiterStats()).unwrap(),
      ]);

      setGenerationStats(genResult);
      setMultiAiStats(aiResult);
      setRateLimiterStats(rateLimitResult);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch performance stats:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllStats, 30000);
    return () => clearInterval(interval);
  }, [fetchAllStats]);

  // AI Providers table columns
  const aiProviderColumns = [
    {
      title: "Provider",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Tag color={name === "grok" ? "blue" : "green"}>
          {name.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "Weight (%)",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Load",
      key: "load",
      render: (record: { currentLoad: number; maxConcurrent: number }) => (
        <Progress
          percent={Math.round(
            (record.currentLoad / record.maxConcurrent) * 100
          )}
          format={() => `${record.currentLoad}/${record.maxConcurrent}`}
          size="small"
        />
      ),
    },
    {
      title: "Failures",
      dataIndex: "failures",
      key: "failures",
      render: (failures: number) => (
        <Tag color={failures > 0 ? "red" : "green"}>{failures}</Tag>
      ),
    },
    {
      title: "Last Used",
      dataIndex: "lastUsed",
      key: "lastUsed",
      render: (timestamp: number) => {
        if (!timestamp) return "Never";
        const ago = Math.round((Date.now() - timestamp) / 1000);
        return `${ago}s ago`;
      },
    },
  ];

  const getSystemHealthColor = () => {
    if (!generationStats) return "default";
    const successRate = generationStats.stats.performance.successRate;
    if (successRate >= 95) return "success";
    if (successRate >= 80) return "warning";
    return "error";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="mb-2">
              ⚡ Performance Monitor
            </Title>
            <Text type="secondary">
              Real-time AI Generation System Performance
            </Text>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchAllStats}
            loading={loading}>
            Refresh Stats
          </Button>
        </div>

        {/* Last Refresh Info */}
        <Alert
          message={`Last updated: ${lastRefresh.toLocaleTimeString()}`}
          type="info"
          showIcon
          className="mb-6"
        />

        <Spin spinning={loading}>
          {/* System Overview */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="System Health"
                  value={
                    generationStats
                      ? `${generationStats.stats.performance.successRate.toFixed(
                          1
                        )}%`
                      : "N/A"
                  }
                  valueStyle={{
                    color:
                      getSystemHealthColor() === "success"
                        ? "#3f8600"
                        : getSystemHealthColor() === "warning"
                        ? "#cf1322"
                        : "#d46b08",
                  }}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Queue Length"
                  value={generationStats?.stats.queue.queueLength || 0}
                  prefix={<DatabaseOutlined />}
                  suffix={`/ ${
                    generationStats?.stats.queue.maxConcurrent || 3
                  }`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Avg Generation Time"
                  value={
                    generationStats?.stats.performance.avgGenerationTime || 0
                  }
                  precision={1}
                  suffix="s"
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Generations"
                  value={
                    generationStats?.stats.performance.totalGenerations || 0
                  }
                  prefix={<RocketOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Detailed Stats */}
          <Row gutter={[16, 16]}>
            {/* AI Generation Queue */}
            <Col xs={24} lg={12}>
              <Card title="🚀 AI Generation Queue" className="h-full">
                {generationStats ? (
                  <Space direction="vertical" className="w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text strong>Currently Running:</Text>
                        <br />
                        <Text className="text-2xl">
                          {generationStats.stats.queue.currentRunning}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Queue Length:</Text>
                        <br />
                        <Text className="text-2xl">
                          {generationStats.stats.queue.queueLength}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Total Processed:</Text>
                        <br />
                        <Text className="text-2xl">
                          {generationStats.stats.queue.totalProcessed}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Total Failed:</Text>
                        <br />
                        <Text className="text-2xl text-red-600">
                          {generationStats.stats.queue.totalFailed}
                        </Text>
                      </div>
                    </div>
                    <Progress
                      percent={Math.round(
                        (generationStats.stats.queue.currentRunning /
                          generationStats.stats.queue.maxConcurrent) *
                          100
                      )}
                      status={
                        generationStats.stats.queue.currentRunning >=
                        generationStats.stats.queue.maxConcurrent
                          ? "exception"
                          : "active"
                      }
                      format={() =>
                        `${generationStats.stats.queue.currentRunning}/${generationStats.stats.queue.maxConcurrent} Running`
                      }
                    />
                  </Space>
                ) : (
                  <Text>No data available</Text>
                )}
              </Card>
            </Col>

            {/* Rate Limiter Stats */}
            <Col xs={24} lg={12}>
              <Card title="⚡ Rate Limiter" className="h-full">
                {rateLimiterStats ? (
                  <Space direction="vertical" className="w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text strong>Concurrent:</Text>
                        <br />
                        <Text className="text-2xl">
                          {rateLimiterStats.stats.concurrent}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Queued:</Text>
                        <br />
                        <Text className="text-2xl">
                          {rateLimiterStats.stats.queued}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Processed:</Text>
                        <br />
                        <Text className="text-2xl text-green-600">
                          {rateLimiterStats.stats.processed}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Failed:</Text>
                        <br />
                        <Text className="text-2xl text-red-600">
                          {rateLimiterStats.stats.failed}
                        </Text>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Text strong>Memory Usage:</Text>
                      <Progress
                        percent={Math.round(rateLimiterStats.stats.memoryUsage)}
                        status={
                          rateLimiterStats.stats.memoryUsage > 80
                            ? "exception"
                            : "active"
                        }
                      />
                    </div>
                  </Space>
                ) : (
                  <Text>No data available</Text>
                )}
              </Card>
            </Col>
          </Row>

          {/* 🚨 NEW: Answer Validation Monitoring */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col span={24}>
              <Card
                title="🎯 Answer Validation & Distribution Quality"
                className="mb-6">
                {generationStats ? (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title="Valid Distributions"
                          value={
                            generationStats.stats.validation
                              ?.validDistributions || 0
                          }
                          suffix={`/ ${
                            generationStats.stats.validation?.totalValidated ||
                            0
                          }`}
                          valueStyle={{
                            color:
                              (generationStats.stats.validation
                                ?.validDistributions || 0) >
                              (generationStats.stats.validation
                                ?.totalValidated || 0) *
                                0.8
                                ? "#3f8600"
                                : "#cf1322",
                          }}
                          prefix="✅"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title="Concentration Issues"
                          value={
                            generationStats.stats.validation
                              ?.concentrationIssues || 0
                          }
                          valueStyle={{ color: "#cf1322" }}
                          prefix="🚨"
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small">
                        <Statistic
                          title="Auto-Retries Success"
                          value={
                            generationStats.stats.validation?.retrySuccessRate
                              ? `${generationStats.stats.validation.retrySuccessRate.toFixed(
                                  1
                                )}%`
                              : "0%"
                          }
                          valueStyle={{
                            color:
                              (generationStats.stats.validation
                                ?.retrySuccessRate || 0) > 70
                                ? "#3f8600"
                                : "#d46b08",
                          }}
                          prefix="🔄"
                        />
                      </Card>
                    </Col>
                  </Row>
                ) : (
                  <Text>No validation data available</Text>
                )}
              </Card>
            </Col>
          </Row>

          {/* AI Providers Table */}
          <Card title="🤖 Multi-AI Load Balancer" className="mt-6">
            {multiAiStats ? (
              <Table
                dataSource={multiAiStats.stats.providers}
                columns={aiProviderColumns}
                rowKey="name"
                pagination={false}
                size="small"
              />
            ) : (
              <Text>No AI provider data available</Text>
            )}
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default PerformanceMonitorPage;
