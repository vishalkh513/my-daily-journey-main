import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const SUBJECTS = [
  "Engineering Mathematics",
  "Digital Logic",
  "Computer Organization & Architecture",
  "Programming & Data Structures",
  "Algorithms",
  "Theory of Computation",
  "Compiler Design",
  "Operating System",
  "Database Management System",
  "Computer Networks",
  "Discrete Mathematics",
  "General Aptitude",
];

interface Mark {
  _id: string;
  user_id: string;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  test_date: string;
  notes: string | null;
  created_at: string;
}

const schema = z.object({
  subject: z.string().min(1, "Pick a subject"),
  marks_obtained: z.number().min(0, "Cannot be negative"),
  total_marks: z.number().min(1, "Must be at least 1"),
  test_date: z.string().min(1),
  notes: z.string().max(500).optional(),
});

const Marks = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [marks, setMarks] = useState<Mark[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [obtained, setObtained] = useState("");
  const [total, setTotal] = useState("100");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "Test Marks — The Daily Routine"; }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const load = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const response = await fetch(`http://localhost:3000/api/marks?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch marks');
      }
      const data = await response.json();
      setMarks(data);
    } catch (error) {
      console.error('Error loading marks:', error);
      toast.error('Failed to load marks');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const resetForm = () => {
    setSubject(""); setObtained(""); setTotal("100");
    setTestDate(new Date().toISOString().split("T")[0]); setNotes("");
    setEditingId(null);
  };

  const startEdit = (m: Mark) => {
    setEditingId(m._id);
    setSubject(m.subject);
    setObtained(String(m.marks_obtained));
    setTotal(String(m.total_marks));
    setTestDate(m.test_date);
    setNotes(m.notes ?? "");
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      subject,
      marks_obtained: Number(obtained),
      total_marks: Number(total),
      test_date: testDate,
      notes: notes || undefined,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (Number(obtained) > Number(total)) { toast.error("Obtained marks can't exceed total"); return; }

    setSaving(true);
    try {
      const url = editingId ? `http://localhost:3000/api/marks/${editingId}` : 'http://localhost:3000/api/marks';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subject,
          marks_obtained: Number(obtained),
          total_marks: Number(total),
          test_date: testDate,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save mark');
      }

      toast.success(editingId ? "Mark updated." : "Mark added.");
      resetForm(); setShowForm(false); load();
    } catch (err: any) {
      console.error('Error saving mark:', err);
      toast.error(err.message ?? "Could not save");
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete marks');
      return;
    }
    if (!confirm("Delete this entry?")) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/marks/${id}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete mark');
      }

      toast.success("Deleted.");
      load();
    } catch (error) {
      console.error('Error deleting mark:', error);
      toast.error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stats = useMemo(() => {
    if (marks.length === 0) return null;
    const totalObtained = marks.reduce((s, m) => s + Number(m.marks_obtained), 0);
    const totalMax = marks.reduce((s, m) => s + Number(m.total_marks), 0);
    const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const bySubject: Record<string, { obt: number; tot: number; n: number }> = {};
    marks.forEach((m) => {
      const k = m.subject;
      if (!bySubject[k]) bySubject[k] = { obt: 0, tot: 0, n: 0 };
      bySubject[k].obt += Number(m.marks_obtained);
      bySubject[k].tot += Number(m.total_marks);
      bySubject[k].n += 1;
    });
    return { totalObtained, totalMax, overallPct, bySubject, count: marks.length };
  }, [marks]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Ledger</p>
            <h2 className="font-serif text-5xl tracking-tight">GATE Test Marks</h2>
            <p className="text-muted-foreground italic mt-2">A running tally of practice and progress.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add mark
          </Button>
        </div>

        {/* Summary */}
        {stats && (
          <section className="mb-12 grid sm:grid-cols-3 gap-4">
            <div className="border border-rule/30 p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Tests Taken</p>
              <p className="font-serif text-4xl">{stats.count}</p>
            </div>
            <div className="border border-rule/30 p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Overall</p>
              <p className="font-serif text-4xl">
                {stats.totalObtained}<span className="text-muted-foreground text-2xl"> / {stats.totalMax}</span>
              </p>
            </div>
            <div className="border border-rule/30 p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Average</p>
              <p className="font-serif text-4xl text-accent">{stats.overallPct.toFixed(1)}%</p>
            </div>
          </section>
        )}

        {/* Form */}
        {showForm && (
          <section className="border border-rule/40 p-6 mb-12 bg-card">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {editingId ? "Edit entry" : "New entry"}
              </p>
              <Button variant="ghost" size="sm" onClick={() => { resetForm(); setShowForm(false); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.2em]">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                  <SelectContent side="bottom" avoidCollisions={true}>
                    {SUBJECTS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obt" className="text-[11px] uppercase tracking-[0.2em]">Marks obtained</Label>
                <Input id="obt" type="number" step="0.01" value={obtained} onChange={(e) => setObtained(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tot" className="text-[11px] uppercase tracking-[0.2em]">Total marks</Label>
                <Input id="tot" type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="td" className="text-[11px] uppercase tracking-[0.2em]">Date</Label>
                <Input id="td" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nt" className="text-[11px] uppercase tracking-[0.2em]">Notes (optional)</Label>
                <Input id="nt" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Mock 3, weak in DP…" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Update" : "Add"}</Button>
              </div>
            </form>
          </section>
        )}

        {/* List */}
        <section>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">All entries</p>
          {fetching ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : marks.length === 0 ? (
            <div className="border border-dashed border-rule/40 p-12 text-center">
              <p className="font-serif text-2xl mb-2">No marks recorded yet.</p>
              <p className="text-muted-foreground italic">Add your first GATE practice score.</p>
            </div>
          ) : (
            <div className="divide-y divide-rule/20 border-y border-rule/20">
              {marks.map((m) => {
                const pct = (Number(m.marks_obtained) / Number(m.total_marks)) * 100;
                return (
                  <div key={m._id} className="grid grid-cols-12 gap-4 py-4 items-center">
                    <div className="col-span-12 md:col-span-5">
                      <p className="font-serif text-lg">{m.subject}</p>
                      {m.notes && <p className="text-sm text-muted-foreground italic line-clamp-1">{m.notes}</p>}
                    </div>
                    <div className="col-span-4 md:col-span-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {fmtDate(m.test_date)}
                    </div>
                    <div className="col-span-4 md:col-span-2 font-serif">
                      {m.marks_obtained}<span className="text-muted-foreground"> / {m.total_marks}</span>
                    </div>
                    <div className="col-span-2 md:col-span-1 font-serif text-accent">{pct.toFixed(0)}%</div>
                    <div className="col-span-2 md:col-span-2 flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(m)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(m._id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Per-subject breakdown */}
        {stats && Object.keys(stats.bySubject).length > 0 && (
          <section className="mt-16">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">By subject</p>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(stats.bySubject).map(([s, v]) => {
                const pct = v.tot > 0 ? (v.obt / v.tot) * 100 : 0;
                return (
                  <div key={s} className="flex items-center justify-between border-b border-rule/20 py-2">
                    <span className="font-serif">{s}</span>
                    <span className="text-sm text-muted-foreground">
                      {v.obt}/{v.tot} <span className="text-accent ml-2">{pct.toFixed(0)}%</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Marks;
