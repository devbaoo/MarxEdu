import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance, { ApiError } from "@/services/constant/axiosInstance";
import {
  GET_TOPICS_ENDPOINT,
  CHOOSE_TOPICS_ENDPOINT,
  CREATE_TOPIC_ENDPOINT,
  UPDATE_TOPIC_ENDPOINT,
  DELETE_TOPIC_ENDPOINT,
} from "@/services/constant/apiConfig";

export interface Topic {
  _id: string;
  name: string;
  description: string;
}

interface TopicState {
  topics: Topic[];
  loading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  topics: [],
  loading: false,
  error: null,
};

export const fetchTopics = createAsyncThunk<
  { topics: Topic[] },
  void,
  { rejectValue: { message: string } }
>("topic/fetchTopics", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(GET_TOPICS_ENDPOINT);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to fetch topics";
    return rejectWithValue({ message });
  }
});

export const createTopic = createAsyncThunk<
  Topic,
  { name: string; description: string },
  { rejectValue: { message: string } }
>("topic/createTopic", async (topicData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(CREATE_TOPIC_ENDPOINT, topicData);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to create topic";
    return rejectWithValue({ message });
  }
});

export const updateTopic = createAsyncThunk<
  Topic,
  { id: string; data: { name: string; description: string } },
  { rejectValue: { message: string } }
>("topic/updateTopic", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(UPDATE_TOPIC_ENDPOINT(id), data);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to update topic";
    return rejectWithValue({ message });
  }
});

export const deleteTopic = createAsyncThunk<
  string,
  string,
  { rejectValue: { message: string } }
>("topic/deleteTopic", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(DELETE_TOPIC_ENDPOINT(id));
    return id;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to delete topic";
    return rejectWithValue({ message });
  }
});

export const chooseTopics = createAsyncThunk<
  void,
  string[],
  { rejectValue: { message: string } }
>("topic/chooseTopics", async (selectedTopic, { rejectWithValue }) => {
  try {
    await axiosInstance.post(CHOOSE_TOPICS_ENDPOINT, { topics: selectedTopic });
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to choose topics";
    return rejectWithValue({ message });
  }
});

const topicSlice = createSlice({
  name: "topic",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload.topics;
        state.error = null;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch topics";
      })
      .addCase(createTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload);
        state.error = null;
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create topic";
      })
      .addCase(updateTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex(
          (topic) => topic._id === action.payload._id
        );
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update topic";
      })
      .addCase(deleteTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = state.topics.filter(
          (topic) => topic._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete topic";
      });
  },
});

export default topicSlice.reducer;
