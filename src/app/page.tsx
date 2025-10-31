"use client";

import { useUser } from "@clerk/nextjs";
import CallToAction from "@/components/CallToAction";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import { SignInModal } from "@/components/SignInModal";
import { AuthModalProvider, useAuthModal } from "@/contexts/AuthModalContext";
import { getAppUrl } from "@/lib/utils";

function HomeContent() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useAuthModal();

  const handleCtaClick = () => {
    if (isSignedIn) {
      window.location.href = getAppUrl();
    } else {
      openSignIn();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Hero
          isAuthenticated={isLoaded && isSignedIn}
          onCtaClick={handleCtaClick}
        />
        <Features />
        <CallToAction
          isAuthenticated={isLoaded && isSignedIn}
          onCtaClick={handleCtaClick}
        />

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-border/30">
          <div className="container mx-auto text-center text-muted-foreground">
            <p className="mb-2">
              Hecho con ❤️ para honrar nuestras tradiciones
            </p>
            <p className="text-sm">
              © 2025 Recuerdame.app | Celebrando el Día de los Muertos.
            </p>
          </div>
        </footer>
      </div>
      <SignInModal />
    </>
  );
}

export default function Home() {
  return (
    <AuthModalProvider>
      <HomeContent />
    </AuthModalProvider>
  );
}
