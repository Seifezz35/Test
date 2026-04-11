import { Prisma, Trip } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "../utils/prisma";
import {
  calculateDurationMinutes,
  calculateNetProfit,
  calculateTotalExpenses,
  getCommissionAmount,
  roundCurrency
} from "../utils/trip";
import { AppError } from "../utils/appError";

export type TripPayload = {
  date: string;
  startTime: string;
  endTime: string;
  distanceKm: number;
  fareAmount: number;
  commission: number;
  fuelCost: number;
  tollFees?: number;
  parkingFees?: number;
  tipAmount?: number;
  platform: string;
  tags?: string[];
};

type TripFilters = {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  platform?: string;
  tag?: string;
  profit?: "profit" | "loss";
  sortBy?: "date" | "profit" | "distance" | "duration";
  sortOrder?: "asc" | "desc";
  search?: string;
};

const enrichTrip = (trip: Trip) => {
  const commissionAmount = getCommissionAmount(trip.fareAmount, trip.commission);
  const totalExpenses = calculateTotalExpenses(trip);

  return {
    ...trip,
    commissionAmount,
    totalExpenses,
    grossIncome: roundCurrency(trip.fareAmount + trip.tipAmount),
    durationHours: roundCurrency(trip.durationMinutes / 60)
  };
};

export const listTrips = async (userId: string, filters: TripFilters) => {
  const where: Prisma.TripWhereInput = { userId };

  if (filters.from || filters.to) {
    where.date = {
      gte: filters.from ? dayjs(filters.from).startOf("day").toDate() : undefined,
      lte: filters.to ? dayjs(filters.to).endOf("day").toDate() : undefined
    };
  } else if (filters.search) {
    where.date = {
      gte: dayjs(filters.search).startOf("day").toDate(),
      lte: dayjs(filters.search).endOf("day").toDate()
    };
  }

  if (filters.platform) {
    where.platform = filters.platform;
  }

  if (filters.tag) {
    where.tags = { has: filters.tag };
  }

  if (filters.profit === "profit") {
    where.netProfit = { gt: 0 };
  }

  if (filters.profit === "loss") {
    where.netProfit = { lt: 0 };
  }

  const sortFieldMap: Record<string, Prisma.TripOrderByWithRelationInput> = {
    date: { date: filters.sortOrder ?? "desc" },
    profit: { netProfit: filters.sortOrder ?? "desc" },
    distance: { distanceKm: filters.sortOrder ?? "desc" },
    duration: { durationMinutes: filters.sortOrder ?? "desc" }
  };

  const [items, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy: sortFieldMap[filters.sortBy ?? "date"],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.trip.count({ where })
  ]);

  return {
    items: items.map(enrichTrip),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const createTrip = async (userId: string, payload: TripPayload) => {
  const durationMinutes = calculateDurationMinutes(payload.startTime, payload.endTime);
  const netProfit = calculateNetProfit(payload);

  const trip = await prisma.trip.create({
    data: {
      userId,
      date: dayjs(payload.date).toDate(),
      startTime: payload.startTime,
      endTime: payload.endTime,
      durationMinutes,
      distanceKm: payload.distanceKm,
      fareAmount: payload.fareAmount,
      commission: payload.commission,
      fuelCost: payload.fuelCost,
      tollFees: payload.tollFees ?? 0,
      parkingFees: payload.parkingFees ?? 0,
      tipAmount: payload.tipAmount ?? 0,
      platform: payload.platform,
      tags: payload.tags ?? [],
      netProfit
    }
  });

  return enrichTrip(trip);
};

export const getTripById = async (userId: string, id: string) => {
  const trip = await prisma.trip.findFirst({
    where: { id, userId }
  });

  if (!trip) {
    throw new AppError("الرحلة غير موجودة", 404, "TRIP_NOT_FOUND");
  }

  return enrichTrip(trip);
};

export const updateTrip = async (userId: string, id: string, payload: TripPayload) => {
  await getTripById(userId, id);

  const durationMinutes = calculateDurationMinutes(payload.startTime, payload.endTime);
  const netProfit = calculateNetProfit(payload);

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      date: dayjs(payload.date).toDate(),
      startTime: payload.startTime,
      endTime: payload.endTime,
      durationMinutes,
      distanceKm: payload.distanceKm,
      fareAmount: payload.fareAmount,
      commission: payload.commission,
      fuelCost: payload.fuelCost,
      tollFees: payload.tollFees ?? 0,
      parkingFees: payload.parkingFees ?? 0,
      tipAmount: payload.tipAmount ?? 0,
      platform: payload.platform,
      tags: payload.tags ?? [],
      netProfit
    }
  });

  return enrichTrip(trip);
};

export const deleteTrip = async (userId: string, id: string) => {
  await getTripById(userId, id);
  await prisma.trip.delete({ where: { id } });
};

export const getTripsByRange = async (userId: string, start?: Date, end?: Date) => {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (start) dateFilter.gte = start;
  if (end) dateFilter.lte = end;

  return prisma.trip.findMany({
    where: {
      userId,
      date: start || end ? dateFilter : undefined
    },
    orderBy: { date: "asc" }
  });
};

export const getAllTrips = async (userId: string) =>
  prisma.trip.findMany({
    where: { userId },
    orderBy: { date: "asc" }
  });
