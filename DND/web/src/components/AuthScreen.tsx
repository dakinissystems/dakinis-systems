import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Mode = "login" | "register";

type Props = {
  onContinueOffline?: () => void;
};

export function AuthScreen({ onContinueOffline }: Props) {
  const { login, register } = useAuth();
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (mode === "login") {
        await login(normalizedEmail, password);
      } else {
        await register(normalizedEmail, password, displayName.trim());
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("auth.authError");
      if (msg.includes("401") || msg.toLowerCase().includes("credenciales")) {
        setError(t("auth.badCredentials"));
      } else if (msg.toLowerCase().includes("conectar") || msg.toLowerCase().includes("api")) {
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen screen--auth">
      <header className="auth-header">
        <div className="auth-header__top">
          <LanguageSwitcher />
        </div>
        <h1>{t("brand.fullName")}</h1>
        <p>
          {t("brand.tagline")}. {t("auth.subtitle")}
        </p>
      </header>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === "login" ? "auth-tab--on" : ""}`}
          onClick={() => setMode("login")}
        >
          {t("auth.loginTab")}
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === "register" ? "auth-tab--on" : ""}`}
          onClick={() => setMode("register")}
        >
          {t("auth.registerTab")}
        </button>
      </div>

      <form className="auth-form panel" onSubmit={submit}>
        {mode === "register" && (
          <label className="form-field">
            <span>{t("auth.adventurerName")}</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("auth.adventurerPlaceholder")}
              autoComplete="name"
            />
          </label>
        )}
        <label className="form-field">
          <span>{t("auth.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            enterKeyHint="next"
          />
        </label>
        <label className="form-field">
          <span>{t("auth.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="go"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-block" disabled={busy}>
          {busy ? t("auth.connecting") : mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
        </button>
      </form>

      {onContinueOffline && (
        <>
          <button type="button" className="btn btn-secondary btn-block auth-offline-btn" onClick={onContinueOffline}>
            {t("auth.continueOffline")}
          </button>
          <p className="auth-offline-hint">{t("auth.offlineHint")}</p>
        </>
      )}
    </div>
  );
}
