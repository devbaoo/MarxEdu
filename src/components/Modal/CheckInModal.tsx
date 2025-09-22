import React, { useEffect } from 'react';
import { Modal, Button, Typography, Spin, Row, Col, Card, Space, message, Tooltip } from 'antd';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { performCheckIn, getCheckInStatus } from '@/services/features/checkin/checkInSlice';
import { CalendarOutlined, TrophyOutlined, FireOutlined, GiftOutlined, CheckCircleFilled } from '@ant-design/icons';
import confetti from 'canvas-confetti';
import iphone17Icon from '@/assets/image1.png';

const { Title, Text } = Typography;

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { status, checkInData, checkInStatus, error } = useAppSelector((state) => state.checkIn);
    const isLoading = status === 'loading';

    useEffect(() => {
        if (isOpen) {
            dispatch(getCheckInStatus());
        }
    }, [isOpen, dispatch]);

    const handleCheckIn = async () => {
        try {
            await dispatch(performCheckIn()).unwrap();
            // Trigger confetti effect on successful check-in
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            message.success('Điểm danh thành công!');
        } catch {
            message.error('Có lỗi xảy ra khi điểm danh');
        }
    };

    // Calculate progress percentage for next special reward
    const progressPercentage = checkInStatus?.nextSpecialReward
        ? ((checkInStatus.nextSpecialReward.day - checkInStatus.nextSpecialReward.daysLeft) / checkInStatus.nextSpecialReward.day) * 100
        : 0;

    // Calculate which days have been checked in
    const currentConsecutiveDays = checkInStatus?.consecutiveCheckIns || 0;

    // Generate array of 7 days for calendar display
    const daysArray = Array.from({ length: 7 }, (_, i) => i + 1);

    return (
        <Modal
            title={<Title level={4}>Điểm Danh Hàng Ngày</Title>}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                    <Spin size="large" />
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Có lỗi xảy ra: {error}</p>
                    <Button onClick={() => dispatch(getCheckInStatus())}>Thử lại</Button>
                </div>
            ) : (
                <div>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Space>
                                            <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                            <div>
                                                <Text strong>Điểm danh liên tiếp</Text>
                                                <br />
                                                <Text>{checkInStatus?.consecutiveCheckIns || 0} ngày</Text>
                                            </div>
                                        </Space>
                                        <Space>
                                            <FireOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                                            <div>
                                                <Text strong>Tổng số lần điểm danh</Text>
                                                <br />
                                                <Text>{checkInStatus?.totalCheckIns || 0} ngày</Text>
                                            </div>
                                        </Space>
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card>
                                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <GiftOutlined /> Điểm danh 7 ngày liên tiếp
                                    <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#ff4d4f', marginLeft: 'auto' }}>
                                        Phần thưởng: iPhone 17 Pro Max
                                    </span>
                                </Title>

                                <div className="calendar-days-container" style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                                    {daysArray.map((day) => {
                                        const isChecked = day <= currentConsecutiveDays;
                                        const isToday = day === currentConsecutiveDays + 1 && !checkInStatus?.hasCheckedInToday;
                                        const isSpecialReward = day === 7;

                                        return (
                                            <Tooltip
                                                key={day}
                                                title={isSpecialReward ? 'iPhone 17 Pro Max' : `Ngày ${day}`}
                                            >
                                                <div
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '50%',
                                                        backgroundColor: isChecked ? '#52c41a' : isToday ? '#faad14' : '#f0f0f0',
                                                        color: isChecked || isToday ? 'white' : 'rgba(0, 0, 0, 0.65)',
                                                        fontWeight: 'bold',
                                                        position: 'relative',
                                                        boxShadow: isToday ? '0 0 10px rgba(250, 173, 20, 0.5)' : 'none',
                                                    }}
                                                >
                                                    {isSpecialReward ? (
                                                        <img src={iphone17Icon} alt="iPhone 17" style={{ width: '24px', height: '24px' }} />
                                                    ) : (
                                                        day
                                                    )}
                                                    {isChecked && (
                                                        <CheckCircleFilled style={{ position: 'absolute', bottom: '-8px', color: '#52c41a', backgroundColor: 'white', borderRadius: '50%' }} />
                                                    )}
                                                </div>
                                            </Tooltip>
                                        );
                                    })}
                                </div>

                                {checkInStatus?.nextSpecialReward && (
                                    <div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <Text strong>{checkInStatus.nextSpecialReward.reward.name}</Text>
                                            <br />
                                            <Text type="secondary">{checkInStatus.nextSpecialReward.reward.description}</Text>
                                        </div>
                                        <div>
                                            <Text>Còn {checkInStatus.nextSpecialReward.daysLeft} ngày nữa</Text>
                                            <div style={{
                                                height: '8px',
                                                background: '#f0f0f0',
                                                borderRadius: '4px',
                                                marginTop: '8px',
                                                marginBottom: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${progressPercentage}%`,
                                                    background: 'linear-gradient(90deg, #108ee9 0%, #87d068 100%)',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <Text type="secondary">
                                                Điểm danh đủ {checkInStatus.nextSpecialReward.day} ngày liên tiếp để nhận phần thưởng
                                            </Text>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </Col>

                        {checkInData && (
                            <Col span={24}>
                                <Card style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                                    <Space align="center">
                                        <TrophyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                                        <div>
                                            <Text strong>Phần thưởng hôm nay</Text>
                                            <br />
                                            <Text>+{checkInData.xpEarned} XP, +{checkInData.pointsEarned} điểm</Text>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                        )}

                        <Col span={24} style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleCheckIn}
                                loading={isLoading}
                                disabled={checkInStatus?.hasCheckedInToday}
                                style={{ minWidth: '200px' }}
                            >
                                {checkInStatus?.hasCheckedInToday ? 'Đã điểm danh hôm nay' : 'Điểm danh ngay'}
                            </Button>
                            {checkInStatus?.hasCheckedInToday && (
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary">Bạn đã điểm danh hôm nay. Hãy quay lại vào ngày mai!</Text>
                                </div>
                            )}
                        </Col>
                    </Row>
                </div>
            )}
        </Modal>
    );
};

export default CheckInModal;
