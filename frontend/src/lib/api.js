import { handleMockRequest } from "./mockBackend";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

let accessToken = localStorage.getItem("accessToken") || null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

export function getAccessToken() {
  return accessToken;
}

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = "GET", body, retry = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include", // send refreshToken cookie
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Access token expired — try a silent refresh once, then retry the call.
    if (res.status === 401 && retry && path !== "/auth/refresh") {
      const refreshed = await tryRefresh();
      if (refreshed) return request(path, { method, body, retry: false });
    }

    if (res.status === 204) return null;

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message = data?.message || data?.error || `Request failed (${res.status})`;
      throw new ApiError(message, res.status, data);
    }

    return data;
  } catch (err) {
    // If it's an ApiError (HTTP error status from a responding backend), rethrow it
    if (err instanceof ApiError) throw err;

    // Backend server is unavailable/offline — transparently use standalone mock data!
    console.info(`[Standalone Mode] Backend unavailable at ${BASE_URL}. Mocking ${method} ${path}`);
    const mockResult = handleMockRequest(path, method, body);
    if (mockResult !== null) return mockResult;
    throw err;
  }
}

async function tryRefresh() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    // Try mock fallback if backend offline
    const mockRes = handleMockRequest("/auth/refresh", "POST");
    if (mockRes?.accessToken) {
      setAccessToken(mockRes.accessToken);
      return true;
    }
    return false;
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

export { ApiError };
