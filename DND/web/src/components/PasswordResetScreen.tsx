import { useEffect, useMemo, useState } from "react";
import { tabletopApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PasswordInput } from "./PasswordInput";

function readTokenFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const token = String(params.get("token") || "").trim();
  return /^[a-f0-9]{64}$/i.test(token) ? token : "";
}

export function PasswordResetScreen() {
  const { login } = useAuth();
  const { t } = useLocale();
  const token = useMemo(() => readTokenFromLocation(), []);
  const [emailMasked, setEmailMasked] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setLoadError(t("auth.invalidToken"));
        setPendingLoading(false);
        return;
      }
      try {
        const data = await tabletopApi.passwordResetPending(token);
        if (!cancelled) setEmailMasked(data.email_masked || "");
      } catch {
        if (!cancelled) setLoadError(t("auth.invalidToken"));
      } finally {
        if (!cancelled) setPendingLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      const data = await tabletopApi.passwordResetComplete(token, password);
      await login(data.user.email, password);
      setDone(true);
      window.history.replaceState({}, "", "/");
    } catch {
      setError(t("auth.resetFailed"));
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
        <p>{t("auth.chooseNewPassword")}</p>
      </header>

      <form className="auth-form panel" onSubmit={submit}>
        {pendingLoading ? (
          <p className="muted">{t("app.loading")}</p>
        ) : loadError ? (
          <p className="form-error">{loadError}</p>
        ) : done ? (
          <p className="muted">{t("auth.signIn")}</p>
        ) : (
          <>
            {emailMasked && (
              <p className="muted">{t("auth.resetForEmail", { email: emailMasked })}</p>
            )}
            <PasswordInput
              label={t("auth.newPassword")}
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              autoComplete="new-password"
              id="reset-password"
            />
            <PasswordInput
              label={t("auth.confirmPassword")}
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              required
              minLength={6}
              autoComplete="new-password"
              id="reset-password-confirm"
            />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-block" disabled={busy}>
              {busy ? t("auth.connecting") : t("auth.savePassword")}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
