// API client utilities

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  createdAt: string;
}

export interface ApiAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  language: string;
  minTestsToPass: number;
  starterCode: string;
  status?: string;
  score?: string;
  tests: ApiTest[];
}

export interface ApiTest {
  id: string;
  name: string;
  input: string;
  expected: string;
  status?: string;
  actual?: string;
}

async function fetchApi(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      fetchApi("/api/auth/logout", { method: "POST" }),
    me: () =>
      fetchApi("/api/auth/me"),
  },

  users: {
    list: () =>
      fetchApi("/api/users"),
    create: (name: string, email: string, password: string, role: "admin" | "student" = "student") =>
      fetchApi("/api/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      }),
  },

  assignments: {
    list: () =>
      fetchApi("/api/assignments"),
    get: (id: string) =>
      fetchApi(`/api/assignments/${id}`),
    create: (data: {
      title: string;
      description: string;
      dueDate: string;
      language: string;
      minTestsToPass: number;
      starterCode: string;
      tests: Array<{ name: string; input: string; expected: string }>;
    }) =>
      fetchApi("/api/assignments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  submissions: {
    submit: (assignmentId: string, data: {
      code: string;
      passedTests: number;
      totalTests: number;
      status: string;
      score: string;
    }) =>
      fetchApi(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
