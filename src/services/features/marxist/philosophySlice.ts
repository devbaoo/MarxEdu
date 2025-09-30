import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "@/services/constant/axiosInstance";
import {
  GENERATE_MARXIST_PHILOSOPHY_LESSON_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_LEARNING_PATH_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_LESSON_BY_PATH_ENDPOINT,
  COMPLETE_MARXIST_PHILOSOPHY_LESSON_ENDPOINT,
  RETRY_MARXIST_PHILOSOPHY_LESSON_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_STATS_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_TOPICS_ENDPOINT,
  ANALYZE_MARXIST_PHILOSOPHY_PROGRESS_ENDPOINT,
  TEST_MARXIST_PHILOSOPHY_CONNECTION_ENDPOINT,
  TEST_MARXIST_PHILOSOPHY_GEMINI_ENDPOINT,
  GENERATE_CONTENT_PACK_ENDPOINT,
  GET_LATEST_CONTENT_PACK_ENDPOINT,
  GENERATE_LESSON_FROM_CONTENT_ENDPOINT,
  CREATE_MARXIST_PHILOSOPHY_TOPIC_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_TOPICS_LIST_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_TOPIC_BY_ID_ENDPOINT,
  UPDATE_MARXIST_PHILOSOPHY_TOPIC_ENDPOINT,
  DELETE_MARXIST_PHILOSOPHY_TOPIC_ENDPOINT,
  SEED_MARXIST_PHILOSOPHY_TOPICS_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_GENERATION_STATS_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_MULTI_AI_STATS_ENDPOINT,
  GET_MARXIST_PHILOSOPHY_RATE_LIMITER_STATS_ENDPOINT,
} from "@/services/constant/apiConfig";
import {
  IMarxistPhilosophyTopic,
  IMarxistPhilosophyLearningPath,
  IMarxistPhilosophyStats,
  IGenerateMarxistPhilosophyLessonOptions,
  IGenerateMarxistPhilosophyLessonResponse,
  IMarxistPhilosophyLearningPathResponse,
  IMarxistPhilosophyStatsResponse,
  ICompleteMarxistPhilosophyLessonData,
  ICompleteMarxistPhilosophyLessonResponse,
  ICreateMarxistPhilosophyTopicData,
  IUpdateMarxistPhilosophyTopicData,
  IGenerateContentPackPayload,
  IGenerateContentPackResponse,
  IGenerateLessonFromContentPayload,
  IContentPack,
} from "@/interfaces/IMarxist";
import { ILesson } from "@/interfaces/ILesson";

interface PhilosophyState {
  loading: boolean;
  error: string | null;
  success: string | null;
  learningPath: IMarxistPhilosophyLearningPath[];
  currentLesson: ILesson | null;
  stats: IMarxistPhilosophyStats | null;
  topics: IMarxistPhilosophyTopic[];
  // Pre-study content
  contentPack: IContentPack | null;
  progressAnalysis: unknown;
  geminiConnected: boolean;
  // Multi-AI status
  multiAI: {
    connected: boolean;
    providers: {
      gemini: boolean;
      grok: boolean;
    };
    lastTest?: string;
    loadBalancerStats?: {
      providers: Array<{
        name: string;
        priority: number;
        weight: number;
        maxConcurrent: number;
        currentLoad: number;
        failures: number;
        lastUsed: number;
      }>;
      timestamp: number;
    };
  };
}

const initialState: PhilosophyState = {
  loading: false,
  error: null,
  success: null,
  learningPath: [],
  currentLesson: null,
  stats: null,
  topics: [],
  contentPack: null,
  progressAnalysis: null,
  geminiConnected: false,
  multiAI: {
    connected: false,
    providers: {
      gemini: false,
      grok: false,
    },
    lastTest: undefined,
    loadBalancerStats: undefined,
  },
};

// 🚀 Generate Marxist Philosophy Lesson
export const generateMarxistPhilosophyLesson = createAsyncThunk(
  "philosophy/generateLesson",
  async (
    options: IGenerateMarxistPhilosophyLessonOptions = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        GENERATE_MARXIST_PHILOSOPHY_LESSON_ENDPOINT,
        options
      );
      return response.data as IGenerateMarxistPhilosophyLessonResponse;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;

        // Handle specific validation errors from enhanced BE
        if (errorData?.error === "ANSWER_CONCENTRATION_FAILED") {
          return rejectWithValue({
            statusCode: errorData.statusCode || 400,
            message:
              errorData.message || "AI generated poor answer distribution",
            error: "ANSWER_CONCENTRATION_FAILED",
            concentrationIssues: errorData.concentrationIssues,
            retryable: errorData.retryable || true,
          });
        }

        if (errorData?.error === "AI_GENERATION_FAILED") {
          return rejectWithValue({
            statusCode: errorData.statusCode || 503,
            message: errorData.message || "All AI providers failed",
            error: "AI_GENERATION_FAILED",
            retryable: errorData.retryable || true,
          });
        }

        if (errorData?.statusCode === 429) {
          // Background generation in progress
          return rejectWithValue({
            statusCode: 429,
            message:
              errorData.message ||
              "Hệ thống đang tạo bài học tự động, vui lòng chờ...",
          });
        }

        return rejectWithValue({
          statusCode: error.response?.status || 500,
          message:
            errorData?.message || error.message || "Failed to generate lesson",
          error: errorData?.error,
          retryable: errorData?.retryable,
        });
      }
      return rejectWithValue({
        statusCode: 500,
        message: "Unknown error occurred",
      });
    }
  }
);

