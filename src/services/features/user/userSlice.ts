import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiMethods } from "@/services/constant/axiosInstance";
import {
  GET_PROFILE_TOKEN_ENDPOINT,
  UPDATE_AVATAR_PROFILE_ENDPOINT,
  UPDATE_PROFILE_ENDPOINT,
} from "@/services/constant/apiConfig";
import {  UserProfile } from "@/interfaces/IUser";

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  avatarUploading: boolean;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  password?: string;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  avatarUploading: false,
};

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiMethods.get<UserProfile>(
        GET_PROFILE_TOKEN_ENDPOINT
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "user/uploadAvatar",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiMethods.upload<UserProfile>(
        UPDATE_AVATAR_PROFILE_ENDPOINT,
        formData
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload avatar");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await apiMethods.put<UserProfile>(
        UPDATE_PROFILE_ENDPOINT,
        data
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.avatarUploading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.avatarUploading = false;
        state.profile = action.payload;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.avatarUploading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
