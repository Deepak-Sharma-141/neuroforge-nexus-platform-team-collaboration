import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, initialsFor } from "../context/AuthContext";
import { useDirectory, nameFor, canManagePortfolio, isUserAssignedToProject } from "../lib/useDirectory";
import ProjectForm from "../components/ProjectForm";
import {
  Plus,
  Search,
  ArrowUpRight,
  KanbanSquare,
  AlertCircle,
  FolderOpen,
  Calendar,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { users } = useDirectory();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("Overview");

  const canManage = canManagePortfolio(user);

  async function load() {
    setError("");
    setSyncing(true);
    try {
      const data = await api.get("/projects");
      setProjects(data || []);
    } catch (err) {
      setError(err.message || "Could not load project portfolio.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(values) {
    setCreating(true);
    setError("");
    try {
      await api.post("/projects", { ...values, ownerId: user?.id });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message || "Could not create project.");
    } finally {
      setCreating(false);
    }
  }

  // Filter projects assigned to the current user (Admins see all projects)
  const userAssignedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => isUserAssignedToProject(user, p));
  }, [projects, user]);

  // Filter assigned projects by Search Query & Selected Status Filter
  const filteredProjects = useMemo(() => {
    return userAssignedProjects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        selectedStatusFilter === "ALL" || p.status === selectedStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [userAssignedProjects, searchQuery, selectedStatusFilter]);

  // Statistics calculation based on assigned projects
  const stats = useMemo(() => {
    const assignedMemberIds = new Set();
    userAssignedProjects.forEach((p) => {
      if (p.ownerId) assignedMemberIds.add(p.ownerId);
      if (p.teamLead) assignedMemberIds.add(p.teamLead);
      if (Array.isArray(p.memberIds)) {
        p.memberIds.forEach((m) => assignedMemberIds.add(m));
      }
      if (Array.isArray(p.members)) {
        p.members.forEach((m) => {
          if (typeof m === "string") assignedMemberIds.add(m);
          else if (m?.id) assignedMemberIds.add(m.id);
        });
      }
    });

    return {
      total: userAssignedProjects.length,
      active: userAssignedProjects.filter((p) => p.status === "IN_PROGRESS").length,
      critical: userAssignedProjects.filter(
        (p) => p.priority === "HIGH" || p.priority === "CRITICAL"
      ).length,
      team: canManage ? users.length : assignedMemberIds.size,
    };
  }, [userAssignedProjects, users, canManage]);

  // Dynamic time greeting
  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const navItems = [
    "Overview",
    "Projects",
    "Requirements",
    "Engineering",
    "Quality",
    "DevOps",
    "Intelligence",
  ];

  return (
    <div className="ent-dashboard">
      {/* 2. Top Navigation */}
      <header className="ent-topnav">
        <div className="ent-topnav-left">
          <Link to="/" className="ent-brand">
            <div className="ent-brand-icon">
              <Sparkles size={16} />
            </div>
            <span>NEUROFORGE // NEXUS</span>
          </Link>

          <nav className="ent-nav-links">
            {navItems.map((item) => (
              <button
                key={item}
                className={`ent-nav-link ${activeTab === item ? "active" : ""}`}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="ent-topnav-right">
          {user && (
            <div className="ent-user-profile">
              <div className="ent-avatar">{initialsFor(user.name)}</div>
              <div className="ent-user-details">
                <span className="ent-user-name">{user.name}</span>
                <span className="ent-user-role">{user.role || "MEMBER"}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 3. Dashboard Greeting Section */}
      <div className="ent-greeting-row">
        <div>
          <h1 className="ent-greeting-title">
            {greetingTime}, {user?.name ? user.name.split(" ")[0] : "Team"}.
          </h1>
          <p className="ent-greeting-sub">
            {canManage
              ? "Oversee, configure, and monitor software delivery across your organization."
              : "Projects and active engineering deliverables assigned to you."}
          </p>
        </div>

        <div className="ent-greeting-actions">
          <button
            className="ent-btn ent-btn-secondary"
            onClick={load}
            disabled={syncing}
            title="Refetch project portfolio data"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? "Syncing..." : "Sync Data"}</span>
          </button>

          {canManage && (
            <button
              className="ent-btn ent-btn-primary"
              onClick={() => setShowForm((v) => !v)}
            >
              <Plus size={15} />
              <span>{showForm ? "Cancel Creation" : "Create New Project"}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Horizontal Enterprise KPI Section */}
      <div className="ent-kpi-banner">
        <div className="ent-kpi-col">
          <span className="ent-kpi-label">TOTAL PROJECTS</span>
          <span className="ent-kpi-value">{stats.total}</span>
          <span className="ent-kpi-subtext">Assigned portfolio</span>
        </div>

        <div className="ent-kpi-col">
          <span className="ent-kpi-label">ACTIVE WORKSTREAMS</span>
          <span className="ent-kpi-value">{stats.active}</span>
          <span className="ent-kpi-subtext">In-progress status</span>
        </div>

        <div className="ent-kpi-col">
          <span className="ent-kpi-label">HIGH PRIORITY</span>
          <span className="ent-kpi-value">{stats.critical}</span>
          <span className="ent-kpi-subtext">Critical & high priority</span>
        </div>

        <div className="ent-kpi-col">
          <span className="ent-kpi-label">WORKSPACE TEAM</span>
          <span className="ent-kpi-value">{stats.team}</span>
          <span className="ent-kpi-subtext">Active collaborators</span>
        </div>
      </div>

      {/* Inline Creation Form */}
      {showForm && canManage && (
        <ProjectForm
          onSubmit={handleCreate}
          submitting={creating}
          submitLabel="Create Project"
          showMembers
        />
      )}

      {/* 5 & 6. Projects Section & Search/Filter Toolbar */}
      <div className="ent-projects-header">
        <div className="ent-section-title-group">
          <h2 className="ent-section-title">Projects</h2>
          {filteredProjects.length > 0 && (
            <span className="ent-count-badge">{filteredProjects.length}</span>
          )}
        </div>

        <div className="ent-toolbar-controls">
          <div className="ent-search-wrapper">
            <Search size={15} className="ent-search-icon" />
            <input
              type="text"
              className="ent-search-input"
              placeholder="Search projects by name or keyword…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="ent-filter-select"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PLANNED">Planned</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {projects === null && !error && (
        <div className="empty-state">
          <span className="loading-spinner" />
          <p>Loading project portfolio…</p>
        </div>
      )}

      {/* Empty State */}
      {projects && filteredProjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <FolderOpen size={28} />
          </div>
          <h3 className="empty-title">No projects found</h3>
          <p className="empty-description">
            {searchQuery || selectedStatusFilter !== "ALL"
              ? "No projects matched your search criteria. Try adjusting your filters."
              : canManage
              ? "No projects created yet. Click 'Create New Project' above to get started."
              : "You are not enrolled in any projects currently."}
          </p>
        </div>
      )}

      {/* Workspace Panel Project Cards Grid */}
      {filteredProjects.length > 0 && (
        <div className="ent-project-grid">
          {filteredProjects.map((p) => (
            <div key={p.id} className="ent-project-card">
              <div>
                <div className="ent-card-header">
                  <div className="ent-card-title-row">
                    <span
                      className={`dot dot-${p.priority || "MEDIUM"}`}
                      title={`Priority: ${p.priority || "MEDIUM"}`}
                    />
                    <h3 className="ent-card-name">{p.name}</h3>
                  </div>

                  {/* Subtle Pills for status */}
                  <span className={`ent-pill ent-pill-${p.status || "PLANNED"}`}>
                    {(p.status || "PLANNED").replace("_", " ")}
                  </span>
                </div>

                <p className="ent-card-desc">
                  {p.description || "No description provided for this project."}
                </p>
              </div>

              <div className="ent-card-footer">
                <div className="ent-card-meta">
                  <span>
                    Lead:{" "}
                    <span className="ent-lead-name">
                      {p.teamLead ? nameFor(users, p.teamLead) : "Unassigned"}
                    </span>
                  </span>

                  {p.endDate && (
                    <span className="ent-card-date">
                      <Calendar size={13} />
                      {p.endDate}
                    </span>
                  )}
                </div>

                <div className="ent-card-actions">
                  <Link
                    to={`/projects/${p.id}`}
                    className="ent-btn ent-btn-secondary card-btn"
                  >
                    <span>Overview</span>
                    <ArrowUpRight size={14} />
                  </Link>
                  <Link
                    to={`/projects/${p.id}/board`}
                    className="ent-btn ent-btn-primary card-btn"
                  >
                    <KanbanSquare size={14} />
                    <span>Board</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}