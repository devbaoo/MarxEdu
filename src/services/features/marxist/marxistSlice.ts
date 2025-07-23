import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/services/constant/axiosInstance";
import {
  GENERATE_MARXIST_LESSON_ENDPOINT,
  GET_MARXIST_LEARNING_PATH_ENDPOINT,
  GET_MARXIST_LESSON_BY_PATH_ENDPOINT,
  COMPLETE_MARXIST_LESSON_ENDPOINT,
  RETRY_MARXIST_LESSON_ENDPOINT,
  GET_MARXIST_STATS_ENDPOINT,
  GET_MARXIST_TOPICS_ENDPOINT,
  ANALYZE_MARXIST_PROGRESS_ENDPOINT,
  TEST_MARXIST_CONNECTION_ENDPOINT,
  TEST_GEMINI_ENDPOINT,
  CREATE_MARXIST_TOPIC_ENDPOINT,
  GET_MARXIST_TOPICS_LIST_ENDPOINT,
  GET_MARXIST_TOPIC_BY_ID_ENDPOINT,
  UPDATE_MARXIST_TOPIC_ENDPOINT,
  DELETE_MARXIST_TOPIC_ENDPOINT,
  SEED_MARXIST_TOPICS_ENDPOINT,
} from "@/services/constant/apiConfig";
import {
  IMarxistTopic,
  IMarxistLearningPath,
  IMarxistStats,
  IMarxistProgressAnalysis,
  IGenerateMarxistLessonOptions,
  ICreateMarxistTopicData,
  IUpdateMarxistTopicData,
  ICompleteMarxistLessonData,
  ICompleteMarxistLessonResponse,
} from "@/interfaces/IMarxist";
import axios from "axios";

// State interface
interface MarxistState {
  // Learning Path
  learningPath: IMarxistLearningPath[];
  learningPathLoading: boolean;
  learningPathError: string | null;
  
  // Topics
  topics: IMarxistTopic[];
  topicsLoading: boolean;
  topicsError: string | null;
  
  // Current Topic Detail
  currentTopic: IMarxistTopic | null;
  currentTopicLoading: boolean;
  currentTopicError: string | null;
  
  // Statistics
  stats: IMarxistStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // Progress Analysis
  progressAnalysis: IMarxistProgressAnalysis | null;
  progressAnalysisLoading: boolean;
  progressAnalysisError: string | null;
  
  // Lesson Generation
  lessonGenerating: boolean;
  lessonGenerateError: string | null;
  
  // General loading and success states
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

// Initial state
const initialState: MarxistState = {
  learningPath: [],
  learningPathLoading: false,
  learningPathError: null,
  
  topics: [],
  topicsLoading: false,
  topicsError: null,
  
  currentTopic: null,
  currentTopicLoading: false,
  currentTopicError: null,
  
  stats: null,
  statsLoading: false,
  statsError: null,
  
  progressAnalysis: null,
  progressAnalysisLoading: false,
  progressAnalysisError: null,
  
  lessonGenerating: false,
  lessonGenerateError: null,
  
  loading: false,
  error: null,
  successMessage: null,
  
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  },
};

// Async thunks
export const generateMarxistLesson = createAsyncThunk(
  "marxist/generateLesson",
  async (options: IGenerateMarxistLessonOptions = {}) => {
    const response = await axiosInstance.post(GENERATE_MARXIST_LESSON_ENDPOINT, options);
    return response.data;
  }
);

export const getMarxistLearningPath = createAsyncThunk(
  "marxist/getLearningPath",
  async (params: { page?: number; limit?: number } = {}) => {
    const response = await axiosInstance.get(GET_MARXIST_LEARNING_PATH_ENDPOINT, { params });
    return response.data;
  }
);

export const getMarxistLessonByPath = createAsyncThunk(
  "marxist/getLessonByPath",
  async (pathId: string) => {
    const response = await axiosInstance.get(GET_MARXIST_LESSON_BY_PATH_ENDPOINT(pathId));
    return response.data;
  }
);

