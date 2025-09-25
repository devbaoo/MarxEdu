import React, { useEffect, useMemo, useState } from "react";
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
  generateContentPack,
  getLatestContentPack,
} from "@/services/features/marxist/philosophySlice";
import ContentPackModal from "@/components/Modal/ContentPackModal";
import { useNavigate } from "react-router-dom";

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
  const { loading, error, success, learningPath, contentPack } = useAppSelector(
    (state: RootState) => state.philosophy
  );

  const [isContentModalOpen, setContentModalOpen] = useState(false);
  const [isGeneratingFromContent, setGeneratingFromContent] = useState(false);
  const [currentTopicForContent, setCurrentTopicForContent] = useState<{
    topicId: string;
    topicName: string;
    level: string;
  } | null>(null);
  const [currentLessonPathId, setCurrentLessonPathId] = useState<string | null>(
    null
  );

  // Type assertion for learningPath items
  const typedLearningPath = learningPath as LearningPathItem[];

  useEffect(() => {
    dispatch(getMarxistPhilosophyLearningPath({}));
  }, [dispatch]);

  // Monitor contentPack changes from BE background generation (but don't auto-popup)
  useEffect(() => {
    if (contentPack && !isContentModalOpen) {
      console.log("📚 ContentPack received from BE, ready for manual display");

      // Set topic info for quiz generation (but don't show modal automatically)
      if (contentPack.topicId && contentPack.topicName) {
        setCurrentTopicForContent({
          topicId: contentPack.topicId,
          topicName: contentPack.topicName,
          level: contentPack.level || "intermediate",
        });
      }
    }
  }, [contentPack, isContentModalOpen]);

  const handleGenerateLesson = async (options = {}) => {
    try {
      console.log("🚀 Generating new Marxist Philosophy lesson...");
      console.log("📊 Current learning path state:", {
        totalLessons: learningPath.length,
        completedLessons: typedLearningPath.filter((p) => p.completed).length,
        hasIncompleteLesson: hasIncompleteLesson,
        canGenerate: !hasIncompleteLesson,
      });

      // Show loading message for Multi-AI system with JSON processing
      message.loading(
        "Đang tạo bài học với Multi-AI System (Gemini + Grok4)... Đang xử lý và kiểm tra JSON...",
        0
      );

      const result = await dispatch(
        generateMarxistPhilosophyLesson(options)
      ).unwrap();
      console.log("✅ Lesson generated successfully:", result);
      message.destroy(); // Clear loading message

      // Show AI provider info if available
      const aiProvider = result.provider || "Unknown AI";
      const loadBalancerInfo = result.loadBalancer;

      let successMessage = `🎉 Bài học đã được tạo thành công bởi ${aiProvider}!`;
      if (loadBalancerInfo) {
        successMessage += ` (${loadBalancerInfo.strategy} strategy, attempt ${loadBalancerInfo.providerAttempt})`;
      }

      message.success({
        content: successMessage,
        duration: 6,
      });

      // Implement new flow: Generate ContentPack first, then show modal
      if (result.success && result.learningPath?.pathId) {
        const pathId = result.learningPath.pathId;
        console.log(
          "ℹ️ Lesson created (pathId)",
          pathId,
          "generating ContentPack first"
        );

        // Get topic info for ContentPack generation
        const marxistTopic = result.learningPath.marxistTopic;
        if (marxistTopic) {
          setCurrentTopicForContent({
            topicId: marxistTopic.id,
            topicName: marxistTopic.title || marxistTopic.name,
            level: "intermediate",
          });
        }

        // Generate ContentPack for pre-study flow (but don't show modal automatically)
        try {
          await dispatch(
            generateContentPack({
              topicId: marxistTopic?.id,
              topicName:
                result.lesson?.title ||
                marxistTopic?.title ||
                marxistTopic?.name, // Use actual lesson title
              level: "intermediate",
              goal: `Ôn tập cho bài học: ${
                result.lesson?.title ||
                marxistTopic?.title ||
                marxistTopic?.name
              }`, // Match BE format
              include: {
                summary: true,
                keyPoints: true,
                mindmap: true,
                slideOutline: true,
                flashcards: true,
              },
            })
          ).unwrap();

          console.log("✅ ContentPack generated, ready for manual display");
          // Navigate directly to lesson - user will click "Học" to see ContentPack
          setTimeout(() => {
            window.location.href = `/philosophy-lesson/${pathId}`;
          }, 500);
        } catch (contentError) {
          console.warn("ContentPack generation failed:", contentError);
          // Fallback: navigate directly to lesson
          setTimeout(() => {
            window.location.href = `/philosophy-lesson/${pathId}`;
          }, 500);
        }
      }

      // Alternative: Check if lesson was created and use lessonId as fallback
      if (result.success && result.lesson?.lessonId) {
        console.log(
          "⚠️ No pathId found, trying to navigate with lessonId:",
          result.lesson.lessonId
        );

        // Refresh learning path first to get the pathId
        const learningPathResult = await dispatch(
          getMarxistPhilosophyLearningPath({})
        ).unwrap();
        console.log("📝 Refreshed learning path:", learningPathResult);

        // Find the newest lesson (should be the one we just created)
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

      // Final fallback: just refresh learning path and show success message
      console.log(
        "⚠️ Could not auto-navigate, refreshing learning path for manual navigation"
      );
      await dispatch(getMarxistPhilosophyLearningPath({}));
    } catch (err) {
      console.error("❌ Error generating lesson:", err);
      message.destroy(); // Clear loading message

      // Handle specific rate limiting and queue errors
      const error = err as { statusCode?: number; message?: string };
      if (error?.statusCode === 503) {
        // System overload
        message.error({
          content: `⚠️ ${error.message}`,
          duration: 5,
        });
      } else if (error?.statusCode === 429) {
        // User already generating or system is auto-generating
        message.warning({
          content: `⏳ ${error.message}`,
          duration: 6,
        });
      } else if (error?.statusCode === 408) {
        // Timeout
        message.error({
          content: `⏱️ ${error.message}`,
          duration: 5,
        });
      } else if (error?.message?.includes("JSON")) {
        // JSON parsing errors from Grok4
        message.error({
          content:
            "Lỗi xử lý dữ liệu từ AI. Hệ thống đang tự động sửa chữa và thử lại...",
          duration: 6,
        });
      } else if (error?.message?.includes("repair")) {
        // JSON repair errors
        message.warning({
          content: "AI đang tối ưu hóa dữ liệu. Vui lòng thử lại sau giây lát.",
          duration: 5,
        });
      } else {
        // Generic error
        message.error({
          content: "Có lỗi xảy ra khi tạo bài học. Vui lòng thử lại.",
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
        return "Không xác định";
    }
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
      <ContentPackModal
        open={isContentModalOpen}
        loading={isGeneratingFromContent}
        content={contentPack || undefined}
        onClose={() => setContentModalOpen(false)}
        onConfirmStudyDone={async () => {
          try {
            setGeneratingFromContent(true);
            setContentModalOpen(false);

            // Navigate to the specific lesson that user clicked
            if (currentLessonPathId) {
              console.log(
                "📚 User finished studying, navigating to lesson:",
                currentLessonPathId
              );
              window.location.href = `/philosophy-lesson/${currentLessonPathId}`;
            } else {
              // Fallback: find the current lesson to navigate to
              const currentLesson = typedLearningPath.find(
                (lesson) => !lesson.completed
              );
              if (currentLesson) {
                console.log(
                  "📚 Fallback: navigating to lesson:",
                  currentLesson.pathId
                );
                window.location.href = `/philosophy-lesson/${currentLesson.pathId}`;
              } else {
                message.info("Không tìm thấy bài học hiện tại.");
                dispatch(getMarxistPhilosophyLearningPath({}));
              }
            }

            setGeneratingFromContent(false);
          } catch (error) {
            setGeneratingFromContent(false);
            console.error("Error navigating to lesson:", error);
            message.error("Không thể vào bài học.");
          }
        }}
      />
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
            description={error}
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
                  onClick={() => navigate("/staff/philosophy-topics")}
                >
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
              className="shadow-lg"
            >
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
                    className="bg-red-600 hover:bg-red-700"
                  >
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
                        className={`border-l-4 ${
                          item.completed
                            ? "border-l-green-500 bg-green-50"
                            : isNewest
                            ? "border-l-blue-500 bg-blue-50"
                            : "border-l-gray-300 bg-gray-50"
                        } hover:shadow-md transition-all`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-lg ${
                                  item.completed ? "🎉" : isNewest ? "🚀" : "📚"
                                }`}
                              >
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
                                color={getDifficultyColor(item.difficultyLevel)}
                              >
                                {getDifficultyText(item.difficultyLevel)}
                              </Tag>
                              <Tag color="purple">
                                {item.marxistTopic?.title ||
                                  item.marxistTopic?.name}
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
                                  icon={<EyeOutlined />}
                                >
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
                                  icon={<ReloadOutlined />}
                                >
                                  🔄 Làm lại (-1 ❤️)
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type={isNewest ? "primary" : "default"}
                                size="small"
                                onClick={async () => {
                                  try {
                                    // Always fetch latest ContentPack from BE to ensure we have the most recent one
                                    console.log(
                                      "🔄 Fetching latest ContentPack from BE..."
                                    );
                                    const result = await dispatch(
                                      getLatestContentPack()
                                    ).unwrap();

                                    console.log("📦 API Response:", result);

                                    // Prefer using API response directly to decide modal
                                    const cp = (result as any)?.contentPack;
                                    console.log("🔍 ContentPack from API:", cp);

                                    if (cp && (cp.topicName || cp.title)) {
                                      setCurrentLessonPathId(item.pathId);
                                      setContentModalOpen(true);
                                      console.log(
                                        "📚 Latest ContentPack fetched, showing modal for lesson:",
                                        item.pathId
                                      );
                                    } else {
                                      console.log(
                                        "📚 No ContentPack available or missing fields, navigate directly to lesson",
                                        {
                                          exists: !!cp,
                                          topicName: cp?.topicName,
                                          title: cp?.title,
                                        }
                                      );
                                      window.location.href = `/philosophy-lesson/${item.pathId}`;
                                    }
                                  } catch (error) {
                                    console.error(
                                      "❌ Failed to fetch latest ContentPack:",
                                      error
                                    );
                                    // Fallback: navigate directly to lesson
                                    window.location.href = `/philosophy-lesson/${item.pathId}`;
                                  }
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
                                }
                              >
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
                className="shadow-lg"
              >
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
                          // Check if there's a ContentPack available for study
                          if (contentPack && currentTopicForContent) {
                            setCurrentLessonPathId(nextIncompleteLesson.pathId);
                            setContentModalOpen(true);
                            console.log(
                              "📚 Showing ContentPack modal for study, lesson:",
                              nextIncompleteLesson.pathId
                            );
                          } else {
                            // Navigate directly to lesson if no ContentPack
                            window.location.href = `/philosophy-lesson/${nextIncompleteLesson.pathId}`;
                          }
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      📖 Tiếp tục học bài hiện tại
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Paragraph className="text-gray-600 mb-4">
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
                      className="bg-red-600 hover:bg-red-700"
                    >
                      🤖 Tạo bài học với AI
                    </Button>
                  </div>
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
                className="shadow-lg"
              >
                <Space direction="vertical" className="w-full">
                  <Button
                    block
                    icon={<TrophyOutlined />}
                    onClick={() => navigate("/rank")}
                  >
                    📊 Xem bảng xếp hạng
                  </Button>
                  <Button
                    block
                    icon={<BookOutlined />}
                    onClick={() => navigate("/profile")}
                  >
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
