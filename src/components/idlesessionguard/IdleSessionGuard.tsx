"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const TOTAL_IDLE = 10 * 60 * 1000;
const WARNING_BEFORE = 20 * 1000;
const WARNING_TIME = TOTAL_IDLE - WARNING_BEFORE;
const ACTIVITY_THROTTLE = 1000;

export default function IdleSessionGuard() {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_BEFORE / 1000);

  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const showWarningRef = useRef(false);
  const lastActivityRef = useRef(0);

  function clearAllTimers() {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    idleTimeoutRef.current = null;
    logoutTimeoutRef.current = null;
    countdownIntervalRef.current = null;
  }

  function startWarning() {
    showWarningRef.current = true;
    setShowWarning(true);
    setCountdown(WARNING_BEFORE / 1000);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    logoutTimeoutRef.current = setTimeout(() => {
      logout();
    }, WARNING_BEFORE);
  }

  function resetTimer() {
    clearAllTimers();

    showWarningRef.current = false;
    setShowWarning(false);
    setCountdown(WARNING_BEFORE / 1000);

    idleTimeoutRef.current = setTimeout(() => {
      startWarning();
    }, WARNING_TIME);
  }

  function handleActivity() {
    if (showWarningRef.current) return;

    const now = Date.now();

    if (now - lastActivityRef.current < ACTIVITY_THROTTLE) return;

    lastActivityRef.current = now;
    resetTimer();
  }

  async function logout() {
    clearAllTimers();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function stayConnected() {
    resetTimer();
  }

  useEffect(() => {
    const events = ["mousemove", "click", "keydown", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      clearAllTimers();
    };
  }, []);

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