// Complete Marxist lesson
export const completeMarxistLesson = createAsyncThunk(
  'marxist/completeLesson',
  async (data: ICompleteMarxistLessonData, { rejectWithValue }) => {
    try {
      console.log('🎯 Completing Marxist lesson:', data);
      
      const response = await axiosInstance.post(COMPLETE_MARXIST_LESSON_ENDPOINT, data);
      console.log('✅ Complete lesson response:', response.data);
      
      return response.data as ICompleteMarxistLessonResponse;
    } catch (error: unknown) {
      console.error('❌ Complete Marxist lesson error:', error);
      
      // Better error handling for different error types
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || 'Network error occurred';
        console.error('API Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage
        });
        return rejectWithValue({ message: errorMessage, details: error.response?.data });
      } else if (error instanceof Error) {
        console.error('Generic Error:', error.message);
        return rejectWithValue({ message: error.message, details: error });
      } else {
        console.error('Unknown Error:', error);
        return rejectWithValue({ message: 'An unknown error occurred', details: error });
      }
    }
  }
);

export const retryMarxistLesson = createAsyncThunk(
  "marxist/retryLesson",
  async (data: { lessonId: string; pathId?: string }) => {
    const response = await axiosInstance.post(RETRY_MARXIST_LESSON_ENDPOINT, data);
    return response.data;
  }
);

export const getMarxistStats = createAsyncThunk(
  "marxist/getStats",
  async () => {
    const response = await axiosInstance.get(GET_MARXIST_STATS_ENDPOINT);
    return response.data;
  }
);

export const getMarxistTopics = createAsyncThunk(
  "marxist/getTopics",
  async () => {
    const response = await axiosInstance.get(GET_MARXIST_TOPICS_ENDPOINT);
    return response.data;
  }
);

export const analyzeMarxistProgress = createAsyncThunk(
  "marxist/analyzeProgress",
  async () => {
    const response = await axiosInstance.get(ANALYZE_MARXIST_PROGRESS_ENDPOINT);
    return response.data;
  }
);

export const testGeminiConnection = createAsyncThunk(
  "marxist/testGeminiConnection",
  async () => {
    const response = await axiosInstance.get(TEST_MARXIST_CONNECTION_ENDPOINT);
    return response.data;
  }
);

export const testGeminiAPI = createAsyncThunk(
  "marxist/testGeminiAPI", 
  async (data: { prompt?: string }) => {
    const response = await axiosInstance.post(TEST_GEMINI_ENDPOINT, data);
    return response.data;
  }
);

// Topic Management Actions
export const createMarxistTopic = createAsyncThunk(
  "marxist/createTopic",
  async (topicData: ICreateMarxistTopicData) => {
    const response = await axiosInstance.post(CREATE_MARXIST_TOPIC_ENDPOINT, topicData);
    return response.data;
  }
);

export const getMarxistTopicsList = createAsyncThunk(
  "marxist/getTopicsList",
  async (params: { page?: number; limit?: number; isActive?: boolean } = {}) => {
    const response = await axiosInstance.get(GET_MARXIST_TOPICS_LIST_ENDPOINT, { params });
    return response.data;
  }
);

export const getMarxistTopicById = createAsyncThunk(
  "marxist/getTopicById",
  async (id: string) => {
    const response = await axiosInstance.get(GET_MARXIST_TOPIC_BY_ID_ENDPOINT(id));
    return response.data;
  }
);

export const updateMarxistTopic = createAsyncThunk(
  "marxist/updateTopic",
  async ({ id, data }: { id: string; data: IUpdateMarxistTopicData }) => {
    const response = await axiosInstance.put(UPDATE_MARXIST_TOPIC_ENDPOINT(id), data);
    return response.data;
  }
);

export const deleteMarxistTopic = createAsyncThunk(
  "marxist/deleteTopic",
  async (id: string) => {
    const response = await axiosInstance.delete(DELETE_MARXIST_TOPIC_ENDPOINT(id));
    return { ...response.data, deletedId: id };
  }
);

export const seedMarxistTopics = createAsyncThunk(
  "marxist/seedTopics",
  async () => {
    const response = await axiosInstance.post(SEED_MARXIST_TOPICS_ENDPOINT);
    return response.data;
  }
);

