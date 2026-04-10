import dayjs from "dayjs";
import { Trip } from "@prisma/client";
import { getAllTrips, getTripsByRange } from "./tripService";
import { getCommissionAmount, roundCurrency } from "../utils/trip";

type AdviceCard = {
  id: string;
  tone: "danger" | "warning" | "info" | "success" | "celebration";
  title: string;
  message: string;
};

const dailyProfitAdvice = (netProfit: number): AdviceCard => {
  if (netProfit < 0) {
    return {
      id: "daily-loss",
      tone: "danger",
      title: "تنبيه خسارة",
      message: "اليوم خسرت! جرب تقلل وقت الانتظار وركز على المناطق المزدحمة"
    };
  }

  if (netProfit <= 50) {
    return {
      id: "daily-breakeven",
      tone: "warning",
      title: "وصلت للتعادل",
      message: "وصلت للتعادل بس مش كفاية، حاول تضيف 2-3 رحلات في وقت الذروة"
    };
  }

  if (netProfit <= 200) {
    return {
      id: "daily-decent",
      tone: "info",
      title: "شغل كويس",
      message: "شغل كويس! لو زدت ساعة في وقت الذروة هتكسب أكتر بـ 30%"
    };
  }

  if (netProfit <= 500) {
    return {
      id: "daily-good",
      tone: "success",
      title: "أداء ممتاز",
      message: "أداء ممتاز! احرص على صيانة العربية عشان تحافظ على الكفاءة دي"
    };
  }

  return {
    id: "daily-excellent",
    tone: "celebration",
    title: "يوم ذهبي",
    message: "يوم ذهبي! سجل الوقت والمنطقة دي عشان تكررها"
  };
};

const arabicDayNames = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت"
];

const buildWeekPatternAdvice = (trips: Trip[]) => {
  if (trips.length < 3) {
    return [] as AdviceCard[];
  }

  const byDay = new Map<number, { total: number; count: number }>();

  trips.forEach((trip) => {
    const day = dayjs(trip.date).day();
    const current = byDay.get(day) ?? { total: 0, count: 0 };
    byDay.set(day, {
      total: current.total + trip.netProfit,
      count: current.count + 1
    });
  });

  const ranked = [...byDay.entries()]
    .map(([day, stats]) => ({
      day,
      average: stats.total / stats.count
    }))
    .sort((a, b) => b.average - a.average);

  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  return [
    {
      id: "best-day",
      tone: "success" as const,
      title: "أفضل يوم ليك",
      message: `${arabicDayNames[best.day]} أحسن يوم ليك، حاول تشتغل فيه دايمًا`
    },
    {
      id: "worst-day",
      tone: "warning" as const,
      title: "أضعف يوم",
      message: `${arabicDayNames[worst.day]} بيكون أضعف يوم، فكر تصلح العربية فيه`
    }
  ];
};

export const buildAdvice = async (userId: string, date?: string) => {
  const targetDate = date ? dayjs(date) : dayjs();
  const [dailyTrips, allTrips] = await Promise.all([
    getTripsByRange(userId, targetDate.startOf("day").toDate(), targetDate.endOf("day").toDate()),
    getAllTrips(userId)
  ]);

  const dailyGross = roundCurrency(
    dailyTrips.reduce((sum, trip) => sum + trip.fareAmount + trip.tipAmount, 0)
  );
  const dailyNet = roundCurrency(dailyTrips.reduce((sum, trip) => sum + trip.netProfit, 0));
  const fuelTotal = roundCurrency(dailyTrips.reduce((sum, trip) => sum + trip.fuelCost, 0));
  const commissionTotal = roundCurrency(
    dailyTrips.reduce((sum, trip) => sum + getCommissionAmount(trip.fareAmount, trip.commission), 0)
  );
  const peakTrips = dailyTrips.filter((trip) => trip.tags.includes("peak hour")).length;

  const cards: AdviceCard[] = [dailyProfitAdvice(dailyNet)];

  if (dailyGross > 0 && fuelTotal / dailyGross > 0.4) {
    cards.push({
      id: "fuel-warning",
      tone: "warning",
      title: "تكلفة البنزين مرتفعة",
      message: "البنزين أخد أكثر من 40% من دخلك اليوم، راجع مساراتك وفكر في تعبئة أوفر"
    });
  }

  if (dailyGross > 0 && commissionTotal / dailyGross > 0.3) {
    cards.push({
      id: "commission-warning",
      tone: "info",
      title: "العمولة مرتفعة",
      message: "العمولة عدّت 30% من دخلك، جرب تنوع بين التطبيقات لتحافظ على هامش الربح"
    });
  }

  if (peakTrips < 3) {
    cards.push({
      id: "peak-hour-warning",
      tone: "warning",
      title: "استغل وقت الذروة",
      message: "عدد رحلات الذروة قليل، حاول تركز على الصباح والمساء لزيادة الربح"
    });
  }

  cards.push(...buildWeekPatternAdvice(allTrips));

  return {
    generatedAt: new Date().toISOString(),
    cards
  };
};
