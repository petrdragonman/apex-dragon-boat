import type { BoatSeating } from '../types';

export interface BoatBalance {
  totalLeft: number;
  totalRight: number;
  leftRightDiff: number; // Positive means Right is heavier, Negative means Left is heavier
  frontBackMoment: number;
  totalWeight: number;
}

const MOMENT_ARMS: Record<string, number> = {
  '1L': 4.5, '1R': 4.5,
  '2L': 3.5, '2R': 3.5,
  '3L': 2.5, '3R': 2.5,
  '4L': 1.5, '4R': 1.5,
  '5L': 0.5, '5R': 0.5,
  '6L': -0.5, '6R': -0.5,
  '7L': -1.5, '7R': -1.5,
  '8L': -2.5, '8R': -2.5,
  '9L': -3.5, '9R': -3.5,
  '10L': -4.5, '10R': -4.5,
  'drummer': 6.0,  // Standard placed at very front
  'sweep': -6.0,   // Standard placed at very back
};

export const calculateBalance = (seating: BoatSeating): BoatBalance => {
  let totalLeft = 0;
  let totalRight = 0;
  let frontBackMoment = 0;
  let totalWeight = 0;

  for (const [seatPos, paddler] of Object.entries(seating)) {
    if (!paddler) continue;

    const weight = paddler.weight;
    totalWeight += weight;

    // Left vs Right
    if (seatPos.endsWith('L')) {
      totalLeft += weight;
    } else if (seatPos.endsWith('R')) {
      totalRight += weight;
    }

    // Front vs Back Moment Calculation
    const arm = MOMENT_ARMS[seatPos];
    if (arm !== undefined) {
      if (seatPos === 'drummer' || seatPos === 'sweep') {
         // The spreadsheet logic distributes the individual's weight across the moment arm
         frontBackMoment += (arm / 6) * weight;
      } else {
        // According to spreadsheet, row moment is (Arm / 6) * Row Weight
        // We can just calculate per paddler since (Arm/6)*W_L + (Arm/6)*W_R = (Arm/6)*(W_L + W_R)
        frontBackMoment += (arm / 6) * weight;
      }
    }
  }

  return {
    totalLeft,
    totalRight,
    leftRightDiff: totalRight - totalLeft,
    frontBackMoment,
    totalWeight,
  };
};
