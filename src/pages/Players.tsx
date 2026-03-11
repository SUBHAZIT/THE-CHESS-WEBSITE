import { useState } from "react";
import { useTournamentStore } from "@/lib/store";
import { createPlayer } from "@/lib/tournament-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Edit, Upload, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function Players() {
  const { players, addPlayer, removePlayer, updatePlayer, setPlayers } = useTournamentStore();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", organization: "", rating: "" });

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    (p.organization || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editId) {
      updatePlayer(editId, {
        name: form.name.toUpperCase(),
        phone: form.phone || undefined,
        organization: form.organization?.toUpperCase() || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
      });
    } else {
      const p = createPlayer(form.name, players.length + 1, {
        phone: form.phone || undefined,
        organization: form.organization || undefined,
        rating: form.rating ? Number(form.rating) : undefined,
      });
      addPlayer(p);
    }
    setForm({ name: "", phone: "", organization: "", rating: "" });
    setEditId(null);
    setDialogOpen(false);
  };

  const startEdit = (p: typeof players[0]) => {
    setForm({
      name: p.name,
      phone: p.phone || "",
      organization: p.organization || "",
      rating: p.rating?.toString() || "",
    });
    setEditId(p.id);
    setDialogOpen(true);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const startIdx = players.length + 1;
      const newPlayers = lines.slice(1).map((line, i) => {
        const cols = line.split(",").map(c => c.trim());
        return createPlayer(cols[0] || `PLAYER ${startIdx + i}`, startIdx + i, {
          phone: cols[1] || undefined,
          organization: cols[2] || undefined,
          rating: cols[3] ? Number(cols[3]) : undefined,
        });
      });
      setPlayers([...players, ...newPlayers]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-display tracking-[0.15em] text-gold-gradient">PLAYERS</h1>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            <Button variant="outline" className="gap-2" asChild>
              <span><Upload className="h-4 w-4" /> IMPORT CSV</span>
            </Button>
          </label>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm({ name: "", phone: "", organization: "", rating: "" }); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gold-gradient font-display tracking-wider">
                <Plus className="h-4 w-4" /> ADD PLAYER
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider text-primary">
                  {editId ? "EDIT PLAYER" : "ADD PLAYER"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="NAME" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="font-body tracking-wider uppercase" />
                <Input placeholder="PHONE (OPTIONAL)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="font-body tracking-wider" />
                <Input placeholder="ORGANIZATION (OPTIONAL)" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} className="font-body tracking-wider uppercase" />
                <Input placeholder="RATING (OPTIONAL)" type="number" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="font-body tracking-wider" />
                <Button onClick={handleSubmit} className="w-full bg-gold-gradient font-display tracking-wider">
                  {editId ? "UPDATE" : "ADD"} PLAYER
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="SEARCH PLAYERS..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 font-body tracking-wider"
        />
      </div>

      <div className="text-xs font-mono text-muted-foreground tracking-wider">
        {filtered.length} OF {players.length} PLAYERS
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              {["ID", "NAME", "GROUP", "ORG", "RATING", "PTS", "W", "STATUS", "CHECK-IN", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-display tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-primary">{p.id}</td>
                <td className="px-4 py-3 font-body font-semibold tracking-wider">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.groupId || "—"}</td>
                <td className="px-4 py-3 font-body text-sm text-muted-foreground">{p.organization || "—"}</td>
                <td className="px-4 py-3 font-mono text-sm">{p.rating || "—"}</td>
                <td className="px-4 py-3 font-mono text-sm text-primary">{p.points}</td>
                <td className="px-4 py-3 font-mono text-sm">{p.wins}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-mono tracking-wider px-2 py-0.5 rounded-sm ${
                    p.status === 'active' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => updatePlayer(p.id, { checkedIn: !p.checkedIn })}>
                    {p.checkedIn ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(p)} className="p-1 hover:text-primary"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => removePlayer(p.id)} className="p-1 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground font-body tracking-wider">
            NO PLAYERS FOUND
          </div>
        )}
      </div>
    </div>
  );
}
