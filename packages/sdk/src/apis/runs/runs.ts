import { API_URL } from "../../helpers/constants";
import { api } from "../api";

export const runsApi = {
  getRuns: async (
    status?: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"
  ) => {
    try {
      const url = status
        ? `${API_URL}/developer/runs?status=${status}`
        : `${API_URL}/developer/runs`;
      console.log(url);
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  updateRun: async (
    runId: string,
    data: { status?: string; errorLog?: string | null }
  ) => {
    try {
      const response = await api.put(
        `${API_URL}/developer/runs/${runId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  createExecutions: async (
    runId: string,
    executions: Array<{
      executionTime: string;
      timeslot?: Record<string, unknown>;
      day?: string;
    }>
  ) => {
    try {
      const response = await api.post(
        `${API_URL}/developer/runs/${runId}/executions`,
        { executions }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  updateExecution: async (
    runId: string,
    executionId: string,
    data: {
      status?: "PENDING" | "COMPLETED" | "FAILED" | "SKIPPED";
      executedAt?: string | null;
      errorLog?: string | null;
    }
  ) => {
    try {
      const response = await api.put(
        `${API_URL}/developer/runs/${runId}/executions/${executionId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  getIncompleteExecutions: async (runId: string) => {
    try {
      const response = await api.get(
        `${API_URL}/developer/runs/${runId}/executions?incomplete=true`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};