// 📚 Get Marxist Philosophy Learning Path
export const getMarxistPhilosophyLearningPath = createAsyncThunk(
  "philosophy/getLearningPath",
  async (params: { page?: number; limit?: number } = {}) => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_LEARNING_PATH_ENDPOINT,
      { params }
    );
    return response.data as IMarxistPhilosophyLearningPathResponse;
  }
);

// 📖 Get Marxist Philosophy Lesson by Path
export const getMarxistPhilosophyLessonByPath = createAsyncThunk(
  "philosophy/getLessonByPath",
  async (pathId: string) => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_LESSON_BY_PATH_ENDPOINT(pathId)
    );
    return response.data;
  }
);

// ✅ Complete Marxist Philosophy Lesson
export const completeMarxistPhilosophyLesson = createAsyncThunk(
  "philosophy/completeLesson",
  async (data: ICompleteMarxistPhilosophyLessonData, { rejectWithValue }) => {
    try {
      console.log("🎯 Completing Marxist Philosophy lesson:", data);

      const response = await axiosInstance.post(
        COMPLETE_MARXIST_PHILOSOPHY_LESSON_ENDPOINT,
        data
      );
      console.log("✅ Complete lesson response:", response.data);

      return response.data as ICompleteMarxistPhilosophyLessonResponse;
    } catch (error: unknown) {
      console.error("❌ Complete Marxist Philosophy lesson error:", error);

      // Better error handling for different error types
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Network error occurred";
        console.error("API Error Details:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
        return rejectWithValue(errorMessage);
      } else if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

// 🔄 Retry Marxist Philosophy Lesson
export const retryMarxistPhilosophyLesson = createAsyncThunk(
  "philosophy/retryLesson",
  async (data: { lessonId: string; pathId?: string }) => {
    const response = await axiosInstance.post(
      RETRY_MARXIST_PHILOSOPHY_LESSON_ENDPOINT,
      data
    );
    return response.data;
  }
);

// 📊 Get Marxist Philosophy Stats
export const getMarxistPhilosophyStats = createAsyncThunk(
  "philosophy/getStats",
  async () => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_STATS_ENDPOINT
    );
    return response.data as IMarxistPhilosophyStatsResponse;
  }
);

// 🏷️ Get Marxist Philosophy Topics
export const getMarxistPhilosophyTopics = createAsyncThunk(
  "philosophy/getTopics",
  async () => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_TOPICS_ENDPOINT
    );
    return response.data;
  }
);

// 🔍 Analyze Marxist Philosophy Progress
export const analyzeMarxistPhilosophyProgress = createAsyncThunk(
  "philosophy/analyzeProgress",
  async () => {
    const response = await axiosInstance.get(
      ANALYZE_MARXIST_PHILOSOPHY_PROGRESS_ENDPOINT
    );
    return response.data;
  }
);

// 📚 Generate Content Pack (pre-study)
export const generateContentPack = createAsyncThunk(
  "philosophy/generateContentPack",
  async (payload: IGenerateContentPackPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        GENERATE_CONTENT_PACK_ENDPOINT,
        payload
      );
      return response.data as IGenerateContentPackResponse;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.statusCode === 429) {
          // Background generation in progress
          return rejectWithValue({
            statusCode: 429,
            message:
              errorData.message ||
              "Hệ thống đang tạo bài học tự động, vui lòng chờ...",
          });
        }
        return rejectWithValue({
          statusCode: error.response?.status || 500,
          message:
            errorData?.message ||
            error.message ||
            "Failed to generate content pack",
        });
      }
      return rejectWithValue({
        statusCode: 500,
        message: "Unknown error occurred",
      });
    }
  }
);

// 📚 Get Latest Content Pack (fetch from BE)
export const getLatestContentPack = createAsyncThunk(
  "philosophy/getLatestContentPack",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        GET_LATEST_CONTENT_PACK_ENDPOINT
      );
      return response.data as IGenerateContentPackResponse;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        return rejectWithValue({
          statusCode: error.response?.status || 500,
          message:
            errorData?.message ||
            error.message ||
            "Failed to get latest content pack",
        });
      }
      return rejectWithValue({
        statusCode: 500,
        message: "Unknown error occurred",
      });
    }
  }
);

