import React, { useCallback, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Spin,
  Alert,
  Tag,
  Space,
  message,
} from "antd";
import {
  BookOutlined,
  TrophyOutlined,
  FireOutlined,
  EyeOutlined,
  ReloadOutlined,
  RocketOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@/services/store/store";
import {
  generateMarxistPhilosophyLesson,
  getMarxistPhilosophyLearningPath,
  clearPhilosophyError,
  clearPhilosophySuccess,
} from "@/services/features/marxist/philosophySlice";
import { useNavigate } from "react-router-dom";
import CustomLessonForm from "@/components/Philosophy/CustomLessonForm";
import { IGenerateMarxistPhilosophyLessonResponse } from "@/interfaces/IMarxist";

const { Title, Text, Paragraph } = Typography;

// Temporary interface for learning path items to avoid 'any' type
interface LearningPathItem {
  pathId: string;
  title: string;
  completed: boolean;
  marxistTopic?: {
    title?: string;
    name?: string;
  };
  difficultyLevel: number;
  order: number;
  achievedScore?: number;
  recommendedReason: string;
}

const PhilosophyDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const { user } = useAppSelector((state: RootState) => state.auth);
  const { loading, error, success, learningPath } = useAppSelector(
    (state: RootState) => state.philosophy
  );

  // Type assertion for learningPath items
  const typedLearningPath = learningPath as LearningPathItem[];

  const navigateToLesson = useCallback(
    async (result: IGenerateMarxistPhilosophyLessonResponse) => {
      if (result.success && result.learningPath?.pathId) {
        const pathId = result.learningPath.pathId;
        console.log("✅ Lesson created successfully, navigating to:", pathId);

        setTimeout(() => {
          window.location.href = `/philosophy-lesson/${pathId}`;
        }, 500);
        return;
      }

      if (result.success && result.lesson?.lessonId) {
        console.log(
          "⚠️ No pathId found, trying to navigate with lessonId:",
          result.lesson.lessonId
        );

        const learningPathResult = await dispatch(
          getMarxistPhilosophyLearningPath({})
        ).unwrap();
        console.log("📝 Refreshed learning path:", learningPathResult);

        if (
          learningPathResult.success &&
          learningPathResult.learningPath.length > 0
        ) {
          const newestLesson =
            learningPathResult.learningPath[
              learningPathResult.learningPath.length - 1
            ];
          console.log("🎯 Found newest lesson:", newestLesson);

          if (newestLesson.pathId) {
            setTimeout(() => {
              window.location.href = `/philosophy-lesson/${newestLesson.pathId}`;
            }, 500);
            return;
          }
        }
      }

      console.log(
        "⚠️ Could not auto-navigate, refreshing learning path for manual navigation"
      );
      await dispatch(getMarxistPhilosophyLearningPath({}));
    },
    [dispatch]
  );

  const handleCustomLessonCreated = useCallback(
    async (result: IGenerateMarxistPhilosophyLessonResponse) => {
      const lessonTitle = result.lesson?.title || "Bài học tuỳ chọn";
      const difficultyLabel = result.lesson?.difficultyLevel
        ? ` (Độ khó ${result.lesson.difficultyLevel})`
        : "";

      message.success({
        content: `🎉 Bài học "${lessonTitle}" đã được tạo thành công${difficultyLabel}!`,
        duration: 6,
      });

      await navigateToLesson(result);
    },
    [navigateToLesson]
  );

  useEffect(() => {
    dispatch(getMarxistPhilosophyLearningPath({}));
  }, [dispatch]);

  const handleGenerateLesson = async (options = {}) => {
    try {
      console.log("🚀 Generating new Marxist Philosophy lesson...");
      console.log("📊 Current learning path state:", {
        totalLessons: learningPath.length,
        completedLessons: typedLearningPath.filter((p) => p.completed).length,
        hasIncompleteLesson: hasIncompleteLesson,
        canGenerate: !hasIncompleteLesson,
      });

      // Show optimized loading message for performance improvements
      message.loading(
        "🚀 Tạo bài học với AI System. Vui lòng chờ trong giây lát...",
        0
      );

      const result = await dispatch(
        generateMarxistPhilosophyLesson(options)
      ).unwrap();
      console.log("✅ Lesson generated successfully:", result);
      message.destroy(); // Clear loading message

      // Show enhanced AI provider info with performance metrics
      const aiProvider = result.provider || "Unknown AI";
      const loadBalancerInfo = result.loadBalancer;
      const questionCount = result.lesson?.questionCount || 10;

      let successMessage = `🚀 Bài học tạo thành công với ${questionCount} câu hỏi (AI: ${aiProvider})!`;
      if (loadBalancerInfo) {
        successMessage += ` ⚡ Optimized: ${loadBalancerInfo.strategy} strategy`;
        if (loadBalancerInfo.providerAttempt) {
          successMessage += `, attempt ${loadBalancerInfo.providerAttempt}`;
        }
      }

      message.success({
        content: successMessage,
        duration: 8, // Longer duration để user có thể đọc performance info
      });

      await navigateToLesson(result);
    } catch (err) {
      console.error("❌ Error generating lesson:", err);
      message.destroy(); // Clear loading message

      // Handle specific rate limiting, queue errors, and performance optimizations
      const error = err as {
        statusCode?: number;
        message?: string;
        error?: string;
        retryable?: boolean;
        concentrationIssues?: {
          distribution: { [key: string]: number };
          issues: string[];
          severity: "CRITICAL" | "HIGH" | "MEDIUM";
        };
      };

      // 🚨 NEW: Handle validation errors from enhanced BE
      if (error?.error === "ANSWER_CONCENTRATION_FAILED") {
        console.error("🎯 Answer concentration validation failed:", {
          error: error.error,
          message: error.message,
          concentrationIssues: error.concentrationIssues,
          statusCode: error.statusCode,
        });

        const concentrationInfo = error.concentrationIssues;
        const distributionText = concentrationInfo?.distribution
          ? `A:${concentrationInfo.distribution.A || 0}, B:${concentrationInfo.distribution.B || 0
          }, C:${concentrationInfo.distribution.C || 0}, D:${concentrationInfo.distribution.D || 0
          }`
          : "";

        message.error({
          content: (
            <div>
              <div>
                🎯 <strong>AI Answer Distribution Issues Detected!</strong>
              </div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                📊 Distribution: {distributionText}
              </div>
              <div style={{ fontSize: "12px" }}>
                🚨 Issues:{" "}
                {concentrationInfo?.issues?.join(", ") || "Poor answer balance"}
              </div>
              <div style={{ fontSize: "12px" }}>
                🔄 Hệ thống đang auto-retry với AI khác...
              </div>
            </div>
          ),
          duration: 10,
        });
      } else if (error?.error === "AI_GENERATION_FAILED") {
        console.error("🤖 All AI providers failed:", {
          error: error.error,
          message: error.message,
          retryable: error.retryable,
          statusCode: error.statusCode,
        });

        message.error({
          content: (
            <div>
              <div>
                🤖 <strong>All AI Providers Failed!</strong>
              </div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Gemini + Grok4 đều thất bại trong AI generation
              </div>
              <div style={{ fontSize: "12px" }}>
                🔄 {error.retryable ? "Có thể thử lại" : "Vui lòng báo cáo lỗi"}
              </div>
              {error.retryable && (
                <button
                  onClick={() => handleGenerateLesson()}
                  style={{
                    marginTop: "8px",
                    padding: "4px 8px",
                    background: "#1890ff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}>
                  🔄 Retry Generation
                </button>
              )}
            </div>
          ),
          duration: 12,
        });
      } else if (error?.statusCode === 503) {
        // System overload or AI service unavailable
        message.error({
          content: `⚠️ Hệ thống đang quá tải. ${error.message || "Vui lòng thử lại sau giây lát."
            }`,
          duration: 6,
        });
      } else if (error?.statusCode === 429) {
        // Queue is full or rate limited
        message.warning({
          content: `⏳ Hệ thống đang bận (Queue Management). ${error.message || "Vui lòng chờ và thử lại..."
            }`,
          duration: 8,
        });
      } else if (error?.statusCode === 408) {
        // Timeout - performance optimization kicked in
        message.error({
          content: `⏱️ Timeout: ${error.message || "AI generation mất quá nhiều thời gian. Thử lại!"
            }`,
          duration: 5,
        });
      } else if (error?.message?.includes("queue")) {
        // AI Generation Queue specific errors
        message.warning({
          content:
            "🚀 Hệ thống AI đang xử lý nhiều yêu cầu. Queue Management đang tối ưu, vui lòng thử lại!",
          duration: 7,
        });
      } else if (error?.message?.includes("concurrent")) {
        // Concurrent limit reached
        message.info({
          content:
            "⚡ Đã đạt giới hạn concurrent generations. Performance optimization đang hoạt động, thử lại sau!",
          duration: 6,
        });
      } else if (error?.message?.includes("JSON")) {
        // JSON parsing errors from Grok4
        message.error({
          content:
            "Lỗi xử lý dữ liệu từ AI. Batch Operations đang tự động sửa chữa và thử lại...",
          duration: 6,
        });
      } else if (error?.message?.includes("repair")) {
        // JSON repair errors
        message.warning({
          content:
            "AI đang tối ưu hóa dữ liệu với Parallel Processing. Vui lòng thử lại sau giây lát.",
          duration: 5,
        });
      } else {
        // Generic error
        message.error({
          content:
            "Có lỗi xảy ra trong AI Generation System. Vui lòng thử lại.",
          duration: 4,
        });
      }

      // Still refresh learning path to show any partial success
      dispatch(getMarxistPhilosophyLearningPath({}));
    }
  };

  const handleDismissMessage = () => {
    dispatch(clearPhilosophyError());
    dispatch(clearPhilosophySuccess());
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "green";
      case 2:
        return "blue";
      case 3:
        return "orange";
      case 4:
        return "red";
      case 5:
        return "purple";
      default:
        return "default";
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return "Cơ bản";
      case 2:
        return "Trung bình";
      case 3:
        return "Khá";
      case 4:
        return "Khó";
      case 5:
        return "Rất khó";
      default:
        return "📚";
    }
  };

  const formatTopicDisplay = (title?: string, name?: string) => {
    const normalizedTitle = title?.trim();
    if (!normalizedTitle || normalizedTitle === "Không xác định") {
      const normalizedName = name?.trim();
      if (normalizedName && normalizedName.toLowerCase() !== "unknown") {
        return normalizedName;
      }
      return "📚";
    }
    return normalizedTitle;
  };

  // Check if error is related to missing topics
  const isTopicError =
    error &&
    (error.includes("không có chủ đề") ||
      error.includes("No topics") ||
      error.includes("Admin cần seed dữ liệu"));

  // 🚫 Check if user has incomplete lessons (should not create new ones)
  const hasIncompleteLesson = useMemo(() => {
    // Only disable if there are lessons AND at least one is incomplete
    // If learningPath is empty or all completed, allow creating new lessons
    return (
      typedLearningPath.length > 0 &&
      typedLearningPath.some((path) => !path.completed)
    );
  }, [typedLearningPath]);

  // 📊 Get the most recent incomplete lesson
  const nextIncompleteLesson = useMemo(() => {
    return typedLearningPath.find((path) => !path.completed);
  }, [typedLearningPath]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block transform -translate-x-4">
            <Title level={1} className="text-red-700 mb-2">
              🏛️ Triết học Mác-Lê-Nin
            </Title>
            <Text className="text-lg text-gray-600">
              Khám phá và học tập triết học Marxist-Leninist với AI
            </Text>
          </div>
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
            className="mb-6"
          />
        )}

        {error && !isTopicError && (
          <Alert
            message="Có lỗi xảy ra"
            description={
              <div>
                <p>{error}</p>
                {/* Show retry button for AI failures */}
                {(error.includes("AI APIs") ||
                  error.includes("503") ||
                  error.includes("generation failed") ||
                  error.includes("JSON") ||
                  error.includes("timeout")) && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => handleGenerateLesson()}
                      loading={loading}
                      className="mt-2 bg-red-600 hover:bg-red-700">
                      🔄 Thử lại với AI
                    </Button>
                  )}
              </div>
            }
            type="error"
            showIcon
            closable
            onClose={handleDismissMessage}
            className="mb-6"
          />
        )}

        {/* Special handling for topic error */}
        {isTopicError && (
          <Alert
            message="⚠️ Chưa có chủ đề triết học"
            description={
              <div>
                <p>{error}</p>
                <p>
                  Vui lòng liên hệ Staff để tạo dữ liệu mẫu trước khi bắt đầu
                  học.
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="mt-2"
                  onClick={() => navigate("/staff/philosophy-topics")}>
                  Đi tới trang quản lý chủ đề
                </Button>
              </div>
            }
            type="warning"
            showIcon
            closable
            onClose={handleDismissMessage}
            className="mb-6"
          />
        )}

        <Row gutter={[24, 24]}>
          {/* Learning Path Section */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <div className="flex items-center">
                  <BookOutlined className="text-red-600 mr-2" />
                  <span>Lộ trình học tập triết học</span>
                </div>
              }
              className="shadow-lg">
              {loading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-600">
                    Đang tải lộ trình học tập...
                  </p>
                </div>
              ) : learningPath.length === 0 ? (
                <div className="text-center py-12">
                  <BookOutlined className="text-6xl text-gray-300 mb-4" />
                  <Title level={3} className="text-gray-500">
                    Chưa có bài học nào
                  </Title>
                  <Paragraph className="text-gray-400 mb-6">
                    Hãy tạo bài học đầu tiên với AI để bắt đầu hành trình khám
                    phá triết học Mác-Lê-Nin
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={<RocketOutlined />}
                    onClick={() => handleGenerateLesson()}
                    loading={loading}
                    className="bg-red-600 hover:bg-red-700">
                    🤖 Tạo bài học đầu tiên với AI
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {typedLearningPath.map((item, index) => {
                    const isNewest =
                      index === typedLearningPath.length - 1 && !item.completed;

                    return (
                      <Card
                        key={item.pathId}
                        size="small"
                        className={`border-l-4 ${item.completed
                          ? "border-l-green-500 bg-green-50"
                          : isNewest
                            ? "border-l-blue-500 bg-blue-50"
                            : "border-l-gray-300 bg-gray-50"
                          } hover:shadow-md transition-all`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-lg ${item.completed ? "🎉" : isNewest ? "🚀" : "📚"
                                  }`}>
                                {item.completed ? "🎉" : isNewest ? "🚀" : "📚"}
                              </span>
                              <Title level={5} className="mb-0">
                                {item.title}
                              </Title>
                              {item.completed && (
                                <span className="text-green-600 text-sm">
                                  ✓
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-2">
                              <Tag
                                color={getDifficultyColor(
                                  item.difficultyLevel
                                )}>
                                {getDifficultyText(item.difficultyLevel)}
                              </Tag>
                              <Tag color="purple">
                                {formatTopicDisplay(
                                  item.marxistTopic?.title,
                                  item.marxistTopic?.name
                                )}
                              </Tag>
                              <Tag color="orange">Bài {item.order}</Tag>
                              {item.completed && item.achievedScore && (
                                <Tag color="green">
                                  Điểm: {item.achievedScore}
                                </Tag>
                              )}
                            </div>

                            <Text type="secondary" className="text-sm">
                              {item.recommendedReason}
                            </Text>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {item.completed ? (
                              <div className="flex gap-2">
                                {/* View Details Button */}
                                <Button
                                  type="default"
                                  size="small"
                                  onClick={() => {
                                    window.location.href = `/philosophy-lesson/${item.pathId}`;
                                  }}
                                  className="bg-blue-100 hover:bg-blue-200 border-blue-300"
                                  style={{ fontSize: "11px" }}
                                  icon={<EyeOutlined />}>
                                  Xem chi tiết
                                </Button>

                                {/* Retry Button */}
                                <Button
                                  type="default"
                                  size="small"
                                  onClick={() => {
                                    window.location.href = `/philosophy-test/${item.pathId}?retry=true`;
                                  }}
                                  className="bg-yellow-100 hover:bg-yellow-200 border-yellow-400"
                                  style={{ fontSize: "11px" }}
                                  icon={<ReloadOutlined />}>
                                  🔄 Làm lại (-1 ❤️)
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type={isNewest ? "primary" : "default"}
                                size="small"
                                onClick={() => {
                                  // Navigate directly to lesson without ContentPack popup
                                  window.location.href = `/philosophy-lesson/${item.pathId}`;
                                }}
                                className={
                                  isNewest
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : ""
                                }
                                style={{ fontSize: "11px" }}
                                icon={
                                  isNewest ? (
                                    <RocketOutlined />
                                  ) : (
                                    <EyeOutlined />
                                  )
                                }>
                                {isNewest ? "🚀 Học ngay!" : "👀 Xem chi tiết"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" className="w-full" size="large">
              {/* User Stats Card */}
              <Card className="shadow-lg">
                <div className="text-center">
                  <div className="text-2xl mb-2">👤</div>
                  <Title level={4} className="mb-2">
                    Chào bạn!
                  </Title>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {typedLearningPath.filter((p) => p.completed).length}
                      </div>
                      <Text className="text-sm text-gray-600">
                        Bài đã hoàn thành
                      </Text>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {typedLearningPath.length}
                      </div>
                      <Text className="text-sm text-gray-600">Tổng số bài</Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI Lesson Generation Card */}
              <Card
                title={
                  <div className="flex items-center">
                    <RocketOutlined className="text-blue-600 mr-2" />
                    <span>Tạo bài học với AI</span>
                  </div>
                }
                className="shadow-lg">
                {hasIncompleteLesson ? (
                  <div>
                    <Alert
                      message="Bạn có bài học chưa hoàn thành"
                      description={
                        <div>
                          <p>
                            Vui lòng hoàn thành bài học hiện tại trước khi tạo
                            bài mới:
                          </p>
                          <p className="font-semibold mt-2">
                            "{nextIncompleteLesson?.title}"
                          </p>
                        </div>
                      }
                      type="info"
                      showIcon
                      className="mb-4"
                    />
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<BookOutlined />}
                      onClick={() => {
                        if (nextIncompleteLesson) {
                          // Navigate directly to lesson without ContentPack popup
                          window.location.href = `/philosophy-lesson/${nextIncompleteLesson.pathId}`;
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700">
                      📖 Tiếp tục học bài hiện tại
                    </Button>
                  </div>
                ) : (
                  <Space direction="vertical" className="w-full" size="middle">
                    <Paragraph className="mb-0 text-gray-600">
                      {learningPath.length === 0
                        ? "Tạo bài học triết học đầu tiên của bạn với sự hỗ trợ của AI"
                        : "Tạo bài học triết học mới dựa trên tiến độ học tập của bạn"}
                    </Paragraph>
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<RocketOutlined />}
                      onClick={() => handleGenerateLesson()}
                      loading={loading}
                      className="bg-red-600 hover:bg-red-700">
                      🤖 Tạo bài học với AI
                    </Button>
                    <CustomLessonForm
                      onLessonCreated={handleCustomLessonCreated}
                    />
                  </Space>
                )}
              </Card>

              {/* Quick Actions */}
              <Card
                title={
                  <div className="flex items-center">
                    <FireOutlined className="text-orange-600 mr-2" />
                    <span>Thao tác nhanh</span>
                  </div>
                }
                className="shadow-lg">
                <Space direction="vertical" className="w-full">
                  <Button
                    block
                    icon={<TrophyOutlined />}
                    onClick={() => navigate("/rank")}>
                    📊 Xem bảng xếp hạng
                  </Button>
                  <Button
                    block
                    icon={<BookOutlined />}
                    onClick={() => navigate("/profile")}>
                    👤 Thông tin cá nhân
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PhilosophyDashboard;
