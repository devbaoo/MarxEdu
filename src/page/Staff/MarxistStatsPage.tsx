import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Progress, Select, DatePicker, Button } from 'antd';
import { 
  BarChartOutlined, 
  TrophyOutlined, 
  UserOutlined, 
  BookOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import { RootState, useAppDispatch, useAppSelector } from '@/services/store/store';
import { getMarxistStats } from '@/services/features/marxist/marxistSlice';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const MarxistStatsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    stats, 
    statsLoading 
  } = useAppSelector((state: RootState) => state.marxist);

  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Fetch real stats from API
  useEffect(() => {
    dispatch(getMarxistStats());
  }, [dispatch]);

  // Mock data for charts
  const learningProgressData = [
    { date: '2024-01', lessons: 45, completions: 34 },
    { date: '2024-02', lessons: 52, completions: 41 },
    { date: '2024-03', lessons: 38, completions: 29 },
    { date: '2024-04', lessons: 61, completions: 48 },
    { date: '2024-05', lessons: 73, completions: 58 },
    { date: '2024-06', lessons: 66, completions: 51 },
  ];

  const topicPerformanceData = [
    { topic: 'Chủ nghĩa tư bản', score: 85.4, count: 124 },
    { topic: 'Giá trị thặng dư', score: 78.2, count: 98 },
    { topic: 'Đấu tranh giai cấp', score: 92.1, count: 156 },
    { topic: 'Duy vật biện chứng', score: 76.8, count: 87 },
    { topic: 'Kinh tế chính trị', score: 81.3, count: 112 },
  ];

  const difficultyDistributionData = [
    { difficulty: 'Cơ bản', value: 35 },
    { difficulty: 'Trung bình', value: 28 },
    { difficulty: 'Khá', value: 22 },
    { difficulty: 'Khó', value: 12 },
    { difficulty: 'Rất khó', value: 3 },
  ];

  const topStudentsData = [
    { rank: 1, name: 'Nguyễn Văn A', score: 2847, lessons: 45, completion: 96 },
    { rank: 2, name: 'Trần Thị B', score: 2731, lessons: 42, completion: 94 },
    { rank: 3, name: 'Lê Văn C', score: 2698, lessons: 41, completion: 92 },
    { rank: 4, name: 'Phạm Thị D', score: 2654, lessons: 39, completion: 89 },
    { rank: 5, name: 'Hoàng Văn E', score: 2612, lessons: 38, completion: 87 },
  ];

  const lineConfig = {
    data: learningProgressData,
    xField: 'date',
    yField: 'lessons',
    seriesField: 'type',
    color: ['#dc2626', '#16a34a'],
    smooth: true,
  };

  const columnConfig = {
    data: topicPerformanceData,
    xField: 'topic',
    yField: 'score',
    color: '#dc2626',
  };

  const pieConfig = {
    data: difficultyDistributionData,
    angleField: 'value',
    colorField: 'difficulty',
    radius: 0.8,
  };

  const studentColumns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => (
        <div className={`text-center font-bold ${
          rank === 1 ? 'text-yellow-500' : 
          rank === 2 ? 'text-gray-400' : 
          rank === 3 ? 'text-orange-600' : 'text-gray-600'
        }`}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
        </div>
      )
    },
    { title: 'Học viên', dataIndex: 'name', key: 'name' },
    { title: 'Tổng điểm', dataIndex: 'score', key: 'score' },
    { title: 'Bài học', dataIndex: 'lessons', key: 'lessons' },
    {
      title: 'Tỷ lệ hoàn thành',
      dataIndex: 'completion',
      key: 'completion',
      render: (completion: number) => (
        <Progress percent={completion} size="small" status="active" />
      )
    },
  ];

  return (
    <div className="marxist-stats-page p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2 text-red-700">
          <BarChartOutlined className="mr-2" />
          Thống kê học tập Marxist
        </Title>
        <Text className="text-gray-600">
          Báo cáo và phân tích dữ liệu học tập kinh tế chính trị Mác-Lê-Nin
        </Text>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Select
              style={{ width: '100%' }}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            >
              <Option value="7">7 ngày qua</Option>
              <Option value="30">30 ngày qua</Option>
              <Option value="90">90 ngày qua</Option>
              <Option value="365">1 năm qua</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <RangePicker style={{ width: '100%' }} />
          </Col>
          <Col xs={24} md={8}>
            <Button.Group style={{ width: '100%' }}>
                             <Button icon={<ReloadOutlined />}>
                 Làm mới
               </Button>
              <Button icon={<DownloadOutlined />} type="primary">
                Xuất Excel
              </Button>
            </Button.Group>
          </Col>
        </Row>
      </Card>

      {/* Key Stats */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <BookOutlined className="text-3xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalLessons || 0}
            </div>
            <Text type="secondary">Tổng số bài học</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <UserOutlined className="text-3xl text-green-600 mb-2" />
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.completedLessons || 0}
            </div>
            <Text type="secondary">Bài học hoàn thành</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <TrophyOutlined className="text-3xl text-yellow-600 mb-2" />
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : Math.round(stats?.overallAvgScore || 0)}
            </div>
            <Text type="secondary">Điểm trung bình</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <BarChartOutlined className="text-3xl text-purple-600 mb-2" />
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${stats?.completionRate || 0}%`}
            </div>
            <Text type="secondary">Tỷ lệ hoàn thành</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Tiến độ học tập theo thời gian" className="h-full">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố độ khó" className="h-full">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Hiệu suất theo chủ đề" className="h-full">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top học viên xuất sắc" className="h-full">
            <Table
              columns={studentColumns}
              dataSource={topStudentsData}
              rowKey="rank"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Topic Performance Details */}
      <Card title="Chi tiết hiệu suất theo chủ đề" loading={statsLoading}>
        <Row gutter={[16, 16]}>
          {stats?.topicBreakdown?.map((topic, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card size="small" className="text-center">
                <Title level={5}>{topic.title}</Title>
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {topic.avgScore.toFixed(1)}
                </div>
                <Progress 
                  percent={Math.round(topic.avgScore)} 
                  size="small"
                  strokeColor="#dc2626"
                />
                <Text type="secondary" className="text-xs">
                  {topic.completed}/{topic.total} bài học
                </Text>
              </Card>
            </Col>
          )) || (
            // Fallback to mock data if no API data available
            topicPerformanceData.map((topic, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card size="small" className="text-center">
                  <Title level={5}>{topic.topic}</Title>
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {topic.score.toFixed(1)}
                  </div>
                  <Progress 
                    percent={Math.round(topic.score)} 
                    size="small"
                    strokeColor="#dc2626"
                  />
                  <Text type="secondary" className="text-xs">
                    {topic.count} lượt học
                  </Text>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Card>
    </div>
  );
};

export default MarxistStatsPage; 