// 🧠 Generate Lesson From Content Pack
export const generateLessonFromContent = createAsyncThunk(
  "philosophy/generateLessonFromContent",
  async (payload: IGenerateLessonFromContentPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        GENERATE_LESSON_FROM_CONTENT_ENDPOINT,
        payload
      );
      return response.data as IGenerateMarxistPhilosophyLessonResponse;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.statusCode === 429) {
          // Background generation in progress
          return rejectWithValue({
            statusCode: 429,
            message:
              errorData.message ||
              "Hệ thống đang tạo bài học tự động, vui lòng chờ...",
          });
        }
        return rejectWithValue({
          statusCode: error.response?.status || 500,
          message:
            errorData?.message ||
            error.message ||
            "Failed to generate lesson from content",
        });
      }
      return rejectWithValue({
        statusCode: 500,
        message: "Unknown error occurred",
      });
    }
  }
);

// 🧪 Test Multi-AI Connection (All Providers)
export const testMultiAIConnection = createAsyncThunk(
  "philosophy/testMultiAI",
  async () => {
    const response = await axiosInstance.get(
      TEST_MARXIST_PHILOSOPHY_CONNECTION_ENDPOINT
    );
    return response.data;
  }
);

// 🧪 Test Marxist Philosophy Connection (Legacy - for backward compatibility)
export const testMarxistPhilosophyConnection = createAsyncThunk(
  "philosophy/testConnection",
  async () => {
    const response = await axiosInstance.get(
      TEST_MARXIST_PHILOSOPHY_CONNECTION_ENDPOINT
    );
    return response.data;
  }
);

// 🤖 Test Gemini API
export const testMarxistPhilosophyGeminiAPI = createAsyncThunk(
  "philosophy/testGeminiAPI",
  async (data: { prompt?: string }) => {
    const response = await axiosInstance.post(
      TEST_MARXIST_PHILOSOPHY_GEMINI_ENDPOINT,
      data
    );
    return response.data;
  }
);

// Topic Management Thunks
export const createMarxistPhilosophyTopic = createAsyncThunk(
  "philosophy/createTopic",
  async (topicData: ICreateMarxistPhilosophyTopicData) => {
    const response = await axiosInstance.post(
      CREATE_MARXIST_PHILOSOPHY_TOPIC_ENDPOINT,
      topicData
    );
    return response.data;
  }
);

export const getMarxistPhilosophyTopicsList = createAsyncThunk(
  "philosophy/getTopicsList",
  async (params: { page?: number; limit?: number } = {}) => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_TOPICS_LIST_ENDPOINT,
      { params }
    );
    return response.data;
  }
);

export const getMarxistPhilosophyTopicById = createAsyncThunk(
  "philosophy/getTopicById",
  async (id: string) => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_TOPIC_BY_ID_ENDPOINT(id)
    );
    return response.data;
  }
);

export const updateMarxistPhilosophyTopic = createAsyncThunk(
  "philosophy/updateTopic",
  async ({
    id,
    data,
  }: {
    id: string;
    data: IUpdateMarxistPhilosophyTopicData;
  }) => {
    const response = await axiosInstance.put(
      UPDATE_MARXIST_PHILOSOPHY_TOPIC_ENDPOINT(id),
      data
    );
    return response.data;
  }
);

export const deleteMarxistPhilosophyTopic = createAsyncThunk(
  "philosophy/deleteTopic",
  async (id: string) => {
    const response = await axiosInstance.delete(
      DELETE_MARXIST_PHILOSOPHY_TOPIC_ENDPOINT(id)
    );
    return response.data;
  }
);

export const seedMarxistPhilosophyTopics = createAsyncThunk(
  "philosophy/seedTopics",
  async () => {
    const response = await axiosInstance.post(
      SEED_MARXIST_PHILOSOPHY_TOPICS_ENDPOINT
    );
    return response.data;
  }
);

// ⚡ Performance Monitoring Async Thunks (Admin/Staff only)
export const getGenerationStats = createAsyncThunk(
  "philosophy/getGenerationStats",
  async () => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_GENERATION_STATS_ENDPOINT
    );
    return response.data;
  }
);

export const getMultiAiStats = createAsyncThunk(
  "philosophy/getMultiAiStats",
  async () => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_MULTI_AI_STATS_ENDPOINT
    );
    return response.data;
  }
);

export const getRateLimiterStats = createAsyncThunk(
  "philosophy/getRateLimiterStats",
  async () => {
    const response = await axiosInstance.get(
      GET_MARXIST_PHILOSOPHY_RATE_LIMITER_STATS_ENDPOINT
    );
    return response.data;
  }
);

