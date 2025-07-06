
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiMethods } from "@/services/constant/axiosInstance";
import {
  GET_USERS_ENDPOINT,
  DELETE_USER_ENDPOINT,
  GET_PACKAGES_ENDPOINT,
  DELETE_PACKAGES_ENDPOINT,
  UPDATE_PACKAGES_ENDPOINT,
  CREATE_PACKAGES_ENDPOINT,
} from "@/services/constant/apiConfig";
import { ApiError } from "@/services/constant/axiosInstance";
import {
  IAdmin,
  IPackage,
  IPackageUpdateCreate,
} from "@/interfaces/IAdmin";

interface UsersResponse {
  success: boolean;
  count: number;
  users: IAdmin[];
}

interface AdminState {
  users: IAdmin[];
  packages: IPackage[];
  loading: boolean;
  error: string | null;
  count: number;
}

const initialState: AdminState = {
  users: [],
  packages: [],
  loading: false,
  error: null,
  count: 0,
};

export interface PackageResponse {
  success: boolean;
  message: string;
  packages: IPackage[];
}

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiMethods.get<UsersResponse>(GET_USERS_ENDPOINT);
      const data = response.data as unknown as UsersResponse;
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to fetch users");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiMethods.delete(DELETE_USER_ENDPOINT(userId));
      return { userId, message: response.data.message };
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to delete user");
    }
  }
);

export const fetchPackages = createAsyncThunk(
  "admin/fetchPackages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiMethods.get<PackageResponse>(
        GET_PACKAGES_ENDPOINT
      );
      const data = response.data as unknown as PackageResponse;
      return data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to fetch packages");
    }
  }
);

export const deletePackage = createAsyncThunk(
  "admin/deletePackage",
  async (packageId: string, { rejectWithValue }) => {
    try {
      const response = await apiMethods.delete(
        DELETE_PACKAGES_ENDPOINT(packageId)
      );
      return { packageId, message: response.data.message };
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to delete package");
    }
  }
);

export const createPackage = createAsyncThunk(
  "admin/createPackage",
  async (newPackage: IPackageUpdateCreate, { rejectWithValue }) => {
    try {
      const response = await apiMethods.post(
        CREATE_PACKAGES_ENDPOINT,
        newPackage
      );
      return response.data as unknown as PackageResponse;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to create package");
    }
  }
);

export const updatePackage = createAsyncThunk(
  "admin/updatePackage",
  async (
    {
      packageId,
      updatedPackage,
    }: {
      packageId: string;
      updatedPackage: IPackageUpdateCreate;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiMethods.put(
        UPDATE_PACKAGES_ENDPOINT(packageId),
        updatedPackage
      );
      return response.data as unknown as IPackageUpdateCreate;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to update package");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.users = action.payload.users;
          state.count = action.payload.count;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (user) => user._id !== action.payload.userId
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.packages = action.payload.packages;
        }
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminSlice.reducer;
