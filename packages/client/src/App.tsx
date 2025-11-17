import { Protect } from "@clerk/clerk-react";
import {
  Checkbox,
  Loader,
  MantineProvider,
  MultiSelect,
  Notification,
  NumberInput,
  Select,
  Tabs,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
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
          MultiSelect: MultiSelect.extend({
            defaultProps: {
              checkIconPosition: "right",
            },
          }),
          Select: Select.extend({
            defaultProps: {
              checkIconPosition: "right",
            },
          }),
          Loader: Loader.extend({
            defaultProps: {
              type: "bars",
            },
          }),
          Tabs: Tabs.extend({
            defaultProps: {
              radius: "lg",
              classNames: {
                root: "h-full max-h-full",
                panel: "h-full max-h-full",
              },
            },
          }),
          TagsInput: TagsInput.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "mb-[19.5px]",
            }),
          }),
          TextInput: TextInput.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              description: "mb-2",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "mb-[19.5px]",
            }),
          }),
          Textarea: Textarea.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              description: "mb-2",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "mb-[19.5px]",
            }),
          }),
          NumberInput: NumberInput.extend({
            classNames: (_, ref) => ({
              label: ref.description ? undefined : "mb-1",
              // reserving space for error message
              error: "mt-1",
              wrapper: ref.error ? "mb-0" : "mb-[19.5px]",
            }),
          }),
          Notification: Notification.extend({
            defaultProps: {
              withBorder: true,
            },
          }),
          Checkbox: Checkbox.extend({
            classNames: () => ({
              description: "!mt-1",
            }),
          }),
        },
      }}
    >
      <Notifications />
      <ModalsProvider>
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
      </ModalsProvider>
    </MantineProvider>
  );
};
