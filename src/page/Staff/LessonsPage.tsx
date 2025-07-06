import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Select,
  message,
  InputNumber,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { fetchLessons, createLesson, updateLesson, deleteLesson } from '@/services/features/lesson/lessonSlice';
import { fetchTopics } from '@/services/features/topic/topicSlice';
import { fetchLevels } from '@/services/features/level/levelSlice';
import { fetchSkills } from '@/services/features/skill/skillSlice';
import {
  ILesson,
  ISkill,
  LessonFormData,
  CreateLessonData
} from '@/interfaces/ILesson';
import { ColumnsType } from 'antd/es/table';

const LessonsPage = () => {
  const dispatch = useAppDispatch();
  const { lessons, loading, pagination } = useAppSelector((state) => state.lesson);
  const { topics } = useAppSelector((state) => state.topic);
  const { levels } = useAppSelector((state) => state.level);
  const { skills } = useAppSelector((state) => state.skill);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchLessons({ page: currentPage, limit: pageSize }));
    dispatch(fetchTopics());
    dispatch(fetchLevels());
    dispatch(fetchSkills());
  }, [dispatch, currentPage, pageSize]);

  // Convert ILearningPathItem[] to ILesson[]
  const convertedLessons: ILesson[] = lessons.map(lesson => ({
    _id: lesson.lessonId,
    title: lesson.title,
    type: "lesson",
    topic: {
      _id: "",
      name: lesson.topic,
      description: "",
      isActive: true,
      createdAt: "",
      __v: 0
    },
    level: {
      _id: "",
      name: lesson.level,
      maxScore: 100,
      timeLimit: 300,
      minUserLevel: 1,
      minLessonPassed: 0,
      minScoreRequired: 70,
      order: 1,
      isActive: true,
      createdAt: lesson.createdAt,
      __v: 0
    },
    skills: lesson.focusSkills.map(skill => ({
      _id: "",
      name: skill,
      description: "",
      supportedTypes: [],
      isActive: true,
      createdAt: "",
      __v: 0
    })),
    maxScore: 100,
    timeLimit: 300,
    questions: [],
    createdAt: lesson.createdAt,
    status: lesson.status === "ACTIVE" ? "LOCKED" : lesson.status
  }));

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteLesson(id)).unwrap();
      message.success('Xóa bài học thành công');
    } catch {
      message.error('Xóa bài học thất bại');
    }
  };

  const handleSubmit = async (values: LessonFormData) => {
    try {
      if (!values.topic || !values.level) {
        message.error("Please fill in all required fields");
        return;
      }

      const lessonData: CreateLessonData = {
        title: values.title,
        topic: values.topic,
        level: values.level,
        questions: values.questions.map(q => ({
          skill: q.skill,
          type: q.type,
          content: q.content,
          options: q.type === 'multiple_choice' ? q.options : undefined,
          correctAnswer: q.type === 'multiple_choice' ? q.correctAnswer : undefined,
          score: Number(q.score) || 0,
          timeLimit: Number(q.timeLimit) || 0,
          audioContent: undefined
        }))
      };


      if (editingLesson) {
        await dispatch(updateLesson({ id: editingLesson._id, data: lessonData })).unwrap();
        message.success("Lesson updated successfully");
      } else {
        await dispatch(createLesson(lessonData)).unwrap();
        message.success("Lesson created successfully");
      }

      // Refresh lessons data
      dispatch(fetchLessons({ page: currentPage, limit: pageSize }));
      setIsModalVisible(false);
      form.resetFields();
      setEditingLesson(null);
    } catch (error) {
      console.error("Error submitting lesson:", error);
      message.error("Failed to save lesson");
    }
  };

  const columns: ColumnsType<ILesson> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },

    {
      title: 'Chủ đề',
      dataIndex: ['topic', 'name'],
      key: 'topic',
    },
    {
      title: 'Cấp độ',
      dataIndex: ['level', 'name'],
      key: 'level',
    },
    {
      title: 'Kỹ năng',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: ISkill[]) => skills.map(skill => skill.name).join(', '),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: ILesson) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingLesson(record);
              // Ensure we're setting the correct data structure for the form
              const formData = {
                title: record.title,
                type: record.type,
                topic: record.topic?._id,
                level: record.level?._id,
                skills: record.skills?.map(skill => skill._id) || [],
                questions: record.questions?.map(q => ({
                  content: q.content,
                  options: q.options || [],
                  correctAnswer: q.correctAnswer,
                  score: q.score || 0,
                  timeLimit: q.timeLimit || 0,
                  skill: q.skill || record.skills?.[0]?._id || '',
                  type: q.type || 'multiple_choice'
                })) || []
              };
              form.setFieldsValue(formData);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Bạn chắc chắn muốn xóa bài học này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Quản lý Bài học</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingLesson(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm bài học
        </Button>
      </div>

      <Table<ILesson>
        columns={columns}
        dataSource={convertedLessons}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: pagination?.currentPage || 1,
          pageSize: pagination?.pageSize || 10,
          total: pagination?.totalItems || 0,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }
        }}
      />

      <Modal
        title={editingLesson ? 'Cập nhật bài học' : 'Thêm bài học'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="topic"
            label="Chủ đề"
            rules={[{ required: true, message: 'Vui lòng chọn chủ đề!' }]}
          >
            <Select>
              {topics.map((topic) => (
                <Select.Option key={topic._id} value={topic._id}>
                  {topic.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="level"
            label="Cấp độ"
            rules={[{ required: true, message: 'Vui lòng chọn cấp độ!' }]}
          >
            <Select>
              {levels.map((level) => (
                <Select.Option key={level._id} value={level._id}>
                  {level.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        label="Câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        label="Loại câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
                      >
                        <Select>
                          <Select.Option value="multiple_choice">Multiple Choice</Select.Option>
                          <Select.Option value="text_input">Text Input</Select.Option>
                          <Select.Option value="audio_input">Audio Input</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'skill']}
                        label="Kỹ năng"
                        rules={[{ required: true, message: 'Vui lòng chọn kỹ năng cho câu hỏi!' }]}
                      >
                        <Select>
                          {skills.map((skill) => (
                            <Select.Option key={skill._id} value={skill._id}>
                              {skill.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => {
                          return prevValues.questions?.[name]?.type !== currentValues.questions?.[name]?.type;
                        }}
                      >
                        {({ getFieldValue }) => {
                          const questionType = getFieldValue(['questions', name, 'type']);
                          if (questionType === 'multiple_choice') {
                            return (
                              <>
                                <Form.List name={[name, 'options']}>
                                  {(optionFields, { add: addOption }) => (
                                    <>
                                      {optionFields.map(({ name: optionName, ...restOptionField }) => (
                                        <Form.Item
                                          {...restOptionField}
                                          name={[optionName]}
                                          label={`Lựa chọn ${optionName + 1}`}
                                          rules={[{ required: true, message: 'Vui lòng nhập lựa chọn!' }]}
                                        >
                                          <Input />
                                        </Form.Item>
                                      ))}
                                      <Button type="dashed" onClick={() => addOption()} block>
                                        Thêm lựa chọn
                                      </Button>
                                    </>
                                  )}
                                </Form.List>

                                <Form.Item
                                  {...restField}
                                  name={[name, 'correctAnswer']}
                                  label="Đáp án đúng"
                                  rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng!' }]}
                                >
                                  <Input />
                                </Form.Item>
                              </>
                            );
                          }
                          return null;
                        }}
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'score']}
                        label="Điểm"
                        rules={[{ required: true, message: 'Vui lòng nhập điểm!' }]}
                      >
                        <InputNumber min={0} />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'timeLimit']}
                        label="Thời gian làm bài (giây)"
                        rules={[{ required: true, message: 'Vui lòng nhập thời gian làm bài!' }]}
                      >
                        <InputNumber min={0} />
                      </Form.Item>

                      <Button type="link" danger onClick={() => remove(name)}>
                        Xóa câu hỏi
                      </Button>
                    </Space>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Thêm câu hỏi
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingLesson ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LessonsPage;
