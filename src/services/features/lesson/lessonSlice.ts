import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance, { ApiError } from "@/services/constant/axiosInstance";
import {
  GET_USER_LEARNING_PATH_ENDPOINT,
  GET_LESSON_BY_ID_ENDPOINT,
  COMPLETE_LESSON_ENDPOINT,
  RETRY_LESSON_ENDPOINT,
  CREATE_LESSON_ENDPOINT,
  UPDATE_LESSON_ENDPOINT,
  DELETE_LESSON_ENDPOINT,
} from "@/services/constant/apiConfig";
import {
  ILesson,
  QuestionResult,
  LessonProgress,
  UserProgress,
  CreateLessonData,
  ILearningPathItem,
} from "@/interfaces/ILesson";
import { message as antMessage } from "antd";

interface LessonState {
  lessons: ILearningPathItem[];
  currentLesson: ILesson | null;
  loading: boolean;
  error: string | null;
  progress: LessonProgress | null;
  userProgress: UserProgress | null;
  status: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  } | null;
}

const initialState: LessonState = {
  lessons: [],
  currentLesson: null,
  loading: false,
  error: null,
  progress: null,
  userProgress: null,
  status: null,
  pagination: null,
};

export const fetchLessons = createAsyncThunk<
  { learningPath: ILearningPathItem[]; pagination: LessonState['pagination'] },
  { page?: number; limit?: number },
  { rejectValue: { message: string } }
>(
  "lesson/fetchLessons",
  async ({ page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${GET_USER_LEARNING_PATH_ENDPOINT}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      const message = error.message || "Failed to fetch learning path";
      return rejectWithValue({ message });
    }
  }
);

export const fetchLessonById = createAsyncThunk<
  { lesson: ILesson },
  string,
  { rejectValue: { message: string } }
>("lesson/fetchLessonById", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(GET_LESSON_BY_ID_ENDPOINT(id));
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to fetch lesson";
    return rejectWithValue({ message });
  }
});

export const completeLesson = createAsyncThunk<
  { progress: LessonProgress; user: UserProgress; status: string },
  {
    lessonId: string;
    score: number;
    questionResults: QuestionResult[];
    isRetried: boolean;
  },
  { rejectValue: { message: string } }
>("lesson/completeLesson", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(COMPLETE_LESSON_ENDPOINT, data);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const errorMessage = error.message || "Failed to complete lesson";
    if (errorMessage === "Bài học đã được hoàn thành trước đó") {
      antMessage.info({
        content: "Bài học đã được hoàn thành trước đó",
        className: "font-baloo",
        duration: 3,
      });
    }
    return rejectWithValue({ message: errorMessage });
  }
});

export const retryLesson = createAsyncThunk<
  void,
  { lessonId: string },
  { rejectValue: { message: string } }
>("lesson/retryLesson", async (data, { rejectWithValue }) => {
  try {
    await axiosInstance.post(RETRY_LESSON_ENDPOINT, data);
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to retry lesson";
    return rejectWithValue({ message });
  }
});

export const createLesson = createAsyncThunk<
  { lesson: ILesson & { pathId: string } },
  CreateLessonData,
  { rejectValue: { message: string } }
>("lesson/createLesson", async (lessonData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      CREATE_LESSON_ENDPOINT,
      lessonData
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to create lesson";
    return rejectWithValue({ message });
  }
});

export const updateLesson = createAsyncThunk<
  { lesson: ILesson & { pathId: string } },
  { id: string; data: CreateLessonData },
  { rejectValue: { message: string } }
>("lesson/updateLesson", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(UPDATE_LESSON_ENDPOINT(id), data);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to update lesson";
    return rejectWithValue({ message });
  }
});

export const deleteLesson = createAsyncThunk<
  void,
  string,
  { rejectValue: { message: string } }
>("lesson/deleteLesson", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(DELETE_LESSON_ENDPOINT(id));
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to delete lesson";
    return rejectWithValue({ message });
  }
});

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
      state.progress = null;
      state.userProgress = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Lessons
      .addCase(fetchLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false;
        // Process lessons to update status
        const processedLessons = action.payload.learningPath.map((lesson, index, array) => {
          // If this is not the first lesson and the previous lesson is complete,
          // or if this is the first lesson, set status to ACTIVE
          if (
            (index === 0) || 
            (index > 0 && array[index - 1].status === "COMPLETE")
          ) {
            return {
              ...lesson,
              status: lesson.status === "LOCKED" ? "ACTIVE" : lesson.status
            };
          }
          return lesson;
        });
        state.lessons = processedLessons;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch learning path";
      })
      // Fetch Lesson By Id
      .addCase(fetchLessonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload.lesson;
        state.error = null;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch lesson";
      })
      // Complete Lesson
      .addCase(completeLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload.progress;
        state.userProgress = action.payload.user;
        state.status = action.payload.status;
        state.error = null;
      })
      .addCase(completeLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to complete lesson";
      })
      // Retry Lesson
      .addCase(retryLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryLesson.fulfilled, (state) => {
        state.loading = false;
        state.progress = null;
        state.error = null;
      })
      .addCase(retryLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to retry lesson";
      })
      // Create Lesson
      .addCase(createLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        state.loading = false;
        // Convert ILesson to ILearningPathItem
        const newLearningPathItem: ILearningPathItem = {
          pathId: action.payload.lesson.pathId,
          lessonId: action.payload.lesson._id,
          title: action.payload.lesson.title,
          topic: action.payload.lesson.topic.name,
          level: action.payload.lesson.level?.name || 'Beginner',
          focusSkills: action.payload.lesson.skills.map(skill => skill.name),
          recommendedReason: "Newly created lesson",
          accuracyBefore: 0,
          order: state.lessons.length + 1,
          completed: false,
          createdAt: action.payload.lesson.createdAt,
          status: action.payload.lesson.status || "LOCKED"
        };
        state.lessons.push(newLearningPathItem);
        state.error = null;
      })
      .addCase(createLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create lesson";
      })
      // Update Lesson
      .addCase(updateLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lessons.findIndex(
          (lesson) => lesson.lessonId === action.payload.lesson._id
        );
        if (index !== -1) {
          // Convert ILesson to ILearningPathItem
          const updatedLearningPathItem: ILearningPathItem = {
            pathId: action.payload.lesson.pathId,
            lessonId: action.payload.lesson._id,
            title: action.payload.lesson.title,
            topic: action.payload.lesson.topic.name,
            level: action.payload.lesson.level?.name || 'Beginner',
            focusSkills: action.payload.lesson.skills.map(skill => skill.name),
            recommendedReason: state.lessons[index].recommendedReason,
            accuracyBefore: state.lessons[index].accuracyBefore,
            order: state.lessons[index].order,
            completed: state.lessons[index].completed,
            createdAt: action.payload.lesson.createdAt,
            status: action.payload.lesson.status || state.lessons[index].status
          };
          state.lessons[index] = updatedLearningPathItem;
        }
        state.error = null;
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update lesson";
      })
      // Delete Lesson
      .addCase(deleteLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.lessons = state.lessons.filter(
          (lesson) => lesson.lessonId !== action.meta.arg
        );
        state.error = null;
      })
      .addCase(deleteLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete lesson";
      });
  },
});

export const { clearCurrentLesson } = lessonSlice.actions;
export default lessonSlice.reducer;
