export type LinkStatus = number | "TIMEOUT" | "ERROR";
export type LinkHealth = "healthy" | "broken" | "transient";

const PERMANENT_CLIENT_ERRORS = new Set([400, 404, 410]);

export function classifyLinkStatus(status: LinkStatus): LinkHealth {
  if (typeof status !== "number") return "transient";
  if (status >= 200 && status < 400) return "healthy";
  if (PERMANENT_CLIENT_ERRORS.has(status)) return "broken";
  return "transient";
}

export function isLinkCheckOk(status: LinkStatus): boolean {
  return classifyLinkStatus(status) !== "broken";
}
