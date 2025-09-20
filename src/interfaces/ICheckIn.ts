export interface Reward {
  name: string;
  type: string;
  description: string;
}

export interface NextSpecialReward {
  day: number;
  daysLeft: number;
  reward: Reward;
}

export interface CheckInResponse {
  xpEarned: number;
  pointsEarned: number;
  consecutiveCheckIns: number;
  totalCheckIns: number;
  specialReward: Reward | null;
  nextSpecialReward: NextSpecialReward;
}

export interface CheckInStatusResponse {
  hasCheckedInToday: boolean;
  lastCheckIn: string;
  consecutiveCheckIns: number;
  totalCheckIns: number;
  rewards: Reward[];
  nextSpecialReward: NextSpecialReward;
}

export interface CheckInState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  checkInData: CheckInResponse | null;
  checkInStatus: CheckInStatusResponse | null;
}
