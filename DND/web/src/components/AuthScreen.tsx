import { useState } from "react";
import { tabletopApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { buildTabletopGoogleLoginUrl } from "../lib/platform-auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PasswordInput } from "./PasswordInput";

type Mode = "login" | "register";

type Props = {
  onContinueOffline?: () => void;
  onForgotPassword?: () => void;
};

export function AuthScreen({ onContinueOffline, onForgotPassword }: Props) {
  const { login } = useAuth();
  const { t } = useLocale();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [registerSent, setRegisterSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (mode === "login") {
        await login(normalizedEmail, password);
      } else {
        const data = await tabletopApi.registerStart(normalizedEmail);
        if (data.warning === "email_send_failed_dev" && data.dev_verify_url) {
          console.info("[dev] registration link:", data.dev_verify_url);
        }
        setRegisterSent(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("auth.authError");
      if (msg.includes("401") || msg.toLowerCase().includes("credenciales")) {
        setError(t("auth.badCredentials"));
      } else if (msg.includes("email_not_configured")) {
        setError(t("auth.emailNotConfigured"));
      } else if (msg.includes("email_send_failed")) {
        setError(t("auth.emailSendFailed"));
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
          {t("brand.tagline")}. {mode === "register" && !registerSent ? t("auth.registerEmailLead") : t("auth.subtitle")}
        </p>
      </header>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === "login" ? "auth-tab--on" : ""}`}
          onClick={() => {
            setMode("login");
            setRegisterSent(false);
            setError("");
          }}
        >
          {t("auth.loginTab")}
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === "register" ? "auth-tab--on" : ""}`}
          onClick={() => {
            setMode("register");
            setRegisterSent(false);
            setError("");
          }}
        >
          {t("auth.registerTab")}
        </button>
      </div>

      {mode === "register" && registerSent ? (
        <div className="auth-form panel">
          <p className="muted">{t("auth.registerSent")}</p>
          <button
            type="button"
            className="btn btn-block"
            onClick={() => {
              setRegisterSent(false);
              setMode("login");
            }}
          >
            {t("auth.backToLogin")}
          </button>
        </div>
      ) : (
        <form className="auth-form panel" onSubmit={submit}>
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
              enterKeyHint={mode === "login" ? "next" : "go"}
            />
          </label>
          {mode === "login" && (
            <>
              <PasswordInput
                label={t("auth.password")}
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                autoComplete="current-password"
                id="auth-password"
              />
              {onForgotPassword && (
                <button type="button" className="auth-forgot-link" onClick={onForgotPassword}>
                  {t("auth.forgotPassword")}
                </button>
              )}
            </>
          )}
          {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-block" disabled={busy}>
          {busy
            ? t("auth.connecting")
            : mode === "login"
              ? t("auth.signIn")
              : t("auth.sendVerificationLink")}
        </button>
        {mode === "login" && (
          <button
            type="button"
            className="btn btn-secondary btn-block auth-offline-btn"
            onClick={() => {
              window.location.href = buildTabletopGoogleLoginUrl();
            }}
          >
            {t("auth.signInWithGoogle")}
          </button>
        )}
      </form>
      )}

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
