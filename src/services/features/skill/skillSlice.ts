//skill
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance, { ApiError } from "@/services/constant/axiosInstance";
import {
  CHOOSE_SKILLS_ENDPOINT,
  GET_SKILLS_ENDPOINT,
  CREATE_SKILL_ENDPOINT,
  UPDATE_SKILL_ENDPOINT,
  DELETE_SKILL_ENDPOINT,
} from "@/services/constant/apiConfig";

//skill
export interface Skill {
  _id: string;
  name: string;
  description: string;
  supportedTypes: string;
}

interface SkillState {
  skills: Skill[];
  loading: boolean;
  error: string | null;
}

const initialState: SkillState = {
  skills: [],
  loading: false,
  error: null,
};

export const fetchSkills = createAsyncThunk<
  { skills: Skill[] },
  void,
  { rejectValue: { message: string } }
>("skill/fetchSkills", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(GET_SKILLS_ENDPOINT);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to fetch skills";
    return rejectWithValue({ message });
  }
});

export const chooseSkills = createAsyncThunk<
  void,
  string[],
  { rejectValue: { message: string } }
>("skill/chooseSkills", async (selectedSkillIds, { rejectWithValue }) => {
  try {
    await axiosInstance.post(CHOOSE_SKILLS_ENDPOINT, {
      skills: selectedSkillIds,
    });
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to choose skills";
    return rejectWithValue({ message });
  }
});

export const createSkill = createAsyncThunk<
  { skill: Skill },
  { name: string; description: string; supportedTypes: string[] },
  { rejectValue: { message: string } }
>("skill/createSkill", async (skillData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(CREATE_SKILL_ENDPOINT, skillData);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to create skill";
    return rejectWithValue({ message });
  }
});

export const updateSkill = createAsyncThunk<
  { skill: Skill },
  {
    id: string;
    data: { name: string; description: string; supportedTypes: string[] };
  },
  { rejectValue: { message: string } }
>("skill/updateSkill", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(UPDATE_SKILL_ENDPOINT(id), data);
    return response.data;
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to update skill";
    return rejectWithValue({ message });
  }
});

export const deleteSkill = createAsyncThunk<
  void,
  string,
  { rejectValue: { message: string } }
>("skill/deleteSkill", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(DELETE_SKILL_ENDPOINT(id));
  } catch (err: unknown) {
    const error = err as ApiError;
    const message = error.message || "Failed to delete skill";
    return rejectWithValue({ message });
  }
});

const skillSlice = createSlice({
  name: "skill",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = action.payload.skills;
        state.error = null;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch skills";
      })
      .addCase(createSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.skills.push(action.payload.skill);
        state.error = null;
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create skill";
      })
      .addCase(updateSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.skills.findIndex(
          (skill) => skill._id === action.payload.skill._id
        );
        if (index !== -1) {
          state.skills[index] = action.payload.skill;
        }
        state.error = null;
      })
      .addCase(updateSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update skill";
      })
      .addCase(deleteSkill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.skills = state.skills.filter(
          (skill) => skill._id !== action.meta.arg
        );
        state.error = null;
      })
      .addCase(deleteSkill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete skill";
      });
  },
});

export default skillSlice.reducer;
