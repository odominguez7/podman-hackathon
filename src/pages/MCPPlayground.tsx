import { useState } from "react";
import { Shield, ChevronLeft, Play, Terminal, Loader2, Copy, Check, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface MCPTool {
  id: string;
  name: string;
  description: string;
  params: { name: string; type: string; placeholder: string; required?: boolean }[];
  endpoint: string;
  method: "GET" | "POST";
  buildRequest: (params: Record<string, string>) => { url: string; options?: RequestInit };
}

const TOOLS: MCPTool[] = [
  {
    id: "check-wellness",
    name: "check_my_wellness",
    description: "Employee self-service: check YOUR OWN wellness status — baseline, trends, drift alerts. Only accessible by the authenticated user.",
    params: [{ name: "user_id", type: "text", placeholder: "e.g. sarah-demo (your own ID)", required: true }],
    endpoint: "/api/history",
    method: "GET",
    buildRequest: (p) => ({ url: `${API_BASE}/api/history/${p.user_id}` }),
  },
  {
    id: "team-summary",
    name: "get_team_wellness_summary",
    description: "Get anonymized team-wide wellness aggregates — participation, drift alerts, daily trends",
    params: [],
    endpoint: "/api/dashboard",
    method: "GET",
    buildRequest: () => ({ url: `${API_BASE}/api/dashboard` }),
  },
  {
    id: "recommendations",
    name: "get_wellness_recommendations",
    description: "Get personalized activity recommendations based on mood, energy, and sleep scores (1-5)",
    params: [
      { name: "mood", type: "number", placeholder: "1-5", required: true },
      { name: "energy", type: "number", placeholder: "1-5", required: true },
      { name: "sleep", type: "number", placeholder: "1-5", required: true },
    ],
    endpoint: "/api/checkin",
    method: "POST",
    buildRequest: (p) => {
      // Simulate MCP recommendation logic locally
      const mood = parseInt(p.mood) || 3;
      const energy = parseInt(p.energy) || 3;
      const sleep = parseInt(p.sleep) || 3;
      const recs: string[] = [];
      if (mood <= 2) recs.push("Restorative Yoga (Down Under Yoga, 45 min)", "Guided Meditation (Wellness Room, 20 min)", "Box Breathing (Anywhere, 10 min)");
      if (energy >= 4 && mood >= 3) recs.push("HIIT Express (FitHub, 25 min)", "Power Vinyasa (Down Under Yoga, 50 min)");
      if (energy <= 2) recs.push("Deep Stretch Class (FitHub, 40 min)", "Chair Massage (Floor 2, 15 min)");
      if (sleep <= 2) recs.push("Yin Yoga (Down Under Yoga, 60 min)", "Self-Massage & Foam Rolling (Anywhere, 20 min)");
      if (mood >= 3 && mood <= 4 && energy >= 3 && energy <= 4 && sleep >= 3) recs.push("Focus Flow Yoga (Down Under Yoga, 30 min)", "Cold Plunge + Sauna (FitHub, 20 min)");
      if (recs.length === 0) recs.push("Focus Flow Yoga (Down Under Yoga, 30 min)", "Morning Run Club (Esplanade, 35 min)", "Mindful Nature Walk (Charles River, 30 min)");
      return {
        url: "local://mcp",
        options: { method: "LOCAL", body: JSON.stringify({ recommendations: recs, input: { mood, energy, sleep } }) },
      };
    },
  },
  {
    id: "book-activity",
    name: "book_wellness_activity",
    description: "Book a wellness activity for an employee — returns booking confirmation",
    params: [
      { name: "user_id", type: "text", placeholder: "e.g. sarah-demo", required: true },
      { name: "activity", type: "text", placeholder: "e.g. Restorative Yoga", required: true },
    ],
    endpoint: "/api/book",
    method: "POST",
    buildRequest: (p) => ({
      url: "local://mcp",
      options: {
        method: "LOCAL",
        body: JSON.stringify({
          status: "confirmed",
          booking_id: `YU-${(p.user_id || "DEMO").slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 99999)}`,
          user_id: p.user_id,
          activity: p.activity,
          message: `Booked ${p.activity} for ${p.user_id}. See you there!`,
        }),
      },
    }),
  },
  {
    id: "submit-checkin",
    name: "submit_checkin",
    description: "Submit a daily wellness check-in and receive an AI coaching response",
    params: [
      { name: "user_id", type: "text", placeholder: "e.g. sarah-demo", required: true },
      { name: "mood", type: "number", placeholder: "1-5", required: true },
      { name: "energy", type: "number", placeholder: "1-5", required: true },
      { name: "sleep", type: "number", placeholder: "1-5", required: true },
      { name: "note", type: "text", placeholder: "optional note" },
    ],
    endpoint: "/api/checkin",
    method: "POST",
    buildRequest: (p) => ({
      url: `${API_BASE}/api/checkin`,
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: p.user_id,
          mood: parseInt(p.mood) || 3,
          energy: parseInt(p.energy) || 3,
          sleep: parseInt(p.sleep) || 3,
          note: p.note || undefined,
          provider: "ramalama",
        }),
      },
    }),
  },
];

