import { useState, useRef, useEffect } from "react";
import { Shield, ChevronLeft, History, Send, X, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { submitCheckin, getHistory, getInsights, registerUser } from "@/lib/api";
import BookingModal from "@/components/BookingModal";

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
  { emoji: "😞", value: 1 },
  { emoji: "😕", value: 2 },
  { emoji: "😐", value: 3 },
  { emoji: "🙂", value: 4 },
  { emoji: "😊", value: 5 },
];

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
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>(localStorage.getItem("yu_provider") || "ramalama");
  const [activeTab, setActiveTab] = useState<"checkin" | "insights">("checkin");

  // Data state
  const [history, setHistory] = useState<HistoryCheckIn[]>([]);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [insightText, setInsightText] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hi there! 👋 I'm your wellness companion. Let's do a quick check-in.\n\nSelect your mood, energy, and sleep below — it takes less than a minute.",
      timestamp: new Date(),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem("yu_user_id");
  const firstName = localStorage.getItem("yu_first_name");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleRegister = async () => {
    const name = nameInput.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    localStorage.setItem("yu_user_id", id);
    localStorage.setItem("yu_first_name", name);
    await registerUser(id, name);
    setRegistered(true);
  };

  const handleSubmitCheckIn = async () => {
    if (mood === null || !userId) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: `Mood: ${MOODS[mood - 1].emoji} (${mood}/5) · Energy: ⚡${energy}/5 · Sleep: 💤 ${sleep}/5${note ? `\n💭 ${note}` : ""}`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const submittedMood = mood;
    const submittedEnergy = energy;
    const submittedSleep = sleep;
    const submittedNote = note || undefined;

    setMood(null);
    setEnergy(3);
    setSleep(3);
    setNote("");

    try {
      const result = await submitCheckin(userId, submittedMood, submittedEnergy, submittedSleep, provider, submittedNote);

      // Main AI response
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: result.response || "Thanks for checking in!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Update baseline
      if (result.baseline) setBaseline(result.baseline);

      // Drift alert with specific data
      if (result.drift && result.drift.alerts && result.drift.alerts.length > 0) {
        const alertLines = result.drift.alerts.map(
          (a: { metric: string; baseline: number; recent: number }) =>
            `${a.metric}: baseline ${a.baseline} → recent ${a.recent}`
        );
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-drift-${Date.now()}`,
              role: "ai",
              content: `⚠️ Pattern Detected:\n${alertLines.join("\n")}\n\nI'd recommend trying a wellness class. Would you like to book one?`,
              timestamp: new Date(),
            },
          ]);
        }, 1000);
      }

      loadHistory();
    } catch {
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
      <div className="h-screen flex flex-col bg-background">
        <header className="flex items-center px-4 py-3 border-b bg-card shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary ml-2" />
          <span className="font-semibold text-foreground ml-2">YU Shield</span>
        </header>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Welcome</h2>
              <p className="text-sm text-muted-foreground">Let's get to know you</p>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">First name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="e.g. Omar"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <Button variant="hero" className="w-full" onClick={handleRegister} disabled={!nameInput.trim()}>
                Get Started
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              🔒 Your data stays with you. Employers only see anonymous team aggregates.
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
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">YU Shield</span>
          {firstName && <span className="text-xs text-muted-foreground">· {firstName}</span>}
        </div>
        <div className="flex items-center gap-1">
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              localStorage.setItem("yu_provider", e.target.value);
            }}
            className="text-xs bg-card border border-border rounded-md px-2 py-1 text-foreground"
          >
            <option value="ramalama">RamaLama (Local)</option>
            <option value="claude">Claude (Cloud)</option>
          </select>
          <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)}>
            <History className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b bg-card shrink-0 px-4">
        <button
          onClick={() => setActiveTab("checkin")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "checkin"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Check-in
        </button>
        <button
          onClick={() => { setActiveTab("insights"); loadInsights(); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
            activeTab === "insights"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" /> Insights
        </button>
      </div>

      {/* Baseline banner */}
      {activeTab === "checkin" && (
        <div className="px-4 py-2 bg-card border-b shrink-0">
          {baseline ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                Baseline: mood {baseline.mood} · energy {baseline.energy} · sleep {baseline.sleep}
              </span>
              <span className="text-muted-foreground">{baseline.data_points} check-ins</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {history.length}/7 check-ins to build your personal baseline
            </p>
          )}
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
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-chat-user text-chat-user-foreground rounded-br-md"
                          : "bg-chat-ai text-chat-ai-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => {
                        if (line.startsWith("⚠️")) {
                          return (
                            <p key={i} className="mt-2 font-semibold text-warning">
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        return <p key={i}>{line}</p>;
                      })}
                      {msg.role === "ai" && msg.content.includes("wellness class") && (
                        <Button
                          variant="hero"
                          size="sm"
                          className="mt-2"
                          onClick={() => setShowBooking(true)}
                        >
                          Book Wellness Class
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-chat-ai text-chat-ai-foreground rounded-2xl rounded-bl-md px-4 py-2.5 text-sm animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="border-t bg-card px-4 py-4 space-y-4 shrink-0">
                {/* Mood selector */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">How's your mood?</p>
                  <div className="flex gap-2 justify-center">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={`text-2xl p-2 rounded-xl transition-all ${
                          mood === m.value
                            ? "bg-primary/15 scale-110 ring-2 ring-primary/30"
                            : "hover:bg-accent"
                        }`}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy & Sleep */}
                <div className="flex gap-6 justify-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">⚡ Energy</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => setEnergy(v)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                            energy >= v
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">💤 Sleep</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          onClick={() => setSleep(v)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                            sleep >= v
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Note */}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything on your mind? (optional)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm resize-none h-14 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <Button
                  variant="chat"
                  className="w-full"
                  disabled={mood === null || loading}
                  onClick={handleSubmitCheckIn}
                >
                  <Send className="h-4 w-4 mr-2" /> {loading ? "Sending..." : "Submit Check-In"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  🔒 Your data stays with you. Employers only see anonymous team aggregates.
                </p>
              </div>
            </>
          ) : (
            /* Insights tab */
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <h3 className="font-semibold text-foreground">Your Wellness Insights</h3>
                {insightLoading ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Analyzing your patterns...</p>
                ) : (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{insightText}</p>
                )}
                {baseline && (
                  <div className="pt-2">
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                      Baseline: mood {baseline.mood} · energy {baseline.energy} · sleep {baseline.sleep}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {history.length} check-ins recorded
              </p>
            </div>
          )}
        </div>

        {/* History sidebar */}
        {showHistory && (
          <div className="w-72 border-l bg-card overflow-y-auto shrink-0 hidden md:block">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm text-foreground">Check-In History</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 space-y-2">
              {[...history].reverse().slice(0, 14).map((c) => (
                <div key={c.id} className="bg-muted rounded-lg p-3 text-xs space-y-1">
                  <p className="font-medium text-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">
                    Mood: {c.mood}/5 · Energy: {c.energy}/5 · Sleep: {c.sleep}/5
                  </p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No check-ins yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      <BookingModal open={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
};

export default Chat;
