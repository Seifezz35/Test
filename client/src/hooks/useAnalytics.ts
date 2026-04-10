import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/axiosInstance";
import type {
  ApiResponse,
  CumulativeAnalytics,
  DailyAnalytics,
  MonthlyAnalytics
} from "@/types";
import { getTodayIso } from "@/utils/dateHelpers";

type AnalyticsView = "daily" | "monthly" | "cumulative";

export const useAnalytics = (view: AnalyticsView) => {
  const [data, setData] = useState<DailyAnalytics | MonthlyAnalytics | CumulativeAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date(getTodayIso());
      const response =
        view === "daily"
          ? await api.get<ApiResponse<DailyAnalytics>>("/analytics/daily", {
              params: { date: getTodayIso() }
            })
          : view === "monthly"
            ? await api.get<ApiResponse<MonthlyAnalytics>>("/analytics/monthly", {
                params: { year: today.getFullYear(), month: today.getMonth() + 1 }
              })
            : await api.get<ApiResponse<CumulativeAnalytics>>("/analytics/cumulative");

      setData(response.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    refetch: fetchAnalytics
  };
};
