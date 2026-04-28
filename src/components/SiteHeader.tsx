import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PenLine, LogOut, GraduationCap, User } from "lucide-react";

export const SiteHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <header className="border-b border-rule/20">
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
          <span>{today}</span>
          <span className="hidden sm:inline">Vol. I — Daily Dispatch</span>
          <Link to="/marks" className="hover:text-accent transition-colors inline-flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Marks
          </Link>
        </div>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <Link to="/" className="group">
            <h1 className="font-serif text-5xl sm:text-7xl font-medium tracking-tight leading-none">
              The Daily<span className="italic text-accent"> Routine</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 italic">A field journal of small completions.</p>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/write")}>
                  <PenLine className="w-4 h-4 mr-2" /> Write
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </Button>
                <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
            )}
          </nav>
        </div>
      </div>
      <div className="editorial-rule h-px max-w-5xl mx-auto" />
    </header>
  );
};
