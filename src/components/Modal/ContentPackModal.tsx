import React from "react";
import { Modal, Typography, List, Tag, Button, Divider } from "antd";
import { IContentPack } from "@/interfaces/IMarxist";

const { Title, Text, Paragraph } = Typography;

interface ContentPackModalProps {
  open: boolean;
  loading?: boolean;
  content?: IContentPack | null;
  onClose: () => void;
  onConfirmStudyDone: () => void;
}

const ContentPackModal: React.FC<ContentPackModalProps> = ({
  open,
  loading = false,
  content,
  onClose,
  onConfirmStudyDone,
}) => {
  return (
    <Modal
      open={open}
      width={920}
      title={<span>📘 Học liệu ôn tập trước khi làm 10 câu</span>}
      onCancel={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose}>Để sau</Button>
          <Button type="primary" loading={loading} onClick={onConfirmStudyDone}>
            Tôi đã học xong • Bắt đầu 10 câu ôn tập
          </Button>
        </div>
      }
    >
      {content ? (
        <div>
          <Title level={4} className="mb-2">
            {content.title}
          </Title>
          {content.summary && (
            <Paragraph className="text-gray-700">{content.summary}</Paragraph>
          )}

          {Array.isArray(content.keyPoints) && content.keyPoints.length > 0 && (
            <div className="mb-4">
              <Title level={5}>🔑 Key Points</Title>
              <List
                dataSource={content.keyPoints}
                renderItem={(kp) => <List.Item>- {kp}</List.Item>}
                size="small"
              />
            </div>
          )}

          {Array.isArray(content.slideOutline) &&
            content.slideOutline.length > 0 && (
              <div className="mb-4">
                <Title level={5}>🗂️ Slide digest</Title>
                <List
                  dataSource={content.slideOutline}
                  renderItem={(item, idx) => (
                    <List.Item>
                      Slide {idx + 1}: {item}
                    </List.Item>
                  )}
                  size="small"
                />
              </div>
            )}

          {Array.isArray(content.flashcards) &&
            content.flashcards.length > 0 && (
              <div className="mb-4">
                <Title level={5}>🧠 Flashcards</Title>
                <List
                  dataSource={content.flashcards.slice(0, 6)}
                  renderItem={(fc) => (
                    <List.Item>
                      <div>
                        <Text strong>{fc.term}</Text>
                        <div className="text-gray-700">{fc.definition}</div>
                        {fc.tags && fc.tags.length > 0 && (
                          <div className="mt-1 flex gap-1 flex-wrap">
                            {fc.tags.slice(0, 4).map((t) => (
                              <Tag key={t}>{t}</Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                  size="small"
                />
              </div>
            )}

          <Divider />
          <Text type="secondary">
            Thời gian đọc đề xuất: {content.readingTime || 5} phút
          </Text>
        </div>
      ) : (
        <Text type="secondary">Đang tải học liệu...</Text>
      )}
    </Modal>
  );
};

export default ContentPackModal;
