import React from "react";

export function AppLayoutStyles() {
  return <style>{`
    html, body, #root { min-height: 100%; background: #F3F4F7; }
    * { box-sizing: border-box; }
    .app-shell { min-height: 100vh; width: 100%; background: #F3F4F7; }
    .app-sidebar { width: 256px; min-width: 256px; flex: 0 0 256px; }
    .app-main { min-width: 0; width: calc(100% - 256px); background: #F3F4F7; }
    .app-content { width: 100%; max-width: 1280px; margin: 0 auto; }
    .metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .metric-card { min-width: 0; min-height: 128px; height: 128px; }
    .dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .75fr); gap: 20px; align-items: stretch; }
    .dashboard-chart-card { min-width: 0; height: 360px; }
    .standard-modal { width: min(560px, calc(100vw - 32px)); max-height: calc(100vh - 48px); overflow-y: auto; }
    @media (max-width: 1100px) {
      .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dashboard-grid { grid-template-columns: 1fr; }
      .dashboard-chart-card { height: 340px; }
    }
    @media (max-width: 1023px) {
      .app-sidebar { display: none; }
      .app-main { width: 100%; }
    }
    @media (max-width: 640px) {
      .metric-grid { grid-template-columns: 1fr; }
      .metric-card { height: 116px; min-height: 116px; }
      .dashboard-chart-card { height: 320px; }
    }
  `}</style>;
}
