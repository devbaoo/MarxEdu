import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICreateSurvey, ISurveyStatistics } from "../../../interfaces/ISurvey";
import {
  ADMIN_CREATE_SURVEY_ENDPOINT,
  ADMIN_GET_SURVEY_STATISTICS_ENDPOINT,
} from "../../constant/apiConfig";
import axiosInstance from "../../constant/axiosInstance";

interface AdminSurveyState {
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  statistics: ISurveyStatistics | null;
  statisticsLoading: boolean;
  statisticsError: string | null;
}

const initialState: AdminSurveyState = {
  loading: false,
  error: null,
  createSuccess: false,
  statistics: null,
  statisticsLoading: false,
  statisticsError: null,
};

export const createSurvey = createAsyncThunk(
  "adminSurvey/createSurvey",
  async (surveyData: ICreateSurvey, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        ADMIN_CREATE_SURVEY_ENDPOINT,
        surveyData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể tạo khảo sát"
      );
    }
  }
);

export const getSurveyStatistics = createAsyncThunk(
  "adminSurvey/getSurveyStatistics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        ADMIN_GET_SURVEY_STATISTICS_ENDPOINT
      );
      return response.data.statistics;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy thống kê khảo sát"
      );
    }
  }
);

const adminSurveySlice = createSlice({
  name: "adminSurvey",
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createSurvey.fulfilled, (state) => {
        state.loading = false;
        state.createSuccess = true;
      })
      .addCase(createSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getSurveyStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(getSurveyStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
      })
      .addCase(getSurveyStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.payload as string;
      });
  },
});

export const { resetCreateStatus } = adminSurveySlice.actions;
export default adminSurveySlice.reducer;
