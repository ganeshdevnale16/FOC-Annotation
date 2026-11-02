// Policy reader: turns any policy text into measurable test attributes.
// 1) explicit parameter names in the text (e.g. "login/min_password_lng = 10")
// 2) a knowledge base of common ITGC settings recognised from plain language
// 3) any other "must / at least / at most + number" statement (generic attribute,
//    matched later against whatever parameter names exist in the evidence)

export const KB = [
  { key: "login/min_password_lng", d: "Minimum password length", dir: "min", sev: "High",
    syn: ["password length", "minimum length", "min(?:imum)? (?:password )?length", "characters? long", "length of (?:the |a )?password"] },
  { key: "login/min_password_digits", d: "Minimum digits in password", dir: "min", sev: "Low",
    syn: ["\\bdigits?\\b", "numeric characters?", "\\bnumerals?\\b"] },
  { key: "login/min_password_specials", d: "Minimum special characters", dir: "min", sev: "Medium",
    syn: ["special", "\\bsymbols?\\b", "non-alphanumeric"] },
  { key: "login/min_password_uppercase", d: "Minimum uppercase letters", dir: "min", sev: "Low",
    syn: ["upper ?case", "capital letters?"] },
  { key: "login/min_password_lowercase", d: "Minimum lowercase letters", dir: "min", sev: "Low",
    syn: ["lower ?case", "small letters?"] },
  { key: "login/min_password_letters", d: "Minimum letters", dir: "min", sev: "Low",
    syn: ["(?<!(?:case|capital|small) )\\bletters\\b", "alphabetic characters?"] },
  { key: "login/min_password_diff", d: "Characters different from previous password", dir: "min", sev: "Low",
    syn: ["\\bdiffer", "different characters"] },
  { key: "login/password_history_size", d: "Password history size", dir: "min", sev: "Medium",
    syn: ["password history", "\\bhistory\\b", "re-?use", "remember(?:s|ed)? (?:the )?(?:last|previous)", "previous passwords"] },
  { key: "login/fails_to_user_lock", d: "Failed logon attempts before user lock", dir: "max", sev: "High",
    syn: ["(?:failed|invalid|unsuccessful|incorrect) (?:login |logon |log-on |sign-?in )?attempts?", "\\block(?:ed|out)?\\b"] },
  { key: "login/password_expiration_time", d: "Password expiry (days)", dir: "max", sev: "Medium", unit: "days",
    syn: ["expir", "change (?:their |the )?passwords? every", "password (?:validity|age)", "maximum password age"] },
  { key: "login/fails_to_session_end", d: "Failed attempts before session ends", dir: "max", sev: "Low",
    syn: ["session (?:is )?(?:ended|terminated|ends|end)", "terminate (?:the )?session"] },
  { key: "login/password_max_idle_initial", d: "Validity of unused initial passwords (days)", dir: "max", sev: "Medium", unit: "days",
    syn: ["initial passwords?", "unused initial"] },
  { key: "login/password_max_idle_productive", d: "Validity of unused productive passwords (days)", dir: "max", sev: "Medium", unit: "days",
    syn: ["productive passwords?", "unused passwords?", "inactive (?:passwords?|accounts?|users?)"] },
  { key: "rdisp/gui_auto_logout", d: "Automatic logout after inactivity (seconds)", dir: "max", sev: "High", unit: "seconds",
    syn: ["auto(?:matic(?:ally)?)? ?log(?:ged)? ?(?:out|off)", "logged (?:out|off) automatically", "inactivity", "idle (?:session|time)", "session time ?-?out", "\\btimeout\\b"] },
  { key: "login/failed_user_auto_unlock", d: "Automatic unlock of locked users", dir: "eq", sev: "High", bool: { neg: 0, pos: 1 },
    syn: ["auto(?:matic(?:ally)?)? ?unlock(?:ed)?", "unlocked automatically"] },
  { key: "login/no_automatic_user_sapstar", d: "Automatic SAP* user disabled", dir: "eq", sev: "High", bool: { neg: 1, pos: 0 },
    syn: ["sap\\*", "sapstar", "emergency user"] },
  { key: "login/disable_multi_gui_login", d: "Multiple logons prevented", dir: "eq", sev: "Medium", bool: { neg: 1, pos: 0 },
    syn: ["multiple (?:logons?|logins?|log-ons?|sessions)", "concurrent (?:logons?|logins?|sessions)"] },
  { key: "login/password_compliance_to_current_policy", d: "Existing passwords must meet current policy", dir: "eq", sev: "Medium", bool: { neg: 0, pos: 1 },
    syn: ["compl(?:y|iance) with (?:the )?current (?:password )?policy", "existing passwords? (?:must|should|shall) compl"] },
];

