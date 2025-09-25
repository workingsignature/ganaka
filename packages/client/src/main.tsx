import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { Dashboard } from "./layouts/Dashboard/Dashboard.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Dashboard />
    </Provider>
  </StrictMode>
);
