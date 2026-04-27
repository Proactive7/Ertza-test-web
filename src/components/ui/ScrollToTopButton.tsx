"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 260);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Subir arriba"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3577] text-xl font-bold text-white shadow-[0_16px_30px_rgba(15,53,119,0.35)] transition hover:-translate-y-1 hover:bg-[#184a99]"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}