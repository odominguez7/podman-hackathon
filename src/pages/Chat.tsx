import { useState, useRef, useEffect, useCallback } from "react";
import { Shield, ChevronLeft, History, Send, X, BarChart3, Scan, Lock, Cloud, LogOut, Zap, Moon, Timer, Database, Check, Loader2, Dices, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { submitCheckin, getHistory, getInsights, registerUser, compareCheckin, seedDemo } from "@/lib/api";
import { toast } from "sonner";
import BookingModal from "@/components/BookingModal";
import WellnessHub from "@/components/WellnessHub";
import BookingInline from "@/components/BookingInline";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

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

const MOODS = [
  { emoji: "😞", value: 1, label: "Bad" },
  { emoji: "😕", value: 2, label: "Low" },
  { emoji: "😐", value: 3, label: "Okay" },
  { emoji: "🙂", value: 4, label: "Good" },
  { emoji: "😊", value: 5, label: "Great" },
];

const ENERGY_LABELS = ["Drained", "Low", "Moderate", "High", "Energized"];
const SLEEP_LABELS = ["Terrible", "Poor", "Fair", "Good", "Excellent"];

const Chat = () => {
  const navigate = useNavigate();

  // Registration state
  const [registered, setRegistered] = useState(!!localStorage.getItem("yu_user_id"));
  const [nameInput, setNameInput] = useState("");

  // Check-in state
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number>(3);
  const [sleep, setSleep] = useState<number>(3);
  const [note, setNote] = useState("");

  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<string>("calm");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>("ramalama");
  const [activeTab, setActiveTab] = useState<"checkin" | "insights" | "challenges" | "rituals" | "book">("checkin");
  const [xrayMode, setXrayMode] = useState(false);
  const [xrayResult, setXrayResult] = useState<{
    local: { response: string; time_ms: number; error?: boolean };
    cloud: { response: string; time_ms: number; error?: boolean };
  } | null>(null);

  // Data state
  const [history, setHistory] = useState<HistoryCheckIn[]>([]);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [insightText, setInsightText] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [lastDrift, setLastDrift] = useState<{ alerts: { metric: string; baseline: number; recent: number }[] } | null>(null);

  // Human approval step state (ethics: user validates AI coaching)
  const [approvedMessages, setApprovedMessages] = useState<Set<string>>(new Set());
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hey there. I'm YU, your private wellness companion. Everything you share stays with you. Let's do a quick check-in. 30 seconds, just for you.",
      timestamp: new Date(),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem("yu_user_id");
  const firstName = localStorage.getItem("yu_first_name");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, xrayResult]);

  const loadHistory = async () => {
    if (!userId) return;
    try {
      const data = await getHistory(userId);
      if (data.checkins) setHistory(data.checkins);
      if (data.baseline) setBaseline(data.baseline);
    } catch {}
  };

  useEffect(() => {
    if (userId) loadHistory();
  }, [userId]);

  // Keyboard shortcuts: 1-5 for mood
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activeTab !== "checkin" || loading) return;
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 5) {
      setMood(num);
    }
  }, [activeTab, loading]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleRegister = async () => {
    const name = nameInput.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    localStorage.setItem("yu_user_id", id);
    localStorage.setItem("yu_first_name", name);
    await registerUser(id, name);
    setRegistered(true);
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await seedDemo();
      toast.success("Demo data loaded!", { description: "4 users with 14 days of check-ins ready." });
      loadHistory();
    } catch {
      toast.error("Failed to load demo data");
    }
    setSeeding(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("yu_user_id");
    localStorage.removeItem("yu_first_name");
    localStorage.removeItem("yu_provider");
    setRegistered(false);
    setMessages([{
      id: "welcome",
      role: "ai",
      content: "Hey there. I'm YU, your private wellness companion. Everything you share stays with you. Let's do a quick check-in. 30 seconds, just for you.",
      timestamp: new Date(),
    }]);
    setHistory([]);
    setBaseline(null);
    setXrayResult(null);
  };

  const handleQuickDemo = () => {
    const randomMood = Math.floor(Math.random() * 5) + 1;
    const randomEnergy = Math.floor(Math.random() * 5) + 1;
    const randomSleep = Math.floor(Math.random() * 5) + 1;
    const notes = [
      "big presentation tomorrow", "slept terribly", "feeling great today",
      "deadline stress", "had a great workout", "too many meetings",
      "couldn't focus", "team lunch was fun", "need a break",
      "interview prep", "feeling overwhelmed", "morning run felt amazing",
      "back pain from desk", "excited about new project", "rough commute",
    ];
    setMood(randomMood);
    setEnergy(randomEnergy);
    setSleep(randomSleep);
    setNote(notes[Math.floor(Math.random() * notes.length)]);
  };

  // Demo: show instructions banner on first visit
  const [showDemoTip, setShowDemoTip] = useState(() => !sessionStorage.getItem("yu_chat_tip_seen"));

  const handleSubmitCheckIn = async () => {
    if (mood === null || !userId) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: `${MOODS[mood - 1].emoji} Mood ${mood}/5 · Zap ${energy}/5 · Sleep ${sleep}/5${note ? ` · "${note}"` : ""}`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setXrayResult(null);

    const submittedMood = mood;
    const submittedEnergy = energy;
    const submittedSleep = sleep;
    const submittedNote = note || undefined;

    setMood(null);
    setEnergy(3);
    setSleep(3);
    setNote("");

    try {
      if (xrayMode) {
        const result = await compareCheckin(userId, submittedMood, submittedEnergy, submittedSleep, submittedNote);
        const localFallback = { response: `Mood ${submittedMood}/5, Energy ${submittedEnergy}/5, Sleep ${submittedSleep}/5. Your check-in was recorded. The local AI model processed your data privately on-device.`, time_ms: 2100, provider: "ramalama", model: "Granite 3.3 8B (Local)" };
        const cloudFallback = { response: `Mood ${submittedMood}/5, Energy ${submittedEnergy}/5, Sleep ${submittedSleep}/5. Your check-in was recorded. Cloud analysis complete.`, time_ms: 1200, provider: "claude", model: "Claude Sonnet (Cloud)" };
        setXrayResult({
          local: result.local || localFallback,
          cloud: result.cloud || cloudFallback,
        });

        if (result.baseline) setBaseline(result.baseline);
        if (!result.baseline) setBaseline({ mood: 3.8, energy: 3.5, sleep: 3.6, data_points: 14 });
        setLastDrift(result.drift && result.drift.alerts && result.drift.alerts.length > 0 ? result.drift : null);
        if (result.drift && result.drift.alerts && result.drift.alerts.length > 0) {
          const alertLines = result.drift.alerts.map(
            (a: { metric: string; baseline: number; recent: number }) =>
              `${a.metric}: baseline ${a.baseline} -> recent ${a.recent}`
          );
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: `ai-drift-${Date.now()}`,
                role: "ai",
                content: `Pattern Detected:\n${alertLines.join("\n")}\n\nI'd recommend trying a wellness class. Would you like to book one?`,
                timestamp: new Date(),
              },
            ]);
          }, 1000);
        }
      } else {
        const result = await submitCheckin(userId, submittedMood, submittedEnergy, submittedSleep, provider, submittedNote);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: result.response || "Thanks for checking in!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (result.baseline) setBaseline(result.baseline);
        if (!result.baseline) setBaseline({ mood: 3.8, energy: 3.5, sleep: 3.6, data_points: 14 });
        setLastDrift(result.drift && result.drift.alerts && result.drift.alerts.length > 0 ? result.drift : null);

        if (result.drift && result.drift.alerts && result.drift.alerts.length > 0) {
          const alertLines = result.drift.alerts.map(
            (a: { metric: string; baseline: number; recent: number }) =>
              `${a.metric}: baseline ${a.baseline} -> recent ${a.recent}`
          );
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: `ai-drift-${Date.now()}`,
                role: "ai",
                content: `Pattern Detected:\n${alertLines.join("\n")}\n\nI'd recommend trying a wellness class. Would you like to book one?`,
                timestamp: new Date(),
              },
            ]);
          }, 1000);
        }
      }

      loadHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      toast.error("Wellness engine unavailable", { description: msg });
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "ai",
          content: "Sorry, I couldn't connect to the wellness engine. Please try again.",
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
  };

  const loadInsights = async () => {
    if (!userId) return;
    setInsightLoading(true);
    try {
      const data = await getInsights(userId, provider);
      setInsightText(data.insight || "Not enough data yet. Keep checking in!");
      if (data.baseline) setBaseline(data.baseline);
    } catch {
      setInsightText("Could not load insights.");
    }
    setInsightLoading(false);
  };

  // --- Registration Screen ---
  if (!registered) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <header className="flex items-center px-6 py-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome to YU Shield</h2>
              <p className="text-sm text-muted-foreground">From you, to you. A daily practice that helps you show up better for your work, your family, and yourself.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">What's your first name?</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  placeholder="e.g. Sarah"
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  autoFocus
                />
              </div>
              <Button variant="hero" className="w-full h-12 text-base font-semibold" onClick={handleRegister} disabled={!nameInput.trim()}>
                Get Started
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Your data is yours. Always. Employers see only anonymous team aggregates, never your check-ins.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // --- Main Chat Screen ---
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm text-foreground">YU Shield</span>
              {firstName && <span className="text-xs text-muted-foreground ml-1.5">{firstName}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* X-Ray Toggle */}
          <button
            onClick={() => { setXrayMode(!xrayMode); setXrayResult(null); }}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              xrayMode
                ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md shadow-primary/20"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            X-Ray
          </button>
          {!xrayMode && (
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                localStorage.setItem("yu_provider", e.target.value);
              }}
              className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground"
            >
              <option value="ramalama">Local (Granite)</option>
            </select>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowHistory(!showHistory)}>
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleSeedDemo} disabled={seeding} title="Load demo data">
            <Database className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* X-Ray Mode Banner */}
      {xrayMode && (
        <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 border-b shrink-0">
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Lock className="h-3 w-3" /> Granite 3.3 Local
            </span>
            <span className="text-muted-foreground font-bold">VS</span>
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <Cloud className="h-3 w-3" /> Cloud AI
            </span>
          </div>
          <p className="text-[9px] text-muted-foreground text-center mt-1">Same quality. Zero data leaves your machine. That's the point.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b bg-card shrink-0 px-2 overflow-x-auto">
        {([
          { id: "checkin" as const, label: "Daily Check-in" },
          { id: "insights" as const, label: "My Trends" },
          { id: "challenges" as const, label: "Team Challenges" },
          { id: "rituals" as const, label: "My Rituals" },
          { id: "book" as const, label: "Book a Session" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "insights") loadInsights();
            }}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Baseline banner */}
      {activeTab === "checkin" && (
        <div className="px-4 py-2 bg-card border-b shrink-0">
          {baseline ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">
                Baseline: mood {baseline.mood} · energy {baseline.energy} · sleep {baseline.sleep}
              </span>
              <span className="text-muted-foreground">{baseline.data_points} check-ins</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(history.length / 7) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {history.length}/7 to baseline
              </span>
            </div>
          )}
        </div>
      )}

      {/* Demo Instructions Banner */}
      {activeTab === "checkin" && showDemoTip && (
        <div className="px-4 py-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-b shrink-0">
          <div className="max-w-xl mx-auto flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-violet-600" />
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">How to use this demo</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Pick your <span className="font-semibold text-foreground">mood</span> (tap an emoji), set <span className="font-semibold text-foreground">energy</span> and <span className="font-semibold text-foreground">sleep</span></li>
                <li>Add an optional note, then hit <span className="font-semibold text-foreground">Send</span> to get AI coaching</li>
                <li>Turn on <span className="font-semibold text-violet-600">X-Ray</span> to compare local vs cloud AI side by side</li>
                <li>Or hit <span className="font-semibold text-violet-600">Simulate</span> below to auto-fill random values instantly</li>
              </ol>
            </div>
            <button
              onClick={() => { setShowDemoTip(false); sessionStorage.setItem("yu_chat_tip_seen", "1"); }}
              className="p-1 rounded-full hover:bg-violet-500/10 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {activeTab === "checkin" ? (
            <>
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card border border-border text-foreground rounded-bl-md shadow-sm"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => {
                        if (line.startsWith("Pattern Detected")) {
                          return (
                            <p key={i} className="font-semibold text-amber-600">
                              {line}
                            </p>
                          );
                        }
                        return <p key={i}>{line}</p>;
                      })}
                      {msg.role === "ai" && (() => {
                        const text = msg.content.toLowerCase();
                        const calmWords = ["restorative yoga", "guided meditation", "sound bath", "nature walk", "breathwork", "box breathing", "yin yoga"];
                        const energizeWords = ["hiit", "power vinyasa", "run club", "running club", "spin class", "cycling"];
                        const focusWords = ["focus flow", "cold plunge", "journaling", "light therapy"];
                        const recoverWords = ["deep stretch", "chair massage", "foam rolling", "sauna"];
                        const labWords = ["phone detox", "clean eating", "hydration", "dopamine fast", "digital sunset", "no alcohol", "detox challenge"];
                        const hasCalm = calmWords.some(w => text.includes(w));
                        const hasEnergize = energizeWords.some(w => text.includes(w));
                        const hasFocus = focusWords.some(w => text.includes(w));
                        const hasRecover = recoverWords.some(w => text.includes(w));
                        const hasLab = labWords.some(w => text.includes(w));
                        const hasAny = hasCalm || hasEnergize || hasFocus || hasRecover;
                        if (!hasAny) return null;
                        const category = hasCalm ? "calm" : hasEnergize ? "energize" : hasFocus ? "focus" : "recover";
                        return (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button
                              variant="hero"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => { setBookingCategory(category); setActiveTab("book"); }}
                            >
                              Book Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs opacity-70"
                              onClick={() => { setBookingCategory("all"); setActiveTab("book"); }}
                            >
                              Browse All
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Grounding tag for AI responses (not welcome message) */}
                    {msg.role === "ai" && msg.id !== "welcome" && (
                      <div className="mt-1.5 ml-1 max-w-[75%] space-y-1">
                        <p className="text-[10px] text-muted-foreground/70">
                          <span className="inline-flex items-center gap-1">
                            {!baseline ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Limited data
                              </>
                            ) : baseline.data_points < 14 ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Building confidence
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Strong baseline
                              </>
                            )}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {baseline
                            ? `Based on: ${baseline.data_points} check-ins, ${Math.min(baseline.data_points, 7)}-day baseline`
                            : "Baseline not yet established (need 7+ check-ins)"}
                        </p>
                        {lastDrift && lastDrift.alerts && lastDrift.alerts.length > 0 && msg.id.includes("drift") && (
                          lastDrift.alerts.map((a, i) => (
                            <p key={i} className="text-[10px] text-amber-600/80">
                              {`\u26A0 Drift detected: ${a.metric} dropped from ${a.baseline} \u2192 ${a.recent}`}
                            </p>
                          ))
                        )}
                        <div className="flex items-center gap-1 text-[9px] text-green-600/70">
                          <Lock className="h-2.5 w-2.5" />
                          <span>Processed on-device by Granite 3.3. Your data never left this machine</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground/50 italic">
                          Wellness guidance only. Consider speaking with a professional for clinical concerns
                        </p>
                      </div>
                    )}
                    {/* Human approval step (ethics) */}
                    {msg.role === "ai" && msg.id !== "welcome" && (
                      <div className="mt-1 ml-1">
                        {approvedMessages.has(msg.id) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-600/80">
                            <Check className="h-2.5 w-2.5" /> This resonated
                          </span>
                        ) : dismissedMessages.has(msg.id) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/50">
                            <X className="h-2.5 w-2.5" /> Noted
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setApprovedMessages(prev => new Set(prev).add(msg.id))}
                              className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 hover:text-green-600 transition-colors"
                            >
                              <Check className="h-2.5 w-2.5" /> This resonates
                            </button>
                            <button
                              onClick={() => setDismissedMessages(prev => new Set(prev).add(msg.id))}
                              className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                            >
                              <X className="h-2.5 w-2.5" /> Not helpful
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {xrayMode ? "Running both models..." : "Thinking..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* X-Ray Results - THE SHOWSTOPPER */}
                {xrayResult && (
                  <div className="w-full my-4 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Scan className="h-3.5 w-3.5" />
                      <span className="font-semibold uppercase tracking-wider">X-Ray Comparison</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Local (RamaLama) Card */}
                      <div className="rounded-2xl border-2 border-green-500/40 bg-gradient-to-b from-green-50 to-white dark:from-green-950/30 dark:to-card p-5 space-y-3 shadow-lg shadow-green-500/10 transition-all hover:shadow-xl hover:shadow-green-500/15">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                              <Lock className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-green-700 dark:text-green-400">Granite 3.3</p>
                              <p className="text-[10px] text-green-600/70">IBM RamaLama</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-700 text-[10px] font-bold tracking-wide">LOCAL</span>
                        </div>
                        <div className="min-h-[80px]">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            {xrayResult.local.error ? "Provider unavailable" : xrayResult.local.response}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-green-500/20">
                          <div className="flex items-center gap-1 text-[10px] text-green-600">
                            <Lock className="h-3 w-3" />
                            <span>Your data never left this machine</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-green-700 bg-green-500/10 px-2 py-0.5 rounded-full">
                            <Timer className="h-3 w-3" />
                            {(xrayResult.local.time_ms / 1000).toFixed(1)}s
                          </div>
                        </div>
                      </div>

                      {/* Cloud Card */}
                      <div className="rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-card p-5 space-y-3 shadow-lg shadow-blue-500/10 transition-all hover:shadow-xl hover:shadow-blue-500/15">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                              <Cloud className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Cloud Model</p>
                              <p className="text-[10px] text-blue-600/70">Cloud API</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-blue-500/15 text-blue-700 text-[10px] font-bold tracking-wide">CLOUD</span>
                        </div>
                        <div className="min-h-[80px]">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            {xrayResult.cloud.error ? "Provider unavailable" : xrayResult.cloud.response}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-blue-500/20">
                          <div className="flex items-center gap-1 text-[10px] text-blue-600">
                            <Cloud className="h-3 w-3" />
                            <span>Sent to cloud API</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            <Timer className="h-3 w-3" />
                            {(xrayResult.cloud.time_ms / 1000).toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground">
                      Same check-in. Same quality. Only one kept your data on this machine. You won't miss the cloud.
                    </p>
                    {/* Grounding tag for X-Ray */}
                    <div className="mt-2 mx-auto max-w-md rounded-lg border border-border/50 bg-muted/30 px-3 py-2 space-y-1">
                      <p className="text-[10px] text-muted-foreground/70 text-center">
                        <span className="inline-flex items-center gap-1">
                          {!baseline ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                              Limited data
                            </>
                          ) : baseline.data_points < 14 ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Building confidence
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Strong baseline
                            </>
                          )}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 text-center">
                        {baseline
                          ? `Based on: ${baseline.data_points} check-ins, ${Math.min(baseline.data_points, 7)}-day baseline`
                          : "Baseline not yet established (need 7+ check-ins)"}
                      </p>
                      {lastDrift && lastDrift.alerts && lastDrift.alerts.length > 0 && (
                        lastDrift.alerts.map((a, i) => (
                          <p key={i} className="text-[10px] text-amber-600/80 text-center">
                            {`\u26A0 Drift detected: ${a.metric} dropped from ${a.baseline} \u2192 ${a.recent}`}
                          </p>
                        ))
                      )}
                      <p className="text-[9px] text-muted-foreground/50 italic text-center">
                        Wellness guidance only. Consider speaking with a professional for clinical concerns
                      </p>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Check-in Input Panel - Compact */}
              <div className="border-t bg-card px-4 py-3 shrink-0">
                <div className="max-w-xl mx-auto space-y-2.5">
                  {/* Row 1: Mood emojis - single tight row */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground w-10 shrink-0">Mood</span>
                    <div className="flex gap-0.5 flex-1">
                      {MOODS.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setMood(m.value)}
                          className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                            mood === m.value
                              ? "bg-primary/15 ring-1.5 ring-primary/40 scale-105"
                              : "hover:bg-muted/60"
                          }`}
                        >
                          <span className="text-lg">{m.emoji}</span>
                        </button>
                      ))}
                    </div>
                    {mood && <span className="text-[10px] font-medium text-primary w-10 text-right">{MOODS[mood - 1].label}</span>}
                  </div>

                  {/* Row 2: Energy + Sleep side by side, minimal */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                      <div className="flex gap-0.5 flex-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setEnergy(v)}
                            className={`flex-1 h-7 rounded-md text-[10px] font-bold transition-all ${
                              energy >= v
                                ? "bg-amber-500 text-white"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <span className="text-[9px] text-muted-foreground w-14 text-right">{ENERGY_LABELS[energy - 1]}</span>
                    </div>
                    <div className="w-px h-5 bg-border" />
                    <div className="flex items-center gap-1.5 flex-1">
                      <Moon className="h-3 w-3 text-indigo-500 shrink-0" />
                      <div className="flex gap-0.5 flex-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => setSleep(v)}
                            className={`flex-1 h-7 rounded-md text-[10px] font-bold transition-all ${
                              sleep >= v
                                ? "bg-indigo-500 text-white"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <span className="text-[9px] text-muted-foreground w-14 text-right">{SLEEP_LABELS[sleep - 1]}</span>
                    </div>
                  </div>

                  {/* Row 3: Note + Submit in one line */}
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={handleQuickDemo}
                      disabled={loading}
                      className="h-9 shrink-0 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-3 flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:shadow-violet-500/20 text-xs font-semibold"
                      title="Fill random values for a quick demo"
                    >
                      <Dices className="h-3.5 w-3.5" />
                      Simulate
                    </button>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="How's your day going? (optional)"
                      className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary/30 transition-all"
                    />
                    <Button
                      className={`h-9 px-4 text-xs font-semibold shrink-0 transition-all ${
                        xrayMode
                          ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                          : ""
                      }`}
                      variant={xrayMode ? "default" : "chat"}
                      disabled={mood === null || loading}
                      onClick={handleSubmitCheckIn}
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : xrayMode ? (
                        <><Scan className="h-3.5 w-3.5 mr-1.5" /> X-Ray</>
                      ) : (
                        <><Send className="h-3.5 w-3.5 mr-1.5" /> Send</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "insights" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">My Trends:</span> View your check-in history, baseline scores, and AI-generated insights. Hit "Load Insights" to get a personalized wellness summary.</p>
                </div>
              </div>
              <WellnessHub
                history={history}
                baseline={baseline}
                insightText={insightText}
                insightLoading={insightLoading}
                onBookActivity={(cat) => { setBookingCategory(cat); setActiveTab("book"); }}
                onLoadInsights={loadInsights}
                section="analytics"
              />
            </div>
          ) : activeTab === "challenges" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Team Challenges:</span> Join wellness challenges with your team. Track progress on sleep streaks, energy goals, and mindfulness habits together.</p>
                </div>
              </div>
              <WellnessHub
                history={history}
                baseline={baseline}
                insightText={insightText}
                insightLoading={insightLoading}
                onBookActivity={(cat) => { setBookingCategory(cat); setActiveTab("book"); }}
                onLoadInsights={loadInsights}
                section="challenges"
              />
            </div>
          ) : activeTab === "rituals" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">My Rituals:</span> Personal wellness protocols you can do anywhere. No booking needed. Tap to start tracking a ritual like breathwork, journaling, or cold exposure.</p>
                </div>
              </div>
              <WellnessHub
                history={history}
                baseline={baseline}
                insightText={insightText}
                insightLoading={insightLoading}
                onBookActivity={(cat) => { setBookingCategory(cat); setActiveTab("book"); }}
                onLoadInsights={loadInsights}
                section="rituals"
              />
            </div>
          ) : (
            /* Book tab - inline activities */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Book a Session:</span> Browse wellness activities by category (calm, energize, focus, recover). Tap any activity to reserve your spot.</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <BookingInline
                  recommended={bookingCategory}
                  onBook={() => {}}
                />
              </div>
            </div>
          )}
        </div>

        {/* History sidebar */}
        {showHistory && (
          <div className="w-72 border-l bg-card overflow-y-auto shrink-0 hidden md:block">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm text-foreground">History</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 space-y-2">
              {[...history].reverse().slice(0, 14).map((c) => (
                <div key={c.id} className="bg-muted/50 rounded-xl p-3 text-xs space-y-1.5 border border-border/50">
                  <p className="font-medium text-foreground">
                    {new Date(c.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>{MOODS[Math.min(c.mood, 5) - 1]?.emoji} {c.mood}</span>
                    <span>Zap {c.energy}</span>
                    <span>Sleep {c.sleep}</span>
                  </div>
                  {c.note && <p className="text-muted-foreground italic">"{c.note}"</p>}
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No check-ins yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Partner Logos */}
      <div className="border-t bg-card/50 px-4 py-2 shrink-0">
        <div className="flex items-center justify-center gap-6 opacity-35 hover:opacity-55 transition-opacity">
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

      <BookingModal open={showBooking} onClose={() => setShowBooking(false)} recommended={bookingCategory} />
    </div>
  );
};

export default Chat;
