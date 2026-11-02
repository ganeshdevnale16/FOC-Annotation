export async function fetchInputFileName() {
  const res = await fetch("http://localhost:3001/api/input-file-name");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch input file name");
  }
  const data = await res.json();
  return data.fileName;
}
