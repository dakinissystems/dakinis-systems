import { useState } from "react";
import { tabletopApi } from "../api/client";
import { useLocale } from "../context/LocaleContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = {
  onBack: () => void;
};

export function ForgotPasswordScreen({ onBack }: Props) {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await tabletopApi.passwordResetStart(email.trim().toLowerCase());
      if (data.warning === "email_send_failed_dev" && data.dev_reset_url) {
        console.info("[dev] password reset link:", data.dev_reset_url);
      }
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email_not_configured")) {
        setError(t("auth.emailNotConfigured"));
      } else if (msg.includes("email_send_failed")) {
        setError(t("auth.emailSendFailed"));
      } else {
        setError(t("auth.authError"));
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
        <p>{t("auth.forgotPassword")}</p>
      </header>

      <div className="auth-form panel">
        {sent ? (
          <>
            <p className="muted">{t("auth.resetSent")}</p>
            <button type="button" className="btn btn-block" onClick={onBack}>
              {t("auth.backToLogin")}
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <label className="form-field">
              <span>{t("auth.email")}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoCapitalize="none"
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-block" disabled={busy}>
              {busy ? t("auth.connecting") : t("auth.sendResetLink")}
            </button>
            <button type="button" className="btn btn-secondary btn-block auth-offline-btn" onClick={onBack}>
              {t("auth.backToLogin")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
