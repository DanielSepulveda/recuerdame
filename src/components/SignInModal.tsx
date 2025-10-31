"use client";

import { SignIn } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { getAppUrl } from "@/lib/utils";

export function SignInModal() {
  const { openModalType, closeModal } = useAuthModal();

  const isOpen = openModalType === "sign-in";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">
            Entrar
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <SignIn
            routing="hash"
            forceRedirectUrl={getAppUrl()}
            signUpForceRedirectUrl={getAppUrl()}
            withSignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                cardBox: "border-none",
                // socialButtonsBlockButton:
                //   "border-2 border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border text-foreground",
                // socialButtonsBlockButtonText: "text-foreground font-medium",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                formFieldInput:
                  "bg-input border-border text-foreground focus:ring-ring",
                formFieldLabel: "text-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/90",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/90",
                footerAction: "hidden",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                alternativeMethodsBlockButton:
                  "border-border text-foreground hover:bg-accent",
                otpCodeFieldInput:
                  "bg-input border-border text-foreground focus:ring-ring",
                formResendCodeLink: "text-primary hover:text-primary/90",
                footer: "hidden",
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false,
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
