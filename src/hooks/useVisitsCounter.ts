"use client";

import { useEffect, useState } from "react";

export function useVisitsCounter() {
  const [visits, setVisits] = useState<number>(0);

  useEffect(() => {
    const totalKey = "ertzatest_total_visits";
    const sessionKey = "ertzatest_session_counted";

    const storedVisits = parseInt(localStorage.getItem(totalKey) || "207819", 10);
    const alreadyCounted = sessionStorage.getItem(sessionKey) === "true";

    let nextVisits = storedVisits;

    if (!alreadyCounted) {
      nextVisits += 1;
      localStorage.setItem(totalKey, String(nextVisits));
      sessionStorage.setItem(sessionKey, "true");
    }

    setVisits(nextVisits);
  }, []);

  return visits;
}