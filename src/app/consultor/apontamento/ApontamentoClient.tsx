"use client";

import { useState, useEffect } from "react";

const HORAS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

function getWeekBounds(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const seg = new Date(d);
  seg.setDate(diff);
  const dom = new Date(seg);
  dom.setDate(dom.getDate() + 6);
  dom.setHours(23, 59, 59, 999);
  return { seg, dom };
}

function fmt(n: number) {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function ApontamentoClient({ userId }: { userId: string }) {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const seg = new Date(d);
    seg.setDate(diff);
    return seg;
  });
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ day: number; date: Date } | null>(null);

  const { seg, dom } = getWeekBounds(weekStart);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/time-entries?userId=${userId}&start=${seg.toISOString()}&end=${dom.toISOString()}`
    )
      .then((r) => r.json())
      .then((list: Array<{ date: string; totalHoras: number }>) => {
        const byDay: Record<string, number> = {};
        for (const e of list) {
          const key = new Date(e.date).toDateString();
          byDay[key] = (byDay[key] || 0) + e.totalHoras;
        }
        setEntries(byDay);
      })
      .finally(() => setLoading(false));
  }, [userId, seg.toISOString(), dom.toISOString()]);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(seg);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }
  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  const totalSemana = Object.values(entries).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={prevWeek}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white"
          >
            ← Semana anterior
          </button>
          <button
            onClick={nextWeek}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white"
          >
            Próxima semana →
          </button>
        </div>
        <p className="text-slate-400 text-sm">
          {seg.getDate().toString().padStart(2, "0")} - {dom.getDate().toString().padStart(2, "0")} de{" "}
          {dom.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className=" overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-slate-800">
              <th className="w-20 px-2 py-3 text-slate-400 text-sm">Hora</th>
              {days.map((d) => (
                <th key={d.toISOString()} className="px-2 py-3 text-slate-400 text-sm min-w-[100px]">
                  <div>{DIAS[d.getDay()]}</div>
                  <div className="font-mono">{d.getDate().toString().padStart(2, "0")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora} className="border-t border-slate-700">
                <td className="px-2 py-2 text-slate-400 text-sm">{hora}</td>
                {days.map((d) => {
                  const key = d.toDateString();
                  const horas = entries[key] ?? 0;
                  const cellKey = `${d.toISOString().slice(0, 10)}-${hora}`;
                  return (
                    <td key={cellKey} className="px-2 py-2 align-top">
                      <button
                        onClick={() =>
                          setModal({ day: d.getDay(), date: new Date(d) })
                        }
                        className="w-full min-h-[36px] rounded border border-dashed border-slate-600 hover:border-amber-500 hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 flex items-center justify-center gap-1 text-sm"
                      >
                        <span>+</span>
                        <span>{horas > 0 ? fmt(horas) : "vazio"}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-slate-700 bg-slate-800/50">
              <td className="px-2 py-3 text-slate-400 font-medium">Total</td>
              {days.map((d) => {
                const key = d.toDateString();
                const horas = entries[key] ?? 0;
                return (
                  <td key={d.toISOString()} className="px-2 py-3 text-amber-400 font-mono">
                    {fmt(horas)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {modal && (
        <ApontamentoModal
          date={modal.date}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            setLoading(true);
            fetch(
              `/api/time-entries?userId=${userId}&start=${seg.toISOString()}&end=${dom.toISOString()}`
            )
              .then((r) => r.json())
              .then((list: Array<{ date: string; totalHoras: number }>) => {
                const byDay: Record<string, number> = {};
                for (const e of list) {
                  const key = new Date(e.date).toDateString();
                  byDay[key] = (byDay[key] || 0) + e.totalHoras;
                }
                setEntries(byDay);
              })
              .finally(() => setLoading(false));
          }}
        />
      )}
    </div>
  );
}

function ApontamentoModal({
  date,
  onClose,
  onSaved,
}: {
  date: Date;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; clientId: string }>>([]);
  const [tickets, setTickets] = useState<Array<{ id: string; code: string; title: string; projectId: string }>>([]);
  const [activities, setActivities] = useState<Array<{ id: string; name: string }>>([]);
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("17:00");
  const [intervaloInicio, setIntervaloInicio] = useState("");
  const [intervaloFim, setIntervaloFim] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    fetch("/api/activities").then((r) => r.json()).then(setActivities);
  }, []);
  useEffect(() => {
    if (!clientId) {
      setProjects([]);
      setProjectId("");
      setTicketId("");
      return;
    }
    fetch("/api/projects")
      .then((r) => r.json())
      .then((list: Array<{ id: string; name: string; clientId: string }>) =>
        setProjects(list.filter((p) => p.clientId === clientId))
      );
    setProjectId("");
    setTicketId("");
  }, [clientId]);
  useEffect(() => {
    if (!projectId) {
      setTickets([]);
      setTicketId("");
      return;
    }
    fetch(`/api/tickets?projectId=${projectId}`)
      .then((r) => r.json())
      .then((list: Array<{ id: string; code: string; title: string; projectId: string }>) =>
        setTickets(list)
      );
    setTicketId("");
  }, [projectId]);

  function calcTotal() {
    const parse = (h: string) => {
      const [hh, mm] = h.split(":").map(Number);
      return (hh || 0) + (mm || 0) / 60;
    };
    let t = parse(horaFim) - parse(horaInicio);
    if (intervaloInicio && intervaloFim) {
      t -= parse(intervaloFim) - parse(intervaloInicio);
    }
    return t > 0 ? fmt(t) : "00:00";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!projectId) {
      setError("Selecione cliente e projeto");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.toISOString().slice(0, 10),
          horaInicio,
          horaFim,
          intervaloInicio: intervaloInicio || undefined,
          intervaloFim: intervaloFim || undefined,
          description: description || undefined,
          projectId,
          ticketId: ticketId || undefined,
          activityId: activityId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar");
        return;
      }
      onSaved();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Novo apontamento - {date.toLocaleDateString("pt-BR")}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Cliente</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Selecione</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Projeto</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              >
                <option value="">Selecione</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Chamado</label>
              <select
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Nenhum</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>{t.code}: {t.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Atividade</label>
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Nenhuma</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Hora início</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Hora fim</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Intervalo início</label>
                <input
                  type="time"
                  value={intervaloInicio}
                  onChange={(e) => setIntervaloInicio(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Intervalo fim</label>
                <input
                  type="time"
                  value={intervaloFim}
                  onChange={(e) => setIntervaloFim(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>
            <p className="text-amber-400 font-mono">Total: {calcTotal()}</p>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Descrição do apontamento
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="Descreva o apontamento com o máximo de detalhes."
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-medium disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
