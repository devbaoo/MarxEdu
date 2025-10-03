import React, { useMemo, useState } from "react";
import { Alert, Button, Form, Select, Space, Spin, Typography } from "antd";
import useMarxistTopics from "@/hooks/useMarxistTopics";
import { createCustomLesson } from "@/services/features/marxist/philosophyApi";
import { handleApiError } from "@/utils/errorHandler";
import { IGenerateMarxistPhilosophyLessonResponse } from "@/interfaces/IMarxist";

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

interface CustomLessonFormProps {
  onLessonCreated?: (data: IGenerateMarxistPhilosophyLessonResponse) => void;
  disabled?: boolean;
}

const difficultyOptions = [
  { value: 1, label: "1 - Rất dễ" },
  { value: 2, label: "2 - Dễ" },
  { value: 3, label: "3 - Trung bình" },
  { value: 4, label: "4 - Khó" },
  { value: 5, label: "5 - Rất khó" },
];

const CustomLessonForm: React.FC<CustomLessonFormProps> = ({
  onLessonCreated,
  disabled = false,
}) => {
  const {
    groupedTopics,
    loading: topicsLoading,
    error: topicError,
    refetch,
  } = useMarxistTopics();
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [difficulty, setDifficulty] = useState<number>(2);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const topicGroups = useMemo(
    () => Object.entries(groupedTopics),
    [groupedTopics]
  );

  const handleSubmit = async () => {
    if (!selectedTopic) {
      setFormError("Vui lòng chọn chủ đề");
      return;
    }

    console.log("🎯 [CUSTOM-FORM] Starting custom lesson creation:", {
      selectedTopic,
      difficulty,
    });
    setSubmitting(true);
    setFormError("");

    try {
      const response = await createCustomLesson(selectedTopic, difficulty);
      console.log("✅ [CUSTOM-FORM] Custom lesson API response:", response);

      if (response.success) {
        console.log("🎉 [CUSTOM-FORM] Calling onLessonCreated callback");
        onLessonCreated?.(response);
        setSelectedTopic("");
        setDifficulty(2);
      }
    } catch (error) {
      console.error("❌ [CUSTOM-FORM] Error creating custom lesson:", error);
      const message = handleApiError(error);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (topicsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Spin size="large" />
        <Text className="mt-4 text-gray-500">Đang tải danh sách chủ đề...</Text>
      </div>
    );
  }

  if (topicError) {
    return (
      <Alert
        type="error"
        message="Không thể tải danh sách chủ đề"
        description={
          <Space direction="vertical">
            <Text>{topicError}</Text>
            <Button type="primary" onClick={refetch}>
              Thử tải lại
            </Button>
          </Space>
        }
        showIcon
      />
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <Space direction="vertical" className="w-full" size="large">
        <div>
          <Title level={4} className="!mb-1 text-red-700">
            Tạo bài học tuỳ chọn
          </Title>
          <Text className="text-gray-600">
            Chọn chủ đề có sẵn và độ khó để AI tạo bài học phù hợp.
          </Text>
        </div>

        {formError && (
          <Alert
            type="error"
            message={formError}
            showIcon
            closable
            onClose={() => setFormError("")}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item label="Chủ đề" required>
            <Select
              placeholder="-- Chọn chủ đề --"
              value={selectedTopic || undefined}
              onChange={(value) => setSelectedTopic(value as string)}
              size="large"
              showSearch
              optionFilterProp="children"
              className="w-full">
              {topicGroups.map(([chapterKey, chapter]) => (
                <OptGroup key={chapterKey} label={chapter.title}>
                  {chapter.topics.map((topic) => (
                    <Option key={topic.key} value={topic.key}>
                      {topic.title}
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Độ khó">
            <Select
              value={difficulty}
              onChange={(value) => setDifficulty(Number(value))}
              size="large">
              {difficultyOptions.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            disabled={!topicGroups.length || disabled}
            className="bg-red-600 hover:bg-red-700">
            {submitting
              ? "Đang tạo bài học..."
              : disabled
              ? "Auto-generation đang chạy..."
              : "Tạo bài học"}
          </Button>
        </Form>
      </Space>
    </div>
  );
};

export default CustomLessonForm;
