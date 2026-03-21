import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">YU Shield</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/mcp")}>
            MCP Playground
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            Employer Dashboard
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-8">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              YU Shield
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Prevention, Not Treatment
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Daily wellness check-ins that help you and your team thrive. Quick, private, and powered by intelligent insights.
          </p>

          <Button variant="hero" size="lg" onClick={() => navigate("/chat")}>
            Start Check-In
          </Button>

          <p className="text-xs text-muted-foreground">
            Takes less than 2 minutes · 100% confidential
          </p>
        </div>
      </main>

      {/* Footer — Partner Logos */}
      <footer className="border-t py-5 px-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">Powered by</p>
          <div className="flex items-center gap-8 opacity-40 hover:opacity-60 transition-opacity">
            {/* Podman */}
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/>
              </svg>
              <span className="text-xs font-semibold text-muted-foreground">Podman</span>
            </div>
            {/* Red Hat */}
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M16.009 13.386c1.577 0 3.86-.326 3.86-2.202a1.86 1.86 0 0 0-.07-.479l-.86-3.596c-.165-.73-.384-1.07-1.36-1.554-.766-.384-2.448-1.2-2.86-1.2-.384 0-.498.481-1.2.481-.673 0-1.176-.576-1.855-.576-.652 0-1.073.384-1.4 1.17 0 0-1.003 2.813-1.073 3.046a.464.464 0 0 0-.028.165c0 1.176 4.26 2.746 6.845 2.746zM21.85 13.163c.137.576.206 1.002.206 1.372 0 1.81-1.84 2.82-4.26 2.82-4.645 0-9.468-2.758-9.468-5.135a2.2 2.2 0 0 1 .178-.862C5.6 11.468 3.4 12.153 3.4 14.06c0 3.18 5.94 5.588 11.46 5.588 4.14 0 6.78-1.32 6.78-3.72 0-1.29-.84-2.01-1.79-2.766z"/>
              </svg>
              <span className="text-xs font-semibold text-muted-foreground">Red Hat</span>
            </div>
            {/* RamaLama */}
            <div className="flex items-center gap-1.5">
              <span className="text-base">🦙</span>
              <span className="text-xs font-semibold text-muted-foreground">RamaLama</span>
            </div>
            {/* IBM Granite */}
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <span className="text-xs font-semibold text-muted-foreground">IBM Granite</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
