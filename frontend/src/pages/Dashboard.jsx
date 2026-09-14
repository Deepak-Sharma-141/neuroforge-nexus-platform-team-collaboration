import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useDirectory, nameFor, canManagePortfolio, isUserAssignedToProject } from "../lib/useDirectory";
import ProjectForm from "../components/ProjectForm";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Users,
  Activity,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  KanbanSquare,
  AlertCircle,
  FolderOpen,
  Calendar,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { users } = useDirectory();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  const canManage = canManagePortfolio(user);

  async function load() {
    setError("");
    try {
      const data = await api.get("/projects");
      setProjects(data || []);
    } catch (err) {
      setError(err.message || "Could not load project portfolio.");
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

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-title-group">
          <h1 className="page-title">
            <FolderKanban size={26} className="title-icon" />
            <span>Projects & Engineering Workspaces</span>
          </h1>
          <p className="page-sub">
            {canManage
              ? "Oversee, configure, and monitor software delivery across your organization."
              : "Projects and active engineering deliverables assigned to you."}
          </p>
        </div>

        {canManage && (
          <button
            className="btn btn-primary create-project-btn"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus size={18} />
            <span>{showForm ? "Cancel Creation" : "Create New Project"}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Projects</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-icon stat-icon-primary">
            <FolderKanban size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Workstreams</span>
            <span className="stat-value stat-value-purple">{stats.active}</span>
          </div>
          <div className="stat-icon stat-icon-purple">
            <Activity size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">High Priority Items</span>
            <span className="stat-value stat-value-amber">{stats.critical}</span>
          </div>
          <div className="stat-icon stat-icon-amber">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Workspace Team</span>
            <span className="stat-value stat-value-cyan">{stats.team}</span>
          </div>
          <div className="stat-icon stat-icon-cyan">
            <Users size={22} />
          </div>
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

      {/* Search and Filter Section */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by name or keywords…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={16} className="filter-icon" />
          <select
            className="filter-select"
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

      {/* Project Cards Grid */}
      {filteredProjects.length > 0 && (
        <div className="project-grid">
          {filteredProjects.map((p) => (
            <div key={p.id} className="project-card">
              <div className="project-card-body">
                <div className="project-card-header">
                  <div className="project-title-row">
                    <span
                      className={`dot dot-${p.priority || "MEDIUM"}`}
                      title={`Priority: ${p.priority || "MEDIUM"}`}
                    />
                    <h3 className="project-name">{p.name}</h3>
                  </div>
                  <span className={`tag tag-${p.status || "PLANNED"}`}>
                    {p.status || "PLANNED"}
                  </span>
                </div>

                <p className="project-desc">
                  {p.description || "No description provided for this project."}
                </p>
              </div>

              <div className="project-card-footer-group">
                <div className="project-meta-info">
                  <span className="project-lead">
                    Lead:{" "}
                    <strong className="lead-name">
                      {p.teamLead ? nameFor(users, p.teamLead) : "Unassigned"}
                    </strong>
                  </span>
                  {p.endDate && (
                    <span className="project-date">
                      <Calendar size={13} />
                      {p.endDate}
                    </span>
                  )}
                </div>

                <div className="project-card-actions">
                  <Link
                    to={`/projects/${p.id}`}
                    className="btn btn-sm btn-secondary card-btn"
                  >
                    <span>Overview</span>
                    <ArrowUpRight size={14} />
                  </Link>
                  <Link
                    to={`/projects/${p.id}/board`}
                    className="btn btn-sm btn-primary card-btn"
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
