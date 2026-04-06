const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.detail ||
      (Array.isArray(data?.detail)
        ? data.detail.map((e) => e.msg).join(", ")
        : "An unexpected error occurred.");
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export const employeesApi = {
  list: () => request("/employees"),
  create: (body) => request("/employees", { method: "POST", body: JSON.stringify(body) }),
  delete: (id) => request(`/employees/${id}`, { method: "DELETE" }),
  get: (id) => request(`/employees/${id}`),
};

export const attendanceApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.employee_id != null) qs.set("employee_id", params.employee_id);
    if (params.date) qs.set("date", params.date);
    const query = qs.toString();
    return request(`/attendance${query ? `?${query}` : ""}`);
  },
  mark: (body) => request("/attendance", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/attendance/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => request(`/attendance/${id}`, { method: "DELETE" }),
};

export const dashboardApi = {
  stats: () => request("/dashboard"),
};