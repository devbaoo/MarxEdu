import React, { useEffect, useState } from "react";
import { Table, Tag, Modal, Descriptions, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { GET_PAYMENT_HISTORY_ENDPOINT } from "@/services/constant/apiConfig";
import { apiMethods } from "@/services/constant/axiosInstance";
import { EyeOutlined } from "@ant-design/icons";

interface IUserPaymentHistoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  paymentHistory: PaymentManager[];
}

export interface PaymentManager {
  _id: string;
  user: string;
  package: PackageManager;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  discountApplied: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PackageManager {
  name: string;
  price: number;
  duration: number;
  description: string;
}

const HistoryPaymentPage: React.FC = () => {
  const [selected, setSelected] = useState<PaymentManager | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentManager[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiMethods.get<IUserPaymentHistoryResponse>(
          GET_PAYMENT_HISTORY_ENDPOINT
        );

        const history = response.data.paymentHistory;
        if (history) {
          setPaymentHistory(history);
        }
      } catch (error) {
        console.error("Failed to fetch payment history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showDetail = (record: PaymentManager) => {
    setSelected(record);
    setIsModalVisible(true);
  };

  const columns: ColumnsType<PaymentManager> = [
    {
      title: "Gói đăng ký",
      dataIndex: "package",
      key: "package",
      render: (pkg) => pkg?.name || "Không rõ",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => `${amount.toLocaleString()} VND`,
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      align: "center",
      render: (status) => {
        const normalized = status?.trim().toLowerCase();
        switch (normalized) {
          case "completed":
            return <Tag color="green">Hoàn tất</Tag>;
          case "failed":
            return <Tag color="red">Thất bại</Tag>;
          case "pending":
            return <Tag color="blue">Đang xử lý</Tag>;
          default:
            return <Tag color="gray">Không xác định</Tag>;
        }
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "right",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
          className="text-sky-600 border border-sky-300 hover:bg-sky-100 rounded-md shadow-sm"
        >
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-red-700 mb-6 text-center">
        Lịch Sử Thanh Toán
      </h1>
      <Table
        dataSource={paymentHistory}
        columns={columns}
        rowKey="_id"
        pagination={false}
        loading={loading}
        bordered
      />

      <Modal
        title="Chi Tiết Thanh Toán"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selected && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Mã giao dịch" span={2}>
              {selected.transactionId}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              {selected.amount.toLocaleString()} VND
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              {selected.discountApplied}%
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selected.paymentStatus === "completed"
                ? "Hoàn tất"
                : selected.paymentStatus === "failed"
                  ? "Thất bại"
                  : selected.paymentStatus === "pending"
                    ? "Đang xử lý"
                    : "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức">
              {selected.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Kích hoạt">
              {selected.isActive ? "Có" : "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Bắt đầu">
              {new Date(selected.startDate).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Kết thúc">
              {new Date(selected.endDate).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selected.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {new Date(selected.updatedAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
            {selected.package && (
              <>
                <Descriptions.Item label="Tên gói" span={2}>
                  {selected.package.name}
                </Descriptions.Item>
                <Descriptions.Item label="Thời hạn (ngày)">
                  {selected.package.duration}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {selected.package.description}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default HistoryPaymentPage;
