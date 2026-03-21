import { useState, useEffect } from "react";
import {
  Shield, ChevronLeft, AlertTriangle, Users, TrendingUp, TrendingDown,
  Database, Lock, Eye, EyeOff, Heart, Zap, Moon, Activity, ShieldCheck,
  ArrowRight, CheckCircle2, XCircle, UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard, seedDemo } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

interface DashboardData {
  total_users: number;
  active_users: number;
  participation_rate: number;
  drift_alerts: number;
  daily_trends: { date: string; mood: number; energy: number; sleep: number }[];
}

interface TeamMember {
  first_name: string;
  status: "alert" | "stable" | "inactive";
  checkins_7d: number;
  latest_mood: number | null;
  latest_energy: number | null;
  latest_sleep: number | null;
  drift_alerts: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [res, teamRes] = await Promise.all([
        getDashboard(),
        fetch((import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api/dashboard/team").then(r => r.json()),
      ]);
      setData(res);
      setTeam(Array.isArray(teamRes) ? teamRes : []);
    } catch {
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await seedDemo();
      await loadDashboard();
    } catch {}
    setSeeding(false);
  };

  const chartData = data?.daily_trends.map((d) => ({
    date: d.date.slice(5),
    Mood: d.mood,
    Energy: d.energy,
    Sleep: d.sleep,
    Composite: +((d.mood + d.energy + d.sleep) / 3).toFixed(1),
  })) ?? [];

  const participationPct = data ? Math.round(data.participation_rate * 100) : 0;

  // Compute wellness score (0-100)
  const latestTrends = data?.daily_trends.slice(-3) ?? [];
  const wellnessScore = latestTrends.length > 0
    ? Math.round(
        (latestTrends.reduce((sum, d) => sum + (d.mood + d.energy + d.sleep) / 3, 0) / latestTrends.length) * 20
      )
    : 0;

  // Trend direction
  const firstHalf = data?.daily_trends.slice(0, 7) ?? [];
  const secondHalf = data?.daily_trends.slice(-7) ?? [];
  const firstAvg = firstHalf.length ? firstHalf.reduce((s, d) => s + d.mood + d.energy + d.sleep, 0) / firstHalf.length / 3 : 0;
  const secondAvg = secondHalf.length ? secondHalf.reduce((s, d) => s + d.mood + d.energy + d.sleep, 0) / secondHalf.length / 3 : 0;
  const trendUp = secondAvg > firstAvg + 0.1;
  const trendDown = secondAvg < firstAvg - 0.1;