// Slice
const marxistSlice = createSlice({
  name: "marxist",
  initialState,
  reducers: {
    clearMarxistError: (state) => {
      state.error = null;
      state.learningPathError = null;
      state.topicsError = null;
      state.currentTopicError = null;
      state.statsError = null;
      state.progressAnalysisError = null;
      state.lessonGenerateError = null;
    },
    clearMarxistSuccess: (state) => {
      state.successMessage = null;
    },
    setMarxistPagination: (state, action: PayloadAction<Partial<MarxistState["pagination"]>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Generate Lesson
    builder
      .addCase(generateMarxistLesson.pending, (state) => {
        state.lessonGenerating = true;
        state.lessonGenerateError = null;
      })
      .addCase(generateMarxistLesson.fulfilled, (state, action) => {
        state.lessonGenerating = false;
        state.successMessage = action.payload.message;
      })
      .addCase(generateMarxistLesson.rejected, (state, action) => {
        state.lessonGenerating = false;
        state.lessonGenerateError = action.error.message || "Không thể tạo bài học";
      });

    // Get Learning Path
    builder
      .addCase(getMarxistLearningPath.pending, (state) => {
        state.learningPathLoading = true;
        state.learningPathError = null;
      })
      .addCase(getMarxistLearningPath.fulfilled, (state, action) => {
        state.learningPathLoading = false;
        state.learningPath = action.payload.learningPath;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMarxistLearningPath.rejected, (state, action) => {
        state.learningPathLoading = false;
        state.learningPathError = action.error.message || "Không thể lấy lộ trình học";
      });

    // Complete Lesson
    builder
      .addCase(completeMarxistLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeMarxistLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(completeMarxistLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể hoàn thành bài học";
      });

    // Retry Lesson
    builder
      .addCase(retryMarxistLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryMarxistLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(retryMarxistLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể làm lại bài học";
      });

    // Get Stats
    builder
      .addCase(getMarxistStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getMarxistStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(getMarxistStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.error.message || "Không thể lấy thống kê";
      });

    // Get Topics
    builder
      .addCase(getMarxistTopics.pending, (state) => {
        state.topicsLoading = true;
        state.topicsError = null;
      })
      .addCase(getMarxistTopics.fulfilled, (state, action) => {
        state.topicsLoading = false;
        state.topics = action.payload.topics || [];
      })
      .addCase(getMarxistTopics.rejected, (state, action) => {
        state.topicsLoading = false;
        state.topicsError = action.error.message || "Không thể lấy danh sách chủ đề";
      });

    // Analyze Progress
    builder
      .addCase(analyzeMarxistProgress.pending, (state) => {
        state.progressAnalysisLoading = true;
        state.progressAnalysisError = null;
      })
      .addCase(analyzeMarxistProgress.fulfilled, (state, action) => {
        state.progressAnalysisLoading = false;
        state.progressAnalysis = action.payload.analysis;
      })
      .addCase(analyzeMarxistProgress.rejected, (state, action) => {
        state.progressAnalysisLoading = false;
        state.progressAnalysisError = action.error.message || "Không thể phân tích tiến độ";
      });

    // Topic Management - Get Topics List
    builder
      .addCase(getMarxistTopicsList.pending, (state) => {
        state.topicsLoading = true;
        state.topicsError = null;
      })
      .addCase(getMarxistTopicsList.fulfilled, (state, action) => {
        state.topicsLoading = false;
        state.topics = action.payload.topics;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMarxistTopicsList.rejected, (state, action) => {
        state.topicsLoading = false;
        state.topicsError = action.error.message || "Không thể lấy danh sách chủ đề";
      });

    // Get Topic By ID
    builder
      .addCase(getMarxistTopicById.pending, (state) => {
        state.currentTopicLoading = true;
        state.currentTopicError = null;
      })
      .addCase(getMarxistTopicById.fulfilled, (state, action) => {
        state.currentTopicLoading = false;
        state.currentTopic = action.payload.topic;
      })
      .addCase(getMarxistTopicById.rejected, (state, action) => {
        state.currentTopicLoading = false;
        state.currentTopicError = action.error.message || "Không thể lấy chi tiết chủ đề";
      });

    // Create Topic
    builder
      .addCase(createMarxistTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMarxistTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createMarxistTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể tạo chủ đề";
      });

    // Update Topic
    builder
      .addCase(updateMarxistTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMarxistTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.currentTopic = action.payload.topic;
      })
      .addCase(updateMarxistTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể cập nhật chủ đề";
      });

    // Delete Topic
    builder
      .addCase(deleteMarxistTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMarxistTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.topics = state.topics.filter(topic => topic._id !== action.payload.deletedId);
      })
      .addCase(deleteMarxistTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể xóa chủ đề";
      });

    // Seed Topics
    builder
      .addCase(seedMarxistTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(seedMarxistTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(seedMarxistTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể tạo dữ liệu mẫu";
      });
  },
});

export const { clearMarxistError, clearMarxistSuccess, setMarxistPagination } = marxistSlice.actions;

export default marxistSlice.reducer; 