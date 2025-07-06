import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AppDispatch, RootState } from '@/services/store/store';
import { fetchLevels, createLevel, updateLevel, deleteLevel, Level } from '@/services/features/level/levelSlice';

const LevelsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { levels, loading } = useSelector((state: RootState) => state.level);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [shouldReload, setShouldReload] = useState(false);

  useEffect(() => {
    dispatch(fetchLevels());
  }, [dispatch]);

  useEffect(() => {
    if (shouldReload) {
      dispatch(fetchLevels());
      setShouldReload(false);
    }
  }, [shouldReload, dispatch]);

  const showModal = (level?: Level) => {
    if (level) {
      setEditingLevel(level);
      form.setFieldsValue(level);
    } else {
      setEditingLevel(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingLevel(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingLevel) {
        await dispatch(updateLevel({ levelId: editingLevel._id, updatedLevel: values })).unwrap();
        message.success('Level updated successfully');
      } else {
        await dispatch(createLevel(values)).unwrap();
        message.success('Level created successfully');
      }
      handleCancel();
    } catch {
      message.error('Failed to save level');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteLevel(id)).unwrap();
      message.success('Level deleted successfully');
    } catch {
      message.error('Failed to delete level');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Max Score',
      dataIndex: 'maxScore',
      key: 'maxScore',
    },
    {
      title: 'Time Limit (seconds)',
      dataIndex: 'timeLimit',
      key: 'timeLimit',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Level) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Levels Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add New Level
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={levels}
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title={editingLevel ? 'Edit Level' : 'Create New Level'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: '',
            maxScore: 100,
            timeLimit: 300,
            minUserLevel: 1,
            minLessonPassed: 0,
            minScoreRequired: 0,
            order: 1,
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input level name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="maxScore"
            label="Max Score"
            rules={[{ required: true, message: 'Please input max score!' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="timeLimit"
            label="Time Limit (seconds)"
            rules={[{ required: true, message: 'Please input time limit!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="minUserLevel"
            label="Min User Level"
            rules={[{ required: true, message: 'Please input min user level!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="minLessonPassed"
            label="Min Lesson Passed"
            rules={[{ required: true, message: 'Please input min lesson passed!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="minScoreRequired"
            label="Min Score Required"
            rules={[{ required: true, message: 'Please input min score required!' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="order"
            label="Order"
            rules={[{ required: true, message: 'Please input order!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LevelsPage; 
