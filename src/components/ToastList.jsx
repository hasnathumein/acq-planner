import React from "react";
import { ClipboardList } from "lucide-react";

export function ToastList({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed right-6 top-24 z-50 flex max-w-sm flex-col items-end gap-3">
      {toasts.map(toast => (
        <div key={toast.id} className={`w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xl ${toast.tone}`}>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-slate-100 p-2 text-slate-600"><ClipboardList size={18} /></div>
            <div>
              <div className="font-semibold text-slate-900">{toast.title}</div>
              <div className="mt-1 text-sm text-slate-600">{toast.detail}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
