import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store/store';
import { checkPaymentStatus } from '@/services/features/package/packageSlice';
import { Result, Spin } from 'antd';
import { SmileOutlined, FrownOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface UserPackage {
    _id: string;
    user: string;
    package: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod: string;
    transactionId: string;
    amount: number;
    discountApplied: number;
    createdAt: string;
    updatedAt: string;
}

interface PaymentStatusResponse {
    success: boolean;
    statusCode: number;
    message: string;
    paymentStatus: 'PAID' | 'PENDING' | 'EXPIRED' | 'FAILED';
    userPackage: UserPackage;
}

const PaymentReturn: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const [paymentResult, setPaymentResult] = useState<PaymentStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const orderCode = searchParams.get('orderCode');
    const isCancelled = searchParams.get('cancel') === 'true';

    // Hàm chuyển đổi orderCode sang định dạng PKG_
    const convertToTransactionId = (code: string): string => {
        // Sử dụng toàn bộ orderCode
        return `PKG_${code}`;
    };

    useEffect(() => {
        const handlePaymentReturn = async () => {
            if (orderCode) {
                try {
                    setIsLoading(true);
                    // Chuyển đổi orderCode sang định dạng PKG_
                    const transactionId = convertToTransactionId(orderCode);
                    const action = await dispatch(checkPaymentStatus(transactionId));
                    const result = action.payload as unknown as PaymentStatusResponse;
                    setPaymentResult(result);

                    // Redirect after 3 seconds
                    setTimeout(() => {
                        navigate('/packages');
                    }, 3000);
                } catch (error) {
                    console.error('Error checking payment status:', error);
                    setTimeout(() => {
                        navigate('/packages');
                    }, 3000);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        handlePaymentReturn();
    }, [dispatch, navigate, orderCode]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <Result
                    icon={<Spin size="large" />}
                    title="Đang kiểm tra trạng thái thanh toán..."
                />
            );
        }

        if (!paymentResult) {
            return (
                <Result
                    status="error"
                    title="Có lỗi xảy ra"
                    subTitle="Không thể xác nhận trạng thái thanh toán"
                />
            );
        }

        if (isCancelled) {
            return (
                <Result
                    icon={<FrownOutlined />}
                    status="error"
                    title="Thanh toán đã bị hủy"
                    subTitle="Bạn đã hủy giao dịch thanh toán"
                />
            );
        }

        switch (paymentResult.paymentStatus) {
            case 'PAID':
                return (
                    <Result
                        icon={<SmileOutlined />}
                        status="success"
                        title="Thanh toán thành công!"
                        subTitle={
                            <div>
                                <p>Mã đơn hàng: {orderCode}</p>
                                <p>Số tiền: {paymentResult.userPackage.amount.toLocaleString('vi-VN')}đ</p>
                                {paymentResult.userPackage.discountApplied > 0 && (
                                    <p>Giảm giá: {paymentResult.userPackage.discountApplied}%</p>
                                )}
                            </div>
                        }
                    />
                );
            case 'EXPIRED':
                return (
                    <Result
                        icon={<ClockCircleOutlined />}
                        status="warning"
                        title="Giao dịch đã hết hạn"
                        subTitle="Vui lòng thực hiện giao dịch mới"
                    />
                );
            case 'FAILED':
                return (
                    <Result
                        status="error"
                        title="Thanh toán thất bại"
                        subTitle="Vui lòng thử lại sau"
                    />
                );
            default:
                return (
                    <Result
                        status="info"
                        title="Đang xử lý thanh toán"
                        subTitle="Vui lòng chờ trong giây lát..."
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
            <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
                {renderContent()}
                {!isLoading && (
                    <div className="text-center mt-4">
                        <Spin tip="Đang chuyển hướng..." />
                        <p className="text-gray-500 mt-2">
                            Bạn sẽ được chuyển hướng sau 3 giây...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentReturn; 