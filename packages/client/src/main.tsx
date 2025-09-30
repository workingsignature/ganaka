import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { Dashboard } from "./layouts/Dashboard/Dashboard.layout.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Auth } from "./layouts/Auth/Auth.layout.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>
);
