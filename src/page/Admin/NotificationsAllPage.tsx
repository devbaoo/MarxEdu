import { INoticationAll } from "@/interfaces/IAdmin";
import { NOTIFICATIONS_ALL_ENDPOINT } from "@/services/constant/apiConfig";
import { Input, Button, Typography, Card, Form, message } from "antd";
import axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;

const NotificationsAllPage = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: INoticationAll) => {
    try {
      const token = localStorage.getItem("token"); // hoặc từ nơi bạn lưu token

      if (!token) {
        message.error(
          "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại."
        );
        return;
      }

      await axios.post(NOTIFICATIONS_ALL_ENDPOINT, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("Đã gửi thông báo đến tất cả người dùng!");
      form.resetFields();
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
      message.error("Gửi thông báo thất bại. Vui lòng kiểm tra lại.");
    }
  };

  return (
    <div className="p-6 flex justify-center items-start min-h-screen bg-gray-100">
      <Card
        title={
          <Title
            level={4}
            style={{
              margin: 0,
              fontFamily: "'Baloo 2', cursive",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            NOTIFICATION FOR ALL USER
          </Title>
        }
        style={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input maxLength={100} showCount placeholder="Tiêu đề thông báo" />
          </Form.Item>

          <Form.Item
            label="Nội dung thông báo"
            name="message"
            rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
          >
            <TextArea
              maxLength={300}
              showCount
              autoSize={{ minRows: 3 }}
              placeholder="Nội dung thông báo..."
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Gửi thông báo
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NotificationsAllPage;
