import { useState, useEffect } from "react";
import {
  Shield, ChevronLeft, AlertTriangle, Users, TrendingUp, TrendingDown,
  Database, Lock, Eye, Heart, Zap, Moon, Activity, ShieldCheck,
  ArrowRight, CheckCircle2, Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard, getDepartments, seedDemo } from "@/lib/api";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface DashboardData {
  total_users: number;
  active_users: number;
  participation_rate: number;
  drift_alerts: number;
  daily_trends: { date: string; mood: number; energy: number; sleep: number }[];
}

interface DepartmentData {
  department: string;
  total_heads: number;
  avg_mood: number;
  avg_energy: number;
  avg_sleep: number;
  drift_alerts: number;
  participation_rate: number;
  trend: "improving" | "stable" | "declining";
}

const STATIC_DEPARTMENTS: DepartmentData[] = [
  { department: "Engineering", total_heads: 220, avg_mood: 3.4, avg_energy: 3.1, avg_sleep: 3.6, drift_alerts: 3, participation_rate: 0.78, trend: "declining" },
  { department: "Product & Design", total_heads: 70, avg_mood: 3.8, avg_energy: 3.5, avg_sleep: 4.0, drift_alerts: 1, participation_rate: 0.85, trend: "stable" },
  { department: "Sales & Partnerships", total_heads: 90, avg_mood: 3.2, avg_energy: 3.8, avg_sleep: 3.3, drift_alerts: 2, participation_rate: 0.72, trend: "declining" },
  { department: "Marketing & Growth", total_heads: 60, avg_mood: 3.9, avg_energy: 3.6, avg_sleep: 3.7, drift_alerts: 0, participation_rate: 0.90, trend: "improving" },
  { department: "Customer Success", total_heads: 80, avg_mood: 3.5, avg_energy: 3.2, avg_sleep: 3.5, drift_alerts: 2, participation_rate: 0.81, trend: "stable" },
  { department: "Finance & Legal", total_heads: 40, avg_mood: 3.7, avg_energy: 3.4, avg_sleep: 3.9, drift_alerts: 0, participation_rate: 0.88, trend: "improving" },
  { department: "People & Workplace", total_heads: 40, avg_mood: 4.1, avg_energy: 3.8, avg_sleep: 4.2, drift_alerts: 0, participation_rate: 0.95, trend: "improving" },
  { department: "Data & Analytics", total_heads: 20, avg_mood: 3.6, avg_energy: 3.3, avg_sleep: 3.4, drift_alerts: 1, participation_rate: 0.80, trend: "stable" },
  { department: "Strategy & CEO Office", total_heads: 10, avg_mood: 3.8, avg_energy: 4.0, avg_sleep: 3.5, drift_alerts: 0, participation_rate: 0.70, trend: "stable" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [res, deptRes] = await Promise.all([
        getDashboard(),
        getDepartments().catch(() => []),
      ]);
      setData(res);
      const depts = Array.isArray(deptRes) && deptRes.length > 0 ? deptRes : STATIC_DEPARTMENTS;
      setDepartments(depts.sort((a: DepartmentData, b: DepartmentData) => b.drift_alerts - a.drift_alerts));
    } catch {
      setData(null);
      setDepartments(STATIC_DEPARTMENTS.sort((a, b) => b.drift_alerts - a.drift_alerts));
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
  })) ?? [];

  const participationPct = data ? Math.round(data.participation_rate * 100) : 0;

  // Compute wellness score (0-100)
  const latestTrends = data?.daily_trends.slice(-3) ?? [];
  const wellnessScore = latestTrends.length > 0
    ? Math.round(
        (latestTrends.reduce((sum, d) => sum + (d.mood + d.energy + d.sleep) / 3, 0) / latestTrends.length) * 20
      )
    : 0;

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

  const getMetricColor = (val: number) => {
    if (val >= 4.0) return "bg-green-500";
    if (val >= 3.5) return "bg-emerald-400";
    if (val >= 3.0) return "bg-amber-400";
    return "bg-red-400";
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "improving") return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
    if (trend === "declining") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const totalHeads = departments.reduce((s, d) => s + d.total_heads, 0) || 530;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground tracking-tight">Meridian AI</h1>
              <p className="text-xs text-muted-foreground">Organizational Wellness Environment</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">YU Shield</span>
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
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10 space-y-10">
        {loading ? (
          <div className="text-center py-24">
            <div className="flex gap-1.5 justify-center mb-4">
              <div className="w-2.5 h-2.5 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2.5 h-2.5 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2.5 h-2.5 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-sm text-muted-foreground">Loading wellness data...</p>
          </div>
        ) : !data || data.total_users === 0 ? (
          <div className="text-center py-24 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">No Wellness Data Yet</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Load demo data to see the organizational dashboard, or wait for employees to start checking in.
              </p>
            </div>
            <Button size="lg" onClick={handleSeedDemo} disabled={seeding}>
              <Database className="h-4 w-4 mr-2" />
              {seeding ? "Loading..." : "Load Demo Data"}
            </Button>
          </div>
        ) : (
          <>
            {/* Top Row: Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Organization Score */}
              <Card className="border border-border/60 shadow-none">
                <CardContent className="pt-6 pb-5 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke={wellnessScore >= 75 ? "#22c55e" : wellnessScore >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={`${(wellnessScore / 100) * 314} 314`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-lg font-bold ${getScoreColor(wellnessScore)}`}>{wellnessScore}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Org Score</p>
                    <p className={`text-xs font-medium ${getScoreColor(wellnessScore)}`}>{getScoreLabel(wellnessScore)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Enrolled */}
              <Card className="border border-border/60 shadow-none">
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{totalHeads}</p>
                      <p className="text-xs text-muted-foreground">Total Enrolled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active This Week */}
              <Card className="border border-border/60 shadow-none">
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/8 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{participationPct}%</p>
                      <p className="text-xs text-muted-foreground">Active This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environment Alerts */}
              <Card className="border border-border/60 shadow-none">
                <CardContent className="pt-6 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      data.drift_alerts > 0 ? "bg-amber-500/10" : "bg-green-500/8"
                    }`}>
                      {data.drift_alerts > 0
                        ? <AlertTriangle className="h-5 w-5 text-amber-600" />
                        : <CheckCircle2 className="h-5 w-5 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{data.drift_alerts}</p>
                      <p className="text-xs text-muted-foreground">Environment Alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Department Breakdown</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{departments.length} departments, sorted by alert count</p>
                </div>
              </div>
              <Card className="border border-border/60 shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Department</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Headcount</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-24">Mood</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-24">Energy</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-24">Sleep</th>
                        <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Trend</th>
                        <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Alerts</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-32">Participation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.department} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium text-foreground">{dept.department}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-sm tabular-nums text-muted-foreground">{dept.total_heads}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getMetricColor(dept.avg_mood)}`} style={{ width: `${(dept.avg_mood / 5) * 100}%` }} />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground">{dept.avg_mood.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getMetricColor(dept.avg_energy)}`} style={{ width: `${(dept.avg_energy / 5) * 100}%` }} />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground">{dept.avg_energy.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getMetricColor(dept.avg_sleep)}`} style={{ width: `${(dept.avg_sleep / 5) * 100}%` }} />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground">{dept.avg_sleep.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center">
                              <TrendIcon trend={dept.trend} />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {dept.drift_alerts > 0 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-600">
                                {dept.drift_alerts}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${dept.participation_rate >= 0.85 ? "bg-green-500" : dept.participation_rate >= 0.7 ? "bg-emerald-400" : "bg-amber-400"}`}
                                  style={{ width: `${dept.participation_rate * 100}%` }}
                                />
                              </div>
                              <span className="text-xs tabular-nums text-muted-foreground">{Math.round(dept.participation_rate * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Trend Chart */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Wellness Trends</h2>
                <p className="text-xs text-muted-foreground mt-0.5">14-day rolling view of anonymous aggregate scores</p>
              </div>
              <Card className="border border-border/60 shadow-none">
                <CardContent className="pt-6 pb-4">
                  <div className="h-80">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <defs>
                            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#01696F" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="#01696F" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.12} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(0,0%,80%)" tickLine={false} axisLine={false} />
                          <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} stroke="hsl(0,0%,80%)" tickLine={false} axisLine={false} width={30} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "0.5rem",
                              border: "1px solid hsl(0,0%,90%)",
                              fontSize: "0.75rem",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                              padding: "8px 12px",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                          <Area type="monotone" dataKey="Mood" stroke="#01696F" strokeWidth={2} fill="url(#moodGrad)" dot={false} />
                          <Area type="monotone" dataKey="Energy" stroke="#F59E0B" strokeWidth={2} fill="url(#energyGrad)" dot={false} />
                          <Area type="monotone" dataKey="Sleep" stroke="#6366F1" strokeWidth={2} fill="url(#sleepGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">No trend data yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* What's Working */}
              <Card className="border border-green-200/60 shadow-none bg-green-50/20 dark:bg-green-950/5">
                <CardContent className="pt-6 pb-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="font-medium text-sm text-foreground">What's Working</p>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">+</span>
                      {participationPct >= 70 ? "Strong engagement across the organization. Check-in rates are healthy" : "Team members are beginning to adopt regular check-ins"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">+</span>
                      {data.drift_alerts === 0 ? "No declining patterns detected across any department" : "Early detection is catching environmental issues before escalation"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">+</span>
                      Privacy-first architecture building organizational trust
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Watch Areas */}
              <Card className={`shadow-none ${data.drift_alerts > 0 ? "border border-amber-200/60 bg-amber-50/20 dark:bg-amber-950/5" : "border border-border/60"}`}>
                <CardContent className="pt-6 pb-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-amber-600" />
                    <p className="font-medium text-sm text-foreground">Watch Areas</p>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    {data.drift_alerts > 0 ? (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                        {data.drift_alerts} environment alert{data.drift_alerts > 1 ? "s" : ""} detected. Review workload distribution in affected departments
                      </li>
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground/50 mt-0.5 shrink-0">-</span>
                        No immediate environmental concerns
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground/50 mt-0.5 shrink-0">-</span>
                      {participationPct < 70 ? "Participation below 70%. Consider reviewing onboarding flow" : "Monitor energy patterns during high-intensity project cycles"}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="border border-primary/15 shadow-none bg-primary/3">
                <CardContent className="pt-6 pb-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <p className="font-medium text-sm text-foreground">Recommended Actions</p>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    {data.drift_alerts > 0 && (
                      <li className="flex items-start gap-2">
                        <Heart className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        Reduce meeting load for departments showing sustained decline
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Zap className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      Review workload distribution across teams with low energy scores
                    </li>
                    <li className="flex items-start gap-2">
                      <Moon className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      Implement no-meeting blocks for deep work recovery periods
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Privacy Footer */}
            <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-muted/30 border border-border/40">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Individual data is architecturally inaccessible. Anonymous aggregates only.
              </p>
            </div>
          </>
        )}
      </main>

      {/* Footer - Partner Logos */}
      <footer className="border-t py-6 px-8 mt-4">
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">Powered by</p>
          <div className="flex items-center gap-8 opacity-35 hover:opacity-55 transition-opacity">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
              <span className="text-xs font-medium text-muted-foreground">Podman</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M16.009 13.386c1.577 0 3.86-.326 3.86-2.202a1.86 1.86 0 0 0-.07-.479l-.86-3.596c-.165-.73-.384-1.07-1.36-1.554-.766-.384-2.448-1.2-2.86-1.2-.384 0-.498.481-1.2.481-.673 0-1.176-.576-1.855-.576-.652 0-1.073.384-1.4 1.17 0 0-1.003 2.813-1.073 3.046a.464.464 0 0 0-.028.165c0 1.176 4.26 2.746 6.845 2.746zM21.85 13.163c.137.576.206 1.002.206 1.372 0 1.81-1.84 2.82-4.26 2.82-4.645 0-9.468-2.758-9.468-5.135a2.2 2.2 0 0 1 .178-.862C5.6 11.468 3.4 12.153 3.4 14.06c0 3.18 5.94 5.588 11.46 5.588 4.14 0 6.78-1.32 6.78-3.72 0-1.29-.84-2.01-1.79-2.766z"/></svg>
              <span className="text-xs font-medium text-muted-foreground">Red Hat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🦙</span>
              <span className="text-xs font-medium text-muted-foreground">RamaLama</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <span className="text-xs font-medium text-muted-foreground">IBM Granite</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
