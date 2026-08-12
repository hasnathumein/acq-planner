import { useState } from "react";
import { Plus, Copy, ClipboardList, X } from "lucide-react";

export default function TemplatesAdmin({ templates, setTemplates, onToast }) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id || null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const selected = templates.find(template => template.id === selectedId) || templates[0];
  const planCount = selected ? Object.keys(selected.plans).length : 0;
  const taskCount = selected ? Object.values(selected.plans).reduce((count, plan) => count + plan.tasks.filter(task => !task.milestone).length, 0) : 0;

  const createTemplate = () => {
    if (!form.name.trim()) return;
    const template = { id: `template${Date.now()}`, name: form.name, description: form.description, active: true, plans: {} };
    setTemplates(current => [...current, template]);
    setSelectedId(template.id);
    setModal(null);
    if (typeof onToast === "function") {
      onToast({
        title: "Template created",
        detail: `${template.name} was added to templates`,
        time: "Just now",
        tone: "bg-emerald-100 text-emerald-700",
      });
    }
  };

  const duplicateTemplate = () => {
    if (!selected) return;
    const copy = structuredClone(selected);
    copy.id = `template${Date.now()}`;
    copy.name = `${selected.name} Copy`;
    setTemplates(current => [...current, copy]);
    setSelectedId(copy.id);
    if (typeof onToast === "function") {
      onToast({
        title: "Template duplicated",
        detail: `${selected.name} was duplicated`,
        time: "Just now",
        tone: "bg-slate-100 text-slate-700",
      });
    }
  };

  const addDepartmentPlan = () => {
    if (!selected || !form.name.trim()) return;
    const key = `${form.name.toLowerCase().replace(/[^a-z0-9]/g, "")}${Date.now()}`;
    setTemplates(current => current.map(template => template.id === selected.id ? {
      ...template,
      plans: {
        ...template.plans,
        [key]: {
          name: form.name,
          owner: form.description || "Department owner",
          initials: form.name.split(" ").map(value => value[0]).join("").slice(0, 2).toUpperCase(),
          tasks: [
            { id: Date.now(), level: 0, name: `${form.name} readiness`, milestone: true },
            { id: Date.now() + 1, level: 1, name: "Initial planning task", assignee: "", owner: form.description || "Department owner", offset: -7, status: "Not started", notes: "" },
          ],
        },
      },
    } : template));
    setModal(null);
    if (typeof onToast === "function") {
      onToast({
        title: "Plan added",
        detail: `Added ${form.name} to ${selected.name} template`,
        time: "Just now",
        tone: "bg-slate-100 text-slate-700",
      });
    }
  };

  return <div className="space-y-6 text-[#101826]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold">Plan templates</h1><p className="mt-1 text-sm text-slate-600">Admins maintain the reusable plans automatically cloned into new acquisitions.</p></div><button onClick={() => { setForm({ name: "", description: "" }); setModal("template"); }} className="flex items-center justify-center gap-2 rounded-xl bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/>New template</button></div>
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Available templates</div><div className="space-y-2">{templates.map(template => <button key={template.id} onClick={() => setSelectedId(template.id)} className={`w-full rounded-xl border p-4 text-left ${selected?.id === template.id ? "border-[#B8842B] bg-[#FBF7EF]" : "border-slate-200 bg-white hover:bg-slate-50"}`}><div className="flex items-start justify-between"><div><div className="font-semibold text-[#101826]">{template.name}</div><div className="mt-1 text-xs leading-5 text-slate-500">{template.description || "No description"}</div></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span></div></button>)}</div></div>
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected template</div><h2 className="mt-2 text-xl font-bold">{selected?.name}</h2><p className="mt-2 text-sm text-slate-600">{selected?.description}</p></div><div className="flex flex-wrap gap-2"><button onClick={duplicateTemplate} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14213D]"><Copy size={16}/>Duplicate</button><button onClick={() => { setForm({ name: "", description: "" }); setModal("plan"); }} className="flex items-center gap-2 rounded-lg bg-[#14213D] px-3 py-2 text-sm font-semibold text-white"><Plus size={16}/>Add department plan</button></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Department plans</div><div className="mt-2 text-2xl font-bold text-[#14213D]">{planCount}</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Template tasks</div><div className="mt-2 text-2xl font-bold text-[#14213D]">{taskCount}</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Used for new projects</div><div className="mt-2 text-2xl font-bold text-emerald-700">Yes</div></div></div></div>
        <div className="grid gap-4 md:grid-cols-2">{selected && Object.entries(selected.plans).map(([key, plan]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><div className="font-semibold">{plan.name}</div><div className="mt-1 text-xs text-slate-500">Owner: {plan.owner}</div></div><ClipboardList size={20} className="text-[#B8842B]"/></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Milestones</div><div className="mt-1 font-bold">{plan.tasks.filter(task => task.milestone).length}</div></div><div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Tasks</div><div className="mt-1 font-bold">{plan.tasks.filter(task => !task.milestone).length}</div></div></div></div>)}</div>
      </div>
    </div>
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h3 className="font-semibold">{modal === "template" ? "Create template" : "Add department plan"}</h3><p className="mt-1 text-xs text-slate-500">{modal === "template" ? "Create a reusable acquisition template." : "Add another department plan to the selected template."}</p></div><button onClick={() => setModal(null)} className="text-slate-500"><X size={18}/></button></div><div className="space-y-4 p-5"><label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">{modal === "template" ? "Template name" : "Department name"}<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case tracking-normal text-[#101826]"/></label><label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">{modal === "template" ? "Description" : "Department owner"}<input value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case tracking-normal text-[#101826]"/></label></div><div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4"><button onClick={() => setModal(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button onClick={modal === "template" ? createTemplate : addDepartmentPlan} className="rounded-lg bg-[#14213D] px-4 py-2 text-sm font-semibold text-white">Save</button></div></div></div>}
  </div>;
}

