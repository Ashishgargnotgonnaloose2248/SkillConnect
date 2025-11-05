// Helper utilities to parse environment variables safely
// Provides robust CSV parsing and origin parsing (handles trailing commas, spaces)

export function parseCsvEnv(varValue) {
  if (!varValue) return [];
  return String(varValue)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseEmailsEnv(varValue) {
  return parseCsvEnv(varValue).map((s) => s.toLowerCase());
}

export function parseCorsOrigins(frontendUrl, corsEnvValue) {
  // Accept either FRONTEND_URL plus a CSV of origins
  const origins = new Set();
  if (frontendUrl) origins.add(frontendUrl.trim());
  parseCsvEnv(corsEnvValue).forEach((o) => origins.add(o));
  return Array.from(origins).filter(Boolean);
}
