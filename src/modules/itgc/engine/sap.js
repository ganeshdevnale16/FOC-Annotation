// SAP evidence source.
// If VITE_SAP_GATEWAY_URL is set, the agent calls your backend gateway (RFC / OData)
//   POST {url}/parameters  body: { sid, host, client, user, password, table }
//   → { rows: [{ host, parameter, value, status }], screenCount?: number }
// Otherwise a built-in demo connector returns a simulated PAHI population.
import { sleep } from "./util";

export const SAP_GATEWAY = import.meta.env.VITE_SAP_GATEWAY_URL || "";

const DEMO_VALUES = {
  "login/min_password_lng": 12, "login/min_password_digits": 2, "login/min_password_specials": 0,
  "login/min_password_uppercase": 1, "login/min_password_lowercase": 1, "login/min_password_letters": 2,
  "login/min_password_diff": 3, "login/password_history_size": 3, "login/fails_to_user_lock": 5,
  "login/password_expiration_time": 180, "login/fails_to_session_end": 3, "login/password_max_idle_initial": 14,
  "login/password_max_idle_productive": 180, "rdisp/gui_auto_logout": 1800, "login/failed_user_auto_unlock": 0,
  "login/no_automatic_user_sapstar": 1, "login/disable_multi_gui_login": 1, "login/password_compliance_to_current_policy": 1,
};
const FILL = ["abap/buffersize", "rdisp/wp_no_dia", "icm/server_port_", "ms/server_port_", "rfc/max_comm_entries",
  "ssl/ciphersuites", "auth/rfc_authority_check", "em/initial_size_MB", "zcsa/table_buffer_area", "rsdb/obj/buffersize"];

function demoAoa(host) {
  const aoa = [["Host", "Parameter", "Value", "Status"]];
  const keys = Object.keys(DEMO_VALUES);
  for (let i = 0; i < 1928 - keys.length; i++) aoa.push([host, FILL[i % 10] + "_" + i, String((i * 7) % 4096), "A"]);
  aoa.splice(40, 0, [host, "login/min_password_lng", 8, "I"]);
  keys.forEach((k, i) => aoa.splice(120 + i * 95, 0, [host, k, DEMO_VALUES[k], "A"]));
  return aoa;
}

function toSource(aoa, conn, screenCount, mode) {
  const rows = aoa.slice(1).map((r, i) => ({ n: i + 2, ri: i + 1, host: String(r[0]), p: String(r[1]), v: r[2], s: String(r[3] || ""), src: "sap" }));
  return {
    id: "sap", kind: "sap", name: `SAP_PAHI_extract_${conn.sid}.xlsx`, rows,
    table: { aoa, header: 0, sheet: "PAHI", cols: { h: 0, p: 1, v: 2, s: 3 } },
    sap: { ...conn, password: undefined, table: "PAHI", screenCount, mode },
  };
}

export async function fetchSapPopulation(conn) {
  if (SAP_GATEWAY) {
    const res = await fetch(SAP_GATEWAY.replace(/\/$/, "") + "/parameters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...conn, table: "PAHI" }),
    });
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || `SAP gateway returned ${res.status}`);
    const data = await res.json();
    const aoa = [["Host", "Parameter", "Value", "Status"], ...(data.rows || []).map((r) => [r.host || conn.host, r.parameter, r.value, r.status || "A"])];
    const src = toSource(aoa, conn, data.screenCount ?? null, "live");
    if (src.sap.screenCount == null) src.sap.screenCount = src.rows.filter((r) => /^a/i.test(r.s)).length;
    return src;
  }
  await sleep(400);
  const host = (conn.host || "sapds4") + "_" + conn.sid + "_00";
  const src = toSource(demoAoa(host), conn, null, "demo");
  src.sap.screenCount = src.rows.filter((r) => r.s === "A").length;
  return src;
}
