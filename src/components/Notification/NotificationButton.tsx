import { useState, useEffect } from 'react';
import { Badge, Dropdown, Typography, Button } from 'antd';
import { BellOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import axios from 'axios';
import { GET_NOTIFICATIONS_ENDPOINT, READ_A_NOTIFICATION_ENDPOINT, MARK_ALL_NOTIFICATIONS_READ_ENDPOINT } from '@/services/constant/apiConfig';
import { INotification, INotificationResponse } from '@/interfaces/INotification';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { MenuProps } from 'antd';

dayjs.extend(relativeTime);

const NotificationButton = () => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<INotificationResponse>(GET_NOTIFICATIONS_ENDPOINT, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling to fetch notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleReadNotification = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(READ_A_NOTIFICATION_ENDPOINT(id), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh notifications after marking as read
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.patch(MARK_ALL_NOTIFICATIONS_READ_ENDPOINT, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh notifications after marking all as read
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = (notification: INotification) => {
        // Mark as read
        handleReadNotification(notification._id);

        // Navigate to link if exists
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const menuItems: MenuProps['items'] = [
        {
            key: 'header',
            label: (
                <div className="flex justify-between items-center py-2 px-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Typography.Text strong className="text-base font-baloo">
                            Thông báo
                        </Typography.Text>
                        {unreadCount > 0 && (
                            <Badge
                                count={unreadCount}
                                size="small"
                                style={{ backgroundColor: '#1677ff' }}
                            />
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            type="link"
                            size="small"
                            onClick={handleMarkAllAsRead}
                            className="text-xs hover:text-red-600 px-0 font-baloo"
                        >
                            Đọc tất cả
                        </Button>
                    )}
                </div>
            ),
        },
        ...(notifications.length === 0 ? [{
            key: 'no-notifications',
            label: (
                <div className="text-center text-gray-500 py-4">
                    <Typography.Text className="text-gray-400 text-sm font-baloo">
                        Không có thông báo nào
                    </Typography.Text>
                </div>
            )
        }] : notifications.map((notification, index) => {
            const isExpanded = expandedIds.has(notification._id);
            const shouldTruncate = notification.message.length > 80;

            return {
                key: notification._id || index,
                label: (
                    <div
                        className={`
                            cursor-pointer transition-all duration-200 
                            hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                            ${!notification.isRead ? 'bg-red-50/60' : ''}
                        `}
                        onClick={() => handleNotificationClick(notification)}
                    >
                        <div className="flex flex-col gap-1 p-3 relative">
                            {!notification.isRead && (
                                <div className="absolute left-1.5 top-5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                </div>
                            )}
                            <div className={`flex flex-col ${!notification.isRead ? 'pl-3' : ''}`}>
                                <Typography.Text
                                    strong
                                    className={`text-sm ${!notification.isRead ? 'text-red-600' : 'text-gray-800'} font-baloo`}
                                >
                                    {notification.title}
                                </Typography.Text>
                                <div className="relative">
                                    <Typography.Text
                                        className={`text-xs text-gray-600 mt-0.5 ${!isExpanded && shouldTruncate ? 'line-clamp-2' : ''} font-baloo`}
                                    >
                                        {notification.message}
                                    </Typography.Text>
                                    {shouldTruncate && (
                                        <Button
                                            type="link"
                                            size="small"
                                            className="px-0 h-5 text-xs text-red-600 font-baloo"
                                            onClick={(e) => toggleExpand(e, notification._id)}
                                            icon={isExpanded ? <UpOutlined className="text-xs" /> : <DownOutlined className="text-xs" />}
                                        >
                                            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                                        </Button>
                                    )}
                                </div>
                                <Typography.Text className="text-xs text-gray-400 mt-1 font-baloo">
                                    {dayjs(notification.createdAt).fromNow()}
                                </Typography.Text>
                            </div>
                        </div>
                    </div>
                ),
            };
        }))
    ];

    return (
        <Dropdown
            menu={{
                items: menuItems,
                style: {
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    width: '320px',
                    padding: 0,
                }
            }}
            trigger={['click']}
            placement="bottomRight"
            arrow
        >
            <Badge count={unreadCount} offset={[-5, 5]}>
                <Button
                    icon={<BellOutlined />}
                    shape="circle"
                    className="flex items-center justify-center hover:bg-gray-100"
                />
            </Badge>
        </Dropdown>
    );
};

export default NotificationButton; 