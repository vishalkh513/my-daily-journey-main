import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import ContributionCalendar from "@/components/ContributionCalendar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  content: string;
  mood?: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
  published?: boolean;
}

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "The Daily Routine — A field journal";
    
    // Fetch posts from MongoDB API
    fetch('http://localhost:3000/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch posts:', error);
        setLoading(false);
      });
  }, []);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const lead = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-muted-foreground">Loading entries…</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">From the desk</p>
            <h2 className="font-serif text-4xl mb-3">The page is blank.</h2>
            <p className="text-muted-foreground italic max-w-md mx-auto">
              No entries yet. Sign in and write the first dispatch of your daily routine.
            </p>
          </div>
        ) : (
          <>
            {/* Contribution Calendar */}
            <div className="mb-16 border-b border-rule/20 pb-8">
              <ContributionCalendar posts={posts} />
            </div>
            
            {/* Create New Entry Button for logged-in users */}
            {user && (
              <div className="mb-12 flex justify-center">
                <Link to="/write">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" /> Create New Entry
                  </Button>
                </Link>
              </div>
            )}
            {/* Lead story */}
            <Link to={`/post/${lead._id}`} className="block group mb-16">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Today's lead</p>
              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-8">
                  <h2 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-balance group-hover:text-accent transition-colors duration-500">
                    {lead.title}
                  </h2>
                </div>
                <div className="md:col-span-4 md:border-l md:border-rule/30 md:pl-6">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                    {fmtDate(lead.createdAt)} {lead.mood && <span className="text-accent">· {lead.mood}</span>}
                  </div>
                  <p className="text-foreground/80 leading-relaxed line-clamp-5">
                    {lead.content}
                  </p>
                  <span className="inline-block mt-4 text-sm text-accent border-b border-accent/40 group-hover:border-accent transition">
                    Read the entry
                  </span>
                </div>
              </div>
            </Link>

            {rest.length > 0 && <div className="editorial-rule h-px mb-10" />}

            {/* Entries grid */}
            {rest.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">Earlier entries</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {rest.map((p) => (
                    <Link key={p._id} to={`/post/${p._id}`} className="group block">
                      <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                        {fmtDate(p.createdAt)} {p.mood && <span className="text-accent">· {p.mood}</span>}
                      </div>
                      <h3 className="font-serif text-2xl leading-snug mb-2 text-balance group-hover:text-accent transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {p.content}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
      <footer className="border-t border-rule/20 mt-24">
        <div className="max-w-5xl mx-auto px-6 py-8 flex justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>The Daily Routine</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
