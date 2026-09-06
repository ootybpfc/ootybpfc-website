// Typed fetch layer over the club FastAPI backend.
//
// BASE is the relative "/api" prefix on purpose, so the browser always talks to its OWN
// origin: Vite proxies /api in dev, and vercel.json rewrites /api to the backend host in
// production. The backend's session cookie is httpOnly + SameSite=Lax with no Domain
// attribute and its CORS policy is `Allow-Origin: *` with no `Allow-Credentials`, so a
// direct cross-origin call from the browser can never hold a session. Keep it same-origin.
const BASE = "/api";

// Fields are declared, not constructor parameter properties: tsconfig sets
// erasableSyntaxOnly, which rejects `constructor(readonly status: number)`.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonBody = unknown;

// If /api is not routed to the backend, the SPA rewrite answers with index.html and a
// 200 text/html. Detect that explicitly instead of failing with an opaque JSON parse
// error, which is what made the portal login report a bare "Could not send a code".
const ROUTING_HINT =
  "The club API is not reachable from this site. Check the /api rewrite in vercel.json.";

function isJson(res: Response) {
  return (res.headers.get("content-type") ?? "").toLowerCase().includes("json");
}

async function request<T>(method: string, path: string, body?: JsonBody): Promise<T> {
  // Auth rides the httpOnly session cookie automatically — never add auth headers here.
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, { detail: "Network unavailable. Check your connection and try again." });
  }

  if (!res.ok) {
    // FastAPI reports request-validation failures as 422 with a {detail: [...]} body.
    const errBody = isJson(res) ? await res.json().catch(() => null) : null;
    if (!isJson(res)) {
      throw new ApiError(res.status, { detail: ROUTING_HINT }, ROUTING_HINT);
    }
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;

  if (!isJson(res)) {
    throw new ApiError(res.status, { detail: ROUTING_HINT }, ROUTING_HINT);
  }

  return (await res.json()) as T;
}

// The response type is yours to declare: nothing infers across the Python boundary, so a
// TS interface here mirrors the endpoint's Pydantic model by hand — keep the two in sync.
export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: JsonBody) => request<T>("POST", path, body ?? null);
export const apiPut = <T>(path: string, body?: JsonBody) => request<T>("PUT", path, body ?? null);
export const apiPatch = <T>(path: string, body?: JsonBody) =>
  request<T>("PATCH", path, body ?? null);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);
