"use client";

import { PersistGate } from "redux-persist/integration/react";
import { UIProvider } from "./context/UIContext";
import { AuthProviderWrapper } from "./providers/AuthProvider";
import { persistor } from "./redux/store";

export function Providers({ children }) {
  return (
    <PersistGate loading={null} persistor={persistor}>
      <UIProvider>
        <AuthProviderWrapper>
          <div className="flex flex-col min-h-screen">{children}</div>
        </AuthProviderWrapper>
      </UIProvider>
    </PersistGate>
  );
}
