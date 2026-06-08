import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../feature/store/authStore";
import { ROUTES } from "../constants/routes";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const success = await login(credentials.email, credentials.password);
      if (success) {
        const { user } = useAuthStore.getState();
        if (from) { navigate(from, { replace: true }); return; }
        if (user?.role === "CLIENT") {
          const hasConsented = localStorage.getItem(`consented_${user.id}`);
          navigate(hasConsented ? ROUTES.CLIENT_DASHBOARD : "/client/consent", { replace: true });
        } else {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputWrap: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    background: "#f0f4fb", border: "1.5px solid #dde4f0",
    borderRadius: 10, padding: "0 14px", height: 48,
  };
  const inputField: React.CSSProperties = {
    flex: 1, border: "none", background: "transparent",
    fontFamily: "'Manrope', sans-serif", fontSize: 14,
    color: "#111827", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 10, letterSpacing: "1.8px",
    textTransform: "uppercase", fontWeight: 700,
    color: "#6b7280", marginBottom: 7,
    fontFamily: "'Manrope', sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Manrope', sans-serif" }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          width: "55%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#fff",
          padding: "36px 48px",
        }}
      >
        {/* ── Layer 1: the actual logo as a full-bleed background photo ── */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }} />

        {/* ── Layer 2: dark navy colour overlay — like the blue tint over the keys photo ── */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(10,20,55,0.93) 0%, rgba(15,30,66,0.88) 60%, rgba(8,18,48,0.95) 100%)",
        }} />

        {/* ── Layer 3: subtle dot-grid texture on top ── */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.03) 39px,rgba(255,255,255,0.03) 40px)," +
            "repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.03) 39px,rgba(255,255,255,0.03) 40px)",
        }} />

        {/* ── Layer 4: bottom-left blue glow ── */}
        <div style={{
          position: "absolute", bottom: "-40px", left: "-80px",
          width: 360, height: 360, pointerEvents: "none",
          background: "radial-gradient(circle, rgba(55,138,221,0.25) 0%, transparent 65%)",
        }} />

        {/* ── All content sits above the layers ── */}

        {/* top — logo row */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", backdropFilter: "blur(4px)",
            }}>
              <img
                src="/image.png"
                alt="ISCO"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div>
              <span style={{ display: "block", fontSize: 10, letterSpacing: "2px", opacity: 0.6, textTransform: "uppercase", fontWeight: 500 }}>
                ISCO Technologies
              </span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>
                ISCO-TECH VULNERABILITY ASSESSMENT PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* middle — headline + bullets */}
        <div style={{
          position: "relative", zIndex: 1,
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "12px 0",
        }}>
          {/* badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 24,
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20,
            padding: "5px 14px", fontSize: 11, letterSpacing: "1.5px",
            textTransform: "uppercase", color: "rgba(255,255,255,0.75)",
            fontWeight: 600, width: "fit-content",
            backdropFilter: "blur(4px)",
            background: "rgba(255,255,255,0.05)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#4ec9a6", flexShrink: 0, display: "inline-block",
            }} />
            Secure workspace
          </div>

          <h1 style={{ fontSize: 34, lineHeight: 1.2, fontWeight: 800, marginBottom: 18 }}>
            Your{" "}
            <em style={{ fontStyle: "normal", color: "#5aaee8" }}>vulnerabilities</em>,<br />
            findings and reports,<br />
            all in one place.
          </h1>

          <p style={{
            fontSize: 13.5, color: "rgba(255,255,255,0.62)",
            lineHeight: 1.75, maxWidth: 320, marginBottom: 28,
          }}>
            Sign in to manage assessments, track findings, and collaborate from a single secure portal.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              "Real-time visibility across all assessments",
              "Unified findings, reports, and client management",
              "CVSS scoring and severity tracking",
            ].map((item) => (
              <li key={item} style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 13.5, color: "rgba(255,255,255,0.78)",
              }}>
                <span style={{
                  width: 18, height: 18, flexShrink: 0,
                  background: "rgba(78,201,166,0.2)",
                  border: "1px solid rgba(78,201,166,0.4)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <polyline points="2,5 4,7 8,3" stroke="#4ec9a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* bottom — footer */}
        <p style={{ position: "relative", zIndex: 1, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          © 2026 ISCO Technologies. All rights reserved.
        </p>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div style={{
        flex: 1, background: "#eef1f6",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "40px 24px",
      }}>
        {/* centred floating card */}
        <div style={{
          flex: 1, display: "flex",
          alignItems: "center", justifyContent: "center", width: "100%",
        }}>
          <div style={{
            background: "#ffffff", borderRadius: 16,
            padding: "44px 40px", width: "100%", maxWidth: 420,
            boxShadow: "0 4px 32px rgba(15,30,66,0.10), 0 1px 6px rgba(15,30,66,0.06)",
          }}>
            <h2 style={{
              fontSize: 26, fontWeight: 800, color: "#111827",
              marginBottom: 6, lineHeight: 1.25,
              fontFamily: "'Manrope', sans-serif",
            }}>
              Sign in to your workspace
            </h2>
            <p style={{
              fontSize: 14, color: "#6b7280",
              marginBottom: 30, fontFamily: "'Manrope', sans-serif",
            }}>
              Enter your credentials to continue.
            </p>

            {error && (
              <div style={{
                marginBottom: 16, borderRadius: 8, padding: "12px 16px",
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#dc2626", fontSize: 13.5,
                fontFamily: "'Manrope', sans-serif",
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Email */}
              <div>
                <label style={labelStyle}>
                  Email
                </label>
                <div style={inputWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8ca0be" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="admin@iscotechnologies.rw"
                    style={inputField}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  Password{""}
                </label>
                <div style={inputWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8ca0be" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    style={inputField}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#8ca0be", lineHeight: 1 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%", height: 52,
                  background: isLoading ? "#3a5a9b" : "#0f1e42",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 16, fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  marginTop: 4, letterSpacing: "0.3px",
                  transition: "background 0.15s",
                  opacity: isLoading ? 0.75 : 1,
                }}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", fontFamily: "'Manrope', sans-serif" }}>
          © 2026 ISCO Technologies
        </p>
      </div>

    </div>
  );
};

export default Login;