const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fifteen: 15, twenty: 20, thirty: 30, forty: 40, sixty: 60, ninety: 90, hundred: 100 };
const UNIT = { seconds: { s: 1, m: 60, h: 3600, d: 86400 }, days: { d: 1, w: 7, mo: 30, y: 365 } };
const NEG = /\b(not|never|no|disabled?|deactivated?|prevent(?:ed)?|prohibit(?:ed)?|restrict(?:ed)?|block(?:ed)?|disallow(?:ed)?|forbidden)\b/;
const MODAL = /\b(must|shall|should|required?|at least|at most|minimum|maximum|no more than|not exceed|no less than|within|limited to|set to)\b/;
const STOP = new Set("the a an and or of to be is are must shall should will with for in on at by from than this that each all any per system systems user users value set least most minimum maximum more less not no within after before every have has their its".split(" "));
export const PARAM_RE = /\b([a-z][a-z0-9_]*(?:\/[a-z0-9_.\-]+)+)/i;

function numbersIn(s) {
  const out = [];
  const re = /(?<![\w./-])(\d{1,6})(?![\w/]|\.\d)/g;
  let m;
  while ((m = re.exec(s))) {
    const n = +m[1];
    if (n >= 1900 && n <= 2100) continue; // years
    out.push({ n, i: m.index, e: m.index + m[0].length });
  }
  if (out.length) return out; // digits present: ignore number words ("previous one")
  for (const w in WORDS) {
    const r = new RegExp("\\b" + w + "\\b", "g");
    while ((m = r.exec(s))) out.push({ n: WORDS[w], i: m.index, e: m.index + w.length });
  }
  return out.sort((a, b) => a.i - b.i);
}

function unitAfter(s, at) {
  const t = s.slice(at, at + 14);
  if (/^\s*(seconds?|secs?)\b/.test(t)) return "s";
  if (/^\s*(minutes?|mins?)\b/.test(t)) return "m";
  if (/^\s*(hours?|hrs?)\b/.test(t)) return "h";
  if (/^\s*days?\b/.test(t)) return "d";
  if (/^\s*weeks?\b/.test(t)) return "w";
  if (/^\s*months?\b/.test(t)) return "mo";
  if (/^\s*years?\b/.test(t)) return "y";
  return null;
}

function opFrom(s, fallback) {
  if (/at most|maximum|max\.?\b|no more than|not (?:to )?exceed|up to|within|or less|or fewer|≤|<=|limited to|after/.test(s)) return "max";
  if (/at least|minimum|min\.?\b|no less than|no fewer than|or more|≥|>=|longer than|more than/.test(s)) return "min";
  if (/exactly|equal to|set to|=/.test(s)) return "eq";
  return fallback;
}

function convert(kb, n, s, numEnd) {
  if (!kb?.unit) return n;
  const u = unitAfter(s, numEnd);
  const t = UNIT[kb.unit];
  return u && t && t[u] ? n * t[u] : n;
}

