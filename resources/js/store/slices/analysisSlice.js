import { createSlice } from '@reduxjs/toolkit'

export const analysisSlice = createSlice({
    name: 'analysis',
    initialState: {
        githubUrl: '',
        loading: false,
        analysis: null,
        error: null,
    },
    reducers: {
        setGithubUrl: (state, action) => {
            state.githubUrl = action.payload
        },
        startAnalysis: (state) => {
            state.loading = true
            state.error = null
            state.analysis = null
        },
        analysisSuccess: (state, action) => {
            state.loading = false
            state.analysis = action.payload
        },
        analysisError: (state, action) => {
            state.loading = false
            state.error = action.payload
        },
    },
})

export const { setGithubUrl, startAnalysis, analysisSuccess, analysisError } = analysisSlice.actions
export default analysisSlice.reducer 