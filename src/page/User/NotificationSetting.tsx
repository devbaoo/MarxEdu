import { useState, useEffect } from 'react';
import { Card, Switch, Typography, message, Skeleton, List } from 'antd';
import { BellOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { GET_NOTIFICATION_SETTINGS_ENDPOINT, SETTING_NOTIFICATIONS_ENDPOINT } from '@/services/constant/apiConfig';

interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
}

const NotificationSettings = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        emailNotifications: false,
        pushNotifications: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(GET_NOTIFICATION_SETTINGS_ENDPOINT, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            message.error('Không thể tải cài đặt thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleToggle = async (key: keyof NotificationSettings) => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            const newSettings = {
                ...settings,
                [key]: !settings[key]
            };

            await axios.patch(SETTING_NOTIFICATIONS_ENDPOINT, newSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSettings(newSettings);
            message.success('Đã cập nhật cài đặt thông báo');
        } catch (error) {
            console.error('Error updating notification settings:', error);
            message.error('Không thể cập nhật cài đặt thông báo');
        } finally {
            setSaving(false);
        }
    };

    const notificationItems = [
        {
            key: 'pushNotifications',
            icon: <BellOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
            title: 'Thông báo đẩy',
            description: 'Nhận thông báo trực tiếp trên trình duyệt',
            checked: settings.pushNotifications
        },
        {
            key: 'emailNotifications',
            icon: <MailOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
            title: 'Thông báo qua email',
            description: 'Nhận thông báo qua địa chỉ email của bạn',
            checked: settings.emailNotifications
        }
    ];

    if (loading) {
        return (
            <Card className="max-w-2xl mx-auto mt-8">
                <Skeleton active />
            </Card>
        );
    }

    return (
        <Card
            title={
                <Typography.Title level={4} className="mb-0 font-baloo">
                    Cài đặt thông báo
                </Typography.Title>
            }
            className="max-w-2xl mx-auto mt-8"
        >
            <List
                itemLayout="horizontal"
                dataSource={notificationItems}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Switch
                                key="switch"
                                checked={item.checked}
                                onChange={() => handleToggle(item.key as keyof NotificationSettings)}
                                loading={saving}
                            />
                        ]}
                    >
                        <List.Item.Meta
                            avatar={item.icon}
                            title={<span className="font-baloo">{item.title}</span>}
                            description={<span className="font-baloo text-gray-500">{item.description}</span>}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default NotificationSettings;