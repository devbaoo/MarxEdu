import axiosInstance from "@/services/constant/axiosInstance";
import { GENERATE_CUSTOM_MARXIST_PHILOSOPHY_LESSON_ENDPOINT } from "@/services/constant/apiConfig";
import { IGenerateMarxistPhilosophyLessonResponse } from "@/interfaces/IMarxist";

export const createCustomLesson = async (
  topicKey: string,
  difficulty = 2
): Promise<IGenerateMarxistPhilosophyLessonResponse> => {
  try {
    const response = await axiosInstance.post<
      IGenerateMarxistPhilosophyLessonResponse
    >(GENERATE_CUSTOM_MARXIST_PHILOSOPHY_LESSON_ENDPOINT, {
      topicKey,
      difficulty,
    });

    return response.data;
  } catch (error) {
    // Allow caller to handle via custom error handler
    console.error("Lỗi khi tạo bài học tùy chọn:", error);
    throw error;
  }
};

export default createCustomLesson;
