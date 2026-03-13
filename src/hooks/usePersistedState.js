import { useState, useEffect, useRef } from "react";

async function loadFromApi(key) {
  try {
    const res = await fetch(`/api/data/${key}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // fall through
  }
  return undefined;
}

function saveToApi(key, value) {
  fetch(`/api/data/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  }).catch(() => {});
}

export function usePersistedState(key, defaultVal) {
  const [state, setState] = useState(() => {
    // Use localStorage as fast initial cache while API loads
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  });

  const initialized = useRef(false);

  // Load from file API on mount (source of truth)
  useEffect(() => {
    loadFromApi(key).then((data) => {
      if (data != null) {
        setState(data);
        localStorage.setItem(key, JSON.stringify(data));
      }
      initialized.current = true;
    });
  }, [key]);

  // Save to both localStorage and file API on changes
  useEffect(() => {
    if (!initialized.current) return;
    localStorage.setItem(key, JSON.stringify(state));
    saveToApi(key, state);
  }, [key, state]);

  return [state, setState];
}
