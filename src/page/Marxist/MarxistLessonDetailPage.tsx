import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Row, Col, Tag, Spin, Alert } from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { RootState, useAppDispatch, useAppSelector } from '@/services/store/store';
import { getMarxistLessonByPath } from '@/services/features/marxist/marxistSlice';
import { ILesson } from '@/interfaces/ILesson';

const { Title, Text, Paragraph } = Typography;

const MarxistLessonDetailPage: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { error } = useAppSelector((state: RootState) => state.marxist);
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  useEffect(() => {
    if (pathId) {
      fetchLessonDetail();
    }
  }, [pathId]);

  const fetchLessonDetail = async () => {
    if (!pathId) return;
    
    setLessonLoading(true);
    try {
      const result = await dispatch(getMarxistLessonByPath(pathId)).unwrap();
      setLesson(result.lesson);
    } catch (error) {
      console.error('Error fetching lesson detail:', error);
    } finally {
      setLessonLoading(false);
    }
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

  const handleStartLesson = () => {
    console.log('🚀 Starting Marxist lesson test for pathId:', pathId);
    navigate(`/marxist-test/${pathId}`);
  };

  if (lessonLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert
          message="Lỗi khi tải bài học"
          description={error}
          type="error"
          showIcon
        />
        <Button 
          className="mt-4" 
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert
          message="Không tìm thấy bài học"
          description="Bài học có thể đã bị xóa hoặc không tồn tại."
          type="warning"
          showIcon
        />
        <Button 
          className="mt-4" 
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="marxist-lesson-detail p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          className="mb-4"
        >
          Quay lại
        </Button>
        
        <Title level={2} className="mb-2 text-red-700">
          <BookOutlined className="mr-2" />
          {lesson.title}
        </Title>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Tag color="blue">{lesson.topic?.name}</Tag>
          <Tag color={getDifficultyColor(3)}>
            {getDifficultyText(3)}
          </Tag>
          <Tag color="green">{lesson.questions?.length || 0} câu hỏi</Tag>
        </div>
      </div>

      {/* Lesson Info Cards */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <ClockCircleOutlined className="text-3xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{lesson.timeLimit || 45}</div>
            <Text type="secondary">Phút</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <BookOutlined className="text-3xl text-green-600 mb-2" />
            <div className="text-2xl font-bold">{lesson.questions?.length || 0}</div>
            <Text type="secondary">Câu hỏi</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center">
            <TrophyOutlined className="text-3xl text-yellow-600 mb-2" />
            <div className="text-2xl font-bold">{lesson.maxScore || 0}</div>
            <Text type="secondary">Điểm tối đa</Text>
          </Card>
        </Col>
      </Row>

      {/* Lesson Description */}
      <Card className="mb-6">
        <Title level={4}>Mô tả bài học</Title>
        <Paragraph>
          Bài học này tập trung vào các khái niệm cốt lõi của chủ đề <strong>{lesson.topic?.name}</strong>. 
          Học viên sẽ được kiểm tra kiến thức thông qua {lesson.questions?.length || 0} câu hỏi 
          với thời gian giới hạn {lesson.timeLimit || 45} phút.
        </Paragraph>
        
        <Title level={5}>Mục tiêu học tập:</Title>
        <ul>
          <li>Hiểu rõ các khái niệm cơ bản của {lesson.topic?.name}</li>
          <li>Áp dụng kiến thức vào thực tiễn</li>
          <li>Phát triển tư duy phản biện và phân tích</li>
        </ul>
      </Card>

      {/* Skills Required */}
      <Card className="mb-6">
        <Title level={4}>Kỹ năng yêu cầu</Title>
        <Row gutter={[16, 16]}>
          {lesson.skills?.map((skill) => (
            <Col key={skill._id} xs={24} sm={12}>
              <Card size="small">
                <Text strong>{skill.name}</Text>
                <br />
                <Text type="secondary">{skill.description}</Text>
              </Card>
            </Col>
          )) || (
            <Col span={24}>
              <Text type="secondary">Không có thông tin về kỹ năng yêu cầu</Text>
            </Col>
          )}
        </Row>
      </Card>

      {/* Question Preview */}
      <Card className="mb-6">
        <Title level={4}>Xem trước câu hỏi</Title>
        <Text type="secondary" className="block mb-4">
          Dưới đây là một số câu hỏi mẫu trong bài học:
        </Text>
        
        {lesson.questions?.slice(0, 3).map((question, index) => (
          <Card key={question._id} size="small" className="mb-3">
            <Text strong>Câu {index + 1}: </Text>
            <Text>{question.content}</Text>
            <div className="mt-2">
              <Tag color="blue">{question.type}</Tag>
              <Tag color="green">{question.score} điểm</Tag>
            </div>
          </Card>
        ))}
        
        {(lesson.questions?.length || 0) > 3 && (
          <Text type="secondary">
            ... và {(lesson.questions?.length || 0) - 3} câu hỏi khác
          </Text>
        )}
      </Card>

      {/* Action Buttons */}
      <Card className="text-center">
        <Title level={4} className="mb-4">Sẵn sàng bắt đầu?</Title>
        <Paragraph className="mb-4">
          Hãy đảm bảo bạn có đủ thời gian và không bị gián đoạn trong quá trình làm bài.
        </Paragraph>
        
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={handleStartLesson}
          className="bg-red-600 hover:bg-red-700"
        >
          Bắt đầu bài học
        </Button>
      </Card>
    </div>
  );
};

export default MarxistLessonDetailPage; 