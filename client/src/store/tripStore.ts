import { create } from "zustand";

type TripFilters = {
  from: string;
  to: string;
  platform: string;
  tag: string;
  profit: "" | "profit" | "loss";
  sortBy: "date" | "profit" | "distance" | "duration";
  sortOrder: "asc" | "desc";
  search: string;
};

type TripState = {
  filters: TripFilters;
  dismissedAdviceIds: string[];
  setFilters: (payload: Partial<TripFilters>) => void;
  resetFilters: () => void;
  dismissAdvice: (id: string) => void;
  resetDismissedAdvice: () => void;
};

const defaultFilters: TripFilters = {
  from: "",
  to: "",
  platform: "",
  tag: "",
  profit: "",
  sortBy: "date",
  sortOrder: "desc",
  search: ""
};

export const useTripStore = create<TripState>((set) => ({
  filters: defaultFilters,
  dismissedAdviceIds: [],
  setFilters: (payload) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...payload
      }
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  dismissAdvice: (id) =>
    set((state) => ({
      dismissedAdviceIds: [...new Set([...state.dismissedAdviceIds, id])]
    })),
  resetDismissedAdvice: () => set({ dismissedAdviceIds: [] })
}));
