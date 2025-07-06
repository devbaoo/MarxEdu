import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  chooseTopics,
  fetchTopics,
} from "@/services/features/topic/topicSlice";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { BookOutlined } from "@ant-design/icons";

const TopicForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (profile?.level && profile?.preferredSkills && profile.preferredSkills.length > 0) {
      navigate("/learn");
      return;
    }
    dispatch(fetchTopics());
  }, [dispatch, profile, navigate]);

  const { topics } = useAppSelector((state) => state.topic);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleNext = async () => {
    const selectedTopicIds = selectedIndexes.map((i) => topics[i].name);
    try {
      await dispatch(chooseTopics(selectedTopicIds)).unwrap();
      navigate("/choose-level");
    } catch {
      // console.error("Failed to choose topics:", error);
      alert("Có lỗi xảy ra khi lưu lựa chọn. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <main className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 py-8 sm:py-0 h-auto sm:h-screen max-w-[988px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 font-baloo">
            Chọn Chủ Đề Bạn Muốn Học
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-baloo px-2">
            Hãy chọn những chủ đề bạn quan tâm để MarxEdu cá nhân hóa trải nghiệm học tập cho bạn!
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
          {topics.map((topic, index) => {
            const isSelected = selectedIndexes.includes(index);
            return (
              <div
                key={topic._id}
                onClick={() => toggleSelect(index)}
                className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${isSelected
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg"
                    : "bg-white hover:bg-red-50 text-gray-800 shadow-md"
                  } rounded-2xl p-4 sm:p-6 border-2 ${isSelected ? "border-red-600" : "border-transparent"}`}
              >
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className={`p-3 sm:p-4 rounded-full ${isSelected ? "bg-white/20" : "bg-red-100"}`}>
                    <BookOutlined className="text-xl sm:text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold font-baloo">{topic.name}</h3>
                    <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-80 font-baloo">
                      {topic.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Button */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={handleNext}
            disabled={selectedIndexes.length === 0}
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold font-baloo transition-all duration-300 transform hover:scale-105
              ${selectedIndexes.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl"
              }`}
          >
            {selectedIndexes.length === 0 ? "Chọn ít nhất một chủ đề" : "Tiếp tục"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TopicForm;
