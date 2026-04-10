export type TripFinancialInput = {
  fareAmount: number;
  tipAmount?: number;
  commission: number;
  fuelCost: number;
  tollFees?: number;
  parkingFees?: number;
};

export const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const getCommissionAmount = (fareAmount: number, commissionPercent: number) =>
  roundCurrency((fareAmount * commissionPercent) / 100);

export const calculateNetProfit = ({
  fareAmount,
  tipAmount = 0,
  commission,
  fuelCost,
  tollFees = 0,
  parkingFees = 0
}: TripFinancialInput) => {
  const commissionAmount = getCommissionAmount(fareAmount, commission);

  return roundCurrency(
    fareAmount + tipAmount - commissionAmount - fuelCost - tollFees - parkingFees
  );
};

export const calculateTotalExpenses = ({
  fareAmount,
  commission,
  fuelCost,
  tollFees = 0,
  parkingFees = 0
}: TripFinancialInput) =>
  roundCurrency(getCommissionAmount(fareAmount, commission) + fuelCost + tollFees + parkingFees);

export const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateDurationMinutes = (startTime: string, endTime: string) => {
  const start = parseTimeToMinutes(startTime);
  let end = parseTimeToMinutes(endTime);

  if (end < start) {
    end += 24 * 60;
  }

  return end - start;
};
