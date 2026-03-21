import { Shield, Lock, Container, Cpu, GitBranch, ArrowRight } from "lucide-react";
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/mcp")}>
            MCP Playground
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            Employer Dashboard
          </Button>
          <Button variant="hero" size="sm" onClick={() => navigate("/chat")}>
            Start Check-In
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* Hero */}
        <section className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-3xl text-center space-y-8">

            <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="h-10 w-10 text-white" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                  Local AI Running on Podman
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Open Source Stack
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  MCP Ready
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Privacy-First Architecture
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
                YU Shield
              </h1>
              <p className="text-xl text-muted-foreground font-medium italic">
                From you, to you.
              </p>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              A private, AI-powered daily practice that helps you understand your own patterns so you can show up better for your work, your family, and yourself. Granite 3.3 runs locally. Your data never leaves your infrastructure.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button variant="hero" size="lg" onClick={() => navigate("/chat")} className="gap-2">
                Start Check-In <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>
                View Dashboard
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              30 seconds of honesty. Built for the employee, not the employer. Your data is yours.
            </p>
          </div>
        </section>

        {/* Value Props */}
        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-bold text-foreground">Private by Architecture</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Granite 3.3 runs locally via RamaLama inside a Podman container. Your data exists to help you, not your employer. Employers see only anonymous team aggregates. Built for HIPAA-sensitive environments.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">X-Ray Mode</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit one check-in and see Granite 3.3 local versus Claude cloud respond side by side. Same data, two models, real response times. Local AI is viable for enterprise wellness.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-foreground">MCP Native</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                YU Shield exposes 5 wellness tools via Model Context Protocol. Any AI assistant, Claude Desktop, Cursor, or your own agents can check team wellness and book activities programmatically.
              </p>
            </div>

          </div>
        </section>

        {/* Founder Story */}
        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border border-primary/10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2 text-center md:text-left">
              <p className="font-bold text-foreground">Built from lived experience</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Omar Dominguez spent 11 years managing capacity in manufacturing before MIT. He lost 80 lbs starting with 7 minutes a day, ran the Boston Marathon, and finished Ironman 70.3. YU Shield exists because taking care of yourself is not selfish. It's one of the best ways to take care of the people who depend on you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source Stack */}
        <section className="px-6 pb-6">
          <div className="max-w-4xl mx-auto space-y-3">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium text-center">Open Source Stack</p>
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-50 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                </svg>
                <span className="text-xs font-semibold text-muted-foreground">Podman</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M16.009 13.386c1.577 0 3.86-.326 3.86-2.202a1.86 1.86 0 0 0-.07-.479l-.86-3.596c-.165-.73-.384-1.07-1.36-1.554-.766-.384-2.448-1.2-2.86-1.2-.384 0-.498.481-1.2.481-.673 0-1.176-.576-1.855-.576-.652 0-1.073.384-1.4 1.17 0 0-1.003 2.813-1.073 3.046a.464.464 0 0 0-.028.165c0 1.176 4.26 2.746 6.845 2.746zM21.85 13.163c.137.576.206 1.002.206 1.372 0 1.81-1.84 2.82-4.26 2.82-4.645 0-9.468-2.758-9.468-5.135a2.2 2.2 0 0 1 .178-.862C5.6 11.468 3.4 12.153 3.4 14.06c0 3.18 5.94 5.588 11.46 5.588 4.14 0 6.78-1.32 6.78-3.72 0-1.29-.84-2.01-1.79-2.766z"/>
                </svg>
                <span className="text-xs font-semibold text-muted-foreground">Red Hat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🦙</span>
                <span className="text-xs font-semibold text-muted-foreground">RamaLama</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span className="text-xs font-semibold text-muted-foreground">IBM Granite</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">FastAPI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">FastMCP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">React</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Containerized with Podman. Pushable to any OCI registry. Kubernetes-ready.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t">
        <p className="text-[11px] text-muted-foreground/50 text-center">
          Built by Omar Dominguez. MIT, 11 years optimizing capacity in manufacturing. Now fixing employee wellness.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
