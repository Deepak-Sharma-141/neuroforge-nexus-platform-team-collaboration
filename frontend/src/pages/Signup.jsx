import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react";

export default function Signup() {
  const { signup, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      {/* Top Header Actions */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/landing" className="btn btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Landing</span>
        </Link>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            className="brand-icon-box"
            style={{ width: 44, height: 44, margin: "0 auto 14px", borderRadius: 12 }}
          >
            <Sparkles size={24} />
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-main)",
            }}
          >
            JOIN NEUROFORGE
          </h1>
          <p className="page-sub" style={{ fontSize: 13, marginTop: 4 }}>
            Create your engineering workspace account
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <div style={{ position: "relative" }}>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                style={{ paddingLeft: 40 }}
              />
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  color: "var(--text-dim)",
                }}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Work Email</label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 40 }}
              />
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  color: "var(--text-dim)",
                }}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 40, paddingRight: 40 }}
              />
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  color: "var(--text-dim)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 10,
                  color: "var(--text-dim)",
                  padding: 2,
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8, height: 44 }}
          >
            {loading ? (
              <span className="loading-spinner" />
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="page-sub" style={{ textAlign: "center", marginTop: 24, fontSize: 13 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
