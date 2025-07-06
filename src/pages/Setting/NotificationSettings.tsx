import { useState, useEffect } from 'react';
import { Card, Switch, Typography, message, Skeleton } from 'antd';
import { BellOutlined, MailOutlined } from '@ant-design/icons';
import axios, { AxiosError } from 'axios';
import { GET_NOTIFICATION_SETTINGS_ENDPOINT, SETTING_NOTIFICATIONS_ENDPOINT } from '@/services/constant/apiConfig';

interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
}

interface NotificationSettingsResponse {
    success: boolean;
    settings: NotificationSettings;
    message?: string;
}

interface ErrorResponse {
    success: boolean;
    message: string;
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
            const response = await axios.get<NotificationSettingsResponse>(
                GET_NOTIFICATION_SETTINGS_ENDPOINT,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSettings(response.data.settings);
            } else if (response.data.message) {
                message.error(response.data.message);
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

    const validateSettings = (newSettings: NotificationSettings): boolean => {
        return (
            typeof newSettings.emailNotifications === 'boolean' &&
            typeof newSettings.pushNotifications === 'boolean'
        );
    };

    const handleToggle = async (key: keyof NotificationSettings) => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            const newSettings = {
                ...settings,
                [key]: !settings[key]
            };

            // Validate settings before sending
            if (!validateSettings(newSettings)) {
                message.error('Giá trị cài đặt không hợp lệ');
                return;
            }

            const response = await axios.post<NotificationSettingsResponse>(
                SETTING_NOTIFICATIONS_ENDPOINT,
                newSettings,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSettings(response.data.settings);
                message.success('Đã cập nhật cài đặt thông báo');
            } else {
                // Handle error message from server
                message.error(response.data.message || 'Không thể cập nhật cài đặt thông báo');
                // Revert the settings if update failed
                fetchSettings();
            }
        } catch (error) {
            console.error('Error updating notification settings:', error);

            // Handle specific error messages from server
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                if (axiosError.response?.data?.message) {
                    message.error(axiosError.response.data.message);
                } else {
                    message.error('Không thể cập nhật cài đặt thông báo');
                }
            } else {
                message.error('Không thể cập nhật cài đặt thông báo');
            }

            // Revert the settings if update failed
            fetchSettings();
        } finally {
            setSaving(false);
        }
    };

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
                <Typography.Title level={4} className="mb-0">
                    Cài đặt thông báo
                </Typography.Title>
            }
            className="max-w-2xl mx-auto mt-8"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <BellOutlined className="text-xl text-red-600" />
                        </div>
                        <div>
                            <Typography.Text strong className="block">
                                Thông báo đẩy
                            </Typography.Text>
                            <Typography.Text type="secondary" className="text-sm">
                                Nhận thông báo trực tiếp trên trình duyệt
                            </Typography.Text>
                        </div>
                    </div>
                    <Switch
                        checked={settings.pushNotifications}
                        onChange={() => handleToggle('pushNotifications')}
                        loading={saving}
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <MailOutlined className="text-xl text-red-600" />
                        </div>
                        <div>
                            <Typography.Text strong className="block">
                                Thông báo qua email
                            </Typography.Text>
                            <Typography.Text type="secondary" className="text-sm">
                                Nhận thông báo qua địa chỉ email của bạn
                            </Typography.Text>
                        </div>
                    </div>
                    <Switch
                        checked={settings.emailNotifications}
                        onChange={() => handleToggle('emailNotifications')}
                        loading={saving}
                    />
                </div>
            </div>
        </Card>
    );
};

export default NotificationSettings; 