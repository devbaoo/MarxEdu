import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LoginResponse, User } from "@/interfaces/IUser";
import axiosInstance, { ApiError } from "@/services/constant/axiosInstance";
import { message } from "antd";
import {
  LOGIN_ENDPOINT,
  REGISTER_ENDPOINT,
  FORGOT_PASSWORD_ENDPOINT,
  VERIFY_EMAIL_ENDPOINT,
  RESEND_VERIFICATION_ENDPOINT,
  RESET_PASSWORD_ENDPOINT,
  CHANGE_PASSWORD_ENDPOINT,
  REFRESH_TOKEN_ENDPOINT,
} from "@/services/constant/apiConfig";
import { PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  lastFailedAttempt: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  loginAttempts: 0,
  lastFailedAttempt: null,
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  recaptchaToken: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ResendVerificationRequest {
  email: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: { message: string } }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(LOGIN_ENDPOINT, credentials);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Đăng nhập thất bại";
    return rejectWithValue({ message });
  }
});

export const registerUser = createAsyncThunk<
  LoginResponse,
  RegisterCredentials,
  { rejectValue: { message: string } }
>("auth/registerUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(REGISTER_ENDPOINT, credentials);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Đăng ký thất bại";
    return rejectWithValue({ message });
  }
});

export const forgotPassword = createAsyncThunk<
  { success: boolean; message: string },
  { email: string; recaptchaToken: string },
  { rejectValue: { message: string } }
>("auth/forgotPassword", async (request, { rejectWithValue }) => {
  try {
    console.log("Sending forgot password request:", {
      email: request.email,
      recaptchaToken: request.recaptchaToken ? `${request.recaptchaToken.substring(0, 10)}...` : 'missing'
    });

    const response = await axiosInstance.post(
      FORGOT_PASSWORD_ENDPOINT,
      {
        email: request.email,
        recaptchaToken: request.recaptchaToken
      }
    );

    console.log("Forgot password response:", response.data);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Yêu cầu đặt lại mật khẩu thất bại";
    console.error("Forgot password error:", error);
    return rejectWithValue({ message });
  }
});

export const resetPassword = createAsyncThunk<
  { success: boolean; message: string },
  ResetPasswordRequest,
  { rejectValue: { message: string } }
>("auth/resetPassword", async (request, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `${RESET_PASSWORD_ENDPOINT}/${request.token}`,
      { password: request.password }
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Đặt lại mật khẩu thất bại";
    return rejectWithValue({ message });
  }
});

export const verifyEmail = createAsyncThunk<
  { success: boolean; message: string },
  string,
  { rejectValue: { message: string } }
>("auth/verifyEmail", async (token, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(
      `${VERIFY_EMAIL_ENDPOINT}/${token}`
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Xác thực email thất bại";
    return rejectWithValue({ message });
  }
});

export const resendVerification = createAsyncThunk<
  { success: boolean; message: string },
  ResendVerificationRequest,
  { rejectValue: { message: string } }
>("auth/resendVerification", async (request, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      RESEND_VERIFICATION_ENDPOINT,
      request
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Gửi lại email xác thực thất bại";
    return rejectWithValue({ message });
  }
});

export const changePassword = createAsyncThunk<
  { success: boolean; message: string },
  ChangePasswordRequest,
  { rejectValue: { message: string } }
>("auth/changePassword", async (request, { rejectWithValue }) => {
  try {
    if (request.newPassword !== request.confirmPassword) {
      return rejectWithValue({
        message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
      });
    }
    const response = await axiosInstance.post(CHANGE_PASSWORD_ENDPOINT, {
      oldPassword: request.oldPassword,
      newPassword: request.newPassword,
    });
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Đổi mật khẩu thất bại";
    return rejectWithValue({ message });
  }
});

export const refreshToken = createAsyncThunk<
  { accessToken: string; refreshToken: string },
  string,
  { rejectValue: { message: string } }
>("auth/refreshToken", async (refreshToken, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(REFRESH_TOKEN_ENDPOINT, {
      refreshToken,
    });
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Làm mới token thất bại";
    return rejectWithValue({ message });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastFailedAttempt = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    // Add real-time lives update
    updateUserLives: (state, action: PayloadAction<{ lives: number; livesDeducted?: boolean }>) => {
      if (state.user) {
        state.user.lives = action.payload.lives;
        console.log('🔄 Updated user lives in auth state:', action.payload.lives);
      }
    },

    // Update user XP and level
    updateUserXPAndLevel: (state, action: PayloadAction<{ 
      xp?: number; 
      userLevel?: number; 
      earnedXP?: number 
    }>) => {
      if (state.user) {
        if (typeof action.payload.xp === 'number') {
          state.user.xp = action.payload.xp;
        }
        if (typeof action.payload.userLevel === 'number') {
          state.user.userLevel = action.payload.userLevel;
        }
        console.log('🎯 Updated user XP/Level:', {
          xp: state.user.xp,
          level: state.user.userLevel
        });
      }
    },
    // Update user profile data
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
    loginWithGoogle: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem("token", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastFailedAttempt = null;
    },
    incrementLoginAttempts: (state) => {
      const now = Date.now();
      // Reset attempts if last failure was more than 15 minutes ago
      if (state.lastFailedAttempt && now - state.lastFailedAttempt > 15 * 60 * 1000) {
        state.loginAttempts = 1;
      } else {
        state.loginAttempts += 1;
      }
      state.lastFailedAttempt = now;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0;
        state.lastFailedAttempt = null;
        localStorage.setItem("token", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);

        message.success(action.payload.message);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Đăng nhập thất bại";
        message.error(state.error);
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        message.success(action.payload.message || "Đăng ký thành công");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Đăng ký thất bại";

        message.error(state.error);
      })
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        if (action.payload.success) {
          message.success(
            action.payload.message || "Email đặt lại mật khẩu đã được gửi"
          );
        } else {
          message.error(
            action.payload.message || "Yêu cầu đặt lại mật khẩu thất bại"
          );
        }
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Yêu cầu đặt lại mật khẩu thất bại";

        message.error(state.error);
      })
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        if (action.payload.success) {
          message.success(
            action.payload.message || "Mật khẩu đã được đặt lại thành công"
          );
        } else {
          message.error(action.payload.message || "Đặt lại mật khẩu thất bại");
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Đặt lại mật khẩu thất bại";

        message.error(state.error);
      })
      // Verify email cases
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.isVerify = true;
        }
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Xác thực email thất bại";
      })
      // Resend verification cases
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Gửi lại email xác thực thất bại";
      })
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        message.success(action.payload.message || "Đổi mật khẩu thành công");
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Đổi mật khẩu thất bại";
        message.error(state.error);
      })
      // Add refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        localStorage.setItem("token", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Làm mới token thất bại";
        message.error(state.error);
      });
  },
});

export const { 
  logout, 
  clearAuthError, 
  updateUserLives,
  updateUserXPAndLevel,
  updateUserProfile, 
  setAvatar, 
  loginWithGoogle, 
  resetLoginAttempts, 
  incrementLoginAttempts 
} = authSlice.actions;
export default authSlice.reducer;
