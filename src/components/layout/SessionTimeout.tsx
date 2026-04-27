"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/hooks/useUser";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutos
const WARNING_TIME = 60 * 1000; // aviso 1 minuto antes

export default function SessionTimeout() {
  const user = useUser();

  const logoutTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);
  const showWarningRef = useRef(false);

  const [showWarning, setShowWarning] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function clearTimers() {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);

    logoutTimer.current = null;
    warningTimer.current = null;
  }

  function startTimers() {
    if (!user) return;

    clearTimers();

    warningTimer.current = setTimeout(() => {
      showWarningRef.current = true;
      setShowWarning(true);
    }, INACTIVITY_LIMIT - WARNING_TIME);

    logoutTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  }

  function resetTimer() {
    if (!user) return;

    // Si el popup ya está visible, mover ratón/click/tecla NO lo oculta.
    if (showWarningRef.current) return;

    startTimers();
  }

  function continueSession() {
    showWarningRef.current = false;
    setShowWarning(false);
    startTimers();
  }

  useEffect(() => {
    if (!user) {
      clearTimers();
      showWarningRef.current = false;
      setShowWarning(false);
      return;
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    startTimers();

    return () => {
      clearTimers();
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] border border-white/60 bg-white p-6 text-center shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff] text-2xl">
          🔒
        </div>

        <h2 className="text-[24px] font-extrabold text-[#123b86]">
          Tu sesión está a punto de cerrarse
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Por seguridad, cerraremos tu sesión en 1 minuto si no continúas usando
          la plataforma.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={continueSession}
            className="flex-1 rounded-xl bg-[#123b86] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0f3577]"
          >
            Seguir conectado
          </button>

          <button
            onClick={logout}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}