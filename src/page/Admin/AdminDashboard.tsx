import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Typography, Statistic, Spin, message, Empty } from 'antd';
import { Column } from '@ant-design/plots';
import { UserOutlined, DollarCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import { isAxiosError } from 'axios';
import axiosInstance from '@/services/constant/axiosInstance';
import {
  GET_TOTAL_USER_OVERVIEW_ENDPOINT,
  GET_TOTAL_USER_BY_MONTH_ENDPOINT,
  GET_TOTAL_REVENUE_ENDPOINT,
} from '@/services/constant/apiConfig';

const { Title, Text } = Typography;

interface TotalUserResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  total?: number;
}

interface TotalUserByMonthItem {
  month: string;
  value: number;
}

interface TotalUserByMonthResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: TotalUserByMonthItem[];
  meta?: {
    year?: number;
  };
}

interface TotalRevenueResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  totalRevenue?: number;
  completedTransactions?: number;
}

interface RevenueSummary {
  totalRevenue: number | null;
  completedTransactions: number | null;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [monthlyUserData, setMonthlyUserData] = useState<TotalUserByMonthItem[]>([]);
  const [dashboardYear, setDashboardYear] = useState<number | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary>({
    totalRevenue: null,
    completedTransactions: null,
  });

  const handleDashboardError = useCallback((error: unknown) => {
    console.error('Failed to load admin dashboard metrics:', error);

    if (isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      if (error.response.status === 403) {
        message.error('Bạn không có quyền truy cập dashboard này.');
        return;
      }
    }

    message.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const [totalUserRes, monthlyRes, revenueRes] = await Promise.all([
        axiosInstance.get<TotalUserResponse>(GET_TOTAL_USER_OVERVIEW_ENDPOINT),
        axiosInstance.get<TotalUserByMonthResponse>(GET_TOTAL_USER_BY_MONTH_ENDPOINT),
        axiosInstance.get<TotalRevenueResponse>(GET_TOTAL_REVENUE_ENDPOINT),
      ]);

      const userTotal = typeof totalUserRes.data?.total === 'number' ? totalUserRes.data.total : null;
      const monthlyData = Array.isArray(monthlyRes.data?.data) ? monthlyRes.data?.data : [];
      const resolvedYear = monthlyRes.data?.meta?.year ?? null;
      const totalRevenue = typeof revenueRes.data?.totalRevenue === 'number'
        ? revenueRes.data.totalRevenue
        : null;
      const completedTransactions = typeof revenueRes.data?.completedTransactions === 'number'
        ? revenueRes.data.completedTransactions
        : null;

      setTotalUsers(userTotal);
      setMonthlyUserData(monthlyData);
      setDashboardYear(resolvedYear);
      setRevenueSummary({ totalRevenue, completedTransactions });
    } catch (error) {
      handleDashboardError(error);
    } finally {
      setLoading(false);
    }
  }, [handleDashboardError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const columnConfig = useMemo(
    () => ({
      data: monthlyUserData,
      xField: 'month',
      yField: 'value',
      color: '#1890ff',
      columnWidthRatio: 0.6,
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
        value: { alias: 'Người đăng ký' },
      },
    }),
    [monthlyUserData]
  );

  const totalRevenue = revenueSummary.totalRevenue;
  const completedTransactions = revenueSummary.completedTransactions;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ fontFamily: "'Baloo 2', cursive" }}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <SummaryCard
          title="Người dùng"
          count={totalUsers}
          icon={<UserOutlined />}
          color="blue"
          subtitle="Tổng số người dùng"
          loading={loading && totalUsers === null}
        />
        <SummaryCard
          title="Doanh thu"
          count={totalRevenue}
          icon={<DollarCircleOutlined />}
          color="green"
          subtitle="Doanh thu tích lũy (₫)"
          prefix="₫"
          loading={loading && totalRevenue === null}
        />
        <SummaryCard
          title="Giao dịch thành công"
          count={completedTransactions}
          icon={<ShoppingOutlined />}
          color="purple"
          subtitle="Số lượt thanh toán hoàn tất"
          loading={loading && completedTransactions === null}
        />
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={`Người dùng đăng ký theo tháng${dashboardYear ? ` (${dashboardYear})` : ''}`}
          >
            <Spin spinning={loading} tip="Đang tải dữ liệu">
              {monthlyUserData.length ? (
                <Column {...columnConfig} height={400} />
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Spin>
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
  loading = false,
  prefix,
}: {
  title: string;
  count: number | null;
  subtitle: string;
  color: keyof typeof colorMap;
  icon: React.ReactNode;
  loading?: boolean;
  prefix?: React.ReactNode;
}) => {
  const displayValue: string | number = count == null ? '-' : count;
  const statisticPrefix = displayValue === '-' ? undefined : prefix;

  return (
    <Col xs={24} sm={12} md={8}>
      <Card bordered>
        <Row align="middle" justify="space-between">
          <Col>
            <Text style={{ color: colorMap[color], fontFamily: "'Baloo 2', cursive", fontSize: 16 }}>
              {title}
            </Text>
            <Statistic
              value={displayValue}
              valueStyle={{ fontSize: 28, fontWeight: 'bold' }}
              groupSeparator="."
              loading={loading}
              prefix={statisticPrefix}
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
