import { useEffect, useState } from "react";
import { Bell, Building2, LayoutDashboard, Plus, Settings, ShieldCheck, X } from "lucide-react";

import Portfolio from "./Portfolio.jsx";
import TemplatesAdmin from "./TemplatesAdmin.jsx";
import Workspace from "./Workspace.jsx";
import { AppLayoutStyles } from "../components/AppLayoutStyles.jsx";
import { ToastList } from "../components/ToastList.jsx";
import { loadState, saveState } from "../lib/storage.js";
import { clonePlans, initialProjects, initialTemplates } from "../lib/appData.js";

export default function AcquisitionPlannerDemo() {
  const [signedIn, setSignedIn] = useState(() => loadState("acq-signed-in", false));
  const [view, setView] = useState(() => loadState("acq-view", "portfolio"));
  const [templates, setTemplates] = useState(() => loadState("acq-templates", initialTemplates));
  const [projects, setProjects] = useState(() => loadState("acq-projects", initialProjects));
  const [activeKey, setActiveKey] = useState(() => loadState("acq-active-key", initialProjects[0]?.key || ""));
  const [acquisitionModal, setAcquisitionModal] = useState(null);
  const [acquisitionForm, setAcquisitionForm] = useState({ name: "", id: "", transitionDate: "", status: "On track", next: "", templateId: "standard" });
  const [activityFeed, setActivityFeed] = useState(() => loadState("acq-activity-feed", [{
    id: Date.now() + 1,
    title: "Task created",
    detail: "Added EMR cutover planner task in SM-1001 - ABC Healthcare Center",
    time: "Just now",
    tone: "bg-emerald-100 text-emerald-700",
  }, {
    id: Date.now() + 2,
    title: "Email notification",
    detail: "Sent risk alert to clinical leadership for SM-1002 - Meridian Medical Campus",
    time: "10m ago",
    tone: "bg-slate-100 text-slate-700",
  }, {
    id: Date.now() + 3,
    title: "Acquisition added",
    detail: "SM-1005 - Solstice Medical Center was added to the portfolio",
    time: "1h ago",
    tone: "bg-slate-100 text-slate-700",
  }, {
    id: Date.now() + 4,
    title: "Task deleted",
    detail: "Removed obsolete vendor task from SM-1006 - Harbor Diagnostics Campus",
    time: "2h ago",
    tone: "bg-rose-100 text-rose-700",
  }]));
  const active = projects.find(project => project.key === activeKey) || projects[0];

  const addActivity = event => {
    setActivityFeed(current => [{ id: Date.now(), ...event }, ...current].slice(0, 6));
  };

  const [toasts, setToasts] = useState([]);
  const addToast = event => {
    const id = Date.now();
    setToasts(current => [...current, { id, ...event }].slice(-4));
    setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 3600);
  };

  const openCreate = () => {
    setAcquisitionForm({ name: "", id: `ACQ 0${150 + projects.length}`, transitionDate: "", status: "On track", next: "Day one readiness", templateId: templates[0]?.id || "" });
    setAcquisitionModal("create");
  };
  const openEdit = () => {
    setAcquisitionForm({ name: active.name, id: active.id, transitionDate: active.transitionDate, status: active.status, next: active.next, templateId: active.templateId });
    setAcquisitionModal("edit");
  };

  useEffect(() => {
    saveState("acq-signed-in", signedIn);
  }, [signedIn]);

  useEffect(() => {
    saveState("acq-view", view);
  }, [view]);

  useEffect(() => {
    saveState("acq-templates", templates);
  }, [templates]);

  useEffect(() => {
    saveState("acq-projects", projects);
  }, [projects]);

  useEffect(() => {
    saveState("acq-activity-feed", activityFeed);
  }, [activityFeed]);

  useEffect(() => {
    saveState("acq-active-key", activeKey);
  }, [activeKey]);

  useEffect(() => {
    if (!projects.some(project => project.key === activeKey) && projects[0]) {
      setActiveKey(projects[0].key);
    }
  }, [projects, activeKey]);

  const saveAcquisition = () => {
    if (!acquisitionForm.name.trim() || !acquisitionForm.id.trim() || !acquisitionForm.transitionDate) return;
    if (acquisitionModal === "create") {
      const template = templates.find(item => item.id === acquisitionForm.templateId);
      if (!template) return;
      const key = `acquisition${Date.now()}`;
      const transition = new Date(`${acquisitionForm.transitionDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const created = { key, ...acquisitionForm, transition, departments: clonePlans(template, acquisitionForm.transitionDate) };
      setProjects(current => [...current, created]);
      const event = {
        title: "Acquisition added",
        detail: `${acquisitionForm.name} was added to the portfolio`,
        time: "Just now",
        tone: "bg-slate-100 text-slate-700",
      };
      addActivity(event);
      addToast(event);
      setActiveKey(key);
      setView("workspace");
    } else {
      const transition = new Date(`${acquisitionForm.transitionDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      setProjects(current => current.map(project => project.key === activeKey ? { ...project, ...acquisitionForm, transition } : project));
      const event = {
        title: "Acquisition updated",
        detail: `${acquisitionForm.name} details were updated`,
        time: "Just now",
        tone: "bg-slate-100 text-slate-700",
      };
      addActivity(event);
      addToast(event);
    }
    setAcquisitionModal(null);
  };
  const deleteAcquisition = () => {
    const remaining = projects.filter(project => project.key !== activeKey);
    if (!remaining.length) return;
    const deleted = projects.find(project => project.key === activeKey);
    setProjects(remaining);
    const event = {
      title: "Acquisition deleted",
      detail: `${deleted?.name || "An acquisition"} was removed from the portfolio`,
      time: "Just now",
      tone: "bg-rose-100 text-rose-700",
    };
    addActivity(event);
    addToast(event);
    setActiveKey(remaining[0].key);
    setAcquisitionModal(null);
    setView("workspace");
  };

  if (!signedIn) return <><AppLayoutStyles /><div className="flex min-h-screen items-center justify-center bg-[#14213D] p-6 font-sans text-[#101826]"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2"><div className="flex min-h-[560px] flex-col justify-between bg-gradient-to-br from-[#1F3057] to-[#14213D] p-10 text-white"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B8842B] font-bold text-[#14213D]">AQ</div><div><div className="font-semibold text-white">Acquisitions Hub</div><div className="text-xs text-slate-300">Portfolio platform</div></div></div><div><h1 className="text-4xl font-bold text-white">Manage every acquisition from portfolio to task.</h1><p className="mt-5 leading-7 text-slate-300">Create an acquisition once and automatically generate every approved department plan.</p></div><div className="text-sm text-slate-300">Secure access · Live status · Reusable templates</div></div><div className="flex items-center bg-white p-10 text-[#101826]"><div className="w-full"><ShieldCheck size={34} className="text-[#14213D]"/><h2 className="mt-6 text-3xl font-bold">Welcome back</h2><p className="mt-2 text-slate-600">Use the corporate Microsoft account.</p><button onClick={() => setSignedIn(true)} className="mt-8 w-full rounded-xl bg-[#14213D] px-5 py-4 font-semibold text-white">Sign in with Microsoft</button></div></div></div></div></>;

  return <><AppLayoutStyles /><div className="flex min-h-screen bg-[#F5F6F8] font-sans text-[#101826]"><ToastList toasts={toasts} /><aside className="hidden w-64 flex-col bg-[#14213D] p-4 text-white lg:flex"><div className="flex items-center gap-3 p-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B8842B] font-bold text-[#14213D]">AQ</div><div><div className="font-semibold text-white">Acquisitions Hub</div><div className="text-xs text-slate-300">Portfolio platform</div></div></div><nav className="mt-6 space-y-2"><button onClick={() => setView("portfolio")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${view === "portfolio" ? "bg-white/10 font-semibold text-white" : "text-slate-300"}`}><LayoutDashboard size={18}/>Portfolio dashboard</button><button onClick={() => setView("workspace")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${view === "workspace" ? "bg-white/10 font-semibold text-white" : "text-slate-300"}`}><Building2 size={18}/>Acquisition workspace</button><button onClick={() => setView("templates")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${view === "templates" ? "bg-white/10 font-semibold text-white" : "text-slate-300"}`}><Settings size={18}/>Plan templates</button></nav><div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xs uppercase tracking-wide text-slate-300">Current acquisition</div><div className="mt-2 font-semibold text-white">{active.name}</div><div className="mt-1 text-xs text-slate-300">{active.id}</div></div><div className="mt-auto rounded-xl bg-white/5 p-3"><div className="font-semibold text-white">Hasnat</div><div className="text-xs text-emerald-300">ACQ Admin · Entra ID</div></div></aside><main className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-6 py-3"><div><div className="font-semibold">{view === "portfolio" ? "Portfolio dashboard" : view === "templates" ? "Plan templates" : active.name}</div><div className="text-xs text-slate-500">{view === "portfolio" ? "Live status across every acquisition" : view === "templates" ? "Admin managed reusable plans" : "Acquisition dashboard and department plans"}</div></div><div className="flex items-center gap-3"><button onClick={openCreate} className="hidden items-center gap-2 rounded-lg bg-[#14213D] px-4 py-2 text-sm font-semibold text-white sm:flex"><Plus size={16}/>New acquisition</button><button className="rounded-lg border border-slate-200 bg-white p-2.5 text-[#14213D]"><Bell size={18}/></button></div></header><div className="flex-1 p-5 lg:p-7"><div className="app-content">{view === "portfolio" ? <Portfolio projects={projects} activityFeed={activityFeed} onCreate={openCreate} onOpen={key => { setActiveKey(key); setView("workspace"); }}/> : view === "templates" ? <TemplatesAdmin templates={templates} setTemplates={setTemplates} onToast={addToast}/> : <Workspace key={active.key} project={active} projects={projects} onSelect={setActiveKey} onCreate={openCreate} onEdit={openEdit} onDelete={() => setAcquisitionModal("delete")} onBack={() => setView("portfolio")} onActivity={addActivity} onProjectChange={updatedProject => setProjects(current => current.map(project => project.key === updatedProject.key ? updatedProject : project))} onToast={addToast}/> }</div></div></main>{acquisitionModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white text-[#101826] shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h3 className="text-lg font-semibold">{acquisitionModal === "create" ? "Create acquisition" : acquisitionModal === "edit" ? "Edit acquisition" : "Delete acquisition"}</h3><p className="mt-1 text-xs text-slate-500">{acquisitionModal === "create" ? "Choose a template. Every department plan will be created automatically." : acquisitionModal === "edit" ? "Update acquisition details." : "Remove this acquisition from the demo."}</p></div><button onClick={() => setAcquisitionModal(null)} className="text-slate-500"><X size={18}/></button></div>{acquisitionModal === "delete" ? <div className="p-6"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Delete <b>{active.name}</b> and all inherited department plans?</div></div> : <div className="space-y-4 p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold uppercase text-slate-600">Acquisition name<input value={acquisitionForm.name} onChange={event => setAcquisitionForm({ ...acquisitionForm, name: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label><label className="text-xs font-semibold uppercase text-slate-600">Acquisition ID<input value={acquisitionForm.id} onChange={event => setAcquisitionForm({ ...acquisitionForm, id: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold uppercase text-slate-600">Transition date<input type="date" value={acquisitionForm.transitionDate} onChange={event => setAcquisitionForm({ ...acquisitionForm, transitionDate: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label><label className="text-xs font-semibold uppercase text-slate-600">Status<select value={acquisitionForm.status} onChange={event => setAcquisitionForm({ ...acquisitionForm, status: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm normal-case text-[#101826]"><option>On track</option><option>At risk</option><option>Behind</option></select></label></div>{acquisitionModal === "create" && <label className="block text-xs font-semibold uppercase text-slate-600">Plan template<select value={acquisitionForm.templateId} onChange={event => setAcquisitionForm({ ...acquisitionForm, templateId: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm normal-case text-[#101826]">{templates.filter(template => template.active).map(template => <option key={template.id} value={template.id}>{template.name} · {Object.keys(template.plans).length} plans</option>)}</select><span className="mt-2 block text-xs font-normal normal-case text-slate-500">All plans and tasks from the selected template will be copied into the new acquisition.</span></label>}<label className="block text-xs font-semibold uppercase text-slate-600">Next milestone<input value={acquisitionForm.next} onChange={event => setAcquisitionForm({ ...acquisitionForm, next: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label></div>}<div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4"><button onClick={() => setAcquisitionModal(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button onClick={acquisitionModal === "delete" ? deleteAcquisition : saveAcquisition} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${acquisitionModal === "delete" ? "bg-rose-700" : "bg-[#14213D]"}`}>{acquisitionModal === "delete" ? "Delete acquisition" : acquisitionModal === "create" ? "Create and generate plans" : "Save changes"}</button></div></div></div>}</div></>;
}

