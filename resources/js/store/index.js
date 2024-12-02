import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import analysisReducer from './slices/analysisSlice'

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        analysis: analysisReducer,
    },
}) 