import { ClerkProvider } from "@clerk/clerk-react";
import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "react-complex-tree/lib/style-modern.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./App.tsx";
import "./index.css";
import { store } from "./store/store.ts";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Provider store={store}>
        <App />
      </Provider>
    </ClerkProvider>
  </StrictMode>
);
