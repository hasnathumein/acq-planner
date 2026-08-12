import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Pill } from "../components/Pill.jsx";
import { calculatePlanMetrics, calculateProjectMetrics, visibleRows } from "../lib/appData.js";

export default function Workspace({ project, projects, onSelect, onCreate, onEdit, onDelete, onBack, onActivity, onProjectChange, onToast }) {
  const [tab, setTab] = useState("dashboard");
  const [departmentKey, setDepartmentKey] = useState(null);
  const [taskSets, setTaskSets] = useState(() => Object.fromEntries(Object.entries(project.departments).map(([key, plan]) => [key, plan.tasks])));
  const [collapsed, setCollapsed] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDraft, setTaskDraft] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setTaskSets(Object.fromEntries(Object.entries(project.departments).map(([key, plan]) => [key, plan.tasks])));
  }, [project.key]);

  const persistTaskChanges = nextTaskSets => {
    setTaskSets(nextTaskSets);
    if (typeof onProjectChange === "function") {
      const updatedProject = {
        ...project,
        departments: Object.fromEntries(Object.entries(project.departments).map(([key, plan]) => [key, { ...plan, tasks: nextTaskSets[key] || [] }])),
      };
      onProjectChange(updatedProject);
    }
  };

  const departments = Object.entries(project.departments);
  const department = departmentKey ? project.departments[departmentKey] : null;
  const rawTasks = departmentKey ? taskSets[departmentKey] || [] : [];
  const searchedTasks = query ? rawTasks.filter(task => task.name.toLowerCase().includes(query.toLowerCase()) || task.milestone) : rawTasks;
  const tasks = visibleRows(searchedTasks, collapsed);
  const projectWithTasks = { ...project, departments: Object.fromEntries(departments.map(([key, plan]) => [key, { ...plan, tasks: taskSets[key] || [] }])) };
  const projectMetrics = calculateProjectMetrics(projectWithTasks);
  const toggleCollapse = id => setCollapsed(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const hasChildren = index => index + 1 < rawTasks.length && rawTasks[index + 1].level > rawTasks[index].level;
  const expandableIds = rawTasks.filter((task, index) => hasChildren(index)).map(task => task.id);
  const openDepartment = key => { setDepartmentKey(key); setTab("plans"); setCollapsed(new Set()); setQuery(""); };
  const openTaskEditor = task => {
    const draft = task ? { ...task } : { id: null, level: 1, name: "", assignee: "", owner: department?.owner || "", due: "", status: "Not started", notes: "" };
    setSelectedTask(draft);
    setTaskDraft(draft);
  };
  const saveTask = () => {
    if (!taskDraft?.name?.trim()) return;
    let activityEvent = null;
    const currentTasks = taskSets[departmentKey] || [];
    const departmentName = project.departments[departmentKey]?.name || "department";
    const acquisitionName = project.name;
    let nextTaskSets;

    if (taskDraft.id === null) {
      const nextId = Math.max(0, ...Object.values(taskSets).flat().map(task => Number(task.id) || 0)) + 1;
      activityEvent = {
        title: "Task created",
        detail: `Added ${taskDraft.name} in ${acquisitionName} (${departmentName})`,
        time: "Just now",
        tone: "bg-emerald-100 text-emerald-700",
      };
      nextTaskSets = { ...taskSets, [departmentKey]: [...currentTasks, { ...taskDraft, id: nextId }] };
    } else {
      const existing = currentTasks.find(task => task.id === taskDraft.id);
      if (existing) {
        if (existing.status !== taskDraft.status && taskDraft.status === "Done") {
          activityEvent = {
            title: "Task completed",
            detail: `Completed ${taskDraft.name} in ${acquisitionName} (${departmentName})`,
            time: "Just now",
            tone: "bg-emerald-100 text-emerald-700",
          };
        } else if (existing.status !== taskDraft.status) {
          activityEvent = {
            title: "Task updated",
            detail: `Updated ${taskDraft.name} status to ${taskDraft.status} in ${acquisitionName} (${departmentName})`,
            time: "Just now",
            tone: "bg-slate-100 text-slate-700",
          };
        }
      }
      nextTaskSets = { ...taskSets, [departmentKey]: currentTasks.map(task => task.id === taskDraft.id ? { ...taskDraft } : task) };
    }

    persistTaskChanges(nextTaskSets);
    if (activityEvent && typeof onActivity === "function") {
      onActivity(activityEvent);
    }
    setSelectedTask(null);
    setTaskDraft(null);
  };

  const toggleTaskStatus = task => {
    const nextStatus = task.status === "Done" ? "On track" : "Done";
    const nextTaskSets = {
      ...taskSets,
      [departmentKey]: taskSets[departmentKey].map(item => item.id === task.id ? { ...item, status: nextStatus } : item),
    };

    persistTaskChanges(nextTaskSets);

    const event = {
      title: nextStatus === "Done" ? "Task completed" : "Task updated",
      detail: nextStatus === "Done"
        ? `Completed ${task.name} in ${project.name} (${department?.name || "department"})`
        : `Updated ${task.name} status to ${nextStatus} in ${project.name} (${department?.name || "department"})`,
      time: "Just now",
      tone: nextStatus === "Done" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700",
    };

    if (typeof onActivity === "function") {
      onActivity(event);
    }
    if (typeof onToast === "function") {
      onToast(event);
    }
  };

  const controls = <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[#101826] shadow-sm"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EAD3] text-[#14213D]"><Building2 size={21}/></div><div className="min-w-0 flex-1"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Select acquisition</div><select value={project.key} onChange={event => onSelect(event.target.value)} className="mt-1 w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14213D]">{projects.map(item => <option key={item.key} value={item.key}>{item.name} · {item.id}</option>)}</select></div></div><div className="flex flex-wrap gap-2"><button onClick={onCreate} className="flex items-center gap-2 rounded-lg bg-[#14213D] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16}/>New</button><button onClick={onEdit} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#14213D]"><Pencil size={16}/>Edit</button><button onClick={onDelete} className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700"><Trash2 size={16}/>Delete</button></div></div></div>;
  const tabs = <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"><button onClick={() => { setTab("dashboard"); setDepartmentKey(null); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "dashboard" ? "bg-[#14213D] text-white" : "text-slate-600"}`}>Acquisition dashboard</button><button onClick={() => { setTab("plans"); setDepartmentKey(null); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "plans" ? "bg-[#14213D] text-white" : "text-slate-600"}`}>Department plans</button></div>;

  if (department) {
    const metrics = calculatePlanMetrics({ ...department, tasks: rawTasks });
    return <div className="space-y-5 text-[#101826]">{controls}{tabs}<button onClick={() => setDepartmentKey(null)} className="flex items-center gap-1 text-sm font-semibold text-[#14213D]"><ChevronLeft size={16}/>Department plans</button><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><h1 className="text-2xl font-bold">{department.name}</h1><div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600"><span>{department.owner}</span><Pill value={metrics.status}/><span>{metrics.progress}% complete</span><span>{metrics.complete}/{metrics.tasks.length} tasks</span></div></div><div className="flex flex-wrap gap-2"><button onClick={() => setCollapsed(new Set())} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14213D]">Expand all</button><button onClick={() => setCollapsed(new Set(expandableIds))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14213D]">Collapse all</button><div className="relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tasks" className="rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-[#101826]"/></div><button onClick={() => openTaskEditor(null)} className="flex items-center gap-2 rounded-lg bg-[#14213D] px-4 py-2 text-sm font-semibold text-white"><Plus size={16}/>Add task</button></div></div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="min-w-[920px]"><div className="grid grid-cols-[42px_1fr_120px_120px_170px_110px_60px] gap-2 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500"><span/><span>Task</span><span>Assignee</span><span>Owner</span><span>Due date</span><span>Status</span><span>Notes</span></div>{tasks.map(task => { const rawIndex = rawTasks.findIndex(item => item.id === task.id); const expandable = hasChildren(rawIndex); if (task.milestone) return <div key={task.id} className="grid grid-cols-[42px_1fr] items-center bg-[#F8F6F0] px-4 py-3 font-semibold text-[#14213D]"><button onClick={() => toggleCollapse(task.id)} className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#F5EAD3]">{collapsed.has(task.id) ? <ChevronRight size={16}/> : <ChevronDown size={16}/>}</button><span>{task.name}</span></div>; return <div key={task.id} className="grid grid-cols-[42px_1fr_120px_120px_170px_110px_60px] items-center gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"><div className="flex items-center gap-1">{expandable ? <button onClick={() => toggleCollapse(task.id)} className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100">{collapsed.has(task.id) ? <ChevronRight size={15}/> : <ChevronDown size={15}/>}</button> : <span className="w-6"/>}<button onClick={() => toggleTaskStatus(task)} className={`flex h-4 w-4 items-center justify-center rounded border ${task.status === "Done" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}>{task.status === "Done" && <Check size={11} className="text-white"/>}</button></div><button onClick={() => openTaskEditor(task)} className={`text-left font-medium ${task.status === "Done" ? "text-slate-400 line-through" : "text-[#101826]"}`} style={{ paddingLeft: `${Math.max(0, task.level - 1) * 18}px` }}>{task.name}</button><span>{task.assignee}</span><span>{task.owner}</span><span className="font-mono text-xs">{task.due}</span><Pill value={task.status}/><span className="text-center">{task.notes ? 1 : 0}</span></div>; })}</div></div>{selectedTask && taskDraft && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div className="w-full max-w-xl rounded-2xl bg-white text-[#101826] shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h3 className="font-semibold">{taskDraft.id === null ? "Add task" : "Edit task"}</h3><p className="mt-1 text-xs text-slate-500">Update task details for {department.name}.</p></div><button onClick={() => { setSelectedTask(null); setTaskDraft(null); }} className="text-slate-500"><X size={18}/></button></div><div className="space-y-4 p-5"><label className="block text-xs font-semibold uppercase text-slate-600">Task name<input value={taskDraft.name} onChange={event => setTaskDraft({ ...taskDraft, name: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold uppercase text-slate-600">Assignee<input value={taskDraft.assignee} onChange={event => setTaskDraft({ ...taskDraft, assignee: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label><label className="text-xs font-semibold uppercase text-slate-600">Primary owner<input value={taskDraft.owner} onChange={event => setTaskDraft({ ...taskDraft, owner: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold uppercase text-slate-600">Due date<input value={taskDraft.due} onChange={event => setTaskDraft({ ...taskDraft, due: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label><label className="text-xs font-semibold uppercase text-slate-600">Status<select value={taskDraft.status} onChange={event => setTaskDraft({ ...taskDraft, status: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm normal-case text-[#101826]"><option>Not started</option><option>On track</option><option>At risk</option><option>Behind</option><option>Done</option></select></label></div><label className="block text-xs font-semibold uppercase text-slate-600">Notes<textarea value={taskDraft.notes} onChange={event => setTaskDraft({ ...taskDraft, notes: event.target.value })} className="mt-2 h-24 w-full rounded-lg border border-slate-200 p-3 text-sm normal-case text-[#101826]"/></label></div><div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4"><button onClick={() => { setSelectedTask(null); setTaskDraft(null); }} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button onClick={saveTask} className="rounded-lg bg-[#14213D] px-4 py-2 text-sm font-semibold text-white">Save task</button></div></div></div>}</div>;
  }

  if (tab === "plans") return <div className="space-y-5 text-[#101826]">{controls}<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-[#14213D]"><ChevronLeft size={16}/>Portfolio dashboard</button>{tabs}<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="font-semibold">Transition date · <span className="font-mono">{project.transition}</span></div><p className="mt-1 text-xs text-slate-500">All calculated plan dates were generated from this acquisition transition date.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{departments.map(([key, plan]) => { const metrics = calculatePlanMetrics({ ...plan, tasks: taskSets[key] || [] }); return <button key={key} onClick={() => openDepartment(key)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left text-[#101826] shadow-sm hover:border-[#B8842B]"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{plan.name}</h3><div className="mt-2 text-xs text-slate-600">{plan.owner}</div></div><Pill value={metrics.status}/></div><div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#14213D]" style={{ width: `${metrics.progress}%` }}/></div><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{metrics.progress}% complete</span><span>{metrics.complete}/{metrics.tasks.length} tasks</span></div></button>; })}</div></div>;

  return <div className="space-y-5 text-[#101826]">{controls}<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-[#14213D]"><ChevronLeft size={16}/>Portfolio dashboard</button><div><h1 className="text-2xl font-bold">{project.name}</h1><div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600"><span className="font-mono">{project.id}</span><Pill value={project.status}/><span>{project.transition}</span></div></div>{tabs}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["Overall progress", `${projectMetrics.progress}%`], ["Departments", departments.length], ["Tasks complete", `${projectMetrics.complete}/${projectMetrics.allTasks.length}`], ["Tasks at risk", projectMetrics.risks], ["Next milestone", project.next]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs font-semibold uppercase text-slate-500">{label}</div><div className={`mt-2 font-bold text-[#14213D] ${label === "Next milestone" ? "text-base" : "text-2xl"}`}>{value}</div></div>)}</div><div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]"><div className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="font-semibold">Department readiness</h2><p className="mt-1 text-xs text-slate-500">Current status of every inherited department plan</p></div><div className="divide-y divide-slate-100">{departments.map(([key, plan]) => { const metrics = calculatePlanMetrics({ ...plan, tasks: taskSets[key] || [] }); return <button key={key} onClick={() => openDepartment(key)} className="grid w-full gap-3 p-4 text-left text-[#101826] hover:bg-slate-50 md:grid-cols-[1.25fr_1fr_.65fr_auto] md:items-center"><div><div className="font-semibold">{plan.name}</div><div className="text-xs text-slate-500">{plan.owner}</div></div><div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#14213D]" style={{ width: `${metrics.progress}%` }}/></div><div className="mt-1 text-xs text-slate-500">{metrics.progress}% · {metrics.complete}/{metrics.tasks.length}</div></div><Pill value={metrics.status}/><ChevronRight size={17} className="text-slate-400"/></button>; })}</div></div><div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="font-semibold">Needs attention</h2><AlertCircle size={18} className="text-rose-600"/></div><div className="mt-4 space-y-3">{departments.filter(([, plan]) => { const metrics = calculatePlanMetrics(plan); return metrics.status === "At risk" || metrics.status === "Behind"; }).slice(0, 3).map(([key, plan]) => <button key={key} onClick={() => openDepartment(key)} className="w-full rounded-xl border border-amber-100 bg-amber-50 p-3 text-left"><div className="font-semibold">{plan.name}</div><div className="mt-1 text-xs text-slate-600">Review tasks marked at risk or behind.</div></button>)}</div></div><div className="rounded-2xl bg-[#14213D] p-5 text-white"><div className="text-xs font-semibold uppercase text-[#E8C98B]">Leadership summary</div><p className="mt-3 text-sm leading-6 text-slate-200">{project.name} is {projectMetrics.progress}% complete across {departments.length} inherited department plans. {projectMetrics.risks} tasks need attention.</p></div></div></div></div>;
}