const MCPPlayground = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string>(TOOLS[0].id);
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [demoUsers, setDemoUsers] = useState<string[]>([]);

  const tool = TOOLS.find(t => t.id === activeTool)!;

  const loadDemoData = async () => {
    setSeeding(true);
    try {
      await fetch(`${API_BASE}/api/seed-demo`, { method: "POST" });
      setDemoUsers(["sarah-demo", "james-demo", "maria-demo", "alex-demo"]);
    } catch {}
    setSeeding(false);
  };

  const handleRun = async () => {
    setLoading(true);
    setResult("");
    try {
      const req = tool.buildRequest(params);

      if (req.url.startsWith("local://")) {
        // Local simulation
        const body = req.options?.body ? JSON.parse(req.options.body as string) : {};
        setResult(JSON.stringify(body, null, 2));
      } else {
        const res = await fetch(req.url, req.options);
        const data = await res.json();
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setResult(JSON.stringify({ error: "Failed to call tool. Make sure the backend is running." }, null, 2));
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mcpCallPreview = `mcp.call("${tool.name}", {${tool.params.map(p => `\n  ${p.name}: "${params[p.name] || p.placeholder}"`).join(",")}${tool.params.length ? "\n" : ""}})`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/3 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground">MCP Playground</span>
              <p className="text-[10px] text-muted-foreground">YU Shield Wellbeing Tools — Live API</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-600">5 Tools Available</span>
        </div>
      </header>

      {/* Description */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5">
        <p className="text-xs text-muted-foreground max-w-3xl">
          <span className="font-semibold text-foreground">Model Context Protocol (MCP)</span> lets any AI assistant — Claude Desktop, Cursor, or custom agents — interact with YU Shield's wellness tools programmatically.
          Test the tools below in real-time.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tool Sidebar */}
        <div className="w-72 border-r bg-card/50 overflow-y-auto shrink-0">
          <div className="p-3 space-y-1">
            {/* Demo Data */}
            <div className="px-2 py-2 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={loadDemoData}
                disabled={seeding}
              >
                <Database className="h-3 w-3 mr-1.5" />
                {seeding ? "Loading..." : demoUsers.length ? "Reload Demo Data" : "Load Demo Data"}
              </Button>
              {demoUsers.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-2 space-y-1">
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase">Demo Users (click to use)</p>
                  {[
                    { id: "sarah-demo", name: "Sarah", note: "Drift detected" },
                    { id: "james-demo", name: "James", note: "Stable baseline" },
                    { id: "maria-demo", name: "Maria", note: "Improving trend" },
                    { id: "alex-demo", name: "Alex", note: "New user (5 check-ins)" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setParams({ ...params, user_id: u.id })}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-background transition-colors"
                    >
                      <p className="text-[10px] font-mono font-semibold text-foreground">{u.id}</p>
                      <p className="text-[9px] text-muted-foreground">{u.name} — {u.note}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 py-2">Available Tools</p>
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTool(t.id); setParams({}); setResult(""); }}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                  activeTool === t.id
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "hover:bg-muted"
                }`}
              >
                <p className={`text-xs font-mono font-semibold ${activeTool === t.id ? "text-emerald-600" : "text-foreground"}`}>
                  {t.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tool Header */}
          <div className="px-6 py-4 border-b bg-card/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                {tool.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Parameters */}
            {tool.params.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-foreground">Parameters</p>
                <div className="grid grid-cols-2 gap-3">
                  {tool.params.map((p) => (
                    <div key={p.name}>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">
                        {p.name} {p.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={p.type}
                        placeholder={p.placeholder}
                        value={params[p.name] || ""}
                        onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MCP Call Preview */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground">MCP Call</p>
              <pre className="bg-zinc-900 text-emerald-400 text-xs font-mono p-4 rounded-xl overflow-x-auto">
                {mcpCallPreview}
              </pre>
            </div>

            {/* Run Button */}
            <Button
              onClick={handleRun}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running...</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Run Tool</>
              )}
            </Button>

            {/* Result */}
            {result && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-muted-foreground">Response</p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <><Check className="h-3 w-3 text-green-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>
                <pre className="bg-zinc-900 text-green-400 text-xs font-mono p-4 rounded-xl overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {result}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card/50 px-6 py-2 flex items-center justify-center gap-6 opacity-35">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
          <span className="text-[9px] font-semibold text-muted-foreground">Podman</span>
        </div>
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M16.009 13.386c1.577 0 3.86-.326 3.86-2.202a1.86 1.86 0 0 0-.07-.479l-.86-3.596c-.165-.73-.384-1.07-1.36-1.554-.766-.384-2.448-1.2-2.86-1.2-.384 0-.498.481-1.2.481-.673 0-1.176-.576-1.855-.576-.652 0-1.073.384-1.4 1.17 0 0-1.003 2.813-1.073 3.046a.464.464 0 0 0-.028.165c0 1.176 4.26 2.746 6.845 2.746zM21.85 13.163c.137.576.206 1.002.206 1.372 0 1.81-1.84 2.82-4.26 2.82-4.645 0-9.468-2.758-9.468-5.135a2.2 2.2 0 0 1 .178-.862C5.6 11.468 3.4 12.153 3.4 14.06c0 3.18 5.94 5.588 11.46 5.588 4.14 0 6.78-1.32 6.78-3.72 0-1.29-.84-2.01-1.79-2.766z"/></svg>
          <span className="text-[9px] font-semibold text-muted-foreground">Red Hat</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs">🦙</span>
          <span className="text-[9px] font-semibold text-muted-foreground">RamaLama</span>
        </div>
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span className="text-[9px] font-semibold text-muted-foreground">IBM Granite</span>
        </div>
      </div>
    </div>
  );
};

export default MCPPlayground;
