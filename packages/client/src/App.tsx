import { Protect } from "@clerk/clerk-react";
import {
  MantineProvider,
  NumberInput,
  Tabs,
  Textarea,
  TagsInput,
  TextInput,
} from "@mantine/core";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Auth } from "./layouts/Auth/Auth.layout";
import { Dashboard } from "./layouts/Dashboard/Dashboard.layout";
import { NotFound } from "./layouts/NotFound/NotFound";

export const App = () => {
  // DRAW
  return (
    <MantineProvider
      theme={{
        primaryColor: "pink",
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
          TagsInput: TagsInput.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "!mb-[19.5px]",
            }),
          }),
          TextInput: TextInput.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              description: "mb-2",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "!mb-[19.5px]",
            }),
          }),
          Textarea: Textarea.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              description: "mb-2",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "!mb-[19.5px]",
            }),
          }),
          NumberInput: NumberInput.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "!mb-[19.5px]",
            }),
          }),
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
          <Route
            path="/dashboard/*"
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
