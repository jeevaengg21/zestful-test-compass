import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Priority {
  id: string;
  name: string;
  level: number;
  color: string;
  description: string;
  isActive: boolean;
  createdDate: string;
}

export interface Status {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string;
  isActive: boolean;
  createdDate: string;
}

interface LookupState {
  priorities: Priority[];
  statuses: Status[];
  loading: {
    priorities: boolean;
    statuses: boolean;
  };
  error: {
    priorities: string | null;
    statuses: string | null;
  };
  lastFetched: {
    priorities: number | null;
    statuses: number | null;
  };
}

const initialState: LookupState = {
  priorities: [],
  statuses: [],
  loading: {
    priorities: false,
    statuses: false,
  },
  error: {
    priorities: null,
    statuses: null,
  },
  lastFetched: {
    priorities: null,
    statuses: null,
  },
};

// Async thunks for fetching lookup data
export const fetchPriorities = createAsyncThunk(
  'lookup/fetchPriorities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/priorities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch priorities');
    }
  }
);

export const fetchStatuses = createAsyncThunk(
  'lookup/fetchStatuses',
  async (params: { category?: string } | undefined, { rejectWithValue }) => {
    try {
      const category = params?.category;
      const url = category ? `/api/statuses?category=${category}` : '/api/statuses';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch statuses');
    }
  }
);

// Thunk for refreshing both priorities and statuses
export const refreshLookupData = createAsyncThunk(
  'lookup/refreshLookupData',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchPriorities()),
      dispatch(fetchStatuses({ category: 'test_case' }))
    ]);
  }
);

const lookupSlice = createSlice({
  name: 'lookup',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error.priorities = null;
      state.error.statuses = null;
    },
  },
  extraReducers: (builder) => {
    // Priorities
    builder
      .addCase(fetchPriorities.pending, (state) => {
        state.loading.priorities = true;
        state.error.priorities = null;
      })
      .addCase(fetchPriorities.fulfilled, (state, action: PayloadAction<Priority[]>) => {
        state.loading.priorities = false;
        state.priorities = action.payload;
        state.lastFetched.priorities = Date.now();
      })
      .addCase(fetchPriorities.rejected, (state, action) => {
        state.loading.priorities = false;
        state.error.priorities = action.payload as string;
      })
      // Statuses
      .addCase(fetchStatuses.pending, (state) => {
        state.loading.statuses = true;
        state.error.statuses = null;
      })
      .addCase(fetchStatuses.fulfilled, (state, action: PayloadAction<Status[]>) => {
        state.loading.statuses = false;
        state.statuses = action.payload;
        state.lastFetched.statuses = Date.now();
      })
      .addCase(fetchStatuses.rejected, (state, action) => {
        state.loading.statuses = false;
        state.error.statuses = action.payload as string;
      });
  },
});

export const { clearErrors } = lookupSlice.actions;
export default lookupSlice.reducer;