export interface CheckIn {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  note?: string;
  aiResponse?: string;
}

export interface DayAggregate {
  date: string;
  avgMood: number;
  avgEnergy: number;
  avgSleep: number;
  participationCount: number;
}

const TEAM_SIZE = 12;

function randomBetween(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

function generateSampleData(): { checkIns: CheckIn[]; aggregates: DayAggregate[] } {
  const checkIns: CheckIn[] = [];
  const aggregates: DayAggregate[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Simulate a dip in recent days for pattern detection demo
    const dip = i <= 3 ? 1.5 : 0;

    const mood = Math.max(1, Math.min(5, randomBetween(3.5 - dip, 4.5 - dip)));
    const energy = Math.max(1, Math.min(5, randomBetween(3.2 - dip * 0.8, 4.3 - dip * 0.8)));
    const sleep = Math.max(1, Math.min(5, randomBetween(3.0 - dip * 0.5, 4.5 - dip * 0.5)));

    checkIns.push({
      id: `sample-${i}`,
      date: dateStr,
      mood: Math.round(mood * 10) / 10,
      energy: Math.round(energy * 10) / 10,
      sleep: Math.round(sleep * 10) / 10,
      aiResponse: getAiResponse(mood, energy, sleep),
    });

    const participation = Math.max(6, Math.min(TEAM_SIZE, Math.round(TEAM_SIZE * randomBetween(0.6, 1.0))));
    aggregates.push({
      date: dateStr,
      avgMood: Math.round(randomBetween(3.2 - dip * 0.7, 4.3 - dip * 0.7) * 10) / 10,
      avgEnergy: Math.round(randomBetween(3.0 - dip * 0.5, 4.0 - dip * 0.5) * 10) / 10,
      avgSleep: Math.round(randomBetween(3.1 - dip * 0.4, 4.2 - dip * 0.4) * 10) / 10,
      participationCount: participation,
    });
  }
  return { checkIns, aggregates };
}

export function getAiResponse(mood: number, energy: number, sleep: number): string {
  const avg = (mood + energy + sleep) / 3;
  if (avg >= 4) return "You're doing great today! Keep up the positive momentum. 🌟 Consider sharing what's working well with a colleague.";
  if (avg >= 3) return "Decent day overall. A short walk or stretch break might boost your energy levels. 🚶‍♂️";
  if (avg >= 2) return "I notice things feel a bit tough today. Remember it's okay to take a break. Maybe try some deep breathing exercises. 🧘";
  return "It seems like a challenging day. Please don't hesitate to reach out to your support network or Employee Assistance Program. You matter. 💙";
}

export function detectPattern(checkIns: CheckIn[]): string | null {
  if (checkIns.length < 4) return null;
  const recent = checkIns.slice(-4);
  const older = checkIns.slice(-8, -4);

  if (older.length < 2) return null;

  const recentAvgMood = recent.reduce((s, c) => s + c.mood, 0) / recent.length;
  const olderAvgMood = older.reduce((s, c) => s + c.mood, 0) / older.length;

  if (olderAvgMood - recentAvgMood >= 1.0) {
    return `Your mood dropped from ${olderAvgMood.toFixed(1)} to ${recentAvgMood.toFixed(1)} over the past ${recent.length} days. I'd like to suggest a wellness activity. 💚`;
  }
  return null;
}

export const TEAM_MEMBER_COUNT = TEAM_SIZE;
export const { checkIns: sampleCheckIns, aggregates: sampleAggregates } = generateSampleData();
