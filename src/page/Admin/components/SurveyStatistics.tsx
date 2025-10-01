import React from "react";
import { ISurveyStatistics } from "../../../interfaces/ISurvey";
import { Card, Progress, Divider, Empty, Table, Tag, Typography } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const { Title, Text } = Typography;

interface SurveyStatisticsProps {
    statistics: ISurveyStatistics;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const SurveyStatistics: React.FC<SurveyStatisticsProps> = ({ statistics }) => {
    const formatPercentage = (value: number | undefined) => {
        if (typeof value !== "number" || Number.isNaN(value)) {
            return "0%";
        }
        const normalizedValue = value > 0 && value <= 1 ? value * 100 : value;
        const rounded = Number(
            normalizedValue.toFixed(normalizedValue % 1 === 0 ? 0 : 1)
        );
        return `${rounded}%`;
    };

    const renderPieLegendItems = (data: Array<{ name: string; value: number; percentage?: number }>) => (
        <div className="w-full">
            <div className="space-y-2">
                {data.map((item, index) => {
                    const percentValue =
                        typeof item.percentage === "number" ? item.percentage : 0;

                    return (
                        <div
                            key={`${item.name}-${index}`}
                            className="flex flex-col gap-1 rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm"
                        >
                            <div className="flex items-center gap-2 text-gray-700">
                                <span
                                    className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="font-medium leading-tight">
                                    {item.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{item.value} người</span>
                                <span className="font-semibold text-gray-800">
                                    {formatPercentage(percentValue)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderRatingQuestion = (question: any) => {
        const data = question.ratingDistribution.map((item: any) => ({
            name: `${item.rating} sao`,
            value: item.count,
            percentage: item.percentage,
        }));

        return (
            <div className="mb-8">
                <div className="mb-4">
                    <Title level={5}>{question.questionText}</Title>
                    <div className="flex items-center">
                        <Text type="secondary">Đánh giá trung bình:</Text>
                        <Text strong className="ml-2 text-lg">
                            {question.averageRating.toFixed(1)}
                        </Text>
                        <div className="ml-2 flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`text-xl ${star <= Math.round(question.averageRating)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data} layout="vertical">
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={60} />
                                <Tooltip
                                    formatter={(value: any) => [`${value} người`, "Số lượng"]}
                                />
                                <Bar dataKey="value" fill="#8884d8">
                                    {data.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {data.map((_: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => [`${value} người`, "Số lượng"]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2">
                                {renderPieLegendItems(data)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    {question.ratingDistribution.map((item: any) => (
                        <div key={item.rating} className="mb-2">
                            <div className="flex justify-between mb-1">
                                <span>{item.rating} sao</span>
                                <span>
                                    {item.count} người ({item.percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <Progress
                                percent={item.percentage}
                                showInfo={false}
                                strokeColor={COLORS[(item.rating - 1) % COLORS.length]}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderMultipleChoiceQuestion = (question: any) => {
        const data = question.options.map((item: any) => ({
            name: item.option,
            value: item.count,
            percentage: item.percentage,
        }));

        return (
            <div className="mb-8">
                <Title level={5}>{question.questionText}</Title>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: any) => [`${value} người`, "Số lượng"]}
                                />
                                <Bar dataKey="value" fill="#8884d8">
                                    {data.map((_: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {data.map((_: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => [`${value} người`, "Số lượng"]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2">
                                {renderPieLegendItems(data)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    {question.options.map((item: any, index: number) => (
                        <div key={index} className="mb-2">
                            <div className="flex justify-between mb-1">
                                <span>{item.option}</span>
                                <span>
                                    {item.count} người ({item.percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <Progress
                                percent={item.percentage}
                                showInfo={false}
                                strokeColor={COLORS[index % COLORS.length]}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTextQuestion = (question: any) => {
        const columns = [
            {
                title: "STT",
                dataIndex: "index",
                key: "index",
                width: 80,
            },
            {
                title: "Phản hồi",
                dataIndex: "response",
                key: "response",
            },
        ];

        const data = question.textResponses.map((text: string, index: number) => ({
            key: index,
            index: index + 1,
            response: text,
        }));

        return (
            <div className="mb-8">
                <Title level={5}>{question.questionText}</Title>
                {data.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={data}
                        pagination={{ pageSize: 5 }}
                        className="mt-4"
                    />
                ) : (
                    <Empty description="Chưa có phản hồi nào" />
                )}
            </div>
        );
    };

    return (
        <div className="survey-statistics">
            <div className="mb-6">
                <Card className="text-center mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Title level={4}>{statistics.totalResponses}</Title>
                            <Text type="secondary">Tổng số phản hồi</Text>
                        </div>
                        <div>
                            <Title level={4}>{statistics.surveyVersion}</Title>
                            <Text type="secondary">Phiên bản khảo sát</Text>
                        </div>
                        <div>
                            <Tag color={statistics.totalResponses > 0 ? "green" : "orange"} className="px-3 py-1 text-sm">
                                {statistics.totalResponses > 0 ? "Có dữ liệu" : "Chưa có phản hồi"}
                            </Tag>
                        </div>
                    </div>
                </Card>
            </div>

            {statistics.totalResponses === 0 ? (
                <Empty
                    description="Chưa có phản hồi nào cho khảo sát này"
                    className="py-10"
                />
            ) : (
                <div>
                    {statistics.questions.map((question) => (
                        <div key={question.questionId}>
                            <Divider />
                            {question.questionType === "rating" && renderRatingQuestion(question)}
                            {question.questionType === "multiple_choice" &&
                                renderMultipleChoiceQuestion(question)}
                            {question.questionType === "text" && renderTextQuestion(question)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SurveyStatistics;
