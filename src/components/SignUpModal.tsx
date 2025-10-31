"use client";

import { SignUp } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthModal } from "@/contexts/AuthModalContext";

export function SignUpModal() {
  const { openModalType, closeModal } = useAuthModal();

  const isOpen = openModalType === "sign-up";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">
            Crear Cuenta
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <SignUp
            routing="hash"
            forceRedirectUrl="/app"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-primary hover:bg-primary/90 text-primary-foreground border-primary",
                socialButtonsBlockButtonText: "text-primary-foreground",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                formFieldInput:
                  "bg-input border-border text-foreground focus:ring-ring",
                formFieldLabel: "text-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/90",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/90",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                alternativeMethodsBlockButton:
                  "border-border text-foreground hover:bg-accent",
                otpCodeFieldInput:
                  "bg-input border-border text-foreground focus:ring-ring",
                formResendCodeLink: "text-primary hover:text-primary/90",
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