function segments(text) {
  const segs = [];
  text
    .split(/\r?\n+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .forEach((ln) =>
      ln.split(/(?<=[.;])\s+(?=[A-Z0-9(•\-])/).forEach((seg) => {
        const raw = seg
          .replace(/^\s*(?:[•\-*]|\(?[0-9ivx]+[.)]|[a-z][.)])\s*/i, "")
          .replace(/^\d+(\.\d+)*\s+/, "")
          .trim();
        if (raw.length > 3) segs.push(raw);
      })
    );
  return segs;
}

export function parsePolicy(text) {
  const attrs = [];
  const unmapped = [];
  const seen = new Set();
  const push = (a) => {
    if (seen.has(a.key)) return;
    seen.add(a.key);
    attrs.push({ id: attrs.length + 1, ...a });
  };

  for (const raw of segments(text)) {
    const l = raw.toLowerCase();
    let used = false;

    // 1) explicit parameter names
    const keyRe = new RegExp(PARAM_RE.source, "gi");
    let km;
    while ((km = keyRe.exec(raw))) {
      const key = km[1].toLowerCase().replace(/[.]+$/, "");
      const kb = KB.find((k) => k.key === key);
      const rest = l.slice(km.index + km[0].length);
      const nums = numbersIn(rest);
      let val = nums.length ? nums[0].n : null;
      if (val == null && kb?.bool) val = NEG.test(rest) ? kb.bool.neg : kb.bool.pos;
      if (val == null) {
        const sv = rest.match(/(?:=|set to|value of)\s*['"]?([a-z0-9_\-*]+)/);
        if (!sv) continue;
        val = sv[1];
      }
      const op = typeof val === "number" ? opFrom(l, kb?.dir || "eq") : "eq";
      push({ key, d: kb?.d || `Parameter ${key}`, op, val, sev: kb?.sev || "Medium", src: raw, kb: !!kb });
      used = true;
    }
    if (used) continue;

    // 2) knowledge-base phrases (longest non-overlapping phrase wins)
    const hits = [];
    for (const kb of KB)
      for (const s of kb.syn) {
        const r = new RegExp(s, "gi");
        let m;
        while ((m = r.exec(l))) hits.push({ kb, i: m.index, e: m.index + m[0].length });
      }
    hits.sort((a, b) => b.e - b.i - (a.e - a.i));
    const kept = [];
    for (const h of hits) if (!kept.some((k) => h.i < k.e && k.i < h.e && k.kb !== h.kb)) kept.push(h);
    const byKb = new Map();
    kept.sort((a, b) => a.i - b.i).forEach((h) => !byKb.has(h.kb) && byKb.set(h.kb, h));

    const nums = numbersIn(l);
    const claimed = new Set();
    for (const [kb, h] of byKb) {
      if (seen.has(kb.key)) continue;
      if (kb.bool) {
        const set = l.match(/set to\s*(\d)/);
        const val = set ? +set[1] : NEG.test(l) ? kb.bool.neg : kb.bool.pos;
        push({ key: kb.key, d: kb.d, op: "eq", val, sev: kb.sev, src: raw, kb: true });
        used = true;
        continue;
      }
      let best = null;
      for (const n of nums) {
        if (claimed.has(n)) continue;
        const dist = n.e <= h.i ? h.i - n.e : n.i >= h.e ? n.i - h.e : 0;
        const score = n.e <= h.i && dist <= 3 ? dist : dist + 2;
        if (!best || score < best.score) best = { n, score };
      }
      if (!best || best.score > 80) continue;
      claimed.add(best.n);
      const win = l.slice(Math.max(0, best.n.i - 32), best.n.i);
      let op = opFrom(win, null) || opFrom(l, null) || kb.dir;
      if (kb.dir === "eq") op = "eq";
      else if (op === "eq") op = kb.dir;
      push({ key: kb.key, d: kb.d, op, val: convert(kb, best.n.n, l, best.n.e), sev: kb.sev, src: raw, kb: true });
      used = true;
    }
    if (used) continue;

    // 3) generic measurable requirement
    if (MODAL.test(l) && nums.length) {
      const n = nums[0];
      const keywords = [...new Set(l.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)))];
      push({
        key: "REQ-" + String(attrs.length + 1).padStart(2, "0"),
        d: raw.length > 80 ? raw.slice(0, 78) + "…" : raw,
        op: opFrom(l.slice(Math.max(0, n.i - 32), n.i), null) || opFrom(l, "min"),
        val: n.n, sev: "Medium", src: raw, generic: true, keywords,
      });
    } else if (MODAL.test(l) && l.length > 25) {
      unmapped.push(raw);
    }
  }
  return { attrs, unmapped };
}

export const DEMO_POLICY = `Password Configuration Policy – SAP Systems (v2.1, approved)
1. Minimum password length must be at least 10 characters.
2. Passwords must contain at least 1 digit.
3. Passwords must contain at least 1 special character.
4. Passwords must contain at least 1 uppercase letter and 1 lowercase letter.
5. The system must remember the last 5 passwords (password history).
6. User accounts must be locked after at most 5 failed login attempts.
7. Passwords must expire within 90 days.
8. A new password must differ from the previous one by at least 3 characters.
9. Users must be logged off automatically after 15 minutes of inactivity.
10. Locked users must not be unlocked automatically.`;

export function recommendation(x) {
  const a = x.a;
  if (!x.inst.length)
    return a.generic
      ? "Identify the system setting that enforces this requirement, provide evidence of it and re-test."
      : `Confirm ${a.key} is maintained for every instance in scope, re-run the extract and re-test.`;
  if (a.generic) return "Update the related setting to meet the policy threshold and re-test.";
  if (/^(login|rdisp|auth|icm|rfc|gw|ms)\//.test(a.key))
    return `Set ${a.key} to ${a.op === "min" ? "at least " : a.op === "max" ? "at most " : ""}${a.val} in the instance profile (RZ10/RZ11), activate it and re-test.`;
  return `Change ${a.key} to ${a.op === "min" ? "at least " : a.op === "max" ? "at most " : ""}${a.val} and re-test.`;
}