const philosophySlice = createSlice({
  name: "philosophy",
  initialState,
  reducers: {
    clearPhilosophyError: (state) => {
      state.error = null;
    },
    clearPhilosophySuccess: (state) => {
      state.success = null;
    },
    setPhilosophyLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate lesson
      .addCase(generateMarxistPhilosophyLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateMarxistPhilosophyLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(generateMarxistPhilosophyLesson.rejected, (state, action) => {
        state.loading = false;
        // Handle error payload properly - can be string or object with message
        const errorPayload = action.payload as
          | { message?: string; statusCode?: number }
          | string;
        if (typeof errorPayload === "string") {
          state.error = errorPayload;
        } else if (errorPayload?.message) {
          state.error = errorPayload.message;
        } else {
          state.error = "Failed to generate lesson";
        }
      })

      // Get learning path
      .addCase(getMarxistPhilosophyLearningPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMarxistPhilosophyLearningPath.fulfilled, (state, action) => {
        state.loading = false;
        state.learningPath = action.payload.learningPath || [];
      })
      .addCase(getMarxistPhilosophyLearningPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get learning path";
      })

      // Get lesson by path
      .addCase(getMarxistPhilosophyLessonByPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMarxistPhilosophyLessonByPath.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload.lesson;
      })
      .addCase(getMarxistPhilosophyLessonByPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get lesson";
      })

      // Complete lesson
      .addCase(completeMarxistPhilosophyLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeMarxistPhilosophyLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(completeMarxistPhilosophyLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to complete lesson";
      })

      // Retry lesson
      .addCase(retryMarxistPhilosophyLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryMarxistPhilosophyLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(retryMarxistPhilosophyLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to retry lesson";
      })

      // Get stats
      .addCase(getMarxistPhilosophyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMarxistPhilosophyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(getMarxistPhilosophyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get stats";
      })

      // Get topics
      .addCase(getMarxistPhilosophyTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMarxistPhilosophyTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.topics || [];
      })
      .addCase(getMarxistPhilosophyTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get topics";
      })

      // Topic management cases
      .addCase(createMarxistPhilosophyTopic.fulfilled, (state, action) => {
        state.success = action.payload.message;
      })
      .addCase(updateMarxistPhilosophyTopic.fulfilled, (state, action) => {
        state.success = action.payload.message;
      })
      .addCase(deleteMarxistPhilosophyTopic.fulfilled, (state, action) => {
        state.success = action.payload.message;
      })
      .addCase(seedMarxistPhilosophyTopics.fulfilled, (state, action) => {
        state.success = action.payload.message;
      })

      // Generate content pack
      .addCase(generateContentPack.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateContentPack.fulfilled, (state, action) => {
        state.loading = false;
        state.contentPack = action.payload.contentPack;
        state.success = "Đã tạo học liệu tóm tắt thành công";
      })
      .addCase(generateContentPack.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể tạo học liệu tóm tắt";
      })

      // Get latest content pack
      .addCase(getLatestContentPack.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLatestContentPack.fulfilled, (state, action) => {
        state.loading = false;
        state.contentPack = action.payload.contentPack;
        console.log("✅ Latest ContentPack fetched and updated in Redux state");
      })
      .addCase(getLatestContentPack.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể lấy học liệu mới nhất";
      })

      // Generate lesson from content
      .addCase(generateLessonFromContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateLessonFromContent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(generateLessonFromContent.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Không thể tạo bài học từ học liệu";
      })

      // Test Multi-AI connection
      .addCase(testMultiAIConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testMultiAIConnection.fulfilled, (state, action) => {
        state.loading = false;
        state.multiAI.connected = action.payload.success;
        state.multiAI.providers.gemini =
          action.payload.results?.gemini?.connected || false;
        state.multiAI.providers.grok =
          action.payload.results?.grok?.connected || false;
        state.multiAI.lastTest = new Date().toISOString();
        state.success = action.payload.message;

        // Update legacy geminiConnected for backward compatibility
        state.geminiConnected =
          action.payload.results?.gemini?.connected || false;
      })
      .addCase(testMultiAIConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Multi-AI connection test failed";
        state.multiAI.connected = false;
        state.multiAI.providers.gemini = false;
        state.multiAI.providers.grok = false;
      })

      // Test connection (Legacy)
      .addCase(testMarxistPhilosophyConnection.fulfilled, (state, action) => {
        state.geminiConnected = action.payload.connected;
      })
      .addCase(testMarxistPhilosophyGeminiAPI.fulfilled, (state, action) => {
        state.success = action.payload.message;
      });
  },
});

export const {
  clearPhilosophyError,
  clearPhilosophySuccess,
  setPhilosophyLoading,
} = philosophySlice.actions;
export default philosophySlice.reducer;
