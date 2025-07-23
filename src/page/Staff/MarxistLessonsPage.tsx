import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Row, Col, Input, Select } from 'antd';
import { 
  ReadOutlined, 
  EyeOutlined, 
  BarChartOutlined,
  SearchOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import { RootState, useAppDispatch, useAppSelector } from '@/services/store/store';
import { getMarxistLearningPath } from '@/services/features/marxist/marxistSlice';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface LessonData {
  id: string;
  title: string;
  topic: string;
  difficulty: number;
  questionCount: number;
  maxScore: number;
  createdAt: string;
  completedCount: number;
  averageScore: number;
  status: string;
}

const MarxistLessonsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    learningPath, 
    learningPathLoading 
  } = useAppSelector((state: RootState) => state.marxist);

  const [searchText, setSearchText] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Fetch real data from API
  useEffect(() => {
    dispatch(getMarxistLearningPath({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Convert learning path to lessons format for table
  const lessons: LessonData[] = learningPath.map((item) => ({
    id: item.pathId,
    title: item.title,
    topic: item.marxistTopic.title,
    difficulty: item.difficultyLevel,
    questionCount: 30, // Default value, can be updated when available from API
    maxScore: 3000, // Default value, can be updated when available from API
    createdAt: new Date(item.createdAt).toISOString().split('T')[0],
    completedCount: Math.floor(Math.random() * 50), // Mock data until available from API
    averageScore: item.achievedScore || Math.floor(Math.random() * 40 + 60),
    status: item.completed ? 'completed' : 'active'
  }));

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

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Tiêu đề bài học',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: 'Chủ đề',
      dataIndex: 'topic',
      key: 'topic',
      width: 150,
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (level: number) => (
        <Tag color={getDifficultyColor(level)}>
          {getDifficultyText(level)}
        </Tag>
      ),
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 100,
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'maxScore',
      key: 'maxScore',
      width: 100,
    },
    {
      title: 'Học viên hoàn thành',
      dataIndex: 'completedCount',
      key: 'completedCount',
      width: 150,
    },
    {
      title: 'Điểm TB',
      dataIndex: 'averageScore',
      key: 'averageScore',
      width: 100,
      render: (score: number) => `${score.toFixed(1)}`,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: LessonData) => (
        <Space size="small">
                     <Button
             type="primary"
             size="small"
             icon={<EyeOutlined />}
             onClick={() => window.location.href = `/marxist-lesson/${record.id}`}
           >
             Xem
           </Button>
          <Button
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => console.log('View stats:', record.id)}
          >
            Thống kê
          </Button>
        </Space>
      ),
    },
  ];

  const filteredLessons = lessons.filter((lesson: LessonData) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         lesson.topic.toLowerCase().includes(searchText.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || lesson.difficulty.toString() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="marxist-lessons-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2 text-red-700">
          <ReadOutlined className="mr-2" />
          Bài học AI Marxist
        </Title>
        <Text className="text-gray-600">
          Quản lý và theo dõi các bài học được tạo bởi AI Gemini
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">75</div>
            <Text type="secondary">Tổng bài học</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <Text type="secondary">Lượt học</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">84.2</div>
            <Text type="secondary">Điểm TB</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">76%</div>
            <Text type="secondary">Tỷ lệ hoàn thành</Text>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm bài học hoặc chủ đề..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo độ khó"
              value={difficultyFilter}
              onChange={setDifficultyFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả độ khó</Option>
              <Option value="1">Cơ bản</Option>
              <Option value="2">Trung bình</Option>
              <Option value="3">Khá</Option>
              <Option value="4">Khó</Option>
              <Option value="5">Rất khó</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Lessons Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredLessons}
          rowKey="id"
          loading={learningPathLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bài học`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default MarxistLessonsPage; 