import { KB } from "./policy";
import { lev, norm, toNum } from "./util";

const ACTIVE = /^(a|active|1|yes|true|y|enabled)$/i;
const INACTIVE = /^(i|inactive|0|no|false|n|disabled|old|superseded)$/i;

export function population(sources) {
  const all = sources.flatMap((s) => s.rows);
  const withStatus = all.filter((r) => r.s);
  const active = withStatus.length ? all.filter((r) => !r.s || ACTIVE.test(r.s) || !INACTIVE.test(r.s)) : all;
  return { all, active };
}

function rowMatches(a, r) {
  const p = norm(r.p);
  const k = norm(a.key);
  if (!a.generic) {
    if (p === k) return 3;
    if (k.length > 10 && lev(p, k) <= 2) return 2; // OCR tolerance
    const kb = KB.find((x) => x.key === a.key);
    if (kb && !/\//.test(r.p) && kb.syn.some((s) => new RegExp(s, "i").test(r.p))) return 1;
    return 0;
  }
  const toks = String(r.p).toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const hit = toks.filter((t) => a.keywords.some((w) => w.startsWith(t) || t.startsWith(w))).length;
  return hit >= 2 || (toks.length && hit / toks.length >= 0.6 && hit >= 1) ? 1 : 0;
}

export function evaluate(a, r) {
  const raw = r.v;
  const n = toNum(raw);
  let res, note = "";
  if (a.op === "eq") res = !isNaN(n) && typeof a.val === "number" ? n === a.val : norm(raw) === norm(a.val);
  else if (isNaN(n)) {
    res = false;
    note = "Value is not numeric";
  } else res = a.op === "min" ? n >= a.val : n <= a.val;
  return { act: isNaN(n) ? String(raw) : n, res: res ? "p" : "f", note };
}

export function runTests(attrs, sources) {
  const { active } = population(sources);
  return attrs.map((a) => {
    let best = 0;
    let matches = [];
    for (const r of active) {
      const m = rowMatches(a, r);
      if (m > best) {
        best = m;
        matches = [r];
      } else if (m && m === best) matches.push(r);
    }
    // one result per host/instance (first occurrence)
    const seen = new Set();
    const inst = [];
    for (const r of matches) {
      const k = r.host + "|" + r.src;
      if (seen.has(k)) continue;
      seen.add(k);
      inst.push({ r, ...evaluate(a, r) });
    }
    const res = !inst.length ? "n" : inst.every((i) => i.res === "p") ? "p" : "f";
    return { a, inst, res, act: inst.map((i) => i.act).join(" / ") };
  });
}

// completeness & accuracy: record count + re-performance of a random sample
export function completeness(sources, expected) {
  const { all, active } = population(sources);
  const ca = expected == null || expected === "" ? null : Number(expected) === active.length;
  const pool = [...active];
  const samp = [];
  while (samp.length < 5 && pool.length) samp.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  const byId = Object.fromEntries(sources.map((s) => [s.id, s]));
  const sample = samp.map((r) => {
    const s = byId[r.src];
    let again = null;
    if (s?.table) again = s.table.aoa[r.ri]?.[s.table.cols.v];
    else if (s?.lines) again = s.lines[r.n - 1];
    else again = r.raw;
    const ok = again == null ? true : String(again).includes(String(r.v)) || norm(again) === norm(r.v);
    return { r, ok, file: s?.name || "" };
  });
  return { total: all.length, active: active.length, expected: expected == null || expected === "" ? null : Number(expected), ca, sample };
}
