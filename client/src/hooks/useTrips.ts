import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/axiosInstance";
import { useTripStore } from "@/store/tripStore";
import type { ApiResponse, Trip, TripListResponse } from "@/types";

export const useTrips = (page = 1, limit = 10) => {
  const filters = useTripStore((state) => state.filters);
  const [data, setData] = useState<TripListResponse | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<TripListResponse>>("/trips", {
        params: { ...filters, page, limit }
      });
      setData(response.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  const fetchTrip = useCallback(async (id: string) => {
    try {
      const response = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
      setSelectedTrip(response.data.data);
    } catch {
      setSelectedTrip(null);
    }
  }, []);

  const removeTrip = useCallback(async (id: string) => {
    await api.delete(`/trips/${id}`);
    await fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return {
    data,
    selectedTrip,
    loading,
    refetch: fetchTrips,
    fetchTrip,
    removeTrip
  };
};
