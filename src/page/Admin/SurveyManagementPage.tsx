import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import { getSurveyStatistics } from "../../services/features/admin/adminSurveySlice";
import { Tabs, Card, Spin, Alert, Button } from "antd";
import SurveyForm from "./components/SurveyForm";
import SurveyStatistics from "./components/SurveyStatistics";

const { TabPane } = Tabs;

const SurveyManagementPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { statistics, statisticsLoading, statisticsError } = useAppSelector(
        (state) => state.adminSurvey
    );
    const [activeTab, setActiveTab] = useState("1");
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        if (activeTab === "2") {
            dispatch(getSurveyStatistics());
        }
    }, [dispatch, activeTab]);

    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý khảo sát</h1>
                {activeTab === "1" && !isFormVisible && (
                    <Button
                        type="primary"
                        onClick={() => setIsFormVisible(true)}
                        className="bg-blue-600"
                    >
                        Tạo khảo sát mới
                    </Button>
                )}
            </div>

            {isFormVisible ? (
                <div className="mb-6">
                    <Card title="Tạo khảo sát mới" className="shadow-md">
                        <SurveyForm onCancel={() => setIsFormVisible(false)} />
                    </Card>
                </div>
            ) : (
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    <TabPane tab="Quản lý khảo sát" key="1">
                        <Card className="shadow-md">
                            <div className="p-4">
                                <h2 className="text-lg font-semibold mb-4">Khảo sát hiện tại</h2>
                                <p className="text-gray-600 mb-4">
                                    Hệ thống hiện tại chỉ hỗ trợ một khảo sát hoạt động tại một thời điểm.
                                    Khi bạn tạo một khảo sát mới, khảo sát cũ sẽ bị vô hiệu hóa.
                                </p>
                                <div className="flex justify-center">
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => setIsFormVisible(true)}
                                        className="bg-blue-600"
                                    >
                                        Tạo khảo sát mới
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabPane>
                    <TabPane tab="Thống kê phản hồi" key="2">
                        <Card className="shadow-md">
                            {statisticsLoading ? (
                                <div className="flex justify-center py-10">
                                    <Spin size="large" />
                                </div>
                            ) : statisticsError ? (
                                <Alert
                                    message="Lỗi"
                                    description={statisticsError}
                                    type="error"
                                    showIcon
                                />
                            ) : statistics ? (
                                <SurveyStatistics statistics={statistics} />
                            ) : (
                                <Alert
                                    message="Không có dữ liệu"
                                    description="Chưa có thông tin thống kê khảo sát"
                                    type="info"
                                    showIcon
                                />
                            )}
                        </Card>
                    </TabPane>
                </Tabs>
            )}
        </div>
    );
};

export default SurveyManagementPage;
