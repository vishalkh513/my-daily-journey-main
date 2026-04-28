import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Post {
  _id: string;
  title: string;
  content: string;
  mood?: string;
  createdAt: string;
  author?: string;
}

const PostView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3000/api/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load post:", error);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (post) document.title = `${post.title} — The Daily Routine`;
  }, [post]);

  const handleDelete = async () => {
    if (!user || !post || !confirm("Delete this post?")) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${post._id}?userId=${user.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete post");
      }
      
      toast.success("Post deleted");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="max-w-3xl mx-auto px-6 py-16 text-muted-foreground">Loading…</div></div>;
  if (!post) return <div className="min-h-screen bg-background"><SiteHeader /><div className="max-w-3xl mx-auto px-6 py-16">Entry not found.</div></div>;

  const date = new Date(post.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const isAuthor = user?.id === post.author;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to all entries
        </Link>
        <article>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-5">
            <span>{date}</span>
            {post.mood && <><span className="text-rule">·</span><span className="text-accent">{post.mood}</span></>}
          </div>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight mb-10 text-balance">
            {post.title}
          </h1>
          <div className="editorial-rule h-px mb-10" />
          <div className="prose-editorial font-serif text-lg whitespace-pre-wrap text-pretty">
            {post.content}
          </div>
          {isAuthor && (
            <div className="mt-16 pt-6 border-t border-rule/20">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">Entry Management</p>
              <div className="flex flex-wrap gap-3">
                <Link to={`/write/${post._id}`}>
                  <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <PenLine className="w-4 h-4 mr-2" /> Update Entry
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive border-destructive/50">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Entry
                </Button>
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
};

export default PostView;
