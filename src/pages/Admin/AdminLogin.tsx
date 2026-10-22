import { useState } from "react";
import { useNavigate } from "react-router";
import Logo from "../../components/Logo";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const responseBody = await response.text();
      let result: { error?: string; authenticated?: boolean } = {};
      if (responseBody) {
        try {
          result = JSON.parse(responseBody) as { error?: string; authenticated?: boolean };
        } catch {
          throw new Error(`O servidor retornou uma resposta inválida (HTTP ${response.status}). Tente novamente.`);
        }
      }
      if (!response.ok) {
        throw new Error(result.error || `Não foi possível entrar no painel (HTTP ${response.status}).`);
      }
      if (result.authenticated !== true) {
        throw new Error("O servidor não confirmou o acesso ao painel. Tente novamente.");
      }
      navigate("/admin/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Não foi possível entrar no painel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0a0a" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo size="lg" linkTo="" />
          <p className="mt-4 text-sm" style={{ color: "#555", fontFamily: "Montserrat, sans-serif" }}>
            ÁREA ADMINISTRATIVA
          </p>
        </div>

        <form onSubmit={handleLogin} autoComplete="off" className="p-8 space-y-5" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "4px" }}>
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>
              E-MAIL
            </label>
            <input
              type="email"
              name="admin-login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              placeholder="Digite seu e-mail"
              required
              className="w-full px-4 py-3 text-sm outline-none"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px" }}
              onFocus={(e) => { e.target.style.borderColor = "#ccdd8f"; }}
              onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 tracking-wider" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>
              SENHA
            </label>
            <input
              type="password"
              name="admin-login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Digite sua senha"
              required
              className="w-full px-4 py-3 text-sm outline-none"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", borderRadius: "4px" }}
              onFocus={(e) => { e.target.style.borderColor = "#ccdd8f"; }}
              onBlur={(e) => { e.target.style.borderColor = "#2a2a2a"; }}
            />
          </div>
          {error && (
            <p className="text-sm text-center py-2 px-3" style={{ background: "#1a0a0a", color: "#e30613", border: "1px solid #330a0a", borderRadius: "4px" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-black tracking-wider transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#ccdd8f", color: "#000", borderRadius: "4px", fontFamily: "Montserrat, sans-serif" }}
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

      </div>
    </div>
  );
}
