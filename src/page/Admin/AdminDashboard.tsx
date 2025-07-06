// import { useSelector } from 'react-redux';
import { Card, Col, Row, Typography, Statistic } from 'antd';
import { Pie, Column } from '@ant-design/plots';
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
// import { RootState } from '@/services/store/store';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  // const { user } = useSelector((state: RootState) => state.auth);

  // Fake data - Pie chart: Tỷ lệ cấp độ người dùng
  const roleData = [
    { type: 'Level 1', value: 2 },
    { type: 'Level 2', value: 12 },
    { type: 'Level 3', value: 12 },
    { type: 'Level 4', value: 12 },
    { type: 'Level 5', value: 12 },
  ];

  const pieConfig = {
    appendPadding: 10,
    data: roleData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{value}',
      style: { fontSize: 14, textAlign: 'center' },
    },
    interactions: [{ type: 'element-active' }],
  };

  // Fake data - Column chart: Người đăng ký theo tháng
  const monthlyUserData = [
    { month: 'Tháng 1', value: 120 },
    { month: 'Tháng 2', value: 98 },
    { month: 'Tháng 3', value: 150 },
    { month: 'Tháng 4', value: 180 },
    { month: 'Tháng 5', value: 130 },
    { month: 'Tháng 6', value: 165 },
  ];

  const columnConfig = {
    data: monthlyUserData,
    xField: 'month',
    yField: 'value',
    color: '#1890ff',
    label: {
      position: 'middle',
      style: {
        fill: '#fff',
        fontSize: 12,
        textAlign: 'center',
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    meta: {
      month: { alias: 'Tháng' },
      value: { alias: 'Số người đăng ký' },
    },
  };
  const skillDistribution = [
    { type: 'Listening', value: 25 },
    { type: 'Reading', value: 20 },
    { type: 'Writing', value: 15 },
    { type: 'Speaking', value: 40 },
  ];

  const pieSkillConfig = {
    appendPadding: 10,
    data: skillDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{value}',
      style: { fontSize: 14, textAlign: 'center' },
    },
    interactions: [{ type: 'element-active' }],
  };


  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ fontFamily: "'Baloo 2', cursive" }}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <SummaryCard
          title="Người dùng"
          count={1234}
          icon={<UserOutlined />}
          color="blue"
          subtitle="Tổng số người dùng"
        />
        <SummaryCard
          title="Bài học"
          count={320}
          icon={<BookOutlined />}
          color="purple"
          subtitle="Tổng số bài học"
        />
        <SummaryCard
          title="Cấp độ"
          count={6}
          icon={<TrophyOutlined />}
          color="red"
          subtitle="Tổng số cấp độ"
        />
        <SummaryCard
          title="Kỹ năng"
          count={4}
          icon={<AppstoreOutlined />}
          color="green"
          subtitle="Tổng số kỹ năng"
        />
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card title="Số lượng người đăng ký theo tháng">
            <Column {...columnConfig} height={500} />
          </Card>
        </Col>
        <Col xs={4} md={4} lg={6}>
          <Card title="Tỷ lệ cấp độ người dùng">
            <Pie {...pieConfig} height={200} />
          </Card>
          <Card title="Tỷ lệ kỹ năng người dùng">
            <Pie {...pieSkillConfig} height={200} />
          </Card>
        </Col>
      </Row>


    </div>
  );
};

const SummaryCard = ({
  title,
  count,
  subtitle,
  color,
  icon,
}: {
  title: string;
  count: number;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}) => {
  return (
    <Col xs={24} sm={12} md={6}>
      <Card bordered>
        <Row align="middle" justify="space-between">
          <Col>
            <Text style={{ color: colorMap[color], fontFamily: "'Baloo 2', cursive", fontSize: 16 }}>
              {title}
            </Text>
            <Statistic
              value={count}
              valueStyle={{ fontSize: 28, fontWeight: 'bold' }}
              groupSeparator="."
            />
            <div style={{ color: '#888' }}>{subtitle}</div>
          </Col>
          <Col style={{ fontSize: 32, color: colorMap[color] }}>{icon}</Col>
        </Row>
      </Card>
    </Col>
  );
};

const colorMap: Record<string, string> = {
  blue: '#1890ff',
  purple: '#722ed1',
  red: '#f5222d',
  green: '#52c41a',
};

export default AdminDashboard;
