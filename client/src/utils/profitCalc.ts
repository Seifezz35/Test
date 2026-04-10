export type ProfitInput = {
  fareAmount: number;
  tipAmount?: number;
  commission: number;
  fuelCost: number;
  tollFees?: number;
  parkingFees?: number;
};

export const roundValue = (value: number) => Math.round(value * 100) / 100;

export const calculateNetProfit = ({
  fareAmount,
  tipAmount = 0,
  commission,
  fuelCost,
  tollFees = 0,
  parkingFees = 0
}: ProfitInput) =>
  roundValue(
    fareAmount + tipAmount - fareAmount * (commission / 100) - fuelCost - tollFees - parkingFees
  );

export const getExpenseTotal = ({
  fareAmount,
  commission,
  fuelCost,
  tollFees = 0,
  parkingFees = 0
}: ProfitInput) =>
  roundValue(fareAmount * (commission / 100) + fuelCost + tollFees + parkingFees);

export const getPasswordStrength = (value: string) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 1) return { label: "ضعيفة", percent: 33 };
  if (score === 2) return { label: "متوسطة", percent: 66 };
  return { label: "قوية", percent: 100 };
};
