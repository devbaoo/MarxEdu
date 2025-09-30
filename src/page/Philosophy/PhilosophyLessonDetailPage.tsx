import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Typography, Row, Col, Tag, Spin, Alert } from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
  RootState,
} from "@/services/store/store";
import { getMarxistPhilosophyLessonByPath } from "@/services/features/marxist/philosophySlice";
import { ILesson } from "@/interfaces/ILesson";

const { Title, Text } = Typography;

const PhilosophyLessonDetailPage: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(
    (state: RootState) => state.philosophy
  );
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  const fetchLessonDetail = useCallback(async () => {
    try {
      setLessonLoading(true);
      console.log("🔍 Fetching lesson detail for pathId:", pathId);

      const result = await dispatch(
        getMarxistPhilosophyLessonByPath(pathId!)
      ).unwrap();
      console.log("📚 Lesson detail result:", result);

      if (result.success && result.lesson) {
        setLesson(result.lesson);
      } else {
        console.error("❌ No lesson found in response:", result);
      }
    } catch (error) {
      console.error("❌ Error fetching lesson detail:", error);
    } finally {
      setLessonLoading(false);
    }
  }, [pathId, dispatch]);

  useEffect(() => {
    if (pathId) {
      fetchLessonDetail();
    }
  }, [pathId, fetchLessonDetail]);

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

  if (lessonLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-lg text-gray-600">
            Đang tải thông tin bài học...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert
            message="Lỗi khi tải bài học"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/philosophy")}>
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <BookOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={3} className="text-gray-500">
            Không tìm thấy bài học
          </Title>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/philosophy")}
            className="mt-4">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/philosophy")}
          className="mb-6"
          size="large">
          Quay lại lộ trình học tập
        </Button>

        {/* Lesson Header */}
        <Card className="shadow-lg mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🏛️</div>
            <Title level={2} className="text-red-700 mb-2">
              {lesson.title}
            </Title>
            <Text className="text-lg text-gray-600">
              Triết học Mác-Lê-Nin • Bài học AI
            </Text>
          </div>

          <Row gutter={[24, 16]} className="mb-6">
            <Col xs={24} sm={8} className="text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <FireOutlined className="text-2xl text-blue-600 mb-2" />
                <div>
                  <Text strong className="block">
                    Độ khó
                  </Text>
                  <Tag
                    color={getDifficultyColor(
                      typeof lesson.level === "object" ? 1 : lesson.level
                    )}
                    className="mt-1">
                    {getDifficultyText(
                      typeof lesson.level === "object" ? 1 : lesson.level
                    )}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8} className="text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <BookOutlined className="text-2xl text-green-600 mb-2" />
                <div>
                  <Text strong className="block">
                    Số câu hỏi
                  </Text>
                  <Text className="text-lg font-semibold text-green-700">
                    {lesson.questions?.length || 10} câu
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8} className="text-center">
              <div className="bg-orange-50 p-4 rounded-lg">
                <TrophyOutlined className="text-2xl text-orange-600 mb-2" />
                <div>
                  <Text strong className="block">
                    Điểm tối đa
                  </Text>
                  <Text className="text-lg font-semibold text-orange-700">
                    {lesson.maxScore || 100} điểm
                  </Text>
                </div>
              </div>
            </Col>
          </Row>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <ClockCircleOutlined className="text-yellow-600 mr-2" />
              <Text strong>Thời gian làm bài</Text>
            </div>
            <Text>

              Bạn có <strong>5 phút</strong> để hoàn thành bài kiểm tra này. Hãy
              đọc kỹ từng câu hỏi và suy nghĩ cẩn thận trước khi chọn đáp án.
            </Text>
          </div>

          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <Title level={4} className="text-red-700 mb-3">
              📋 Hướng dẫn làm bài
            </Title>
            <ul className="space-y-2">
              <li>
                • Đọc kỹ từng câu hỏi và các lựa chọn trước khi quyết định
              </li>
              <li>
                • Mỗi câu hỏi chỉ có <strong>một đáp án đúng</strong>
              </li>
              <li>• Bạn có thể xem lại và thay đổi đáp án trước khi nộp bài</li>
              <li>
                • Cần đạt <strong>ít nhất 70%</strong> để vượt qua bài học
              </li>
              <li>
                • Câu hỏi và đáp án được <strong>trộn ngẫu nhiên</strong> mỗi
                lần làm bài
              </li>
            </ul>
          </div>

          {/* Skills Tags */}
          {lesson.skills && lesson.skills.length > 0 && (
            <div className="mb-6">
              <Text strong className="block mb-2">
                Kỹ năng được đánh giá:
              </Text>
              <div className="flex flex-wrap gap-2">
                {lesson.skills.map((skill, index) => (
                  <Tag key={index} color="purple">
                    {typeof skill === "string" ? skill : skill.name || "Skill"}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Topic Information */}
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <Title level={4} className="text-purple-700 mb-2">
              🎯 Chủ đề:{" "}
              {typeof lesson.topic === "string"
                ? lesson.topic
                : lesson.topic?.name || "Triết học Mác-Lê-Nin"}
            </Title>
            <Text className="text-purple-600">
              Bài học này sẽ kiểm tra kiến thức của bạn về các khái niệm cơ bản
              và nâng cao trong triết học Mác-Lê-Nin, giúp bạn hiểu sâu hơn về
              tư tưởng triết học cách mạng.
            </Text>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              type="primary"
              size="large"
              icon={<BookOutlined />}
              onClick={() => navigate(`/philosophy-test/${pathId}`)}
              className="bg-red-600 hover:bg-red-700 px-8 py-2 h-auto text-lg">
              🚀 Bắt đầu bài học
            </Button>
          </div>
        </Card>

        {/* Additional Tips */}
        <Card className="shadow-lg">
          <Title level={4} className="text-blue-700 mb-3">
            💡 Mẹo làm bài hiệu quả
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div className="bg-blue-50 p-3 rounded">
                <Text strong className="text-blue-700">
                  📚 Đọc kỹ đề bài
                </Text>
                <br />
                <Text className="text-sm">
                  Hiểu rõ yêu cầu của câu hỏi trước khi xem các lựa chọn
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="bg-green-50 p-3 rounded">
                <Text strong className="text-green-700">
                  ⏰ Quản lý thời gian
                </Text>
                <br />
                <Text className="text-sm">
                  Phân bổ thời gian hợp lý cho từng câu hỏi
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="bg-orange-50 p-3 rounded">
                <Text strong className="text-orange-700">
                  🎯 Tập trung
                </Text>
                <br />
                <Text className="text-sm">
                  Tìm môi trường yên tĩnh để tập trung tối đa
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="bg-purple-50 p-3 rounded">
                <Text strong className="text-purple-700">
                  🔄 Kiểm tra lại
                </Text>
                <br />
                <Text className="text-sm">
                  Dành thời gian cuối để xem lại các câu trả lời
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default PhilosophyLessonDetailPage;
