const KNOWN_LOCATIONS = {
  tokyo: { label: "Tokyo", lat: 35.6762, lng: 139.6503 },
  kyoto: { label: "Kyoto", lat: 35.0116, lng: 135.7681 },
  osaka: { label: "Osaka", lat: 34.6937, lng: 135.5023 },
  seoul: { label: "Seoul", lat: 37.5665, lng: 126.978 },
  beijing: { label: "Beijing", lat: 39.9042, lng: 116.4074 },
  shanghai: { label: "Shanghai", lat: 31.2304, lng: 121.4737 },
  hongkong: { label: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  singapore: { label: "Singapore", lat: 1.3521, lng: 103.8198 },
  bangkok: { label: "Bangkok", lat: 13.7563, lng: 100.5018 },
  taipei: { label: "Taipei", lat: 25.033, lng: 121.5654 },
  delhi: { label: "Delhi", lat: 28.6139, lng: 77.209 },
  mumbai: { label: "Mumbai", lat: 19.076, lng: 72.8777 },
  sydney: { label: "Sydney", lat: -33.8688, lng: 151.2093 },
  melbourne: { label: "Melbourne", lat: -37.8136, lng: 144.9631 },
  auckland: { label: "Auckland", lat: -36.8509, lng: 174.7645 },
  london: { label: "London", lat: 51.5072, lng: -0.1276 },
  paris: { label: "Paris", lat: 48.8566, lng: 2.3522 },
  berlin: { label: "Berlin", lat: 52.52, lng: 13.405 },
  amsterdam: { label: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  rome: { label: "Rome", lat: 41.9028, lng: 12.4964 },
  madrid: { label: "Madrid", lat: 40.4168, lng: -3.7038 },
  barcelona: { label: "Barcelona", lat: 41.3874, lng: 2.1686 },
  lisbon: { label: "Lisbon", lat: 38.7223, lng: -9.1393 },
  vienna: { label: "Vienna", lat: 48.2082, lng: 16.3738 },
  prague: { label: "Prague", lat: 50.0755, lng: 14.4378 },
  athens: { label: "Athens", lat: 37.9838, lng: 23.7275 },
  istanbul: { label: "Istanbul", lat: 41.0082, lng: 28.9784 },
  cairo: { label: "Cairo", lat: 30.0444, lng: 31.2357 },
  capetown: { label: "Cape Town", lat: -33.9249, lng: 18.4241 },
  johannesburg: { label: "Johannesburg", lat: -26.2041, lng: 28.0473 },
  nairobi: { label: "Nairobi", lat: -1.2921, lng: 36.8219 },
  dubai: { label: "Dubai", lat: 25.2048, lng: 55.2708 },
  "abu dhabi": { label: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
  newyork: { label: "New York", lat: 40.7128, lng: -74.006 },
  "new york": { label: "New York", lat: 40.7128, lng: -74.006 },
  boston: { label: "Boston", lat: 42.3601, lng: -71.0589 },
  seattle: { label: "Seattle", lat: 47.6062, lng: -122.3321 },
  sanfrancisco: { label: "San Francisco", lat: 37.7749, lng: -122.4194 },
  "san francisco": { label: "San Francisco", lat: 37.7749, lng: -122.4194 },
  losangeles: { label: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  "los angeles": { label: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  chicago: { label: "Chicago", lat: 41.8781, lng: -87.6298 },
  toronto: { label: "Toronto", lat: 43.6532, lng: -79.3832 },
  vancouver: { label: "Vancouver", lat: 49.2827, lng: -123.1207 },
  montreal: { label: "Montreal", lat: 45.5017, lng: -73.5673 },
  mexicocity: { label: "Mexico City", lat: 19.4326, lng: -99.1332 },
  "mexico city": { label: "Mexico City", lat: 19.4326, lng: -99.1332 },
  riodejaneiro: { label: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
  "rio de janeiro": { label: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
  saopaulo: { label: "Sao Paulo", lat: -23.5505, lng: -46.6333 },
  "sao paulo": { label: "Sao Paulo", lat: -23.5505, lng: -46.6333 },
  buenosaires: { label: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  "buenos aires": { label: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  santiago: { label: "Santiago", lat: -33.4489, lng: -70.6693 },
  honolulu: { label: "Honolulu", lat: 21.3069, lng: -157.8583 },
};

export function serializeLocationEntry(label, lat, lng) {
  return `${label} | ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

export function serializeLocationObject(location) {
  if (!location) return "";
  if (location.lat == null || location.lng == null) return location.label || "";
  return serializeLocationEntry(location.label || "Location", location.lat, location.lng);
}

function normalizeLocationKey(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseLocationInput(raw) {
  if (raw && typeof raw === "object") {
    return {
      label: raw.label || raw.name || "Location",
      lat: raw.lat ?? null,
      lng: raw.lng ?? null,
      source: raw.source || (raw.lat != null && raw.lng != null ? "manual" : "unknown"),
      raw: raw.raw || serializeLocationObject(raw),
      note: raw.note || "",
    };
  }

  const value = (raw || "").trim();
  if (!value) return null;

  const explicitMatch = value.match(/^(.*?)\s*\|\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (explicitMatch) {
    const label = explicitMatch[1].trim() || `${explicitMatch[2]}, ${explicitMatch[3]}`;
    return {
      label,
      lat: Number(explicitMatch[2]),
      lng: Number(explicitMatch[3]),
      source: "manual",
      raw: value,
      note: "",
    };
  }

  const normalized = normalizeLocationKey(value);
  const known = KNOWN_LOCATIONS[normalized] || KNOWN_LOCATIONS[normalized.replace(/\s+/g, "")];
  if (known) {
    return { ...known, source: "known", raw: value, note: "" };
  }

  return {
    label: value,
    lat: null,
    lng: null,
    source: "unknown",
    raw: value,
    note: "",
  };
}

export function normalizeLocationEntry(raw) {
  const parsed = parseLocationInput(raw);
  if (!parsed) return null;
  return {
    label: parsed.label,
    lat: parsed.lat,
    lng: parsed.lng,
    source: parsed.source,
    raw: parsed.raw,
    note: parsed.note || "",
  };
}

export function buildTravelMarkers(items) {
  return items.flatMap((item) =>
    (item.locations || []).map((location, index) => {
      const parsed = normalizeLocationEntry(location);
      return parsed
        ? {
            ...parsed,
            id: `${item.id}-${index}-${parsed.label}`,
            itemId: item.id,
            itemName: item.name,
            itemColor: item.color || "#2563eb",
          }
        : null;
    }).filter(Boolean)
  );
}

export function projectPoint(lat, lng, width, height) {
  return {
    x: ((lng + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  };
}
