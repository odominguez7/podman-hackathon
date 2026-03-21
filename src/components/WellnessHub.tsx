import { useState } from "react";
import {
  Shield, TrendingUp, TrendingDown, Minus, Zap, Moon, Brain, Heart,
  Wind, Sun, Smartphone, Salad, Droplets,
  Eye, Timer, ArrowRight, Sparkles, CalendarCheck, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HistoryCheckIn {
  id: number;
  mood: number;
  energy: number;
  sleep: number;
  note?: string;
  created_at: string;
}

interface Baseline {
  mood: number;
  energy: number;
  sleep: number;
  data_points: number;
}

interface WellnessHubProps {
  history: HistoryCheckIn[];
  baseline: Baseline | null;
  insightText: string;
  insightLoading: boolean;
  onBookActivity: (category: string) => void;
  onLoadInsights: () => void;
  section?: "analytics" | "challenges" | "rituals";
}

// Rituals (personal protocols, no booking needed)
const RITUALS = [
  {
    id: "breathwork",
    name: "Breathwork",
    emoji: "🫁",
    color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30",
    textColor: "text-teal-600",
    duration: "5 min",
    description: "Box breathing or Wim Hof. Instant calm, oxygen boost.",
    benefit: "Stress -60%",
  },
  {
    id: "light-therapy",
    name: "Light Therapy",
    emoji: "☀️",
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
    textColor: "text-amber-600",
    duration: "10 min",
    description: "Morning bright light. Resets melatonin, boosts serotonin.",
    benefit: "Energy +30%",
  },
  {
    id: "phone-detox",
    name: "Phone Detox",
    emoji: "📵",
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    textColor: "text-violet-600",
    duration: "2 hrs",
    description: "No phone. Reduces cortisol, improves presence.",
    benefit: "Mood +25%",
  },
  {
    id: "clean-eating",
    name: "Clean Eating",
    emoji: "🥗",
    color: "from-green-500/20 to-lime-500/20 border-green-500/30",
    textColor: "text-green-600",
    duration: "All day",
    description: "No processed food, no sugar. Brain fog disappears.",
    benefit: "Energy +45%",
  },
  {
    id: "hydration",
    name: "Hydration Reset",
    emoji: "💧",
    color: "from-sky-500/20 to-blue-500/20 border-sky-500/30",
    textColor: "text-sky-600",
    duration: "All day",
    description: "3L water + electrolytes. Fixes headaches and focus.",
    benefit: "Focus +20%",
  },
  {
    id: "eye-rest",
    name: "20-20-20 Rule",
    emoji: "👁️",
    color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
    textColor: "text-indigo-600",
    duration: "20 sec",
    description: "Every 20 min, look 20 feet away for 20 seconds.",
    benefit: "Strain -50%",
  },
  {
    id: "dopamine-fast",
    name: "Dopamine Fast",
    emoji: "🧠",
    color: "from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30",
    textColor: "text-fuchsia-600",
    duration: "24 hrs",
    description: "No social media, no junk food, no Netflix. Reset your reward system.",
    benefit: "Focus +70%",
  },
  {
    id: "digital-sunset",
    name: "Digital Sunset",
    emoji: "🌅",
    color: "from-rose-500/20 to-orange-500/20 border-rose-500/30",
    textColor: "text-rose-600",
    duration: "Evening",
    description: "Screens off 2 hours before bed. Read, stretch, journal.",
    benefit: "Sleep +50%",
  },
  {
    id: "no-alcohol",
    name: "No Alcohol Pledge",
    emoji: "🚫🍺",
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    textColor: "text-emerald-600",
    duration: "30 days",
    description: "Skip the drinks. Better sleep, clearer skin, sharper mind.",
    benefit: "Mood +40%",
  },
  {
    id: "detox-challenge",
    name: "7-Day Detox",
    emoji: "🧹",
    color: "from-lime-500/20 to-green-500/20 border-lime-500/30",
    textColor: "text-lime-600",
    duration: "7 days",
    description: "No sugar, no caffeine, no alcohol. Total transformation.",
    benefit: "Energy +60%",
  },
  {
    id: "gratitude",
    name: "Gratitude Drop",
    emoji: "🙏",
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    textColor: "text-pink-600",
    duration: "2 min",
    description: "Write 3 things you're grateful for before touching your phone.",
    benefit: "Mood +35%",
  },
  {
    id: "party-prep",
    name: "Party Prep Protocol",
    emoji: "🎉",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    textColor: "text-yellow-600",
    duration: "Pre + Post",
    description: "Pre: hydrate, eat clean, nap. Post: electrolytes, cold shower, walk.",
    benefit: "Recovery +80%",
  },
];

const SCENARIO_STACKS: Record<string, { label: string; rituals: string[] }> = {
  meetings: {
    label: "Heavy meeting day",
    rituals: ["breathwork", "hydration", "eye-rest"],
  },
  focus: {
    label: "Need focus",
    rituals: ["dopamine-fast", "phone-detox", "clean-eating"],
  },
  low: {
    label: "Feeling low",
    rituals: ["gratitude", "light-therapy", "hydration"],
  },
  party: {
    label: "Party tonight",
    rituals: ["party-prep", "hydration", "clean-eating"],
  },
};

const CHALLENGES = [
  {
    id: "cold-plunge-showdown",
    emoji: "🧊",
    name: "Sales vs Engineering: Cold Plunge Showdown",
    channel: "#wellness-challenges",
    postedBy: "Alex from People Ops",
    timestamp: "2h ago",
    message: "Who can get more team members to take the plunge this week? Losing team buys coffee for a month. Let's gooo",
    salesProgress: { joined: 8, total: 12 },
    engProgress: { joined: 11, total: 15 },
    participants: [
      { initials: "JK", color: "bg-blue-500" },
      { initials: "SM", color: "bg-pink-500" },
      { initials: "DL", color: "bg-green-500" },
      { initials: "AR", color: "bg-purple-500" },
      { initials: "TW", color: "bg-amber-500" },
    ],
    reactions: { "🔥": 14, "💪": 9, "🧊": 22 },
    timeLeft: "3 days left",
    buttonLabel: "Join Challenge",
  },
  {
    id: "walking-meeting",
    emoji: "🚶",
    name: "Walking Meeting Week",
    channel: "#wellness-challenges",
    postedBy: "Maya, Wellness Lead",
    timestamp: "Yesterday",
    message: "Complete 3+ walking meetings this week. Sync your steps. Hit the goal and leave early Friday. No cap.",
    participants: [
      { initials: "RJ", color: "bg-cyan-500" },
      { initials: "KP", color: "bg-rose-500" },
      { initials: "NB", color: "bg-indigo-500" },
      { initials: "LM", color: "bg-orange-500" },
    ],
    progress: { completed: 23, total: 45 },
    leaderboard: [
      { name: "Riley J.", steps: "12,400" },
      { name: "Kai P.", steps: "10,800" },
      { name: "Nova B.", steps: "9,200" },
    ],
    reactions: { "🚶": 18, "☀️": 7, "🏆": 5 },
    timeLeft: "4 days left",
    buttonLabel: "Join Challenge",
  },
  {
    id: "phone-stack",
    emoji: "📵",
    name: "Phone Stack Lunch",
    channel: "#wellness-challenges",
    postedBy: "Jordan, Sales",
    timestamp: "30 min ago",
    message: "Team lunch today at 12:30. Phones stack. First to grab pays for dessert. Floor 2 kitchen. Pull up.",
    participants: [
      { initials: "JD", color: "bg-violet-500" },
      { initials: "CC", color: "bg-teal-500" },
      { initials: "WR", color: "bg-red-500" },
      { initials: "PL", color: "bg-sky-500" },
      { initials: "MG", color: "bg-lime-500" },
      { initials: "TS", color: "bg-fuchsia-500" },
    ],
    spotsLeft: 2,
    reactions: { "📵": 11, "😂": 6, "🍕": 8 },
    timeLeft: "Starts at 12:30",
    buttonLabel: "Join Lunch",
  },
  {
    id: "breathwork-session",
    emoji: "🫁",
    name: "Pre-Meeting Breathwork",
    channel: "#wellness-challenges",
    postedBy: "Diana, VP Eng",
    timestamp: "1h ago",
    message: "5 min box breathing before the all-hands. Join the calm. Your future self will thank you.",
    participants: [
      { initials: "DK", color: "bg-teal-500" },
      { initials: "AJ", color: "bg-blue-500" },
      { initials: "RR", color: "bg-pink-500" },
      { initials: "FS", color: "bg-amber-500" },
    ],
    rsvpCount: 12,
    reactions: { "🧘": 15, "🫁": 8, "✨": 6 },
    timeLeft: "Starts in 45 min",
    buttonLabel: "RSVP",
  },
  {
    id: "contrast-therapy",
    emoji: "🧖🧊",
    name: "Friday Contrast Therapy",
    channel: "#wellness-challenges",
    postedBy: "Wellness Team",
    timestamp: "3h ago",
    message: "End the week right. Sauna + cold plunge at FitHub, 4pm. Your manager Diana already signed up. No excuses.",
    participants: [
      { initials: "DK", color: "bg-orange-500" },
      { initials: "BW", color: "bg-cyan-500" },
      { initials: "EL", color: "bg-green-500" },
    ],
    spotsLeft: 5,
    reactions: { "🧖": 12, "🧊": 9, "🔥": 7 },
    timeLeft: "Today at 4pm",
    buttonLabel: "Grab a Spot",
  },
];

function getScoreColor(value: number): string {
  if (value >= 4) return "text-green-600";
  if (value >= 3) return "text-amber-600";
  return "text-red-500";
}

function getScoreBg(value: number): string {
  if (value >= 4) return "bg-green-500";
  if (value >= 3) return "bg-amber-500";
  return "bg-red-500";
}

function getTrend(recent: number[], all: number[]): { direction: "up" | "down" | "flat"; icon: typeof TrendingUp } {
  if (recent.length < 2 || all.length < 4) return { direction: "flat", icon: Minus };
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = all.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(all.slice(0, -3).length, 1);
  if (recentAvg > olderAvg + 0.3) return { direction: "up", icon: TrendingUp };
  if (recentAvg < olderAvg - 0.3) return { direction: "down", icon: TrendingDown };
  return { direction: "flat", icon: Minus };
}

const WellnessHub = ({ history, baseline, insightText, insightLoading, onBookActivity, onLoadInsights, section = "analytics" }: WellnessHubProps) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Calculate analytics
  const last7 = history.slice(-7);
  const last3 = history.slice(-3);
  const avgMood = last7.length ? +(last7.reduce((a, c) => a + c.mood, 0) / last7.length).toFixed(1) : 0;
  const avgEnergy = last7.length ? +(last7.reduce((a, c) => a + c.energy, 0) / last7.length).toFixed(1) : 0;
  const avgSleep = last7.length ? +(last7.reduce((a, c) => a + c.sleep, 0) / last7.length).toFixed(1) : 0;

  const moodTrend = getTrend(last3.map(c => c.mood), history.map(c => c.mood));
  const energyTrend = getTrend(last3.map(c => c.energy), history.map(c => c.energy));
  const sleepTrend = getTrend(last3.map(c => c.sleep), history.map(c => c.sleep));

  // Best/worst day
  const bestDay = [...history].sort((a, b) => (b.mood + b.energy + b.sleep) - (a.mood + a.energy + a.sleep))[0];
  const worstDay = [...history].sort((a, b) => (a.mood + a.energy + a.sleep) - (b.mood + b.energy + b.sleep))[0];

  // Streak
  const streak = history.length;

  // Smart recommendation based on current averages
  const getRecommendedCategory = () => {
    if (avgMood <= 2.5 || avgSleep <= 2.5) return "calm";
    if (avgEnergy >= 4) return "energize";
    if (avgEnergy <= 2.5) return "recover";
    return "focus";
  };

  // --- CHALLENGES SECTION ---
  if (section === "challenges") {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Header */}
          <div className="text-center space-y-1 py-2">
            <h3 className="text-lg font-bold text-foreground">Team Challenges</h3>
            <p className="text-xs text-muted-foreground">Bond with your team through shared wellness. Included in your membership.</p>
          </div>

          {/* Channel header */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-sm font-bold text-foreground"># wellness-challenges</span>
            <span className="text-[10px] text-muted-foreground">47 members</span>
            <span className="ml-auto text-[10px] text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              12 online
            </span>
          </div>

          {/* Challenge Feed */}
          <div className="space-y-3">
            {CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Message header */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                    {challenge.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{challenge.postedBy}</span>
                      <span className="text-[10px] text-muted-foreground">{challenge.timestamp}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">in {challenge.channel}</span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                    {challenge.timeLeft}
                  </span>
                </div>

                {/* Challenge name */}
                <p className="text-sm font-bold text-foreground">{challenge.name}</p>

                {/* Message content */}
                <p className="text-xs text-muted-foreground leading-relaxed">{challenge.message}</p>

                {/* Challenge-specific content */}
                {challenge.id === "cold-plunge-showdown" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-blue-500/10 p-2.5 space-y-1.5">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Sales</p>
                        <div className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(challenge.salesProgress!.joined / challenge.salesProgress!.total) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{challenge.salesProgress!.joined}/{challenge.salesProgress!.total} joined</p>
                      </div>
                      <div className="rounded-xl bg-green-500/10 p-2.5 space-y-1.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Engineering</p>
                        <div className="h-1.5 bg-green-500/20 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(challenge.engProgress!.joined / challenge.engProgress!.total) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{challenge.engProgress!.joined}/{challenge.engProgress!.total} joined</p>
                      </div>
                    </div>
                  </div>
                )}

                {challenge.id === "walking-meeting" && (
                  <div className="space-y-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(challenge.progress!.completed / challenge.progress!.total) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{challenge.progress!.completed}/{challenge.progress!.total} participants completed</p>
                    <div className="rounded-xl bg-muted/50 p-2.5 space-y-1">
                      <p className="text-[10px] font-semibold text-foreground">Step Leaderboard</p>
                      {challenge.leaderboard!.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {entry.name}</span>
                          <span className="font-semibold text-foreground">{entry.steps} steps</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {challenge.id === "phone-stack" && (
                  <div className="rounded-xl bg-violet-500/10 p-2.5">
                    <p className="text-[10px] text-violet-600 font-medium">📍 Floor 2 kitchen · {challenge.spotsLeft} spots left</p>
                  </div>
                )}

                {challenge.id === "breathwork-session" && (
                  <div className="rounded-xl bg-teal-500/10 p-2.5">
                    <p className="text-[10px] text-teal-600 font-medium">{challenge.rsvpCount} people RSVPd</p>
                  </div>
                )}

                {challenge.id === "contrast-therapy" && (
                  <div className="rounded-xl bg-orange-500/10 p-2.5">
                    <p className="text-[10px] text-orange-600 font-medium">📍 FitHub, 4pm · {challenge.spotsLeft} spots left</p>
                  </div>
                )}

                {/* Participants */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {challenge.participants.map((p, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${p.color} flex items-center justify-center text-[8px] font-bold text-white ring-2 ring-card`}
                      >
                        {p.initials}
                      </div>
                    ))}
                  </div>
                  {challenge.participants.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{challenge.participants.length > 5 ? "more" : challenge.participants.length - 3} others</span>
                  )}
                </div>

                {/* Reactions + Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {Object.entries(challenge.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-[10px] transition-colors"
                        onClick={() => toast.success("Reaction added!")}
                      >
                        <span>{emoji}</span>
                        <span className="font-medium text-muted-foreground">{count}</span>
                      </button>
                    ))}
                    <button
                      className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-[10px] transition-colors"
                      onClick={() => toast.success("Reaction added!")}
                    >
                      <ThumbsUp className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="hero"
                    className="h-7 text-xs"
                    onClick={() => toast.success(`You're in! 🎉`, { description: `Joined: ${challenge.name}` })}
                  >
                    {challenge.buttonLabel}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Create a Challenge */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-semibold border-dashed border-2"
            onClick={() => toast.success("Challenge created! 🚀", { description: "Your challenge will appear in #wellness-challenges." })}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create a Challenge
          </Button>

          <p className="text-[10px] text-center text-muted-foreground py-1">
            Challenges are social and fun. No pressure, just good vibes.
          </p>
        </div>
      </div>
    );
  }

  // --- RITUALS SECTION ---
  if (section === "rituals") {
    const highlightedRituals = activeScenario ? SCENARIO_STACKS[activeScenario].rituals : [];

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Header */}
          <div className="text-center space-y-1 py-2">
            <h3 className="text-lg font-bold text-foreground">My Rituals</h3>
            <p className="text-xs text-muted-foreground">Personal protocols you can do anywhere. No booking needed. All included.</p>
          </div>

          {/* Plan My Day */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Plan My Day</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SCENARIO_STACKS).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => setActiveScenario(activeScenario === key ? null : key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeScenario === key
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {scenario.label}
                </button>
              ))}
            </div>
            {activeScenario && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Suggested Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {SCENARIO_STACKS[activeScenario].rituals.map((ritualId) => {
                    const ritual = RITUALS.find(r => r.id === ritualId);
                    if (!ritual) return null;
                    return (
                      <span key={ritualId} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-border text-xs font-medium text-foreground">
                        {ritual.emoji} {ritual.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rituals Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {RITUALS.map((ritual) => {
              const isHighlighted = highlightedRituals.includes(ritual.id);
              return (
                <div
                  key={ritual.id}
                  className={`rounded-xl border bg-gradient-to-br ${ritual.color} p-3 space-y-1.5 transition-all ${
                    isHighlighted ? "ring-2 ring-primary/40 shadow-md" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{ritual.emoji}</span>
                      <span className="text-xs font-bold text-foreground">{ritual.name}</span>
                    </div>
                    <span className={`text-[9px] font-bold ${ritual.textColor} bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded-full`}>
                      {ritual.benefit}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{ritual.description}</p>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className={`text-[9px] font-semibold ${ritual.textColor} flex items-center gap-0.5`}>
                      <Timer className="h-2.5 w-2.5" />{ritual.duration}
                    </span>
                    <button
                      onClick={() => toast.success(`${ritual.emoji} ${ritual.name} started!`, { description: "You got this. Stay consistent." })}
                      className={`text-[10px] font-semibold ${ritual.textColor} hover:underline`}
                    >
                      Start Today →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-center text-muted-foreground py-1">
            All rituals are evidence-based. Consult a professional before starting new routines.
          </p>
        </div>
      </div>
    );
  }

  // --- ANALYTICS SECTION (default) ---
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-4 space-y-4">
        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Mood", value: avgMood, icon: Heart, trend: moodTrend, color: "primary" },
            { label: "Energy", value: avgEnergy, icon: Zap, trend: energyTrend, color: "amber-500" },
            { label: "Sleep", value: avgSleep, icon: Moon, trend: sleepTrend, color: "indigo-500" },
          ].map((metric) => {
            const TrendIcon = metric.trend.icon;
            return (
              <div key={metric.label} className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <metric.icon className={`h-4 w-4 ${getScoreColor(metric.value)}`} />
                  <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                    metric.trend.direction === "up" ? "text-green-600" :
                    metric.trend.direction === "down" ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    <TrendIcon className="h-3 w-3" />
                    {metric.trend.direction}
                  </div>
                </div>
                <p className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>{metric.value || "-"}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{metric.label} (7-day avg)</p>
                {/* Mini bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getScoreBg(metric.value)}`}
                    style={{ width: `${(metric.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Streak + Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{streak}</p>
                <p className="text-[10px] text-muted-foreground">Total Check-ins</p>
              </div>
            </div>
          </div>
          {baseline && (
            <div className="rounded-2xl border border-border bg-gradient-to-br from-green-500/5 to-transparent p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Your Baseline</p>
                  <p className="text-xs font-semibold text-foreground">
                    {baseline.mood} · {baseline.energy} · {baseline.sleep}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mini Timeline - last 7 days */}
        {last7.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
            <p className="text-xs font-semibold text-foreground">Last 7 Days</p>
            <div className="flex gap-1 items-end h-24">
              {last7.map((c, i) => {
                const total = c.mood + c.energy + c.sleep;
                const maxTotal = 15;
                const heightPct = (total / maxTotal) * 100;
                const day = new Date(c.created_at).toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative" style={{ height: "80px" }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                          total >= 12 ? "bg-green-500/70" : total >= 9 ? "bg-amber-500/70" : "bg-red-500/70"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Composite score (mood + energy + sleep)</span>
              <div className="flex gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Good</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Okay</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Low</span>
              </div>
            </div>
          </div>
        )}

        {/* Best & Worst Days */}
        {bestDay && worstDay && history.length >= 3 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-green-500/30 bg-green-50/50 dark:bg-green-950/20 p-3 space-y-1">
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Peak Vibes</p>
              <p className="text-xs text-foreground font-medium">
                {new Date(bestDay.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Mood {bestDay.mood} · Energy {bestDay.energy} · Sleep {bestDay.sleep}
              </p>
              {bestDay.note && <p className="text-[10px] text-green-600 italic">"{bestDay.note}"</p>}
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-1">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Growth Opportunity</p>
              <p className="text-xs text-foreground font-medium">
                {new Date(worstDay.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Mood {worstDay.mood} · Energy {worstDay.energy} · Sleep {worstDay.sleep}
              </p>
              {worstDay.note && <p className="text-[10px] text-amber-600 italic">"{worstDay.note}"</p>}
            </div>
          </div>
        )}

        {/* AI Insight */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Analysis</p>
              <p className="text-[10px] text-muted-foreground">Powered by local Granite 3.3</p>
            </div>
          </div>
          {insightLoading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-muted-foreground">Analyzing your patterns...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{insightText}</p>
              {/* Grounding tag for insights */}
              <div className="mt-3 pt-2 border-t border-border/40 space-y-1">
                <p className="text-[10px] text-muted-foreground/70">
                  {baseline
                    ? `Based on: ${baseline.data_points} check-ins, ${Math.min(baseline.data_points, 7)}-day baseline`
                    : "Baseline not yet established (need 7+ check-ins)"}
                </p>
                <p className="text-[9px] text-muted-foreground/50 italic">
                  Wellness guidance only. Consider speaking with a professional for clinical concerns
                </p>
              </div>
            </>
          )}
        </div>

        {/* Smart CTA - only when trends warrant action */}
        {(avgMood <= 3 || avgEnergy <= 2.5 || avgSleep <= 2.5 || (moodTrend.direction === "down") || (energyTrend.direction === "down")) ? (
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                {avgMood <= 2.5 ? "Your vibe needs a reset" :
                 avgSleep <= 2.5 ? "Let's fix that sleep" :
                 moodTrend.direction === "down" ? "Trend alert: time to recharge" :
                 "Energy running low? We got you"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {avgMood <= 2.5
                ? "Your mood has been dipping. A calming activity can shift your whole week."
                : avgSleep <= 2.5
                ? "Sleep quality is off. Recovery activities tonight can help reset tomorrow."
                : moodTrend.direction === "down"
                ? "We're seeing a downward trend. Small actions now prevent bigger dips later."
                : "Your energy could use a boost. Try something that gets you moving."}
            </p>
            <Button
              variant="hero"
              className="w-full"
              onClick={() => onBookActivity(getRecommendedCategory())}
            >
              Browse Activities <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) : history.length >= 7 ? (
          <div className="rounded-2xl border border-green-500/20 bg-green-50/30 dark:bg-green-950/10 p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-green-600">You're doing great</p>
            <p className="text-xs text-muted-foreground">No action needed right now. Keep up the momentum!</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WellnessHub;
