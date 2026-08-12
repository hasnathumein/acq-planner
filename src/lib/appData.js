export const NAVY = "#14213D";
export const GOLD = "#B8842B";

export const defaultTemplatePlans = {
  legal: {
    name: "Legal and Contracts",
    owner: "Dana Reyes",
    initials: "DR",
    tasks: [
      { id: 1, level: 0, name: "Legal readiness", milestone: true },
      { id: 2, level: 1, name: "Contract review", assignee: "D. Reyes", owner: "D. Reyes", offset: -18, status: "Not started", notes: "" },
      { id: 3, level: 2, name: "Redline NDA", assignee: "D. Reyes", owner: "D. Reyes", offset: -15, status: "Not started", notes: "" },
      { id: 4, level: 2, name: "Finalize indemnification clause", assignee: "D. Reyes", owner: "D. Reyes", offset: -12, status: "Not started", notes: "" },
    ],
  },
  finance: {
    name: "Finance and Accounting",
    owner: "Marcus Lin",
    initials: "ML",
    tasks: [
      { id: 5, level: 0, name: "Financial readiness", milestone: true },
      { id: 6, level: 1, name: "Financial handover", assignee: "M. Lin", owner: "M. Lin", offset: -10, status: "Not started", notes: "" },
      { id: 7, level: 2, name: "Reconcile trial balance", assignee: "M. Lin", owner: "M. Lin", offset: -8, status: "Not started", notes: "" },
      { id: 8, level: 2, name: "Confirm escrow release schedule", assignee: "M. Lin", owner: "M. Lin", offset: -5, status: "Not started", notes: "" },
    ],
  },
  it: {
    name: "IT and Security",
    owner: "Priya Shah",
    initials: "PS",
    tasks: [
      { id: 9, level: 0, name: "Systems access cutover", milestone: true },
      { id: 10, level: 1, name: "Identity and access", assignee: "P. Shah", owner: "P. Shah", offset: -14, status: "Not started", notes: "" },
      { id: 11, level: 2, name: "Entra tenant mapping", assignee: "P. Shah", owner: "P. Shah", offset: -12, status: "Not started", notes: "" },
      { id: 12, level: 2, name: "Security group validation", assignee: "P. Shah", owner: "P. Shah", offset: -9, status: "Not started", notes: "" },
      { id: 13, level: 1, name: "Endpoint transition", assignee: "T. Novak", owner: "P. Shah", offset: -7, status: "Not started", notes: "" },
      { id: 14, level: 2, name: "Endpoint inventory reconciliation", assignee: "P. Shah", owner: "P. Shah", offset: -5, status: "Not started", notes: "" },
    ],
  },
  hr: {
    name: "HR and Culture",
    owner: "Jordan Blake",
    initials: "JB",
    tasks: [
      { id: 15, level: 0, name: "Employee transition", milestone: true },
      { id: 16, level: 1, name: "Onboarding readiness", assignee: "J. Blake", owner: "J. Blake", offset: 4, status: "Not started", notes: "" },
      { id: 17, level: 2, name: "Offer letter batch", assignee: "J. Blake", owner: "J. Blake", offset: -7, status: "Not started", notes: "" },
      { id: 18, level: 2, name: "Benefits enrollment window", assignee: "J. Blake", owner: "J. Blake", offset: 7, status: "Not started", notes: "" },
    ],
  },
};

export const initialTemplates = [
  {
    id: "standard",
    name: "Standard Acquisition Template",
    description: "Default operational plan used for most acquisitions",
    active: true,
    plans: structuredClone(defaultTemplatePlans),
  },
  {
    id: "accelerated",
    name: "Accelerated Transition Template",
    description: "A compact plan for shorter transition timelines",
    active: true,
    plans: structuredClone(defaultTemplatePlans),
  },
];

export const initialProjects = [
  {
    key: "acquisition1",
    name: "Solstice Medical Center",
    id: "SM-1005",
    transitionDate: "2025-11-20",
    transition: "Nov 20, 2025",
    status: "On track",
    next: "Complete vendor onboarding",
    templateId: "standard",
    departments: clonePlans(initialTemplates[0], "2025-11-20"),
  },
  {
    key: "acquisition2",
    name: "Harbor Diagnostics Campus",
    id: "SM-1006",
    transitionDate: "2026-01-10",
    transition: "Jan 10, 2026",
    status: "At risk",
    next: "Finalize finance approvals",
    templateId: "accelerated",
    departments: clonePlans(initialTemplates[1], "2026-01-10"),
  },
  {
    key: "acquisition3",
    name: "Aurora Women’s Hospital",
    id: "SM-1007",
    transitionDate: "2025-12-05",
    transition: "Dec 05, 2025",
    status: "Behind",
    next: "Secure leadership sign-off",
    templateId: "standard",
    departments: clonePlans(initialTemplates[0], "2025-12-05"),
  },
  {
    key: "acquisition4",
    name: "Cedar Ridge Specialty Clinic",
    id: "SM-1008",
    transitionDate: "2026-02-15",
    transition: "Feb 15, 2026",
    status: "On track",
    next: "Finalize IT cutover plan",
    templateId: "accelerated",
    departments: clonePlans(initialTemplates[1], "2026-02-15"),
  },
];

export function formatOffset(dateValue, offset = 0) {
  if (!dateValue) return offset === 0 ? "Transition date" : `T ${offset > 0 ? "plus" : "minus"} ${Math.abs(offset)}`;
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return `T ${offset > 0 ? "plus" : "minus"} ${Math.abs(offset)}`;
  date.setDate(date.getDate() + offset);
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · T ${offset >= 0 ? "plus" : "minus"} ${Math.abs(offset)}`;
}

export function clonePlans(template, transitionDate) {
  const plans = structuredClone(template.plans);
  Object.values(plans).forEach(plan => {
    plan.status = "Not started";
    plan.progress = 0;
    plan.updated = "Just created";
    plan.tasks = plan.tasks.map(task => ({
      ...task,
      status: task.milestone ? undefined : "Not started",
      due: task.milestone ? undefined : formatOffset(transitionDate, task.offset),
      notes: "",
    }));
  });
  return plans;
}

export function calculatePlanMetrics(plan) {
  const tasks = plan.tasks.filter(task => !task.milestone);
  const complete = tasks.filter(task => task.status === "Done").length;
  const progress = tasks.length ? Math.round((complete / tasks.length) * 100) : 0;
  const hasBehind = tasks.some(task => task.status === "Behind");
  const hasRisk = tasks.some(task => task.status === "At risk");
  return {
    tasks,
    complete,
    progress,
    status: hasBehind ? "Behind" : hasRisk ? "At risk" : complete === tasks.length && tasks.length ? "On track" : plan.status || "On track",
  };
}

export function calculateProjectMetrics(project) {
  const plans = Object.values(project.departments);
  const allTasks = plans.flatMap(plan => plan.tasks.filter(task => !task.milestone));
  const complete = allTasks.filter(task => task.status === "Done").length;
  const risks = allTasks.filter(task => task.status === "At risk" || task.status === "Behind").length;
  const progress = allTasks.length ? Math.round((complete / allTasks.length) * 100) : 0;
  return { allTasks, complete, risks, progress };
}

export function visibleRows(rows, collapsed) {
  const result = [];
  let hiddenLevel = null;
  rows.forEach(row => {
    if (hiddenLevel !== null) {
      if (row.level > hiddenLevel) return;
      hiddenLevel = null;
    }
    result.push(row);
    if (collapsed.has(row.id)) hiddenLevel = row.level;
  });
  return result;
}
