import { useState } from "react";
import {
  Shield, TrendingUp, TrendingDown, Minus, Zap, Moon, Brain, Heart,
  Flame, Wind, Snowflake, Sun, Leaf, Smartphone, Salad, Droplets,
  Eye, Timer, ArrowRight, Sparkles, CalendarCheck, Footprints
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  section?: "analytics" | "protocols";
}

// Experimental wellness protocols
const PROTOCOLS = [
  {
    id: "cold-plunge",
    name: "Cold Plunge",
    emoji: "🧊",
    icon: Snowflake,
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    textColor: "text-cyan-600",
    tagline: "Activate your nervous system",
    duration: "3 min",
    description: "2-3 min cold exposure for dopamine spike (+250%), reduced inflammation, and mental clarity.",
    benefit: "Focus +40%",
    category: "focus",
  },
  {
    id: "breathwork",
    name: "Breathwork",
    emoji: "🫁",
    icon: Wind,
    color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30",
    textColor: "text-teal-600",
    tagline: "Reset in 5 minutes",
    duration: "5 min",
    description: "Wim Hof or Box Breathing. Instant calm, oxygen boost, stress hormone reduction.",
    benefit: "Stress -60%",
    category: "calm",
  },
  {
    id: "sauna",
    name: "Sauna Session",
    emoji: "🧖",
    icon: Flame,
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    textColor: "text-orange-600",
    tagline: "Deep recovery mode",
    duration: "20 min",
    description: "Heat therapy for muscle recovery, sleep improvement, and growth hormone release.",
    benefit: "Sleep +35%",
    category: "recover",
  },
  {
    id: "light-therapy",
    name: "Light Therapy",
    emoji: "☀️",
    icon: Sun,
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
    textColor: "text-amber-600",
    tagline: "Fix your circadian rhythm",
    duration: "10 min",
    description: "Morning bright light exposure. Resets melatonin cycle, boosts serotonin, fixes energy dips.",
    benefit: "Energy +30%",
    category: "energize",
  },
  {
    id: "phone-detox",
    name: "Phone Detox",
    emoji: "📵",
    icon: Smartphone,
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    textColor: "text-violet-600",
    tagline: "Reclaim your attention",
    duration: "2 hrs",
    description: "No phone for 2 hours. Reduces cortisol, improves presence, deeper conversations.",
    benefit: "Mood +25%",
    category: "focus",
  },
  {
    id: "clean-eating",
    name: "Clean Eating",
    emoji: "🥗",
    icon: Salad,
    color: "from-green-500/20 to-lime-500/20 border-green-500/30",
    textColor: "text-green-600",
    tagline: "Fuel your performance",
    duration: "All day",
    description: "No processed food, no sugar, high protein. Brain fog disappears, energy stabilizes.",
    benefit: "Energy +45%",
    category: "energize",
  },
  {
    id: "hydration",
    name: "Hydration Reset",
    emoji: "💧",
    icon: Droplets,
    color: "from-sky-500/20 to-blue-500/20 border-sky-500/30",
    textColor: "text-sky-600",
    tagline: "The simplest upgrade",
    duration: "All day",
    description: "3L water + electrolytes. Most people are dehydrated. Fixes headaches, energy, focus.",
    benefit: "Focus +20%",
    category: "focus",
  },
  {
    id: "eye-rest",
    name: "20-20-20 Rule",
    emoji: "👁️",
    icon: Eye,
    color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
    textColor: "text-indigo-600",
    tagline: "Protect your eyes",
    duration: "20 sec",
    description: "Every 20 min, look 20 feet away for 20 seconds. Reduces eye strain and headaches.",
    benefit: "Strain -50%",
    category: "recover",
  },
  {
    id: "dopamine-fast",
    name: "Dopamine Fast",
    emoji: "🧠",
    icon: Brain,
    color: "from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30",
    textColor: "text-fuchsia-600",
    tagline: "Reset your reward system",
    duration: "24 hrs",
    description: "No social media, no junk food, no Netflix. Just you, nature, and real conversations. Your brain will thank you.",
    benefit: "Focus +70%",
    category: "focus",
  },
  {
    id: "digital-sunset",
    name: "Digital Sunset",
    emoji: "🌅",
    icon: Sun,
    color: "from-rose-500/20 to-orange-500/20 border-rose-500/30",
    textColor: "text-rose-600",
    tagline: "Screens off after 8pm",
    duration: "Evening",
    description: "No screens 2 hours before bed. Read, stretch, journal. Fall asleep faster, wake up sharper.",
    benefit: "Sleep +50%",
    category: "recover",
  },
  {
    id: "no-alcohol",
    name: "No Alcohol Pledge",
    emoji: "🚫🍺",
    icon: Heart,
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    textColor: "text-emerald-600",
    tagline: "30-day sober curious challenge",
    duration: "30 days",
    description: "Skip the drinks for 30 days. Better sleep, clearer skin, sharper mind, more money. The gains are insane.",
    benefit: "Mood +40%",
    category: "calm",
  },
  {
    id: "detox-challenge",
    name: "7-Day Detox",
    emoji: "🧹",
    icon: Leaf,
    color: "from-lime-500/20 to-green-500/20 border-lime-500/30",
    textColor: "text-lime-600",
    tagline: "Full system reset",
    duration: "7 days",
    description: "No sugar, no caffeine, no alcohol, no processed food. Combine with daily walks + journaling. Total transformation.",
    benefit: "Energy +60%",
    category: "energize",
  },
  {
    id: "party-prep",
    name: "Party Prep Protocol",
    emoji: "🎉",
    icon: Sparkles,
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    textColor: "text-yellow-600",
    tagline: "Go hard, recover harder",
    duration: "Pre + Post",
    description: "Pre-party: hydrate, eat clean, nap. Post-party: electrolytes, cold shower, light walk. Party smart, not sorry.",
    benefit: "Recovery +80%",
    category: "recover",
  },
  {
    id: "gratitude",
    name: "Gratitude Drop",
    emoji: "🙏",
    icon: Heart,
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    textColor: "text-pink-600",
    tagline: "3 things. Every morning.",
    duration: "2 min",
    description: "Write 3 things you're grateful for before touching your phone. Rewires your brain for positivity. Backed by Harvard research.",
    benefit: "Mood +35%",
    category: "calm",
  },
  {
    id: "walking-meeting",
    name: "Walking Meetings",
    emoji: "🚶",
    icon: Footprints,
    color: "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
    textColor: "text-teal-600",
    tagline: "Walk and talk > sit and stare",
    duration: "30 min",
    description: "Take your 1:1s outside. Boosts creativity 60%, reduces meeting fatigue, vitamin D bonus. Steve Jobs approved.",
    benefit: "Creative +60%",
    category: "focus",
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
  const activeSection = section;

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

  return (
    <div className="flex-1 overflow-y-auto">
      {activeSection === "analytics" ? (
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

          {/* Mini Timeline — last 7 days */}
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
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{insightText}</p>
            )}
          </div>

          {/* Smart CTA — only when trends warrant action */}
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
      ) : (
        /* Wellness Lab — Experimental Protocols */
        <div className="px-4 py-4 space-y-4">
          <div className="text-center space-y-1 py-2">
            <h3 className="text-lg font-bold text-foreground">Wellness Lab</h3>
            <p className="text-xs text-muted-foreground">Science-backed protocols to optimize your performance</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PROTOCOLS.map((protocol) => {
              const Icon = protocol.icon;
              return (
                <button
                  key={protocol.id}
                  onClick={() => onBookActivity(protocol.category)}
                  className={`rounded-2xl border bg-gradient-to-br ${protocol.color} p-4 space-y-2 text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{protocol.emoji}</span>
                    <span className={`text-[10px] font-bold ${protocol.textColor} bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full`}>
                      {protocol.benefit}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{protocol.name}</p>
                    <p className="text-[10px] text-muted-foreground">{protocol.tagline}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{protocol.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-semibold ${protocol.textColor} flex items-center gap-1`}>
                      <Timer className="h-3 w-3" />{protocol.duration}
                    </span>
                    <span className={`text-[10px] font-semibold ${protocol.textColor}`}>
                      Try it <ArrowRight className="h-3 w-3 inline" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Team Challenges — Social Wellness */}
          <div className="space-y-3 pt-2">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Team Challenges</h3>
              <p className="text-xs text-muted-foreground">Dare a colleague. Bond before the big meeting. Science says it works.</p>
            </div>

            {/* Cold Plunge Together */}
            <div className="rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧊🤝</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Cold Plunge Duo</p>
                    <p className="text-[10px] text-cyan-600">Invite a colleague to take the plunge together</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs border-cyan-500/30 text-cyan-600" onClick={() => onBookActivity("focus")}>
                  Dare a Friend
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Heading into a rough Sales vs Marketing meeting? Take a 3-min cold plunge together first.
                Shared discomfort builds instant trust and resets the competitive energy into collaboration.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-cyan-500/10 p-2 text-center">
                  <p className="text-lg font-black text-cyan-600">250%</p>
                  <p className="text-[9px] text-muted-foreground">Dopamine increase</p>
                  <p className="text-[8px] text-cyan-600/60">Srámek et al., 2000</p>
                </div>
                <div className="rounded-xl bg-cyan-500/10 p-2 text-center">
                  <p className="text-lg font-black text-cyan-600">530%</p>
                  <p className="text-[9px] text-muted-foreground">Norepinephrine spike</p>
                  <p className="text-[8px] text-cyan-600/60">Shevchuk, 2008</p>
                </div>
                <div className="rounded-xl bg-cyan-500/10 p-2 text-center">
                  <p className="text-lg font-black text-cyan-600">2-3hrs</p>
                  <p className="text-[9px] text-muted-foreground">Elevated mood after</p>
                  <p className="text-[8px] text-cyan-600/60">Huberman Lab, 2022</p>
                </div>
              </div>
            </div>

            {/* Pre-Meeting Breathwork */}
            <div className="rounded-2xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🫁⚡</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Pre-Meeting Breathwork</p>
                    <p className="text-[10px] text-teal-600">5-min team sync before any high-stakes meeting</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs border-teal-500/30 text-teal-600" onClick={() => onBookActivity("calm")}>
                  Start Session
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Big pitch in 10 minutes? Instead of doom-scrolling Slack, do 5 minutes of box breathing with your team.
                Everyone walks in calmer, sharper, and on the same wavelength.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-teal-500/10 p-2 text-center">
                  <p className="text-lg font-black text-teal-600">62%</p>
                  <p className="text-[9px] text-muted-foreground">Cortisol reduction</p>
                  <p className="text-[8px] text-teal-600/60">Ma et al., 2017</p>
                </div>
                <div className="rounded-xl bg-teal-500/10 p-2 text-center">
                  <p className="text-lg font-black text-teal-600">5min</p>
                  <p className="text-[9px] text-muted-foreground">To activate calm</p>
                  <p className="text-[8px] text-teal-600/60">Zaccaro et al., 2018</p>
                </div>
                <div className="rounded-xl bg-teal-500/10 p-2 text-center">
                  <p className="text-lg font-black text-teal-600">40%</p>
                  <p className="text-[9px] text-muted-foreground">Better decisions</p>
                  <p className="text-[8px] text-teal-600/60">Arch & Craske, 2006</p>
                </div>
              </div>
            </div>

            {/* Sauna + Cold Contrast */}
            <div className="rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧖🧊</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Contrast Therapy Social</p>
                    <p className="text-[10px] text-orange-600">Sauna + cold plunge with your team</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs border-orange-500/30 text-orange-600" onClick={() => onBookActivity("recover")}>
                  Book for Team
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Friday afternoon team recovery session. 15 min sauna, 2 min cold plunge, repeat.
                The best conversations happen when everyone's phones are in a locker.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-orange-500/10 p-2 text-center">
                  <p className="text-lg font-black text-orange-600">300%</p>
                  <p className="text-[9px] text-muted-foreground">Growth hormone</p>
                  <p className="text-[8px] text-orange-600/60">Leppäluoto et al., 1986</p>
                </div>
                <div className="rounded-xl bg-orange-500/10 p-2 text-center">
                  <p className="text-lg font-black text-orange-600">83%</p>
                  <p className="text-[9px] text-muted-foreground">Report better sleep</p>
                  <p className="text-[8px] text-orange-600/60">Hussain & Cohen, 2018</p>
                </div>
                <div className="rounded-xl bg-orange-500/10 p-2 text-center">
                  <p className="text-lg font-black text-orange-600">65%</p>
                  <p className="text-[9px] text-muted-foreground">Less muscle soreness</p>
                  <p className="text-[8px] text-orange-600/60">Cochrane Review, 2015</p>
                </div>
              </div>
            </div>

            {/* Walking 1:1 Challenge */}
            <div className="rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 via-lime-500/5 to-transparent p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚶‍♂️🚶‍♀️</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Walking 1:1 Challenge</p>
                    <p className="text-[10px] text-green-600">Replace one sitting meeting per week</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs border-green-500/30 text-green-600" onClick={() => onBookActivity("focus")}>
                  Challenge Someone
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dare your manager: take the next 1:1 as a walk. Stanford proved walking boosts creative output 60%.
                Plus you both get steps, vitamin D, and better ideas. Win-win-win.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-green-500/10 p-2 text-center">
                  <p className="text-lg font-black text-green-600">60%</p>
                  <p className="text-[9px] text-muted-foreground">More creative ideas</p>
                  <p className="text-[8px] text-green-600/60">Stanford, Oppezzo 2014</p>
                </div>
                <div className="rounded-xl bg-green-500/10 p-2 text-center">
                  <p className="text-lg font-black text-green-600">25%</p>
                  <p className="text-[9px] text-muted-foreground">Less meeting fatigue</p>
                  <p className="text-[8px] text-green-600/60">Bailenson, 2021</p>
                </div>
                <div className="rounded-xl bg-green-500/10 p-2 text-center">
                  <p className="text-lg font-black text-green-600">15min</p>
                  <p className="text-[9px] text-muted-foreground">Mood boost from walk</p>
                  <p className="text-[8px] text-green-600/60">Edwards & Loprinzi, 2018</p>
                </div>
              </div>
            </div>

            {/* Phone Stack Dinner */}
            <div className="rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📵🍽️</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Phone Stack Lunch</p>
                    <p className="text-[10px] text-violet-600">Everyone stacks phones. First to grab pays.</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs border-violet-500/30 text-violet-600" onClick={() => onBookActivity("focus")}>
                  Start Challenge
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Team lunch rule: all phones face-down in a stack. First person to check theirs buys dessert.
                Real conversations, real bonding, real presence. Gen Z approved.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-violet-500/10 p-2 text-center">
                  <p className="text-lg font-black text-violet-600">46%</p>
                  <p className="text-[9px] text-muted-foreground">Better conversations</p>
                  <p className="text-[8px] text-violet-600/60">Dwyer et al., 2018</p>
                </div>
                <div className="rounded-xl bg-violet-500/10 p-2 text-center">
                  <p className="text-lg font-black text-violet-600">37%</p>
                  <p className="text-[9px] text-muted-foreground">More empathy shown</p>
                  <p className="text-[8px] text-violet-600/60">Misra et al., 2016</p>
                </div>
                <div className="rounded-xl bg-violet-500/10 p-2 text-center">
                  <p className="text-lg font-black text-violet-600">2x</p>
                  <p className="text-[9px] text-muted-foreground">Enjoyment reported</p>
                  <p className="text-[8px] text-violet-600/60">Ryan & Deci, 2017</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground py-2">
            All protocols are evidence-based. Consult a professional before starting new routines.
          </p>
        </div>
      )}
    </div>
  );
};

export default WellnessHub;
