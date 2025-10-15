import { MantineProvider } from "@mantine/core";
import { Tabs } from "@mantine/core";
import { format } from "date-fns";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Auth } from "./layouts/Auth/Auth.layout";
import { Dashboard } from "./layouts/Dashboard/Dashboard.layout";
import { NotFound } from "./layouts/NotFound/NotFound";

export const App = () => {
  // VARIABLES
  const today = format(new Date(), "yyyy-MM-dd");

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
          <Route path="/:date/shedule/:sheduleid" element={<Dashboard />} />
          <Route path="/:date" element={<Dashboard />} />
          <Route path="/" element={<Navigate to={`/${today}`} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};
