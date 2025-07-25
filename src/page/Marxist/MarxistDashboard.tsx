import React, { useEffect } from 'react';
import { Card, Button, Spin, Alert, Row, Col, Typography, Progress, Tag } from 'antd';
import { BookOutlined, TrophyOutlined, FireOutlined, BulbOutlined, SettingOutlined, RocketOutlined, EyeOutlined, ReloadOutlined, CheckCircleOutlined, StarOutlined, BarChartOutlined, LockOutlined } from '@ant-design/icons';
import { RootState, useAppDispatch, useAppSelector } from '@/services/store/store';
import {
  getMarxistLearningPath,
  getMarxistStats,
  generateMarxistLesson,
  clearMarxistError,
  clearMarxistSuccess
} from '@/services/features/marxist/marxistSlice';
import { IMarxistLearningPath, IMarxistTopicStats } from '@/interfaces/IMarxist';

const { Title, Text, Paragraph } = Typography;

const MarxistDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    learningPath,
    learningPathLoading,
    stats,
    statsLoading,
    lessonGenerating,
    successMessage,
    error
  } = useAppSelector((state: RootState) => state.marxist);

  useEffect(() => {
    console.log('🔄 MarxistDashboard: Loading learning path and stats...');

    dispatch(getMarxistLearningPath({}))
      .unwrap()
      .then((result) => {
        console.log('✅ Learning path loaded successfully:', result);
        // 🔍 DEBUG: Log completed status for each lesson
        result.learningPath.forEach((item: IMarxistLearningPath, index: number) => {
          console.log(`📚 Lesson ${index + 1}:`, {
            title: item.title,
            completed: item.completed,
            achievedScore: item.achievedScore,
            completedAt: item.completedAt,
            pathId: item.pathId
          });
        });
      })
      .catch((err) => {
        console.error('❌ Failed to load learning path:', err);
      });

    dispatch(getMarxistStats())
      .unwrap()
      .then((result) => {
        console.log('✅ Stats loaded successfully:', result);
      })
      .catch((err) => {
        console.error('❌ Failed to load stats:', err);
      });
  }, [dispatch]);

  const handleGenerateLesson = async (options = {}) => {
    try {
      console.log('🚀 Generating new Marxist lesson...');
      const result = await dispatch(generateMarxistLesson(options)).unwrap();
      console.log('✅ Lesson generated successfully:', result);

      // Check if lesson and learning path were created with proper pathId
      if (result.success && result.learningPath?.pathId) {
        const pathId = result.learningPath.pathId;
        console.log('🔄 Auto-navigating to new lesson with pathId:', pathId);

        // Small delay to ensure backend has fully processed the data
        setTimeout(() => {
          window.location.href = `/marxist-lesson/${pathId}`;
        }, 500);
        return;
      }

      // Alternative: Check if lesson was created and use lessonId as fallback
      if (result.success && result.lesson?.lessonId) {
        console.log('⚠️ No pathId found, trying to navigate with lessonId:', result.lesson.lessonId);

        // Refresh learning path first to get the pathId
        const learningPathResult = await dispatch(getMarxistLearningPath({})).unwrap();
        console.log('📝 Refreshed learning path:', learningPathResult);

        // Find the newest lesson (should be the one we just created)
        if (learningPathResult.success && learningPathResult.learningPath.length > 0) {
          const newestLesson = learningPathResult.learningPath[learningPathResult.learningPath.length - 1];
          console.log('🎯 Found newest lesson:', newestLesson);

          if (newestLesson.pathId) {
            setTimeout(() => {
              window.location.href = `/marxist-lesson/${newestLesson.pathId}`;
            }, 500);
            return;
          }
        }
      }

      // Final fallback: just refresh learning path and show success message
      console.log('⚠️ Could not auto-navigate, refreshing learning path for manual navigation');
      await dispatch(getMarxistLearningPath({}));

    } catch (err) {
      console.error('❌ Error generating lesson:', err);

      // Still refresh learning path to show any partial success
      dispatch(getMarxistLearningPath({}));
    }
  };

  const handleDismissMessage = () => {
    dispatch(clearMarxistSuccess());
    dispatch(clearMarxistError());
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'orange';
      case 4: return 'red';
      case 5: return 'purple';
      default: return 'default';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Cơ bản';
      case 2: return 'Trung bình';
      case 3: return 'Khá';
      case 4: return 'Khó';
      case 5: return 'Rất khó';
      default: return 'Không xác định';
    }
  };

  // Check if error is related to missing topics
  const isTopicError = error && (
    error.includes('không có chủ đề') ||
    error.includes('No topics') ||
    error.includes('Admin cần seed dữ liệu')
  );

  return (
    <div className="marxist-dashboard p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="mb-2 text-red-700">
          <BookOutlined className="mr-2" />
          <RocketOutlined className="mr-2" /> Kinh tế chính trị Mác-Lê-Nin
        </Title>
        <Paragraph className="text-gray-600">
          Học tập và nghiên cứu các nguyên lý cơ bản của chủ nghĩa Mác-Lê-Nin một cách có hệ thống
        </Paragraph>
      </div>

      {/* Success Message with Navigation Guide */}
      {successMessage && (
        <Alert
          message="Tạo bài học thành công!"
          description={
            <div>
              <p>{successMessage}</p>
              {learningPath.length > 0 && (
                <div className="mt-3">
                  <Text strong><RocketOutlined className="mr-1" /> Bài học mới đã sẵn sàng!</Text>
                  <br />
                  <Text type="secondary">
                    Hãy cuộn xuống và bấm nút <strong><BookOutlined className="mr-1" />"Học ngay"</strong> trên bài học mới nhất để bắt đầu.
                  </Text>
                </div>
              )}
            </div>
          }
          type="success"
          showIcon
          closable
          onClose={handleDismissMessage}
          className="mb-6"
        />
      )}

      {/* Error Message with Solution */}
      {error && (
        <Alert
          message={isTopicError ? <><WarningOutlined className="mr-1" />Cần khởi tạo dữ liệu</> : <><BarChartOutlined className="mr-1" />Lỗi khi tải dữ liệu</>}
          description={
            <div>
              <p>{error}</p>
              {isTopicError && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <Title level={5} className="mb-2 text-blue-800">
                    <SettingOutlined className="mr-1" /> Cách khắc phục:
                  </Title>
                  <ol className="text-blue-700 mb-3">
                    <li>1. Vào trang <strong>Staff → Marxist Topics</strong></li>
                    <li>2. Bấm nút <strong>"🌱 Tạo dữ liệu mẫu"</strong></li>
                    <li>3. Quay lại trang này để bắt đầu học</li>
                  </ol>
                  <Button
                    type="primary"
                    onClick={() => window.location.href = '/staff/marxist-topics'}
                    icon={<SettingOutlined />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Đi đến Marxist Topics ngay
                  </Button>
                </div>
              )}
            </div>
          }
          type={isTopicError ? "warning" : "error"}
          showIcon
          closable
          onClose={handleDismissMessage}
          className="mb-6"
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="mb-2">
              <BookOutlined className="text-3xl text-blue-500" />
            </div>
            <div className="text-2xl font-bold">
              {statsLoading ? <Spin /> : stats?.totalLessons || 0}
            </div>
            <Text type="secondary">Tổng số bài học</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="mb-2">
              <TrophyOutlined className="text-3xl text-green-500" />
            </div>
            <div className="text-2xl font-bold">
              {statsLoading ? <Spin /> : stats?.completedLessons || 0}
            </div>
            <Text type="secondary">Đã hoàn thành</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="mb-2">
              <FireOutlined className="text-3xl text-red-500" />
            </div>
            <div className="text-2xl font-bold">
              {statsLoading ? <Spin /> : `${stats?.completionRate || 0}%`}
            </div>
            <Text type="secondary">Tỷ lệ hoàn thành</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="mb-2">
              <BulbOutlined className="text-3xl text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">
              {statsLoading ? <Spin /> : Math.round(stats?.overallAvgScore || 0)}
            </div>
            <Text type="secondary">Điểm trung bình</Text>
          </Card>
        </Col>
      </Row>

      {/* Generate New Lesson */}
      <Card className="mb-8">
        <Title level={4} className="mb-4">
          <BulbOutlined className="mr-2" />
          Tạo bài học mới
        </Title>
        <Paragraph className="mb-4">
          AI sẽ phân tích tiến độ học tập của bạn và tạo ra bài học phù hợp nhất với trình độ hiện tại.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          loading={lessonGenerating}
          onClick={() => handleGenerateLesson()}
          className="bg-red-600 hover:bg-red-700"
          disabled={!!isTopicError}
          icon={<RocketOutlined />}
        >
          Tạo bài học mới với AI
        </Button>
      </Card>

      {/* Learning Path */}
      <Card>
        <Title level={4} className="mb-4">
          <BookOutlined className="mr-2" />
          Lộ trình học tập của bạn
        </Title>

        {learningPathLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">Đang tải lộ trình học tập...</div>
          </div>
        ) : isTopicError ? (
          <div className="text-center py-8">
            <SettingOutlined className="text-4xl text-yellow-500 mb-4" />
            <Paragraph>
              Cần khởi tạo dữ liệu chủ đề Marxist trước khi bắt đầu học.
            </Paragraph>
          </div>
        ) : learningPath.length === 0 ? (
          <div className="text-center py-8">
            <BulbOutlined className="text-4xl text-gray-400 mb-4" />
            <Paragraph>
              Chưa có bài học nào trong lộ trình. Hãy tạo bài học đầu tiên!
            </Paragraph>
            <Button
              type="primary"
              onClick={() => handleGenerateLesson()}
              loading={lessonGenerating}
              className="bg-red-600 hover:bg-red-700"
            >
              🚀 Bắt đầu học tập
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {learningPath.map((item: IMarxistLearningPath, index: number) => {
              // Check if this is the newest lesson (last in array since it's sorted by order desc)
              const isNewest = index === learningPath.length - 1;

              return (
                <Card
                  key={item.pathId}
                  size="small"
                  className={`transition-all hover:shadow-md border-2 ${item.completed
                    ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-400 shadow-lg' // ✅ COMPLETED - Strong green gradient
                    : isNewest
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-400 shadow-md animate-pulse' // 🆕 NEWEST - Blue gradient + pulse
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400' // 📚 PENDING - Gray gradient
                    }`}
                >
                  <Row align="middle">
                    <Col xs={24} md={16}>
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md
                          ${item.completed
                            ? 'bg-gradient-to-r from-green-500 to-green-600' // ✅ COMPLETED - Green gradient
                            : isNewest
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600' // 🆕 NEWEST - Blue gradient
                              : 'bg-gradient-to-r from-gray-500 to-gray-600' // 📚 PENDING - Gray gradient
                          }
                        `}>
                          {item.completed ? <CheckCircleOutlined /> : isNewest ? <RocketOutlined /> : index + 1}
                        </div>
                        <div>
                          <Title level={5} className={`mb-1 ${item.completed ? 'text-green-800' : isNewest ? 'text-blue-800' : 'text-gray-700'}`}>
                            {item.completed && <CheckCircleOutlined className="mr-1" />}
                            {isNewest && !item.completed && <StarOutlined className="mr-1" />}
                            {item.title}
                          </Title>

                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.completed && (
                              <Tag color="green" className="text-xs">
                                <CheckCircleOutlined className="mr-1" /> Đã hoàn thành
                              </Tag>
                            )}
                            {isNewest && !item.completed && (
                              <Tag color="blue" className="text-xs animate-bounce">
                                <StarOutlined className="mr-1" /> Mới nhất
                              </Tag>
                            )}
                            <Tag color={getDifficultyColor(item.difficultyLevel)} className="text-xs">
                              {getDifficultyText(item.difficultyLevel)}
                            </Tag>
                          </div>

                          <Text type="secondary" className={`text-sm ${item.completed ? 'text-green-700' : isNewest ? 'text-blue-700' : 'text-gray-600'}`}>
                            <BookOutlined className="mr-1" /> {item.marxistTopic.title}
                          </Text>
                        </div>
                      </div>
                    </Col>

                    <Col xs={24} md={8}>
                      <div className="flex flex-col gap-2 items-end">
                        {item.completed ? (
                          // ✅ COMPLETED LESSON UI
                          <div className="flex flex-col gap-2">
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-700">
                                <TrophyOutlined className="mr-1" />{item.achievedScore}%
                              </div>
                              <Text type="secondary" className="text-xs text-green-600">
                                Hoàn thành lúc: {new Date(item.completedAt || '').toLocaleDateString('vi-VN')}
                              </Text>
                            </div>

                            <div className="flex gap-2">
                              {/* View Details Button */}
                              <Button
                                type="default"
                                size="small"
                                onClick={() => {
                                  window.location.href = `/marxist-lesson/${item.pathId}`;
                                }}
                                className="bg-blue-100 hover:bg-blue-200 border-blue-300"
                                style={{ fontSize: '11px' }}
                                icon={<EyeOutlined />}
                              >
                                Xem chi tiết
                              </Button>

                              {/* Retry Button */}
                              <Button
                                type="default"
                                size="small"
                                onClick={() => {
                                  window.location.href = `/marxist-test/${item.pathId}?retry=true`;
                                }}
                                className="bg-yellow-100 hover:bg-yellow-200 border-yellow-400"
                                style={{ fontSize: '11px' }}
                                icon={<ReloadOutlined />}
                              >
                                Làm lại (-1 ❤️)
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // 📚 NON-COMPLETED LESSON UI
                          <div className="flex flex-col gap-2 items-end">
                            <div className="text-right mb-2">
                              <div className="text-sm text-gray-600 font-medium">
                                {isNewest ? <StarOutlined className="mr-1" /> : <LockOutlined className="mr-1" />}{isNewest ? 'Sẵn sàng học!' : 'Chờ tới lượt'}
                              </div>
                              <Text type="secondary" className="text-xs">
                                <BarChartOutlined className="mr-1" /> 30 câu hỏi • {item.marxistTopic.title}
                              </Text>
                            </div>

                            <Button
                              type="primary"
                              size="small"
                              onClick={() => {
                                window.location.href = `/marxist-lesson/${item.pathId}`;
                              }}
                              className={`$${isNewest
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg animate-pulse border-0'
                                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0'
                                }`}
                              disabled={!isNewest}
                              icon={isNewest ? <RocketOutlined /> : <LockOutlined />}
                            >
                              {isNewest ? 'Học ngay!' : 'Chờ tới lượt'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>

                  {item.recommendedReason && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <Text type="secondary" className="text-sm">
                        <BulbOutlined className="mr-1" /> <strong>Gợi ý AI:</strong> {item.recommendedReason}
                      </Text>
                    </div>
                  )}

                  {item.completed && (
                    <div className="mt-2 pt-2 border-t border-green-200 bg-green-25">
                      <Text type="secondary" className="text-xs text-green-600">
                        <StarOutlined className="mr-1" /> <strong>Tuyệt vời!</strong> Bạn đã hoàn thành bài học này với {item.achievedScore}% điểm.
                        {item.achievedScore && item.achievedScore >= 90 && <StarOutlined className="ml-1" />}
                      </Text>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Topic Statistics */}
      {stats?.topicBreakdown && stats.topicBreakdown.length > 0 && (
        <Card className="mt-8">
          <Title level={4} className="mb-4">
            <BarChartOutlined className="mr-2" />
            Thống kê theo chủ đề
          </Title>
          <Row gutter={[16, 16]}>
            {stats.topicBreakdown.map((topic: IMarxistTopicStats) => (
              <Col xs={24} md={12} lg={8} key={topic.topicId}>
                <Card size="small">
                  <Title level={5}>{topic.title}</Title>
                  <Progress
                    percent={Math.round((topic.completed / topic.total) * 100)}
                    size="small"
                    status={topic.completed === topic.total ? 'success' : 'active'}
                  />
                  <div className="mt-2 flex justify-between">
                    <Text type="secondary">
                      {topic.completed}/{topic.total} bài
                    </Text>
                    <Text type="secondary">
                      TB: {topic.avgScore}đ
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default MarxistDashboard; 