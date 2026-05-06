"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TOTAL_IDLE = 40 * 60 * 1000;
const WARNING_BEFORE = 60 * 1000;
const WARNING_TIME = TOTAL_IDLE - WARNING_BEFORE;
const ACTIVITY_THROTTLE = 1000;

const LAST_ACTIVITY_KEY = "ertzatest_last_activity_at";
const SESSION_ID_KEY = "ertzatest_session_id";

export default function IdleSessionGuard() {
  const [showWarning, setShowWarning] = useState(false);
  const [sessionChanging, setSessionChanging] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_BEFORE / 1000);

  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleLogoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const sessionLogoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const sessionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const showWarningRef = useRef(false);
  const sessionChangingRef = useRef(false);
  const lastActivityRef = useRef(0);

  function createSessionId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function getLocalSessionId(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(SESSION_ID_KEY);
  }

  function saveLocalSessionId(sessionId: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  function saveLastActivity() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }

  function getLastActivity(): number | null {
    if (typeof window === "undefined") return null;

    const stored = window.localStorage.getItem(LAST_ACTIVITY_KEY);
    const parsed = stored ? Number(stored) : null;

    return parsed && !Number.isNaN(parsed) ? parsed : null;
  }

  function clearIdleTimers() {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (idleLogoutTimeoutRef.current) {
      clearTimeout(idleLogoutTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    idleTimeoutRef.current = null;
    idleLogoutTimeoutRef.current = null;
    countdownIntervalRef.current = null;
  }

  function clearAllTimers() {
    clearIdleTimers();

    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
    }

    if (sessionLogoutTimeoutRef.current) {
      clearTimeout(sessionLogoutTimeoutRef.current);
    }

    sessionCheckIntervalRef.current = null;
    sessionLogoutTimeoutRef.current = null;
  }

  async function logout() {
    clearAllTimers();

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LAST_ACTIVITY_KEY);
      window.localStorage.removeItem(SESSION_ID_KEY);
    }

    await supabase.auth.signOut({ scope: "local" });

    window.location.href = "/";
  }

  async function registerCurrentSession() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) return;

    let sessionId = getLocalSessionId();

    if (!sessionId) {
      sessionId = createSessionId();
      saveLocalSessionId(sessionId);
    }

    const { error } = await supabase.from("active_sessions").upsert(
      {
        user_id: user.id,
        session_id: sessionId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("Error registrando sesión activa:", error.message);
    }
  }

  async function checkCurrentSession() {
    if (sessionChangingRef.current) return;

    const localSessionId = getLocalSessionId();

    if (!localSessionId) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id) return;

    const { data, error } = await supabase
      .from("active_sessions")
      .select("session_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error comprobando sesión activa:", error.message);
      return;
    }

    if (data?.session_id && data.session_id !== localSessionId) {
      sessionChangingRef.current = true;
      showWarningRef.current = false;

      setShowWarning(false);
      setSessionChanging(true);

      clearIdleTimers();

      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }

      sessionLogoutTimeoutRef.current = setTimeout(() => {
        void logout();
      }, 2500);
    }
  }

  function startWarning() {
    if (sessionChangingRef.current) return;

    showWarningRef.current = true;
    setShowWarning(true);
    setCountdown(WARNING_BEFORE / 1000);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    idleLogoutTimeoutRef.current = setTimeout(() => {
      void logout();
    }, WARNING_BEFORE);
  }

  function resetTimer() {
    if (sessionChangingRef.current) return;

    clearIdleTimers();

    showWarningRef.current = false;
    setShowWarning(false);
    setCountdown(WARNING_BEFORE / 1000);

    saveLastActivity();

    idleTimeoutRef.current = setTimeout(() => {
      startWarning();
    }, WARNING_TIME);
  }

  function handleActivity() {
    if (showWarningRef.current || sessionChangingRef.current) return;

    const now = Date.now();

    if (now - lastActivityRef.current < ACTIVITY_THROTTLE) return;

    lastActivityRef.current = now;
    resetTimer();
  }

  function stayConnected() {
    resetTimer();
  }

  useEffect(() => {
    async function initSessionGuard() {
      const lastActivity = getLastActivity();
      const now = Date.now();

      if (lastActivity && now - lastActivity >= TOTAL_IDLE) {
        await logout();
        return;
      }

      await registerCurrentSession();
      await checkCurrentSession();

      const events = ["mousemove", "click", "keydown", "touchstart"];

      events.forEach((event) => {
        window.addEventListener(event, handleActivity, { passive: true });
      });

      resetTimer();

      sessionCheckIntervalRef.current = setInterval(() => {
        void checkCurrentSession();
      }, 5 * 1000);
    }

    void initSessionGuard();

    return () => {
      const events = ["mousemove", "click", "keydown", "touchstart"];

      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      clearAllTimers();
    };
  }, []);

  if (sessionChanging) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl animate-fadeIn">
          <h2 className="text-xl font-extrabold text-[#123b86]">
            Cambiando sesión
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Has iniciado sesión en otro navegador o dispositivo. Por seguridad,
            esta sesión se cerrará automáticamente.
          </p>

          <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-[#123b86]">
            Redirigiendo...
          </div>
        </div>

        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.25s ease-out;
          }
        `}</style>
      </div>
    );
  }

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl animate-fadeIn">
        <h2 className="text-xl font-extrabold text-[#123b86]">
          Sesión a punto de expirar
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Por seguridad, tu sesión se cerrará automáticamente si no confirmas
          que sigues activo.
        </p>

        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          Se cerrará en {countdown}s
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={stayConnected}
            className="flex-1 rounded-xl bg-[#123b86] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f3577]"
          >
            Seguir conectado
          </button>

          <button
            onClick={logout}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}