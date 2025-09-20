import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ISurvey,
  ISurveyStatus,
  ISurveySubmission,
} from "../../../interfaces/ISurvey";
import {
  GET_SURVEY_ENDPOINT,
  GET_SURVEY_STATUS_ENDPOINT,
  SUBMIT_SURVEY_ENDPOINT,
} from "../../constant/apiConfig";
import axiosInstance from "../../constant/axiosInstance";

interface SurveyState {
  survey: ISurvey | null;
  surveyStatus: ISurveyStatus | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  submitSuccess: boolean;
}

const initialState: SurveyState = {
  survey: null,
  surveyStatus: null,
  loading: false,
  error: null,
  submitting: false,
  submitSuccess: false,
};

export const fetchSurvey = createAsyncThunk(
  "survey/fetchSurvey",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(GET_SURVEY_ENDPOINT);
      return response.data.survey;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch survey"
      );
    }
  }
);

export const fetchSurveyStatus = createAsyncThunk(
  "survey/fetchSurveyStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(GET_SURVEY_STATUS_ENDPOINT);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch survey status"
      );
    }
  }
);

export const submitSurvey = createAsyncThunk(
  "survey/submitSurvey",
  async (submission: ISurveySubmission, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        SUBMIT_SURVEY_ENDPOINT,
        submission
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit survey"
      );
    }
  }
);

const surveySlice = createSlice({
  name: "survey",
  initialState,
  reducers: {
    resetSubmitStatus: (state) => {
      state.submitting = false;
      state.submitSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurvey.fulfilled, (state, action) => {
        state.loading = false;
        state.survey = action.payload;
      })
      .addCase(fetchSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSurveyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.surveyStatus = action.payload;
      })
      .addCase(fetchSurveyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitSurvey.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitSurvey.fulfilled, (state) => {
        state.submitting = false;
        state.submitSuccess = true;
        if (state.surveyStatus) {
          state.surveyStatus.hasCompleted = true;
        }
      })
      .addCase(submitSurvey.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSubmitStatus } = surveySlice.actions;
export default surveySlice.reducer;
