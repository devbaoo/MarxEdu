import React, { useEffect, useMemo, useState } from "react";
import { Modal, Typography, List, Button, Divider } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import FlashcardCard from "@/components/Flashcard/FlashcardCard";
import { IFlashcard } from "@/interfaces/IFlashcard";
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
  const previewFlashcards: IFlashcard[] = useMemo(() => {
    if (!Array.isArray(content?.flashcards)) {
      return [];
    }

    return content.flashcards.slice(0, 6).map((fc, idx) => {
      const back = [fc.definition, fc.example && `Ví dụ: ${fc.example}`]
        .filter(Boolean)
        .join("\n\n");

      return {
        id: `content-pack-${idx}-${fc.term || idx}`,
        front: fc.term?.trim() || "Flashcard",
        back: back || "Chưa có nội dung",
        tags: fc.tags ?? [],
      };
    });
  }, [content?.flashcards]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [previewFlashcards.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      Math.min(prev + 1, Math.max(previewFlashcards.length - 1, 0))
    );
  };

  const activeFlashcard = previewFlashcards[activeIndex];

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

          {activeFlashcard && (
            <div className="mb-4">
              <Title level={5}>🧠 Flashcards</Title>
              <div className="space-y-3">
                <div className="min-h-[260px]">
                  <FlashcardCard flashcard={activeFlashcard} />
                </div>

                <div className="flex items-center justify-between">
                  <Text type="secondary">
                    Flashcard {activeIndex + 1}/{previewFlashcards.length}
                  </Text>
                  <div className="flex gap-2">
                    <Button
                      icon={<LeftOutlined />}
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                    >
                      Trước
                    </Button>
                    <Button
                      icon={<RightOutlined />}
                      onClick={handleNext}
                      disabled={activeIndex >= previewFlashcards.length - 1}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </div>
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