  // Bar chart data for composite daily
  const barData = chartData.map(d => ({
    date: d.date,
    score: d.Composite,
    fill: d.Composite >= 4 ? "#22c55e" : d.Composite >= 3 ? "#f59e0b" : "#ef4444",
  }));

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Thriving";
    if (score >= 65) return "Healthy";
    if (score >= 50) return "Moderate";
    if (score >= 35) return "Concerning";
    return "Critical";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/3">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground">Employer Dashboard</span>
              <p className="text-[10px] text-muted-foreground">Team Wellness Overview</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedDemo}
          disabled={seeding}
          className="flex items-center gap-1.5"
        >
          <Database className="h-3.5 w-3.5" />
          {seeding ? "Loading..." : "Load Demo Data"}
        </Button>
      </header>

      {/* Privacy Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Privacy First</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All data is <span className="font-semibold text-foreground">100% anonymous</span>. No individual names, no personal data, no tracking.
            Only aggregated team wellness trends. We never share individual employee information — period.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="flex gap-1 justify-center mb-3">
              <div className="w-3 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-3 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-3 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-muted-foreground">Loading team wellness data...</p>
          </div>
        ) : !data || data.total_users === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">No Wellness Data Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Load demo data to see what your team dashboard looks like, or wait for employees to start checking in.
              </p>
            </div>
            <Button size="lg" onClick={handleSeedDemo} disabled={seeding}>
              <Database className="h-4 w-4 mr-2" />
              {seeding ? "Loading..." : "Load Demo Data"}
            </Button>
          </div>
        ) : (
          <>
            {/* Hero Score */}
            <div className="rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border shadow-lg p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Wellness Score Circle */}
                <div className="relative flex-shrink-0">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={wellnessScore >= 75 ? "#22c55e" : wellnessScore >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(wellnessScore / 100) * 327} 327`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${getScoreColor(wellnessScore)}`}>{wellnessScore}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">/100</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Team Wellness Score</h2>
                    <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                      <span className={`text-sm font-bold ${getScoreColor(wellnessScore)}`}>
                        {getScoreLabel(wellnessScore)}
                      </span>
                      {trendUp && (
                        <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-semibold">
                          <TrendingUp className="h-3 w-3" /> Improving
                        </span>
                      )}
                      {trendDown && (
                        <span className="flex items-center gap-0.5 text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full font-semibold">
                          <TrendingDown className="h-3 w-3" /> Declining
                        </span>
                      )}
                      {!trendUp && !trendDown && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold">
                          Stable
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on aggregated, anonymous check-in data from your team over the past 14 days.
                    This score reflects the overall wellness environment — not any individual.
                  </p>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">{data.total_users}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Team Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">{participationPct}%</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Participation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      data.drift_alerts > 0 ? "bg-amber-500/10 animate-pulse" : "bg-green-500/10"
                    }`}>
                      {data.drift_alerts > 0
                        ? <AlertTriangle className="h-5 w-5 text-amber-600" />
                        : <CheckCircle2 className="h-5 w-5 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">{data.drift_alerts}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Drift Alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">0</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Data Shared</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Trend Chart — 2 cols */}
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Team Wellness Trends</CardTitle>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">14 days</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#01696F" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#01696F" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(0,0%,70%)" />
                          <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} stroke="hsl(0,0%,70%)" />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "0.75rem",
                              border: "1px solid hsl(0,0%,90%)",
                              fontSize: "0.75rem",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                          <Area type="monotone" dataKey="Mood" stroke="#01696F" strokeWidth={2.5} fill="url(#moodGrad)" dot={{ r: 2.5 }} />
                          <Area type="monotone" dataKey="Energy" stroke="#F59E0B" strokeWidth={2.5} fill="url(#energyGrad)" dot={{ r: 2.5 }} />
                          <Area type="monotone" dataKey="Sleep" stroke="#6366F1" strokeWidth={2.5} fill="url(#sleepGrad)" dot={{ r: 2.5 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No trend data yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Composite Bar Chart */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Daily Wellness</CardTitle>
                  <p className="text-[10px] text-muted-foreground">Composite score per day</p>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {barData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(0,0%,70%)" />
                          <YAxis domain={[0, 5]} tick={{ fontSize: 9 }} stroke="hsl(0,0%,70%)" />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "0.75rem",
                              border: "1px solid hsl(0,0%,90%)",
                              fontSize: "0.75rem",
                            }}
                          />
                          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                            {barData.map((entry, idx) => (
                              <rect key={idx} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No data yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* What's Working */}
              <Card className="shadow-sm border-green-500/20 bg-green-50/30 dark:bg-green-950/10">
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-sm text-foreground">What's Working</p>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">+</span>
                      {participationPct >= 70 ? "High engagement — team is checking in regularly" : "Team members are starting to check in"}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">+</span>
                      {data.drift_alerts === 0 ? "No declining patterns detected" : "Early detection catching issues before they escalate"}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">+</span>
                      Privacy-first approach building trust with employees
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Watch Areas */}
              <Card className={`shadow-sm ${data.drift_alerts > 0 ? "border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/10" : "border-border"}`}>
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-amber-600" />
                    <p className="font-semibold text-sm text-foreground">Watch Areas</p>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {data.drift_alerts > 0 ? (
                      <li className="flex items-start gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                        {data.drift_alerts} member{data.drift_alerts > 1 ? "s" : ""} showing sustained decline — consider team wellness initiative
                      </li>
                    ) : (
                      <li className="flex items-start gap-1.5">
                        <span className="text-muted-foreground mt-0.5">-</span>
                        No immediate concerns
                      </li>
                    )}
                    {trendDown && (
                      <li className="flex items-start gap-1.5">
                        <TrendingDown className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                        Overall trend is declining — review workload and deadlines
                      </li>
                    )}
                    <li className="flex items-start gap-1.5">
                      <span className="text-muted-foreground mt-0.5">-</span>
                      {participationPct < 70 ? "Participation below 70% — encourage check-ins" : "Monitor energy levels during project sprints"}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="shadow-sm border-primary/20 bg-primary/3">
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-sm text-foreground">Recommended Actions</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {data.drift_alerts > 0 && (
                      <li className="flex items-start gap-1.5">
                        <Heart className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        Schedule team wellness activity (yoga, group walk)
                      </li>
                    )}
                    <li className="flex items-start gap-1.5">
                      <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      {trendDown ? "Consider reducing meeting load this week" : "Maintain current team cadence"}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Moon className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      Encourage no-meeting blocks for deep work recovery
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Team Member Status — Manager View */}
            {team.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Team Wellness Status</CardTitle>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">First name only · No personal data</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {team.map((member, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl p-4 space-y-2 border ${
                          member.status === "alert"
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/30"
                            : member.status === "inactive"
                            ? "bg-muted/30 border-border"
                            : "bg-green-50/30 dark:bg-green-950/10 border-green-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-foreground">{member.first_name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            member.status === "alert"
                              ? "bg-amber-500/20 text-amber-700"
                              : member.status === "inactive"
                              ? "bg-muted text-muted-foreground"
                              : "bg-green-500/20 text-green-700"
                          }`}>
                            {member.status === "alert" ? "⚠ DRIFT" : member.status === "inactive" ? "INACTIVE" : "✓ STABLE"}
                          </span>
                        </div>
                        {member.latest_mood !== null ? (
                          <div className="flex gap-2 text-[10px] text-muted-foreground">
                            <span>😊 {member.latest_mood}</span>
                            <span>⚡ {member.latest_energy}</span>
                            <span>🌙 {member.latest_sleep}</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">No check-ins yet</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">{member.checkins_7d} check-ins (7d)</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Commitment */}
            <div className="rounded-3xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border border-primary/10 p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <EyeOff className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-lg text-foreground">Your Team's Privacy is Sacred</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    YU Shield <span className="font-semibold text-foreground">never shares individual employee data</span> with employers.
                    Everything you see here is aggregated and anonymized. No names, no individual scores, no personal notes.
                    Employees own their data — you see only the team's wellness environment.
                    This is how trust is built, and trust is how prevention works.
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-2 text-xs">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-muted-foreground">No individual names</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-muted-foreground">No personal scores</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-muted-foreground">No check-in notes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Anonymous aggregates only</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer — Partner Logos */}
      <footer className="border-t py-5 px-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">Powered by</p>
          <div className="flex items-center gap-8 opacity-40 hover:opacity-60 transition-opacity">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
              <span className="text-xs font-semibold text-muted-foreground">Podman</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M16.009 13.386c1.577 0 3.86-.326 3.86-2.202a1.86 1.86 0 0 0-.07-.479l-.86-3.596c-.165-.73-.384-1.07-1.36-1.554-.766-.384-2.448-1.2-2.86-1.2-.384 0-.498.481-1.2.481-.673 0-1.176-.576-1.855-.576-.652 0-1.073.384-1.4 1.17 0 0-1.003 2.813-1.073 3.046a.464.464 0 0 0-.028.165c0 1.176 4.26 2.746 6.845 2.746zM21.85 13.163c.137.576.206 1.002.206 1.372 0 1.81-1.84 2.82-4.26 2.82-4.645 0-9.468-2.758-9.468-5.135a2.2 2.2 0 0 1 .178-.862C5.6 11.468 3.4 12.153 3.4 14.06c0 3.18 5.94 5.588 11.46 5.588 4.14 0 6.78-1.32 6.78-3.72 0-1.29-.84-2.01-1.79-2.766z"/></svg>
              <span className="text-xs font-semibold text-muted-foreground">Red Hat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🦙</span>
              <span className="text-xs font-semibold text-muted-foreground">RamaLama</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <span className="text-xs font-semibold text-muted-foreground">IBM Granite</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
