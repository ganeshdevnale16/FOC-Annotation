export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const OPS = { min: "≥", max: "≤", eq: "=" };
export const OPS_ASCII = { min: ">=", max: "<=", eq: "=" };
export const RES_LABEL = { p: "PASS", f: "FAIL", n: "NOT FOUND" };
export const opWord = (op) => (op === "min" ? "at least" : op === "max" ? "at most" : "exactly");

export const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, "");

export function lev(a, b) {
  a = String(a);
  b = String(b);
  if (Math.abs(a.length - b.length) > 3) return 99;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export const toNum = (v) => {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim().replace(/,/g, "");
  return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
};

export function dataUrlToBytes(url) {
  const bin = atob(url.split(",")[1]);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Image could not be loaded"));
    img.src = src;
  });
}

export const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });

export function saveBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1500);
}
