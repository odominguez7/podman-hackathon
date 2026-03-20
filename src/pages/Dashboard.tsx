import { Shield, ChevronLeft, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleAggregates, TEAM_MEMBER_COUNT } from "@/lib/wellnessData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const data = sampleAggregates;

  const latestParticipation = data[data.length - 1]?.participationCount ?? 0;
  const participationRate = Math.round((latestParticipation / TEAM_MEMBER_COUNT) * 100);

  const chartData = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    Mood: d.avgMood,
    Energy: d.avgEnergy,
    Sleep: d.avgSleep,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Employer Dashboard</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{TEAM_MEMBER_COUNT}</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-success mb-2" />
              <p className="text-2xl font-bold text-foreground">{participationRate}%</p>
              <p className="text-sm text-muted-foreground">Participation Rate</p>
            </CardContent>
          </Card>
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Declining Patterns</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 team members showing declining patterns this week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Wellness Trends (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(170,15%,90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(180,5%,45%)" />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} stroke="hsl(180,5%,45%)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid hsl(170,15%,90%)",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Mood"
                    stroke="#01696F"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Energy"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Sleep"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          All data is anonymized. No individual names are shown.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
