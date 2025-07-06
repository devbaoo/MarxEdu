import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance, { ApiError } from "@/services/constant/axiosInstance";
import { 
  GET_LEVELS_ENDPOINT, 
  CREATE_LEVEL_ENDPOINT, 
  UPDATE_LEVEL_ENDPOINT, 
  DELETE_LEVEL_ENDPOINT,
  CHOOSE_LEVELS_ENDPOINT 
} from "@/services/constant/apiConfig";

//level
export interface Level {
  _id: string;
  name: string;
  maxScore: number;
  timeLimit: number;
  minUserLevel: number;
  minLessonPassed: number;
  minScoreRequired: number;
  order: number;
} 

interface LevelState {
  levels: Level[];
  loading: boolean;
  error: string | null;
}

const initialState: LevelState = {
  levels: [],
  loading: false,
  error: null,
};



export const fetchLevels = createAsyncThunk<
  { levels: Level[] }, 
  void,
  { rejectValue: { message: string } }
>("level/fetchLevels", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(GET_LEVELS_ENDPOINT);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to fetch levels";
    return rejectWithValue({ message });
  }
});

export const createLevel = createAsyncThunk<
  Level,
  Omit<Level, '_id'>,
  { rejectValue: { message: string } }
>("level/createLevel", async (levelData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(CREATE_LEVEL_ENDPOINT, levelData);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to create level";
    return rejectWithValue({ message });
  }
});

export const updateLevel = createAsyncThunk<
  Level,
  { levelId: string; updatedLevel: Partial<Level> },
  { rejectValue: { message: string } }
>("level/updateLevel", async ({ levelId, updatedLevel }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(UPDATE_LEVEL_ENDPOINT(levelId), updatedLevel);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to update level";
    return rejectWithValue({ message });
  }
});

export const deleteLevel = createAsyncThunk<
  string,
  string,
  { rejectValue: { message: string } }
>("level/deleteLevel", async (levelId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(DELETE_LEVEL_ENDPOINT(levelId));
    return levelId;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to delete level";
    return rejectWithValue({ message });
  }
});

export const chooseLevels = createAsyncThunk<
  void,
  string, 
  { rejectValue: { message: string } }
>("level/chooseLevels", async (selectedLevelNames, { rejectWithValue }) => {
  try {
    await axiosInstance.post(CHOOSE_LEVELS_ENDPOINT, {
      level: selectedLevelNames,
    });
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to choose levels";
    return rejectWithValue({ message });
  }
});

const levelSlice = createSlice({
  name: "level",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Levels
      .addCase(fetchLevels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLevels.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = action.payload.levels;
        state.error = null;
      })
      .addCase(fetchLevels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch levels";
      })
      // Create Level
      .addCase(createLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.levels.push(action.payload);
        state.error = null;
      })
      .addCase(createLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create level";
      })
      // Update Level
      .addCase(updateLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLevel.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.levels.findIndex(level => level._id === action.payload._id);
        if (index !== -1) {
          state.levels[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update level";
      })
      // Delete Level
      .addCase(deleteLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.levels = state.levels.filter(level => level._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete level";
      });
  },
});

export default levelSlice.reducer;