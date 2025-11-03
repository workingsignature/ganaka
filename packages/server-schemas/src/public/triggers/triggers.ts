import { z } from "zod";
import { apiResponseSchema } from "../../common";

// ==================== GET /triggers/instruments ====================

export const triggerInstrumentsUpdate = {
  response: apiResponseSchema.extend({
    data: z.undefined(),
  }),
};
