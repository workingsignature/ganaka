import { z } from "zod";
import { apiResponseSchema } from "../../../common";
import { runItemSchema } from "../../core/strategies/:strategyid/versions/:versionid/runs/runs";

// ==================== GET /v1/developer/runs ====================

export const getRuns = {
  response: apiResponseSchema.extend({
    data: z.array(runItemSchema),
  }),
};

