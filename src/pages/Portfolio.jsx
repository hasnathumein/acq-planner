import { useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Pill } from "../components/Pill.jsx";
import { calculateProjectMetrics, GOLD } from "../lib/appData.js";

export default function Portfolio({ projects, onOpen, onCreate, activityFeed }) {
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMetric, setSelectedMetric] = useState("Portfolio progress");

  const metrics = [
    { label: "All acquisitions", key: "All", detail: `${projects.length} total`, tone: "text-slate-900", accent: "bg-slate-900" },
    { label: "On track", key: "On track", detail: "Healthy deals", tone: "text-emerald-700", accent: "bg-emerald-600" },
    { label: "At risk", key: "At risk", detail: "Needs attention", tone: "text-amber-700", accent: "bg-amber-500" },
    { label: "Behind", key: "Behind", detail: "Delayed transitions", tone: "text-rose-700", accent: "bg-rose-600" },
  ];

  const statusSummary = projects.reduce((result, project) => {
    result[project.status] = (result[project.status] || 0) + 1;
    return result;
  }, {});

  const dueSoonCutoff = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const selectedProjects = projects.filter(project => {
    const search = query.toLowerCase();
    const matchesSearch = project.name.toLowerCase().includes(search) || project.id.toLowerCase().includes(search) || project.next.toLowerCase().includes(search) || project.status.toLowerCase().includes(search);
    const isDueSoon = selectedStatus === "Due soon" && new Date(project.transitionDate) <= dueSoonCutoff;
    const matchesStatus = selectedStatus === "All" || project.status === selectedStatus || isDueSoon;
    return matchesSearch && matchesStatus;
  });

  const selectedSoon = selectedProjects.filter(project => new Date(project.transitionDate) <= dueSoonCutoff);
  const departmentKeys = Array.from(new Set(selectedProjects.flatMap(project => Object.keys(project.departments))));
  const workload = departmentKeys.map(key => ({
    name: selectedProjects[0]?.departments[key]?.name?.split(" ")[0] || key,
    tasks: selectedProjects.reduce((count, project) => count + (project.departments[key]?.tasks.filter(task => !task.milestone).length || 0), 0),
  }));

  const averageProgress = selectedProjects.length ? Math.round(selectedProjects.reduce((sum, project) => sum + calculateProjectMetrics(project).progress, 0) / selectedProjects.length) : 0;
  const riskSignals = selectedProjects.reduce((sum, project) => sum + calculateProjectMetrics(project).risks, 0);
  const upcomingTransitions = selectedSoon.length;
  const leadershipCards = [
    { label: "Portfolio progress", value: `${averageProgress}%`, detail: "Average deal completion" , accent: "bg-slate-900", filter: "All" },
    { label: "Near-term transitions", value: `${upcomingTransitions}`, detail: "Within 90 days", accent: "bg-amber-500", filter: "Due soon" },
    { label: "At-risk deals", value: `${statusSummary["At risk"] || 0}`, detail: "Operational attention", accent: "bg-rose-500", filter: "At risk" },
    { label: "Risk signals", value: `${riskSignals}`, detail: "Tasks at risk or behind", accent: "bg-emerald-600", filter: "All" },
  ];
  const moduleCards = [
    { title: "Clinical integration", description: "Track EMR transition readiness and staff alignment." },
    { title: "Contract & compliance", description: "Monitor approval milestones, contracts and audits." },
    { title: "Facility readiness", description: "Coordinate site handover, equipment and physical inspections." },
    { title: "Change management", description: "Measure communications, trainings and stakeholder adoption." },
  ];

  return <div className="mx-auto w-full max-w-[1440px] space-y-6 text-[#101826]">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Portfolio dashboard</h1>
        <p className="max-w-2xl text-sm text-slate-600">A modern acquisition overview with fewer distractions, clearer progress, and better insight into risk across active deals.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-[320px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search acquisitions"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-[#14213D] focus:outline-none"
          />
        </div>
        <button onClick={onCreate} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#14213D] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f1f35]">New acquisition</button>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {leadershipCards.map(item => <button
        key={item.label}
        type="button"
        onClick={() => { setSelectedStatus(item.filter); setSelectedMetric(item.label); }}
        className={`overflow-hidden rounded-[28px] border p-6 text-left transition ${selectedMetric === item.label ? "border-[#14213D] bg-slate-50 shadow-sm" : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
          <div className={`h-2.5 w-16 rounded-full ${item.accent}`} />
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="text-3xl font-semibold text-slate-900">{item.value}</div>
          <div className="text-right text-xs text-slate-500">{item.detail}</div>
        </div>
      </button>) }
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(item => <button
        key={item.key}
        type="button"
        onClick={() => setSelectedStatus(item.key)}
        className={`overflow-hidden rounded-[28px] border p-6 text-left transition ${selectedStatus === item.key ? "border-[#14213D] bg-slate-50 shadow-sm" : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
          <div className={`h-2.5 w-16 rounded-full ${item.accent}`} />
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="text-3xl font-semibold text-slate-900">{item.key === "All" ? projects.length : statusSummary[item.key] || 0}</div>
          <div className="text-right text-xs text-slate-500">{item.detail}</div>
        </div>
      </button>) }
    </div>

    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">{selectedStatus}</span>
            <span>{selectedProjects.length} matching acquisitions</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">Acquisition details</h2>
        </div>
        <div className="text-sm text-slate-500">Click a card above to filter the list.</div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
        <div className="grid gap-0 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-[2fr_120px_140px_160px_1fr]">
          <div>Name</div>
          <div>Status</div>
          <div>Progress</div>
          <div>Transition</div>
          <div>Next milestone</div>
        </div>
        {selectedProjects.length === 0 ? <div className="border-t border-slate-200 px-5 py-8 text-center text-sm text-slate-500">No acquisitions match your filter.</div> : selectedProjects.map(project => {
          const projectMetrics = calculateProjectMetrics(project);
          return <button key={project.key} type="button" onClick={() => onOpen(project.key)} className="w-full border-t border-slate-200 bg-white px-5 py-4 text-left transition hover:bg-slate-50 sm:grid sm:grid-cols-[2fr_120px_140px_160px_1fr] sm:items-center">
            <div className="min-w-0"><div className="font-semibold text-slate-900">{project.name}</div><div className="mt-1 text-xs text-slate-500">{project.id}</div></div>
            <div><Pill value={project.status} /></div>
            <div><div className="text-sm font-semibold text-slate-900">{projectMetrics.progress}%</div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#14213D]" style={{ width: `${projectMetrics.progress}%` }} /></div></div>
            <div className="text-sm text-slate-600">{project.transition}</div>
            <div className="text-sm text-slate-600">{project.next}</div>
          </button>;
        })}
      </div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
      <div className="rounded-[28px] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Department workload</h2>
            <p className="mt-1 text-sm text-slate-500">Tasks in progress across the selected acquisitions.</p>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{selectedProjects.length} deals</div>
        </div>
        <div className="mt-5 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workload} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E4E7EC" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(20,33,61,0.04)" }} />
              <Bar dataKey="tasks" fill={GOLD} radius={[8, 8, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Portfolio health</h2>
          <p className="mt-1 text-sm text-slate-500">Visualize the status distribution of the selected acquisitions.</p>
        </div>
        <div className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{ name: "On track", value: statusSummary["On track"] || 0 }, { name: "At risk", value: statusSummary["At risk"] || 0 }, { name: "Behind", value: statusSummary.Behind || 0 }]} dataKey="value" innerRadius={58} outerRadius={88} paddingAngle={2}>
                {["#1E8E5A", GOLD, "#C0392B"].map(color => <Cell key={color} fill={color} />)}
              </Pie>
              <Tooltip cursor={{ fill: "rgba(20,33,61,0.04)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "On track", value: statusSummary["On track"] || 0, color: "bg-emerald-500" },
              { label: "At risk", value: statusSummary["At risk"] || 0, color: "bg-amber-500" },
              { label: "Behind", value: statusSummary.Behind || 0, color: "bg-rose-500" },
            ].map(item => <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"><div className="flex items-center gap-2"><span className={`${item.color} h-2.5 w-2.5 rounded-full`} /><span className="font-semibold">{item.label}</span></div><div className="mt-2 text-xl font-semibold text-slate-900">{item.value}</div></div>)}
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Portfolio modules</h2>
          <p className="mt-1 text-sm text-slate-500">Plan for future analytics, compliance, and delivery scorecards.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {moduleCards.map(module => <div key={module.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{module.title}</div>
          <div className="mt-4 text-sm font-semibold text-slate-900">{module.description}</div>
        </div>)}
      </div>
    </div>

    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recent activity feed</h2>
          <p className="mt-1 text-sm text-slate-500">Latest portfolio actions, notifications, and task updates.</p>
        </div>
        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Live feed</span>
      </div>
      <div className="mt-6 space-y-4">
        {activityFeed.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={`grid h-11 w-11 place-content-center rounded-2xl ${item.tone}`}><ClipboardList size={18}/></div>
            <div>
              <div className="font-semibold text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.time}</div>
        </div>)}
      </div>
    </div>
  </div>;
}

