import { stringify } from "csv-stringify/sync";
import { getAllTrips } from "./tripService";
import { getCommissionAmount, roundCurrency } from "../utils/trip";

export const buildTripsCsv = async (userId: string) => {
  const trips = await getAllTrips(userId);

  const rows = trips.map((trip) => ({
    التاريخ: trip.date.toISOString(),
    المنصة: trip.platform,
    "وقت البداية": trip.startTime,
    "وقت النهاية": trip.endTime,
    "المسافة كم": trip.distanceKm,
    الأجرة: trip.fareAmount,
    البقشيش: trip.tipAmount,
    "نسبة العمولة": trip.commission,
    "قيمة العمولة": getCommissionAmount(trip.fareAmount, trip.commission),
    الوقود: trip.fuelCost,
    الرسوم: roundCurrency(trip.tollFees + trip.parkingFees),
    "صافي الربح": trip.netProfit,
    الوسوم: trip.tags.join(" | ")
  }));

  return stringify(rows, { header: true });
};
