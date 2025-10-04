import { MantineProvider } from "@mantine/core";
import { format } from "date-fns";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Auth } from "./layouts/Auth/Auth.layout";
import { Dashboard } from "./layouts/Dashboard/Dashboard.layout";

export const App = () => {
  // VARIABLES
  const today = format(new Date(), "yyyy-MM-dd");

  // DRAW
  return (
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/:date" element={<Dashboard />} />
          <Route path="/" element={<Navigate to={`/${today}`} replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};
