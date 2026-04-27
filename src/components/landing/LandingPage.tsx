"use client";

import { useRef } from "react";

import Header from "@/components/layout/Header";
import FooterLegal from "@/components/layout/FooterLegal";
import Hero from "@/components/landing/Hero";
import FeatureStrip from "@/components/landing/FeatureStrip";
import PremiumSection from "@/components/landing/PremiumSection";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";

type LandingPageProps = {
  onOpenTopics: () => void;
  onGoHome: () => void;
  onOpenPanel: () => void;
  onOpenBadges: () => void;
  onOpenMockExam: () => void;
  onOpenLegalTerms: () => void;
  onOpenLegalPrivacy: () => void;
  onOpenLegalCookies: () => void;
};

export default function LandingPage({
  onOpenTopics,
  onGoHome,
  onOpenPanel,
  onOpenBadges,
  onOpenMockExam,
  onOpenLegalTerms,
  onOpenLegalPrivacy,
  onOpenLegalCookies,
}: LandingPageProps) {
  const premiumRef = useRef<HTMLDivElement | null>(null);

  function scrollToPremium(): void {
    premiumRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className="min-h-screen bg-[#d8dde4] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1180px] overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <Header
          onGoHome={onGoHome}
          onOpenTopics={onOpenTopics}
          onOpenPanel={onOpenPanel}
          onOpenBadges={onOpenBadges}
          onOpenMockExam={onOpenMockExam}
        />

        <Hero
          onOpenTopics={onOpenTopics}
          onOpenPremium={scrollToPremium}
        />

        <FeatureStrip />

        <div ref={premiumRef}>
          <PremiumSection />
        </div>

        <FooterLegal
          onOpenLegalTerms={onOpenLegalTerms}
          onOpenLegalPrivacy={onOpenLegalPrivacy}
          onOpenLegalCookies={onOpenLegalCookies}
        />
      </div>

      <ScrollToTopButton />
    </main>
  );
}