import { API_URL } from "../../helpers/constants";
import { api } from "../api";

export const runsApi = {
  getRuns: async () => {
    try {
      console.log(`${API_URL}/developer/runs`);
      const response = await api.get(`${API_URL}/developer/runs`);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};
