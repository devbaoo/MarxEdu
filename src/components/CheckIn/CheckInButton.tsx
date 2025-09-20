import React, { useEffect, useState } from 'react';
import { Button, Badge, Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { getCheckInStatus } from '@/services/features/checkin/checkInSlice';
import CheckInModal from '@/components/Modal/CheckInModal';

const CheckInButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useAppDispatch();
    const { checkInStatus } = useAppSelector((state) => state.checkIn);

    useEffect(() => {
        dispatch(getCheckInStatus());
    }, [dispatch]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Tooltip title="Điểm danh hàng ngày">
                <Badge dot={!checkInStatus?.hasCheckedInToday} offset={[-2, 2]} color="red">
                    <Button
                        icon={<CalendarOutlined />}
                        onClick={handleOpenModal}
                        type="text"
                        size="large"
                        className="flex items-center justify-center"
                    />
                </Badge>
            </Tooltip>

            <CheckInModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default CheckInButton;
