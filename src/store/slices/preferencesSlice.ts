import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readJson } from '@/utils/storage'

export const PREFERENCES_KEY = 'ul.preferences'
export type Theme = 'dark' | 'light'

interface PreferencesState {
  theme: Theme
  recentSearches: string[]
}

const stored = readJson<Partial<PreferencesState>>(PREFERENCES_KEY, {})
const initialState: PreferencesState = {
  theme: stored.theme === 'light' ? 'light' : 'dark',
  recentSearches: Array.isArray(stored.recentSearches) ? stored.recentSearches.slice(0, 6) : [],
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    themeToggled(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    recentSearchAdded(state, action: PayloadAction<string>) {
      const term = action.payload.trim()
      if (term.length < 2) return
      state.recentSearches = [term, ...state.recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6)
    },
    recentSearchesCleared(state) {
      state.recentSearches = []
    },
  },
})

export const { themeToggled, recentSearchAdded, recentSearchesCleared } = preferencesSlice.actions
export default preferencesSlice.reducer
