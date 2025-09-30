import { useSearchParams } from "react-router-dom";

export const useQueryParams = () => {
  // HOOKS
  const [searchParams] = useSearchParams();

  // VARIABLES
  const botId = searchParams.get("botid");

  // RETURN
  return { botId };
};
