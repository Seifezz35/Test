export type ThemeMode = "dark" | "light";

export type Profile = {
  id?: string;
  carModel: string | null;
  carYear: number | null;
  licensePlate: string | null;
  defaultCommission: number;
  defaultCommissionUber: number;
  defaultCommissionCareem: number;
  defaultCommissionInDrive: number;
  defaultCommissionOther: number;
  defaultFuelCostKm: number;
  currency: string;
  notificationsEnabled: boolean;
  monthlyGoal: number;
  theme: ThemeMode;
};

export type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isVerified: boolean;
  profile: Profile | null;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
};

export type ApiResponse<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type TripTag = "peak hour" | "airport run" | "long distance";

export type Trip = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  distanceKm: number;
  fareAmount: number;
  tipAmount: number;
  commission: number;
  fuelCost: number;
  tollFees: number;
  parkingFees: number;
  netProfit: number;
  platform: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  commissionAmount?: number;
  totalExpenses?: number;
  grossIncome?: number;
  durationHours?: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TripListResponse = {
  items: Trip[];
  pagination: PaginationMeta;
};

export type AnalyticsSummary = {
  totalTrips: number;
  totalDistance: number;
  grossIncome: number;
  totalExpenses: number;
  netProfit: number;
  avgProfitPerTrip: number;
  workingHours: number;
};

export type PieDatum = {
  name: string;
  value: number;
  trips?: number;
};

export type DailyAnalytics = {
  view: "daily";
  date: string;
  summary: AnalyticsSummary;
  expenseSplit: PieDatum[];
  platformSplit: PieDatum[];
  dayOfWeekPerformance: { day: string; value: number }[];
};

export type MonthlyAnalytics = {
  view: "monthly";
  month: string;
  summary: AnalyticsSummary;
  dailyBreakdown: { date: string; netProfit: number; trips: number }[];
  bestDay: { date: string; netProfit: number; trips: number } | null;
  expenseSplit: PieDatum[];
  platformSplit: PieDatum[];
  goalProgress: {
    target: number;
    current: number;
    percent: number;
  };
};

export type FuelEntry = {
  id: string;
  date: string;
  liters: number;
  totalCost: number;
  pricePerLiter: number;
  stationName?: string | null;
  notes?: string | null;
};

export type CumulativeAnalytics = {
  view: "cumulative";
  summary: AnalyticsSummary;
  expenseSplit: PieDatum[];
  platformSplit: PieDatum[];
  dayOfWeekPerformance: { day: string; value: number }[];
  monthlyTrend: { month: string; netProfit: number; trips: number }[];
  streak: number;
  monthlyGoal: number;
  latestFuelEntries: FuelEntry[];
};

export type AdviceCard = {
  id: string;
  tone: "danger" | "warning" | "info" | "success" | "celebration";
  title: string;
  message: string;
};

export type AdviceResponse = {
  generatedAt: string;
  cards: AdviceCard[];
};
