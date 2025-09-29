import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  GET_FLASHCARD_BY_ID_ENDPOINT,
  GET_FLASHCARD_TAGS_ENDPOINT,
  GET_FLASHCARDS_ENDPOINT,
  GET_RANDOM_FLASHCARDS_ENDPOINT,
} from "@/services/constant/apiConfig";
import axiosInstance from "@/services/constant/axiosInstance";
import {
  IFlashcard,
  IFlashcardDetailResponse,
  IFlashcardListResponse,
  IFlashcardQueryParams,
  IFlashcardTagSummary,
  IFlashcardTagsResponse,
  IRandomFlashcardQueryParams,
  IRandomFlashcardsResponse,
} from "@/interfaces/IFlashcard";

interface FlashcardState {
  flashcards: IFlashcard[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  tags: IFlashcardTagSummary[];
  tagsLoading: boolean;
  tagsError: string | null;
  randomFlashcards: IFlashcard[];
  randomLoading: boolean;
  randomError: string | null;
  currentFlashcard: IFlashcard | null;
  detailLoading: boolean;
  detailError: string | null;
}

const initialState: FlashcardState = {
  flashcards: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  tags: [],
  tagsLoading: false,
  tagsError: null,
  randomFlashcards: [],
  randomLoading: false,
  randomError: null,
  currentFlashcard: null,
  detailLoading: false,
  detailError: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      fallback
    );
  }

  return fallback;
};

export const fetchFlashcards = createAsyncThunk<
  IFlashcardListResponse,
  IFlashcardQueryParams | undefined,
  { rejectValue: string }
>("flashcard/fetchFlashcards", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<IFlashcardListResponse>(
      GET_FLASHCARDS_ENDPOINT,
      { params }
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Không thể tải danh sách flashcard"));
  }
});

export const fetchFlashcardTags = createAsyncThunk<
  IFlashcardTagsResponse,
  void,
  { rejectValue: string }
>("flashcard/fetchTags", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<IFlashcardTagsResponse>(
      GET_FLASHCARD_TAGS_ENDPOINT
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Không thể tải danh sách tag"));
  }
});

export const fetchRandomFlashcards = createAsyncThunk<
  IRandomFlashcardsResponse,
  IRandomFlashcardQueryParams | undefined,
  { rejectValue: string }
>("flashcard/fetchRandom", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<IRandomFlashcardsResponse>(
      GET_RANDOM_FLASHCARDS_ENDPOINT,
      { params }
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Không thể tải flashcard ngẫu nhiên")
    );
  }
});

export const fetchFlashcardDetail = createAsyncThunk<
  IFlashcardDetailResponse,
  string,
  { rejectValue: string }
>("flashcard/fetchDetail", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<IFlashcardDetailResponse>(
      GET_FLASHCARD_BY_ID_ENDPOINT(id)
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Không thể tải flashcard"));
  }
});

const flashcardSlice = createSlice({
  name: "flashcard",
  initialState,
  reducers: {
    resetFlashcardError: (state) => {
      state.error = null;
      state.detailError = null;
    },
    clearRandomFlashcards: (state) => {
      state.randomFlashcards = [];
      state.randomError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlashcards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcards.fulfilled, (state, action) => {
        state.loading = false;
        state.flashcards = action.payload.data || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 20,
          total: action.payload.data?.length || 0,
          totalPages: 1,
        };
      })
      .addCase(fetchFlashcards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải danh sách flashcard";
        state.flashcards = [];
      })
      .addCase(fetchFlashcardTags.pending, (state) => {
        state.tagsLoading = true;
        state.tagsError = null;
      })
      .addCase(fetchFlashcardTags.fulfilled, (state, action) => {
        state.tagsLoading = false;
        state.tags = action.payload.tags || [];
      })
      .addCase(fetchFlashcardTags.rejected, (state, action) => {
        state.tagsLoading = false;
        state.tagsError = action.payload || "Không thể tải danh sách tag";
        state.tags = [];
      })
      .addCase(fetchRandomFlashcards.pending, (state) => {
        state.randomLoading = true;
        state.randomError = null;
      })
      .addCase(fetchRandomFlashcards.fulfilled, (state, action) => {
        state.randomLoading = false;
        state.randomFlashcards = action.payload.data || [];
      })
      .addCase(fetchRandomFlashcards.rejected, (state, action) => {
        state.randomLoading = false;
        state.randomError = action.payload || "Không thể tải flashcard ngẫu nhiên";
        state.randomFlashcards = [];
      })
      .addCase(fetchFlashcardDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.currentFlashcard = null;
      })
      .addCase(fetchFlashcardDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentFlashcard = action.payload.data;
      })
      .addCase(fetchFlashcardDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Không thể tải flashcard";
        state.currentFlashcard = null;
      });
  },
});

export const { resetFlashcardError, clearRandomFlashcards } = flashcardSlice.actions;
export default flashcardSlice.reducer;
