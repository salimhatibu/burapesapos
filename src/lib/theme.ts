export function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("burapesa-theme", theme); } catch { /* noop */ }
}

export function readTheme(): "light" | "dark" {
  try {
    const t = localStorage.getItem("burapesa-theme");
    if (t === "dark" || t === "light") return t;
  } catch { /* noop */ }
  return "light";
}
