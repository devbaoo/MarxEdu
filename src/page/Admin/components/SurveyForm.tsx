import React, { useEffect } from "react";
import {
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    Space,
    Divider,
    notification,
    Spin,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../services/store/store";
import {
    createSurvey,
    resetCreateStatus,
} from "../../../services/features/admin/adminSurveySlice";
import { ICreateSurvey } from "../../../interfaces/ISurvey";

const { Option } = Select;
const { TextArea } = Input;

interface SurveyFormProps {
    onCancel: () => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onCancel }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { loading, error, createSuccess } = useAppSelector(
        (state) => state.adminSurvey
    );

    useEffect(() => {
        if (createSuccess) {
            notification.success({
                message: "Thành công",
                description: "Tạo khảo sát mới thành công",
            });
            form.resetFields();
            dispatch(resetCreateStatus());
            onCancel();
        }
    }, [createSuccess, dispatch, form, onCancel]);

    useEffect(() => {
        if (error) {
            notification.error({
                message: "Lỗi",
                description: error,
            });
            dispatch(resetCreateStatus());
        }
    }, [error, dispatch]);

    const onFinish = (values: any) => {
        const formattedQuestions = values.questions.map((q: any, index: number) => ({
            ...q,
            order: index + 1,
            options: q.questionType === "multiple_choice" ? q.options : [],
        }));

        const surveyData: ICreateSurvey = {
            title: values.title,
            description: values.description,
            questions: formattedQuestions,
            reward: {
                xp: values.xp,
                points: values.points,
            },
        };

        dispatch(createSurvey(surveyData));
    };

    const handleQuestionTypeChange = (value: string, index: number) => {
        const questions = form.getFieldValue("questions");
        if (value !== "multiple_choice") {
            // Nếu không phải multiple_choice, xóa options
            questions[index].options = [];
        } else if (!questions[index].options) {
            // Nếu là multiple_choice nhưng chưa có options, khởi tạo mảng rỗng
            questions[index].options = [];
        }
        form.setFieldsValue({ questions });
    };

    return (
        <Spin spinning={loading}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    title: "Khảo sát trải nghiệm người dùng",
                    description: "Giúp chúng tôi cải thiện ứng dụng",
                    questions: [
                        {
                            questionText: "Bạn thấy ứng dụng như thế nào?",
                            questionType: "rating",
                            required: true,
                        },
                    ],
                    xp: 100,
                    points: 200,
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Form.Item
                            name="title"
                            label="Tiêu đề khảo sát"
                            rules={[
                                { required: true, message: "Vui lòng nhập tiêu đề khảo sát" },
                            ]}
                        >
                            <Input placeholder="Nhập tiêu đề khảo sát" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả khảo sát"
                            rules={[
                                { required: true, message: "Vui lòng nhập mô tả khảo sát" },
                            ]}
                        >
                            <TextArea
                                placeholder="Nhập mô tả khảo sát"
                                rows={4}
                                maxLength={200}
                                showCount
                            />
                        </Form.Item>
                    </div>

                    <div>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="font-medium text-gray-700 mb-2">Phần thưởng</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="xp"
                                    label="XP"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số XP" },
                                        { type: "number", min: 0, message: "XP phải lớn hơn 0" },
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="Nhập XP"
                                        style={{ width: "100%" }}
                                        min={0}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="points"
                                    label="Điểm"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số điểm" },
                                        { type: "number", min: 0, message: "Điểm phải lớn hơn 0" },
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="Nhập điểm"
                                        style={{ width: "100%" }}
                                        min={0}
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                </div>

                <Divider orientation="left">Câu hỏi khảo sát</Divider>

                <Form.List
                    name="questions"
                    rules={[
                        {
                            validator: async (_, questions) => {
                                if (!questions || questions.length < 1) {
                                    return Promise.reject(
                                        new Error("Vui lòng thêm ít nhất một câu hỏi")
                                    );
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map((field, index) => (
                                <div
                                    key={field.key}
                                    className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium">Câu hỏi {index + 1}</h3>
                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(field.name)}
                                            >
                                                Xóa
                                            </Button>
                                        )}
                                    </div>

                                    <Form.Item
                                        {...field}
                                        name={[field.name, "questionText"]}
                                        label="Nội dung câu hỏi"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Vui lòng nhập nội dung câu hỏi",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nhập nội dung câu hỏi" />
                                    </Form.Item>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Form.Item
                                            {...field}
                                            name={[field.name, "questionType"]}
                                            label="Loại câu hỏi"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Vui lòng chọn loại câu hỏi",
                                                },
                                            ]}
                                        >
                                            <Select
                                                placeholder="Chọn loại câu hỏi"
                                                onChange={(value) =>
                                                    handleQuestionTypeChange(value, field.name)
                                                }
                                            >
                                                <Option value="rating">Đánh giá (1-5 sao)</Option>
                                                <Option value="multiple_choice">Trắc nghiệm</Option>
                                                <Option value="text">Văn bản</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...field}
                                            name={[field.name, "required"]}
                                            label="Bắt buộc"
                                            valuePropName="checked"
                                        >
                                            <Select>
                                                <Option value={true}>Có</Option>
                                                <Option value={false}>Không</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => {
                                            return (
                                                prevValues.questions?.[field.name]?.questionType !==
                                                currentValues.questions?.[field.name]?.questionType
                                            );
                                        }}
                                    >
                                        {({ getFieldValue }) => {
                                            const questionType = getFieldValue([
                                                "questions",
                                                field.name,
                                                "questionType",
                                            ]);

                                            if (questionType !== "multiple_choice") {
                                                return null;
                                            }

                                            return (
                                                <Form.List name={[field.name, "options"]}>
                                                    {(optionFields, { add: addOption, remove: removeOption }) => (
                                                        <div className="bg-white p-3 rounded-md border border-gray-100">
                                                            <div className="mb-2 font-medium text-gray-700">
                                                                Các lựa chọn
                                                            </div>
                                                            {optionFields.map((optionField) => (
                                                                <div
                                                                    key={optionField.key}
                                                                    className="flex items-center mb-2"
                                                                >
                                                                    <Form.Item
                                                                        {...optionField}
                                                                        noStyle
                                                                        rules={[
                                                                            {
                                                                                required: true,
                                                                                message: "Vui lòng nhập lựa chọn",
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Input
                                                                            placeholder={`Lựa chọn ${optionField.name + 1
                                                                                }`}
                                                                            style={{ width: "calc(100% - 32px)" }}
                                                                        />
                                                                    </Form.Item>
                                                                    <MinusCircleOutlined
                                                                        className="ml-2 text-red-500"
                                                                        onClick={() => removeOption(optionField.name)}
                                                                    />
                                                                </div>
                                                            ))}
                                                            <Button
                                                                type="dashed"
                                                                onClick={() => addOption()}
                                                                block
                                                                icon={<PlusOutlined />}
                                                            >
                                                                Thêm lựa chọn
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Form.List>
                                            );
                                        }}
                                    </Form.Item>
                                </div>
                            ))}

                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() =>
                                        add({
                                            questionText: "",
                                            questionType: "text",
                                            required: true,
                                            options: [],
                                        })
                                    }
                                    block
                                    icon={<PlusOutlined />}
                                >
                                    Thêm câu hỏi
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Divider />

                <Form.Item>
                    <Space className="w-full justify-end">
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" className="bg-blue-600">
                            Tạo khảo sát
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Spin>
    );
};

export default SurveyForm;
