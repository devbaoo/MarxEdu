import { useState, KeyboardEvent } from "react";
import { Tag } from "antd";
import { RetweetOutlined } from "@ant-design/icons";
import { IFlashcard } from "@/interfaces/IFlashcard";

interface FlashcardCardProps {
  flashcard: IFlashcard;
}

const baseCardClass =
  "absolute inset-0 rounded-3xl border p-6 flex flex-col gap-4 overflow-hidden [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

const FlashcardCard = ({ flashcard }: FlashcardCardProps) => {
  const [flipped, setFlipped] = useState(false);

  const toggleFlip = () => setFlipped((prev) => !prev);

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFlip();
    }
  };

  return (
    <div className="h-full [perspective:1200px]">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        onClick={toggleFlip}
        onKeyDown={handleKeyPress}
        className={`relative h-full min-h-[260px] w-full cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div
          className={`${baseCardClass} border-sky-200 bg-gradient-to-br from-sky-50/95 to-blue-100/80 text-slate-700 shadow-[0_18px_30px_-20px_rgba(59,130,246,0.45)] transition-opacity duration-300 ${
            flipped ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-2 text-sky-600 text-sm font-semibold">
            <RetweetOutlined />
            <span>Mặt trước</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <p className="text-lg font-semibold leading-relaxed whitespace-pre-line">
              {flashcard.front}
            </p>
          </div>

          <span className="text-xs font-medium text-slate-500">
            Nhấn để xem nội dung ghi nhớ
          </span>
        </div>

        <div
          className={`${baseCardClass} border-emerald-200 bg-gradient-to-br from-emerald-50/95 via-emerald-100/90 to-green-50/95 text-slate-800 shadow-[0_18px_30px_-20px_rgba(16,185,129,0.45)] [transform:rotateY(180deg)] transition-opacity duration-300 ${
            flipped ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
            <RetweetOutlined />
            <span>Mặt sau</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <p className="text-base leading-relaxed whitespace-pre-line">
              {flashcard.back || "Chưa có nội dung"}
            </p>
          </div>

          <div className="min-h-[28px]">
            {flashcard.tags && flashcard.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {flashcard.tags.map((tag) => (
                  <Tag key={`${flashcard.id}-${tag}`} color="green">
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500">Flashcard chưa có tag</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardCard;
