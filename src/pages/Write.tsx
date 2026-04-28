import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Trash2 } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(1, "Title required").max(200),
  content: z.string().trim().min(1, "Write something").max(20000),
  mood: z.string().trim().max(50).optional(),
});

const Write = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!id) return;
    setLoadingPost(true);
    fetch(`http://localhost:3000/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data) => {
        setTitle(data.title || '');
        setContent(data.content || '');
        setMood(data.mood ?? '');
        setLoadingPost(false);
      })
      .catch((error) => {
        console.error("Failed to load post:", error);
        toast.error("Failed to load post");
        setLoadingPost(false);
      });
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const parsed = schema.safeParse({ title, content, mood: mood || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    
    setSaving(true);
    try {
      const url = editing ? `http://localhost:3000/api/posts/${id}` : 'http://localhost:3000/api/posts';
      const method = editing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          content,
          mood: mood || undefined,
          published: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      toast.success(editing ? "Entry updated." : "Entry published.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id || !user) return;
    if (!confirm("Delete this entry?")) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${id}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete post');
      }

      toast.success("Deleted.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message ?? "Could not delete");
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-muted-foreground">Loading post…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          {editing ? "Edit Entry" : "New Entry"}
        </p>
        <form onSubmit={save} className="space-y-6">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The day's headline…"
              className="font-serif text-3xl md:text-4xl border-0 border-b border-rule/30 rounded-none px-0 h-auto py-3 focus-visible:ring-0 focus-visible:border-accent placeholder:text-muted-foreground/50 placeholder:italic"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood" className="text-[11px] uppercase tracking-[0.2em]">Mood / Theme</Label>
            <Input 
              id="mood" 
              value={mood} 
              onChange={(e) => setMood(e.target.value)} 
              placeholder="e.g. focused, reflective, productive" 
              maxLength={50} 
            />
          </div>

          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you complete today? What did the routine teach you?"
              rows={18}
              className="font-serif text-lg leading-[1.8] border-rule/30 focus-visible:ring-accent resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-2 text-right">{content.length} / 20000</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-rule/20">
            {editing ? (
              <Button type="button" variant="ghost" onClick={remove} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/")}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Publish"}</Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Write;
