import { API_URL } from "../../helpers/constants";
import { api } from "../api";

export type OrderType =
  | "BUY"
  | "SELL"
  | "BUY_LIMIT"
  | "SELL_LIMIT"
  | "BUY_STOP"
  | "SELL_STOP";

export type OrderStatus = "PENDING" | "FILLED" | "CANCELLED" | "FAILED";

export interface PlaceOrderData {
  instrumentId: string;
  orderType: OrderType;
  quantity: number;
  price?: number | null;
  stopLoss?: number | null;
  target?: number | null;
  metadata?: Record<string, unknown>;
}

export interface OrderFilters {
  status?: OrderStatus;
  instrumentId?: string;
}

export const ordersApi = {
  placeOrder: async (runId: string, orderData: PlaceOrderData) => {
    try {
      const response = await api.post(
        `${API_URL}/developer/runs/${runId}/orders`,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  getOrders: async (runId: string, filters?: OrderFilters) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) {
        queryParams.append("status", filters.status);
      }
      if (filters?.instrumentId) {
        queryParams.append("instrumentId", filters.instrumentId);
      }
      const queryString = queryParams.toString();
      const url = `${API_URL}/developer/runs/${runId}/orders${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  getOrder: async (runId: string, orderId: string) => {
    try {
      const response = await api.get(
        `${API_URL}/developer/runs/${runId}/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  cancelOrder: async (runId: string, orderId: string) => {
    try {
      const response = await api.delete(
        `${API_URL}/developer/runs/${runId}/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};
