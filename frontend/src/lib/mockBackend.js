// Persistent local storage mock backend for standalone running without Docker/Backend server.

const STORAGE_KEYS = {
  USERS: "neuroforge_mock_users",
  PROJECTS: "neuroforge_mock_projects",
  TASKS: "neuroforge_mock_tasks",
  CURRENT_USER: "neuroforge_mock_current_user",
};

const DEFAULT_USERS = [];

const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    name: "NeuroForge Nexus Platform",
    description: "Core SDLC collaboration system with real-time governance, RBAC, and kanban board.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    ownerId: null,
    teamLead: null,
    memberIds: [],
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-2",
    name: "AI Analytics Pipeline",
    description: "Automated test telemetry and predictive model integration.",
    status: "PLANNING",
    priority: "MEDIUM",
    ownerId: null,
    teamLead: null,
    memberIds: [],
    startDate: "2026-09-10",
    endDate: "2027-01-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_TASKS = [
  {
    id: "tsk-1",
    projectId: "proj-1",
    title: "Implement JWT & OAuth Security Filters",
    description: "Secure backend routes using JWT bearer tokens and standard Spring Security filters.",
    status: "DONE",
    assigneeId: null,
    subtasks: [
      { id: "sub-1", title: "Create JwtUtil class", status: "DONE" },
      { id: "sub-2", title: "Add CustomUserDetailService", status: "DONE" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "tsk-2",
    projectId: "proj-1",
    title: "Role-Based Governance Controls",
    description: "Restrict administrative actions to ADMIN and PROJECT_MANAGER roles.",
    status: "IN_PROGRESS",
    assigneeId: null,
    subtasks: [
      { id: "sub-3", title: "Audit project deletion permissions", status: "DONE" },
      { id: "sub-4", title: "Add member assignment guards", status: "TODO" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "tsk-3",
    projectId: "proj-1",
    title: "Interactive Kanban Task Management",
    description: "Drag/update tasks across TODO, IN_PROGRESS, and DONE status columns.",
    status: "TODO",
    assigneeId: null,
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

function getStored(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Failed to store mock data:", e);
  }
}

function getUsers() {
  const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
  // Clean up all initial default demo users (usr-admin, usr-pm, usr-dev1, usr-dev2, usr-tester)
  const defaultDemoIds = new Set(["usr-admin", "usr-pm", "usr-dev1", "usr-dev2", "usr-tester"]);
  const cleaned = users.filter((u) => !defaultDemoIds.has(u.id));
  if (cleaned.length !== users.length) {
    setStored(STORAGE_KEYS.USERS, cleaned);
    return cleaned;
  }
  return users;
}

function getProjects() {
  return getStored(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
}

function getTasks() {
  return getStored(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
}

function getCurrentUser() {
  const users = getUsers();
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return users.find((u) => u.id === currentId) || users[0] || null;
}

export function handleMockRequest(path, method, body) {
  const users = getUsers();
  const projects = getProjects();
  const tasks = getTasks();

  // AUTH
  if (path === "/auth/login" && method === "POST") {
    const { email } = body || {};
    let user = users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
    if (!user) {
      user = {
        id: "usr-" + Date.now(),
        name: email ? email.split("@")[0] : "User",
        email: email || "user@neuroforge.com",
        role: "DEVELOPER",
      };
      users.push(user);
      setStored(STORAGE_KEYS.USERS, users);
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.id);
    return {
      accessToken: "mock-jwt-access-token-" + Date.now(),
      user,
    };
  }

  if (path === "/auth/signup" && method === "POST") {
    const { name, email } = body || {};
    const newUser = {
      id: "usr-" + Date.now(),
      name: name || "New User",
      email: email || `user${Date.now()}@neuroforge.com`,
      role: "DEVELOPER",
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser.id);
    return {
      accessToken: "mock-jwt-access-token-" + Date.now(),
      user: newUser,
    };
  }

  if (path === "/auth/refresh" && method === "POST") {
    return { accessToken: "mock-jwt-refresh-token-" + Date.now() };
  }

  // USERS
  if (path === "/users/me" && method === "GET") {
    return getCurrentUser();
  }

  if (path === "/users/directory" && method === "GET") {
    return users;
  }

  if (path === "/users/non-admin" && method === "DELETE") {
    const adminUsers = users.filter((u) => u.role === "ADMIN");
    setStored(STORAGE_KEYS.USERS, adminUsers);

    const adminIds = new Set(adminUsers.map((u) => u.id));
    const defaultAdminId = adminUsers[0]?.id || null;
    const updatedProjects = projects.map((p) => ({
      ...p,
      ownerId: adminIds.has(p.ownerId) ? p.ownerId : defaultAdminId,
      teamLead: adminIds.has(p.teamLead) ? p.teamLead : defaultAdminId,
      memberIds: (p.memberIds || []).filter((id) => adminIds.has(id)),
    }));
    setStored(STORAGE_KEYS.PROJECTS, updatedProjects);

    return adminUsers;
  }

  if (path === "/users/all" && method === "DELETE") {
    setStored(STORAGE_KEYS.USERS, []);
    return [];
  }

  const userDelMatch = path.match(/^\/users\/([^\/]+)$/);
  if (userDelMatch && method === "DELETE") {
    const userId = userDelMatch[1];
    const updatedUsers = users.filter((u) => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, updatedUsers);

    const remainingAdminId = updatedUsers.find((u) => u.role === "ADMIN")?.id || null;
    const updatedProjects = projects.map((p) => ({
      ...p,
      teamLead: p.teamLead === userId ? remainingAdminId : p.teamLead,
      memberIds: (p.memberIds || []).filter((id) => id !== userId),
    }));
    setStored(STORAGE_KEYS.PROJECTS, updatedProjects);

    return null;
  }

  if (path.startsWith("/users/") && path.includes("/role") && method === "PATCH") {
    const userId = path.split("/")[2];
    const urlObj = new URL("http://dummy" + path);
    const newRole = urlObj.searchParams.get("role") || body?.role;
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].role = newRole;
      setStored(STORAGE_KEYS.USERS, users);
      return users[userIndex];
    }
    throw new Error("User not found");
  }

  // PROJECTS
  if (path === "/projects" && method === "GET") {
    return projects;
  }

  if (path === "/projects" && method === "POST") {
    const newProject = {
      id: "proj-" + Date.now(),
      name: body.name || "Untitled Project",
      description: body.description || "",
      status: body.status || "PLANNING",
      priority: body.priority || "MEDIUM",
      ownerId: body.ownerId || getCurrentUser().id,
      teamLead: body.teamLead || getCurrentUser().id,
      memberIds: body.memberIds || [],
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(newProject);
    setStored(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  }

  // Project details, updates, members, tasks
  const projMatch = path.match(/^\/projects\/([^\/]+)$/);
  if (projMatch && method === "GET") {
    const projId = projMatch[1];
    const p = projects.find((x) => x.id === projId);
    if (p) return p;
    throw new Error("Project not found");
  }

  if (projMatch && method === "PUT") {
    const projId = projMatch[1];
    const index = projects.findIndex((x) => x.id === projId);
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      setStored(STORAGE_KEYS.PROJECTS, projects);
      return projects[index];
    }
    throw new Error("Project not found");
  }

  if (projMatch && method === "DELETE") {
    const projId = projMatch[1];
    const updated = projects.filter((x) => x.id !== projId);
    setStored(STORAGE_KEYS.PROJECTS, updated);
    return null;
  }

  // Project member additions/removals
  const memberMatch = path.match(/^\/projects\/([^\/]+)\/members\/([^\/]+)$/);
  if (memberMatch && method === "POST") {
    const [, projId, memberId] = memberMatch;
    const p = projects.find((x) => x.id === projId);
    if (p) {
      if (!p.memberIds.includes(memberId)) {
        p.memberIds.push(memberId);
        p.updatedAt = new Date().toISOString();
        setStored(STORAGE_KEYS.PROJECTS, projects);
      }
      return p;
    }
    throw new Error("Project not found");
  }

  if (memberMatch && method === "DELETE") {
    const [, projId, memberId] = memberMatch;
    const p = projects.find((x) => x.id === projId);
    if (p) {
      p.memberIds = p.memberIds.filter((m) => m !== memberId);
      p.updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.PROJECTS, projects);
      return p;
    }
    throw new Error("Project not found");
  }

  // TASKS
  const projectTasksMatch = path.match(/^\/tasks\/project\/([^\/]+)$/);
  if (projectTasksMatch && method === "GET") {
    const projId = projectTasksMatch[1];
    return tasks.filter((t) => t.projectId === projId);
  }

  if (path === "/tasks" && method === "POST") {
    const newTask = {
      id: "tsk-" + Date.now(),
      projectId: body.projectId,
      title: body.title,
      description: body.description || "",
      status: "TODO",
      assigneeId: body.assigneeId || null,
      subtasks: [],
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    setStored(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  const taskStatusMatch = path.match(/^\/tasks\/([^\/]+)\/status$/);
  if (taskStatusMatch && method === "PATCH") {
    const taskId = taskStatusMatch[1];
    const t = tasks.find((x) => x.id === taskId);
    if (t) {
      t.status = body.status;
      setStored(STORAGE_KEYS.TASKS, tasks);
      return t;
    }
    throw new Error("Task not found");
  }

  const taskMatch = path.match(/^\/tasks\/([^\/]+)$/);
  if (taskMatch && method === "PUT") {
    const taskId = taskMatch[1];
    const index = tasks.findIndex((x) => x.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...body };
      setStored(STORAGE_KEYS.TASKS, tasks);
      return tasks[index];
    }
    throw new Error("Task not found");
  }

  if (taskMatch && method === "DELETE") {
    const taskId = taskMatch[1];
    const updated = tasks.filter((x) => x.id !== taskId);
    setStored(STORAGE_KEYS.TASKS, updated);
    return null;
  }

  // Subtasks
  const subtasksMatch = path.match(/^\/tasks\/([^\/]+)\/subtasks$/);
  if (subtasksMatch && method === "POST") {
    const taskId = subtasksMatch[1];
    const t = tasks.find((x) => x.id === taskId);
    if (t) {
      const newSubtask = {
        id: "sub-" + Date.now(),
        title: body.title || "New Subtask",
        assigneeId: body.assigneeId || null,
        status: "TODO",
      };
      t.subtasks = t.subtasks || [];
      t.subtasks.push(newSubtask);
      setStored(STORAGE_KEYS.TASKS, tasks);
      return t;
    }
    throw new Error("Task not found");
  }

  const subtaskToggleMatch = path.match(/^\/tasks\/([^\/]+)\/subtasks\/([^\/]+)$/);
  if (subtaskToggleMatch) {
    const [, taskId, subtaskId] = subtaskToggleMatch;
    const t = tasks.find((x) => x.id === taskId);
    if (t && t.subtasks) {
      if (method === "DELETE") {
        t.subtasks = t.subtasks.filter((s) => s.id !== subtaskId);
      } else {
        const sub = t.subtasks.find((s) => s.id === subtaskId);
        if (sub) {
          sub.status = sub.status === "DONE" ? "TODO" : "DONE";
        }
      }
      setStored(STORAGE_KEYS.TASKS, tasks);
      return t;
    }
    throw new Error("Task or subtask not found");
  }

  // Default fallback
  return null;
}
