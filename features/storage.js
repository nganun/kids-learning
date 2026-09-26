export function createStorage(onError = () => {}) {
  const getText = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { onError(); return false; }
  };
  const saveText = (key, value) => {
    try { localStorage.setItem(key, value); return true; }
    catch { onError(); return false; }
  };
  const load = (key, fallback) => {
    try { return JSON.parse(getText(key)) ?? fallback; }
    catch { return fallback; }
  };
  return { getText, load, save, saveText };
}
