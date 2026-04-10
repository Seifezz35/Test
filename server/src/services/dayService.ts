import dayjs from "dayjs";
import { prisma } from "../utils/prisma";
import { roundCurrency } from "../utils/trip";

export const upsertDay = async (userId: string, date: string): Promise<void> => {
  const start = dayjs(date).startOf("day").toDate();
  const end = dayjs(date).endOf("day").toDate();

  const trips = await prisma.trip.findMany({
    where: { userId, date: { gte: start, lte: end } },
    select: { fareAmount: true, tipAmount: true, distanceKm: true, netProfit: true }
  });

  if (trips.length === 0) {
    await prisma.day.deleteMany({ where: { userId, date } });
    return;
  }

  const totalRevenue = roundCurrency(trips.reduce((s, t) => s + t.fareAmount + t.tipAmount, 0));
  const totalDistance = roundCurrency(trips.reduce((s, t) => s + t.distanceKm, 0));
  const netProfit = roundCurrency(trips.reduce((s, t) => s + t.netProfit, 0));
  const tripsCount = trips.length;

  await prisma.day.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, totalRevenue, totalDistance, netProfit, tripsCount },
    update: { totalRevenue, totalDistance, netProfit, tripsCount }
  });
};

export const getToday = async (userId: string) => {
  const date = dayjs().format("YYYY-MM-DD");
  const day = await prisma.day.findUnique({ where: { userId_date: { userId, date } } });
  return day ?? { date, totalRevenue: 0, totalDistance: 0, netProfit: 0, tripsCount: 0 };
};

export const getHistory = async (userId: string) =>
  prisma.day.findMany({
    where: { userId },
    orderBy: { date: "desc" }
  });
