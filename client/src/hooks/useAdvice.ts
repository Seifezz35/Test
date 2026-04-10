import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/axiosInstance";
import type { AdviceResponse, ApiResponse } from "@/types";
import { getTodayIso } from "@/utils/dateHelpers";

export const useAdvice = () => {
  const [data, setData] = useState<AdviceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<AdviceResponse>>("/analytics/advice", {
        params: {
          date: getTodayIso()
        }
      });
      setData(response.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  return {
    data,
    loading,
    refetch: fetchAdvice
  };
};
