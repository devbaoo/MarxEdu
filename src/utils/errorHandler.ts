import axios, { AxiosError } from "axios";

interface ErrorResponseData {
  message?: string;
}

/**
 * Normalize API errors to user-friendly messages.
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponseData>;
    if (!axiosError.response && axiosError.request) {
      return "Không thể kết nối đến server";
    }

    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    switch (status) {
      case 400:
        return data?.message || "Dữ liệu không hợp lệ";
      case 401:
        return "Vui lòng đăng nhập để tiếp tục";
      case 429:
        return data?.message || "Hệ thống đang bận, vui lòng thử lại sau";
      case 503:
        return data?.message || "Hệ thống AI tạm thời không khả dụng";
      default:
        return data?.message || "Có lỗi xảy ra, vui lòng thử lại";
    }
  }

  return "Có lỗi không xác định";
};

export default handleApiError;
