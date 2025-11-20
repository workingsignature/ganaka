import { z } from "zod";
import {
  v1_core_strategies_versions_runs_schemas,
  v1_core_shortlists_schemas,
} from "@ganaka/server-schemas";
import {
  PlaceOrderData,
  OrderFilters,
} from "../apis/orders/orders";

export type RunItem = z.infer<
  typeof v1_core_strategies_versions_runs_schemas.runItemSchema
>;

export type ScheduleDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export type Timeslot = z.infer<
  typeof v1_core_strategies_versions_runs_schemas.daywiseScheduleSchema
>["timeslots"][number];

export type ShortlistItem = z.infer<
  typeof v1_core_shortlists_schemas.shortlistItemSchema
>;

export type ExecutionTime = {
  executionTime: string; // ISO datetime string
  timeslot: Timeslot;
  day: ScheduleDay;
  shortlist: ShortlistItem[];
};

export type RunContext = {
  run: RunItem;
  timeslot: Timeslot;
  shortlist: ShortlistItem[];
  executionTime: string; // ISO datetime string
  orders: {
    placeOrder: (orderData: PlaceOrderData) => Promise<unknown>;
    getOrders: (filters?: OrderFilters) => Promise<unknown>;
    getOrder: (orderId: string) => Promise<unknown>;
    cancelOrder: (orderId: string) => Promise<unknown>;
  };
};
