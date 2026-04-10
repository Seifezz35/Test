import dayjs from "dayjs";
import { Trip } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { getAllTrips, getTripsByRange } from "./tripService";
import { calculateTotalExpenses, getCommissionAmount, roundCurrency } from "../utils/trip";

const arabicWeekDays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت"
];

const buildSummary = (trips: Trip[]) => {
  const totalTrips = trips.length;
  const totalDistance = roundCurrency(trips.reduce((sum, trip) => sum + trip.distanceKm, 0));
  const grossIncome = roundCurrency(
    trips.reduce((sum, trip) => sum + trip.fareAmount + trip.tipAmount, 0)
  );
  const totalExpenses = roundCurrency(
    trips.reduce((sum, trip) => sum + calculateTotalExpenses(trip), 0)
  );
  const netProfit = roundCurrency(trips.reduce((sum, trip) => sum + trip.netProfit, 0));
  const workingHours = roundCurrency(
    trips.reduce((sum, trip) => sum + trip.durationMinutes, 0) / 60
  );
  const avgProfitPerTrip = totalTrips ? roundCurrency(netProfit / totalTrips) : 0;

  return {
    totalTrips,
    totalDistance,
    grossIncome,
    totalExpenses,
    netProfit,
    avgProfitPerTrip,
    workingHours
  };
};

const buildExpenseSplit = (trips: Trip[]) => {
  const commission = roundCurrency(
    trips.reduce((sum, trip) => sum + getCommissionAmount(trip.fareAmount, trip.commission), 0)
  );
  const fuel = roundCurrency(trips.reduce((sum, trip) => sum + trip.fuelCost, 0));
  const tolls = roundCurrency(trips.reduce((sum, trip) => sum + trip.tollFees, 0));
  const parking = roundCurrency(trips.reduce((sum, trip) => sum + trip.parkingFees, 0));

  return [
    { name: "عمولة", value: commission },
    { name: "وقود", value: fuel },
    { name: "رسوم طريق", value: tolls },
    { name: "انتظار", value: parking }
  ].filter((item) => item.value > 0);
};

const buildPlatformSplit = (trips: Trip[]) => {
  const total = trips.length || 1;
  const map = new Map<string, number>();

  trips.forEach((trip) => {
    map.set(trip.platform, (map.get(trip.platform) ?? 0) + 1);
  });

  return [...map.entries()].map(([name, count]) => ({
    name,
    value: roundCurrency((count / total) * 100),
    trips: count
  }));
};

const buildDayOfWeekPerformance = (trips: Trip[]) => {
  const stats = Array.from({ length: 7 }, (_, index) => ({
    day: arabicWeekDays[index],
    value: 0,
    count: 0
  }));

  trips.forEach((trip) => {
    const dayIndex = dayjs(trip.date).day();
    stats[dayIndex].value += trip.netProfit;
    stats[dayIndex].count += 1;
  });

  return stats.map((entry) => ({
    day: entry.day,
    value: entry.count ? roundCurrency(entry.value / entry.count) : 0
  }));
};

const buildDailyBreakdown = (trips: Trip[]) => {
  const groups = new Map<string, { netProfit: number; trips: number }>();

  trips.forEach((trip) => {
    const key = dayjs(trip.date).format("YYYY-MM-DD");
    const current = groups.get(key) ?? { netProfit: 0, trips: 0 };
    groups.set(key, {
      netProfit: current.netProfit + trip.netProfit,
      trips: current.trips + 1
    });
  });

  return [...groups.entries()].map(([date, stats]) => ({
    date,
    netProfit: roundCurrency(stats.netProfit),
    trips: stats.trips
  }));
};

const buildMonthlyTrend = (trips: Trip[]) => {
  const groups = new Map<string, { netProfit: number; trips: number }>();

  trips.forEach((trip) => {
    const key = dayjs(trip.date).format("YYYY-MM");
    const current = groups.get(key) ?? { netProfit: 0, trips: 0 };
    groups.set(key, {
      netProfit: current.netProfit + trip.netProfit,
      trips: current.trips + 1
    });
  });

  return [...groups.entries()].map(([month, stats]) => ({
    month,
    netProfit: roundCurrency(stats.netProfit),
    trips: stats.trips
  }));
};

const calculateStreak = (trips: Trip[]) => {
  const uniqueDays = [...new Set(trips.map((trip) => dayjs(trip.date).format("YYYY-MM-DD")))].sort(
    (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()
  );

  if (!uniqueDays.length) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = dayjs(uniqueDays[index - 1]);
    const current = dayjs(uniqueDays[index]);

    if (previous.diff(current, "day") === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
};

export const getDailyAnalytics = async (userId: string, date?: string) => {
  const target = date ? dayjs(date) : dayjs();
  const [dailyTrips, allTrips] = await Promise.all([
    getTripsByRange(userId, target.startOf("day").toDate(), target.endOf("day").toDate()),
    getAllTrips(userId)
  ]);

  return {
    view: "daily",
    date: target.format("YYYY-MM-DD"),
    summary: buildSummary(dailyTrips),
    expenseSplit: buildExpenseSplit(dailyTrips),
    platformSplit: buildPlatformSplit(dailyTrips),
    dayOfWeekPerformance: buildDayOfWeekPerformance(allTrips)
  };
};

export const getMonthlyAnalytics = async (userId: string, year: number, month: number) => {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const end = start.endOf("month");
  const [trips, profile] = await Promise.all([
    getTripsByRange(userId, start.startOf("month").toDate(), end.endOf("month").toDate()),
    prisma.profile.findUnique({ where: { userId } })
  ]);

  const dailyBreakdown = buildDailyBreakdown(trips);
  const bestDay = [...dailyBreakdown].sort((a, b) => b.netProfit - a.netProfit)[0] ?? null;
  const summary = buildSummary(trips);
  const monthlyGoal = profile?.monthlyGoal ?? 3000;

  return {
    view: "monthly",
    month: start.format("YYYY-MM"),
    summary,
    dailyBreakdown,
    bestDay,
    expenseSplit: buildExpenseSplit(trips),
    platformSplit: buildPlatformSplit(trips),
    goalProgress: {
      target: monthlyGoal,
      current: summary.netProfit,
      percent: monthlyGoal ? Math.min(100, roundCurrency((summary.netProfit / monthlyGoal) * 100)) : 0
    }
  };
};

export const getCumulativeAnalytics = async (userId: string) => {
  const [trips, profile, fuelEntries] = await Promise.all([
    getAllTrips(userId),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.fuelEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5
    })
  ]);

  const summary = buildSummary(trips);

  return {
    view: "cumulative",
    summary,
    expenseSplit: buildExpenseSplit(trips),
    platformSplit: buildPlatformSplit(trips),
    dayOfWeekPerformance: buildDayOfWeekPerformance(trips),
    monthlyTrend: buildMonthlyTrend(trips),
    streak: calculateStreak(trips),
    monthlyGoal: profile?.monthlyGoal ?? 3000,
    latestFuelEntries: fuelEntries
  };
};
