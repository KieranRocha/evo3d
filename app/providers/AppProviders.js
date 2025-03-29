"use client";

import { ReduxProvider } from "../redux/provider";
import { AuthProvider } from "../context/AuthContext";
import { UploadProvider } from "../context/UploadContext";

export function AppProviders({ children }) {
  return (
    <ReduxProvider>
      <AuthProvider>
        <UploadProvider>{children}</UploadProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}
