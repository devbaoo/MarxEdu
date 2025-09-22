import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import { fetchSurveyStatus } from "../../services/features/survey/surveySlice";
import SurveyModal from "../Modal/SurveyModal";
import { Button } from "antd";
import { FormOutlined } from "@ant-design/icons";

// Định nghĩa keyframes cho animation
const pulseAnimation = `
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
    }
  }
`;

const SurveyButton: React.FC = () => {
    const dispatch = useAppDispatch();
    const { surveyStatus, submitSuccess } = useAppSelector((state) => state.survey);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        dispatch(fetchSurveyStatus());
    }, [dispatch]);

    useEffect(() => {
        if (surveyStatus && !surveyStatus.hasCompleted) {
            setShowButton(true);
        } else {
            setShowButton(false);
        }
    }, [surveyStatus]);

    // Kiểm tra lại trạng thái khi modal đóng
    useEffect(() => {
        if (!isModalOpen) {
            dispatch(fetchSurveyStatus());
        }
    }, [isModalOpen, dispatch]);

    // Ẩn nút khi gửi khảo sát thành công
    useEffect(() => {
        if (submitSuccess) {
            setShowButton(false);
            // Đóng modal sau khi hiển thị phần thưởng một lúc
            setTimeout(() => {
                setIsModalOpen(false);
            }, 3000);
        }
    }, [submitSuccess]);

    if (!showButton) return null;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: pulseAnimation }} />
            <Button
                type="primary"
                shape="circle"
                icon={<FormOutlined style={{ fontSize: 28 }} />}
                size="large"
                style={{
                    position: "fixed",
                    right: 24,
                    bottom: 94, // Đặt ở trên nút Gemini (56px + 14px khoảng cách)
                    zIndex: 1000,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    width: 56,
                    height: 56,
                    minWidth: 56,
                    minHeight: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    backgroundColor: "#f5222d", // Màu đỏ để nổi bật
                    borderColor: "#f5222d",
                }}
                onClick={() => setIsModalOpen(true)}
            />
            {/* Badge thông báo */}
            <div
                style={{
                    position: "fixed",
                    right: 18,
                    bottom: 134,
                    zIndex: 1001,
                    backgroundColor: "#ff4d4f",
                    color: "white",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: "bold",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    animation: "pulse 1.5s infinite"
                }}
            >
                !
            </div>
            <SurveyModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
        </>
    );
};

export default SurveyButton;
