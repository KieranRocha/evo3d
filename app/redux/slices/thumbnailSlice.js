// app/redux/slices/thumbnailSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cachedThumbnails: {},
};

export const thumbnailSlice = createSlice({
  name: "thumbnails",
  initialState,
  reducers: {
    cacheThumbnail: (state, action) => {
      const { fileId, dataUrl } = action.payload;
      state.cachedThumbnails[fileId] = dataUrl;
    },
    clearThumbnailCache: (state) => {
      state.cachedThumbnails = {};
    },
  },
});

export const { cacheThumbnail, clearThumbnailCache } = thumbnailSlice.actions;

export default thumbnailSlice.reducer;
