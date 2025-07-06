import {
  chooseLevels,
  fetchLevels,
} from "@/services/features/level/levelSlice";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { useEffect, useState } from "react";
import { FaSignal, FaStar, FaCrown, FaRocket, FaGraduationCap, FaAward } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LevelForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile } = useAppSelector((state) => state.user);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { levels } = useAppSelector((state) => state.level);

  useEffect(() => {
    // If user has completed all selections, redirect to learn page
    if (profile?.level && profile?.preferredSkills && profile.preferredSkills.length > 0) {
      navigate("/learn");
      return;
    }
    dispatch(fetchLevels());
  }, [dispatch, profile, navigate]);

  const getLevelIcon = (levelName: string) => {
    const name = levelName.toLowerCase();
    if (name.includes("beginner")) return <FaStar className="text-2xl" />;
    if (name.includes("intermediate")) return <FaSignal className="text-2xl" />;
    if (name.includes("advanced")) return <FaCrown className="text-2xl" />;
    if (name.includes("proficient")) return <FaGraduationCap className="text-2xl" />;
    if (name.includes("expert")) return <FaAward className="text-2xl" />;
    return <FaRocket className="text-2xl" />;
  };

  const handleNext = () => {
    if (selectedIndex !== null && levels[selectedIndex]) {
      const selectedLevelName = levels[selectedIndex].name;
      dispatch(chooseLevels(selectedLevelName))
        .unwrap()
        .then(() => navigate("/choose-skill"))
        .catch((error) => alert(error.message));
    } else {
      alert("Vui lòng chọn cấp độ hợp lệ.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <main className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 py-8 sm:py-0 h-auto sm:h-screen max-w-[988px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 font-baloo">
            Chọn Trình Độ Của Bạn
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-baloo px-2">
            Hãy chọn trình độ phù hợp với khả năng hiện tại của bạn để chúng tôi có thể tạo ra lộ trình học tập tốt nhất
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
          {levels.map((level, index) => {
            const isSelected = selectedIndex === index;
            return (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${isSelected
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg"
                    : "bg-white hover:bg-red-50 text-gray-800 shadow-md"
                  } rounded-2xl p-4 sm:p-6 md:p-8 border-2 ${isSelected ? "border-red-600" : "border-transparent"}`}
              >
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className={`p-3 sm:p-4 rounded-full ${isSelected ? "bg-white/20" : "bg-red-100"}`}>
                    {getLevelIcon(level.name)}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold font-baloo">{level.name}</h3>
                    <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-80 font-baloo">
                      {level.name.toLowerCase().includes("beginner")
                        ? "Dành cho người mới bắt đầu học ngôn ngữ"
                        : level.name.toLowerCase().includes("intermediate")
                          ? "Dành cho người đã có kiến thức cơ bản"
                          : "Dành cho người đã thành thạo và muốn nâng cao"}
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
            disabled={selectedIndex === null}
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold font-baloo transition-all duration-300 transform hover:scale-105
              ${selectedIndex === null
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl"
              }`}
          >
            {selectedIndex === null ? "Vui lòng chọn trình độ" : "Tiếp tục"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default LevelForm;
