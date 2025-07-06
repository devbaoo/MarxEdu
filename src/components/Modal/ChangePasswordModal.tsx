import { Modal, Form, Input, message } from 'antd';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

const ChangePasswordModal = ({ isOpen, onClose, onSubmit }: ChangePasswordModalProps) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (values.newPassword !== values.confirmPassword) {
                message.error('Mật khẩu xác nhận không khớp');
                return;
            }

            await onSubmit(values.oldPassword, values.newPassword, values.confirmPassword);
            form.resetFields();
        } catch {
            // Error is handled by the parent component
        }
    };

    return (
        <Modal
            title="Đổi mật khẩu"
            open={isOpen}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Xác nhận"
            cancelText="Hủy"
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <Form.Item
                    name="oldPassword"
                    label="Mật khẩu hiện tại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal; 