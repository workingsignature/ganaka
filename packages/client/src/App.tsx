import { MantineProvider, Tabs } from "@mantine/core";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Auth } from "./layouts/Auth/Auth.layout";
import { Dashboard } from "./layouts/Dashboard/Dashboard.layout";
import { NotFound } from "./layouts/NotFound/NotFound";
import { Protect } from "@clerk/clerk-react";

export const App = () => {
  // DRAW
  return (
    <MantineProvider
      theme={{
        primaryColor: "violet",
        components: {
          Tabs: Tabs.Tab.extend({
            defaultProps: {
              styles: {
                tab: {
                  border: "1px solid var(--mantine-color-gray-3)",
                },
              },
            },
          }),
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <Protect fallback={<Navigate to="/auth" replace />}>
                <Dashboard />
              </Protect>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};
