import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiMethods } from "../../constant/axiosInstance";
import {
  CHECK_IN_ENDPOINT,
  CHECK_IN_STATUS_ENDPOINT,
} from "../../constant/apiConfig";
import {
  CheckInResponse,
  CheckInState,
  CheckInStatusResponse,
} from "@/interfaces/ICheckIn";

const initialState: CheckInState = {
  status: "idle",
  error: null,
  checkInData: null,
  checkInStatus: null,
};

// Async thunks
export const performCheckIn = createAsyncThunk(
  "checkIn/performCheckIn",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiMethods.post<CheckInResponse>(
        CHECK_IN_ENDPOINT
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to check in");
    }
  }
);

export const getCheckInStatus = createAsyncThunk(
  "checkIn/getCheckInStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiMethods.get<CheckInStatusResponse>(
        CHECK_IN_STATUS_ENDPOINT
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get check-in status");
    }
  }
);

const checkInSlice = createSlice({
  name: "checkIn",
  initialState,
  reducers: {
    resetCheckInState: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle performCheckIn
      .addCase(performCheckIn.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        performCheckIn.fulfilled,
        (state, action: PayloadAction<CheckInResponse | undefined>) => {
          state.status = "succeeded";
          if (action.payload) {
            state.checkInData = action.payload;
            // Update status after successful check-in
            if (state.checkInStatus) {
              state.checkInStatus.hasCheckedInToday = true;
              state.checkInStatus.consecutiveCheckIns =
                action.payload.consecutiveCheckIns;
              state.checkInStatus.totalCheckIns = action.payload.totalCheckIns;
            }
          }
        }
      )
      .addCase(performCheckIn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle getCheckInStatus
      .addCase(getCheckInStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        getCheckInStatus.fulfilled,
        (state, action: PayloadAction<CheckInStatusResponse | undefined>) => {
          state.status = "succeeded";
          if (action.payload) {
            state.checkInStatus = action.payload;
          }
        }
      )
      .addCase(getCheckInStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetCheckInState } = checkInSlice.actions;
export default checkInSlice.reducer;
