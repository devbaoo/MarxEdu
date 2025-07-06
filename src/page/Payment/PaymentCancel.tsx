import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store/store';
import { cancelPayment } from '@/services/features/package/packageSlice';
import { Result, Spin } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

interface CancelPaymentResponse {
    success: boolean;
    statusCode: number;
    message: string;
}

const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const [cancelResult, setCancelResult] = useState<CancelPaymentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const orderCode = searchParams.get('orderCode');

    // Hàm chuyển đổi orderCode sang định dạng PKG_
    const convertToTransactionId = (code: string): string => {
        return `PKG_${code}`;
    };

    useEffect(() => {
        const handlePaymentCancel = async () => {
            if (orderCode) {
                try {
                    setIsLoading(true);
                    const transactionId = convertToTransactionId(orderCode);
                    const action = await dispatch(cancelPayment(transactionId));
                    const result = action.payload as unknown as CancelPaymentResponse;
                    setCancelResult(result);

                    // Redirect after 3 seconds
                    setTimeout(() => {
                        navigate('/packages');
                    }, 3000);
                } catch (error) {
                    console.error('Error cancelling payment:', error);
                    setTimeout(() => {
                        navigate('/packages');
                    }, 3000);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        handlePaymentCancel();
    }, [dispatch, navigate, orderCode]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <Result
                    icon={<Spin size="large" />}
                    title="Đang hủy thanh toán..."
                />
            );
        }

        if (!cancelResult) {
            return (
                <Result
                    status="error"
                    title="Có lỗi xảy ra"
                    subTitle="Không thể hủy thanh toán"
                />
            );
        }

        return (
            <Result
                icon={<FrownOutlined />}
                status="info"
                title="Thanh toán đã được hủy"
                subTitle={
                    <div>
                        <p>Mã đơn hàng: {orderCode}</p>
                        <p>Trạng thái: Đã hủy</p>
                    </div>
                }
            />
        );
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

export default PaymentCancel; 