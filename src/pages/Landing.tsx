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
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          Employer Dashboard
        </Button>
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
    </div>
  );
};

export default Landing;
