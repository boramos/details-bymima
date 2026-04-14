"use client";

import { useState, useEffect, useCallback } from "react";
import SecurityEditModal from "../SecurityEditModal";

type SecurityTabProps = {
  sessionUser: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  initialUser: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    twoFactorEnabled?: boolean;
    twoFactorPhone?: string | null;
  };
  locale: string;
};

type EditingField = "name" | "email" | "phone" | "password" | "twoFactor" | null;

export default function SecurityTab({ sessionUser, initialUser, locale }: SecurityTabProps) {
  const isEs = locale === "es";

  const [activeModal, setActiveModal] = useState<EditingField>(null);

  const [currentName, setCurrentName] = useState(initialUser.name ?? "");
  const [currentEmail, setCurrentEmail] = useState(sessionUser.email ?? "");
  const [currentPhone, setCurrentPhone] = useState(initialUser.phone ?? "");
  const [currentTwoFactorEnabled, setCurrentTwoFactorEnabled] = useState(initialUser.twoFactorEnabled ?? false);
  const [currentTwoFactorPhone, setCurrentTwoFactorPhone] = useState(initialUser.twoFactorPhone ?? "");

  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftCurrentPassword, setDraftCurrentPassword] = useState("");
  const [draftNewPassword, setDraftNewPassword] = useState("");
  const [draftConfirmPassword, setDraftConfirmPassword] = useState("");
  const [draftTwoFactorPhone, setDraftTwoFactorPhone] = useState("");
  const [draftOtp, setDraftOtp] = useState("");

  const [twoFactorStep, setTwoFactorStep] = useState<"phone" | "otp">("phone");
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);
  const [changingPhone, setChangingPhone] = useState(false);

  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const resetDrafts = useCallback(() => {
    setDraftName(currentName);
    setDraftEmail("");
    setDraftPhone(currentPhone);
    setDraftCurrentPassword("");
    setDraftNewPassword("");
    setDraftConfirmPassword("");
    setDraftTwoFactorPhone(currentTwoFactorPhone);
    setDraftOtp("");
    setTwoFactorStep("phone");
    setSandboxCode(null);
    setChangingPhone(false);
  }, [currentName, currentPhone, currentTwoFactorPhone]);

  useEffect(() => {
    if (activeModal) {
      resetDrafts();
      setNameMsg(null);
      setEmailMsg(null);
      setPhoneMsg(null);
      setPasswordMsg(null);
      setTwoFactorMsg(null);
    }
  }, [activeModal, resetDrafts]);

  const handleEditClick = (field: EditingField) => {
    setActiveModal(field);
  };

  const handleClose = useCallback(() => {
    setActiveModal(null);
  }, []);

  async function handleNameSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setNameLoading(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      setCurrentName(draftName);
      setNameMsg({ type: "success", text: isEs ? "Nombre actualizado" : "Name updated" });
      setTimeout(() => setActiveModal(null), 1200);
    } catch (err: unknown) {
      setNameMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setNameLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: draftEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      setCurrentEmail(draftEmail);
      setEmailMsg({ type: "success", text: isEs ? "Correo actualizado" : "Email updated" });
      setTimeout(() => setActiveModal(null), 1200);
    } catch (err: unknown) {
      setEmailMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePhoneSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setPhoneLoading(true);
    setPhoneMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: draftPhone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      setCurrentPhone(draftPhone);
      setPhoneMsg({ type: "success", text: isEs ? "Teléfono actualizado" : "Phone updated" });
      setTimeout(() => setActiveModal(null), 1200);
    } catch (err: unknown) {
      setPhoneMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setPhoneLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);

    if (draftNewPassword.length < 8) {
      setPasswordMsg({ type: "error", text: isEs ? "Mínimo 8 caracteres" : "Minimum 8 characters" });
      setPasswordLoading(false);
      return;
    }
    if (draftNewPassword !== draftConfirmPassword) {
      setPasswordMsg({ type: "error", text: isEs ? "Las contraseñas no coinciden" : "Passwords do not match" });
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: draftCurrentPassword, newPassword: draftNewPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      setPasswordMsg({ type: "success", text: isEs ? "Contraseña actualizada" : "Password updated" });
      setDraftCurrentPassword("");
      setDraftNewPassword("");
      setDraftConfirmPassword("");
      setTimeout(() => setActiveModal(null), 1200);
    } catch (err: unknown) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSendOtp(e: React.SyntheticEvent) {
    e.preventDefault();
    setTwoFactorLoading(true);
    setTwoFactorMsg(null);
    setSandboxCode(null);
    try {
      const res = await fetch("/api/user/2fa/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: draftTwoFactorPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error");
      if (data.sandboxCode) setSandboxCode(String(data.sandboxCode));
      setTwoFactorStep("otp");
      setTwoFactorMsg({ type: "success", text: isEs ? "Código enviado" : "Code sent" });
    } catch (err: unknown) {
      setTwoFactorMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.SyntheticEvent) {
    e.preventDefault();
    setTwoFactorLoading(true);
    setTwoFactorMsg(null);
    try {
      const res = await fetch("/api/user/2fa/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: draftTwoFactorPhone, code: draftOtp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      setCurrentTwoFactorEnabled(true);
      setCurrentTwoFactorPhone(draftTwoFactorPhone);
      if (!currentPhone) setCurrentPhone(draftTwoFactorPhone);
      setTwoFactorMsg({ type: "success", text: isEs ? "Configuración actualizada" : "Settings updated" });
      setTimeout(() => setActiveModal(null), 1200);
    } catch (err: unknown) {
      setTwoFactorMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function handleDisableTwoFactor() {
    setTwoFactorLoading(true);
    setTwoFactorMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactorEnabled: false }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      setCurrentTwoFactorEnabled(false);
      setTwoFactorMsg({ type: "success", text: isEs ? "Desactivada correctamente" : "Successfully disabled" });
      setTimeout(() => setActiveModal(null), 1200);
    } catch (err: unknown) {
      setTwoFactorMsg({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setTwoFactorLoading(false);
    }
  }

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-[var(--color-primary-pale)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--color-dark)] text-sm";
  const saveBtnClasses = "w-full py-3 rounded-full bg-[var(--color-dark)] text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition-colors";
  const editBtnClasses = "text-sm font-semibold text-[var(--color-primary)] hover:underline";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-6">
        {isEs ? "Inicio de Sesión y Seguridad" : "Login & Security"}
      </h2>

      <div className="flex flex-col border-t border-[var(--color-primary-pale)]">
        
        <div className="py-6 flex flex-col border-b border-[var(--color-primary-pale)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wider font-semibold">
                {isEs ? "Nombre" : "Name"}
              </span>
              <span className="text-[var(--color-dark)] font-bold">{currentName || "—"}</span>
            </div>
            <button type="button" onClick={() => handleEditClick("name")} className={editBtnClasses}>
              {isEs ? "Editar" : "Edit"}
            </button>
          </div>
        </div>

        <div className="py-6 flex flex-col border-b border-[var(--color-primary-pale)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wider font-semibold">
                {isEs ? "Correo electrónico" : "Email address"}
              </span>
              <span className="text-[var(--color-dark)] font-bold">{currentEmail || "—"}</span>
            </div>
            <button type="button" onClick={() => handleEditClick("email")} className={editBtnClasses}>
              {isEs ? "Editar" : "Edit"}
            </button>
          </div>
        </div>

        <div className="py-6 flex flex-col border-b border-[var(--color-primary-pale)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wider font-semibold">
                {isEs ? "Teléfono" : "Phone"}
              </span>
              <span className="text-[var(--color-dark)] font-bold">
                {currentPhone || (isEs ? "No registrado" : "Not registered")}
              </span>
            </div>
            <button type="button" onClick={() => handleEditClick("phone")} className={editBtnClasses}>
              {isEs ? "Editar" : "Edit"}
            </button>
          </div>
        </div>

        <div className="py-6 flex flex-col border-b border-[var(--color-primary-pale)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wider font-semibold">
                {isEs ? "Contraseña" : "Password"}
              </span>
              <span className="text-[var(--color-dark)] font-bold tracking-widest">••••••••</span>
            </div>
            <button type="button" onClick={() => handleEditClick("password")} className={editBtnClasses}>
              {isEs ? "Cambiar" : "Change"}
            </button>
          </div>
        </div>

        <div className="py-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wider font-semibold">
                {isEs ? "Verificación de 2 pasos" : "2-Step Verification"}
              </span>
              <div className="mt-1 flex items-center gap-2">
                {currentTwoFactorEnabled ? (
                  <>
                    <span className="w-fit px-2 py-1 rounded text-xs font-bold bg-[var(--color-primary-pale)] text-[var(--color-primary)]">
                      {isEs ? "Activada" : "Enabled"}
                    </span>
                    {currentTwoFactorPhone && (
                      <span className="text-xs text-[var(--color-muted)] font-medium">SMS · {currentTwoFactorPhone}</span>
                    )}
                  </>
                ) : (
                  <span className="w-fit px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500">
                    {isEs ? "Desactivada" : "Disabled"}
                  </span>
                )}
              </div>
            </div>
            <button type="button" onClick={() => handleEditClick("twoFactor")} className={editBtnClasses}>
              {isEs ? "Administrar" : "Manage"}
            </button>
          </div>
        </div>

      </div>

      <SecurityEditModal isOpen={activeModal === "name"} onClose={handleClose} title={isEs ? "Editar nombre" : "Edit name"}>
        <form onSubmit={handleNameSubmit} className="space-y-5">
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className={inputClasses}
            placeholder={isEs ? "Nombre" : "Name"}
            required
            autoFocus
          />
          {nameMsg && (
            <div className={`text-sm font-medium ${nameMsg.type === "success" ? "text-[var(--color-primary)]" : "text-red-600"}`}>
              {nameMsg.text}
            </div>
          )}
          <button type="submit" disabled={nameLoading} className={saveBtnClasses}>
            {nameLoading ? "..." : (isEs ? "Guardar" : "Save")}
          </button>
        </form>
      </SecurityEditModal>

      <SecurityEditModal isOpen={activeModal === "email"} onClose={handleClose} title={isEs ? "Cambiar correo" : "Change email"}>
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <input
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            className={inputClasses}
            placeholder={isEs ? "Nuevo correo" : "New email"}
            required
            autoFocus
          />
          {emailMsg && (
            <div className={`text-sm font-medium ${emailMsg.type === "success" ? "text-[var(--color-primary)]" : "text-red-600"}`}>
              {emailMsg.text}
            </div>
          )}
          <button type="submit" disabled={emailLoading} className={saveBtnClasses}>
            {emailLoading ? "..." : (isEs ? "Guardar" : "Save")}
          </button>
        </form>
      </SecurityEditModal>

      <SecurityEditModal isOpen={activeModal === "phone"} onClose={handleClose} title={isEs ? "Editar teléfono" : "Edit phone"}>
        <form onSubmit={handlePhoneSubmit} className="space-y-5">
          <input
            type="tel"
            value={draftPhone}
            onChange={(e) => setDraftPhone(e.target.value.replace(/[^\d\s+\-()]/g, ""))}
            className={inputClasses}
            placeholder="+1 (555) 000-0000"
            required
            autoFocus
          />
          {phoneMsg && (
            <div className={`text-sm font-medium ${phoneMsg.type === "success" ? "text-[var(--color-primary)]" : "text-red-600"}`}>
              {phoneMsg.text}
            </div>
          )}
          <button type="submit" disabled={phoneLoading} className={saveBtnClasses}>
            {phoneLoading ? "..." : (isEs ? "Guardar" : "Save")}
          </button>
        </form>
      </SecurityEditModal>

      <SecurityEditModal isOpen={activeModal === "password"} onClose={handleClose} title={isEs ? "Cambiar contraseña" : "Change password"}>
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <input
            type="password"
            value={draftCurrentPassword}
            onChange={(e) => setDraftCurrentPassword(e.target.value)}
            className={inputClasses}
            placeholder={isEs ? "Contraseña actual" : "Current password"}
            required
            autoFocus
          />
          <input
            type="password"
            value={draftNewPassword}
            onChange={(e) => setDraftNewPassword(e.target.value)}
            className={inputClasses}
            placeholder={isEs ? "Nueva contraseña" : "New password"}
            required
            minLength={8}
          />
          <input
            type="password"
            value={draftConfirmPassword}
            onChange={(e) => setDraftConfirmPassword(e.target.value)}
            className={inputClasses}
            placeholder={isEs ? "Repetir nueva contraseña" : "Repeat new password"}
            required
            minLength={8}
          />
          {passwordMsg && (
            <div className={`text-sm font-medium ${passwordMsg.type === "success" ? "text-[var(--color-primary)]" : "text-red-600"}`}>
              {passwordMsg.text}
            </div>
          )}
          <button type="submit" disabled={passwordLoading} className={saveBtnClasses}>
            {passwordLoading ? "..." : (isEs ? "Guardar" : "Save")}
          </button>
        </form>
      </SecurityEditModal>

      <SecurityEditModal isOpen={activeModal === "twoFactor"} onClose={handleClose} title={isEs ? "Verificación de 2 pasos" : "2-Step Verification"}>
        <div className="space-y-5">
          <div className={`mb-5 flex items-center ${currentTwoFactorEnabled ? "justify-between" : "justify-center"}`}>
            {currentTwoFactorEnabled ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50/80 border border-emerald-100/80">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                    {isEs ? "Activada" : "Enabled"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDisableTwoFactor}
                  disabled={twoFactorLoading}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-100 bg-red-50/80 text-xs font-semibold uppercase tracking-wide text-red-600 transition-colors hover:border-red-200 hover:bg-red-100/70 disabled:opacity-50"
                >
                  <span className="inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  {twoFactorLoading ? "..." : (isEs ? "Deshabilitar" : "Disable")}
                </button>
              </>
            ) : (
              <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">
                {isEs ? "Desactivada" : "Disabled"}
              </span>
            )}
          </div>

          {currentTwoFactorEnabled ? (
            <div className="space-y-5">
              {!changingPhone ? (
                <>
                  <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white border border-[var(--color-primary-pale)] shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-cream)]">
                      <span className="text-lg">📱</span>
                    </div>
                    <div className="flex items-center justify-between flex-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest mb-0.5">
                          {isEs ? "Método actual" : "Current method"}
                        </span>
                        <p className="text-sm font-semibold text-[var(--color-dark)]">
                          SMS{currentTwoFactorPhone ? ` · ${currentTwoFactorPhone}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setChangingPhone(true);
                          setTwoFactorStep("phone");
                          setDraftTwoFactorPhone(currentTwoFactorPhone);
                          setTwoFactorMsg(null);
                        }}
                        className="text-xs font-semibold text-[var(--color-dark)] bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 rounded-md transition-colors ml-3 shadow-sm"
                      >
                        {isEs ? "Cambiar" : "Change"}
                      </button>
                    </div>
                  </div>
                  {twoFactorMsg && (
                    <div className={`text-sm font-medium text-center ${twoFactorMsg.type === "success" ? "text-[var(--color-primary)]" : "text-red-600"}`}>
                      {twoFactorMsg.text}
                    </div>
                  )}
                </>
              ) : (
                <form
                  onSubmit={twoFactorStep === "phone" ? handleSendOtp : handleVerifyOtp}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-primary-pale)]">
                    <span className="text-lg">📱</span>
                    <div>
                      <p className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">
                        {isEs ? "Método preferido" : "Preferred method"}
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-dark)]">SMS</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="tel"
                      value={draftTwoFactorPhone}
                      onChange={(e) => setDraftTwoFactorPhone(e.target.value.replace(/[^\d\s+\-()]/g, ""))}
                      className={`${inputClasses} ${twoFactorStep === "otp" ? "opacity-60 bg-gray-50" : ""}`}
                      placeholder={isEs ? "Nuevo número de teléfono" : "New phone number"}
                      readOnly={twoFactorStep === "otp"}
                      required
                    />
                  </div>
                  {twoFactorStep === "otp" && sandboxCode && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <span className="text-xl">🧪</span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                          {isEs ? "Modo sandbox — tu código es:" : "Sandbox mode — your code is:"}
                        </p>
                        <p className="mt-0.5 font-mono text-2xl font-bold tracking-[0.25em] text-amber-900">{sandboxCode}</p>
                      </div>
                    </div>
                  )}
                  {twoFactorStep === "otp" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={draftOtp}
                        onChange={(e) => setDraftOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className={inputClasses}
                        placeholder={isEs ? "Código de verificación" : "Verification code"}
                        required
                        maxLength={6}
                      />
                    </div>
                  )}
                  {twoFactorMsg && (
                    <div className={`text-sm font-medium ${twoFactorMsg.type === "success" ? "text-[var(--color-primary)]" : "text-red-600"}`}>
                      {twoFactorMsg.text}
                    </div>
                  )}
                  <button type="submit" disabled={twoFactorLoading} className={saveBtnClasses}>
                    {twoFactorLoading
                      ? "..."
                      : twoFactorStep === "phone"
                      ? (isEs ? "Enviar código" : "Send code")
                      : (isEs ? "Verificar y actualizar" : "Verify and update")}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setChangingPhone(false); setTwoFactorStep("phone"); setTwoFactorMsg(null); setDraftOtp(""); setSandboxCode(null); }}
                    className="w-full py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-dark)] transition-colors"
                  >
                    {isEs ? "← Cancelar" : "← Cancel"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form
              onSubmit={twoFactorStep === "phone" ? handleSendOtp : handleVerifyOtp}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-cream)] border border-[var(--color-primary-pale)]">
                <span className="text-lg">📱</span>
                <div>
                  <p className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">
                    {isEs ? "Método preferido" : "Preferred method"}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-dark)]">SMS</p>
                </div>
              </div>
              <div className="space-y-2">
                <input
                  id="twofa-phone"
                  type="tel"
                  value={draftTwoFactorPhone}
                  onChange={(e) => setDraftTwoFactorPhone(e.target.value.replace(/[^\d\s+\-()]/g, ""))}
                  className={`${inputClasses} ${twoFactorStep === "otp" ? "opacity-60 bg-gray-50" : ""}`}
                  placeholder={isEs ? "Número de teléfono" : "Phone number"}
                  readOnly={twoFactorStep === "otp"}
                  required
                  autoFocus
                />
              </div>
              {twoFactorStep === "otp" && sandboxCode && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="text-xl">🧪</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                      {isEs ? "Modo sandbox — tu código es:" : "Sandbox mode — your code is:"}
                    </p>
                    <p className="mt-0.5 font-mono text-2xl font-bold tracking-[0.25em] text-amber-900">{sandboxCode}</p>
                  </div>
                </div>
              )}
              {twoFactorStep === "otp" && (
                <div className="space-y-2">
                  <input
                    id="twofa-otp"
                    type="text"
                    inputMode="numeric"
                    value={draftOtp}
                    onChange={(e) => setDraftOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={inputClasses}
                    placeholder={isEs ? "Código de verificación" : "Verification code"}
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>
              )}
              {twoFactorMsg && (
                <div className={`text-sm font-medium ${twoFactorMsg.type === "success" ? "text-[var(--color-primary)]" : "text-red-600"}`}>
                  {twoFactorMsg.text}
                </div>
              )}
              <button type="submit" disabled={twoFactorLoading} className={saveBtnClasses}>
                {twoFactorLoading
                  ? "..."
                  : twoFactorStep === "phone"
                  ? (isEs ? "Enviar código" : "Send code")
                  : (isEs ? "Verificar y habilitar" : "Verify and enable")}
              </button>
              {twoFactorStep === "otp" && (
                <button
                  type="button"
                  onClick={() => { setTwoFactorStep("phone"); setTwoFactorMsg(null); setDraftOtp(""); setSandboxCode(null); }}
                  className="w-full py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-dark)] transition-colors"
                >
                  {isEs ? "← Cambiar número" : "← Change number"}
                </button>
              )}
            </form>
          )}
        </div>
      </SecurityEditModal>

    </div>
  );
}
