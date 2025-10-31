"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type ModalType = "sign-in" | "sign-up" | null;

interface AuthModalContextType {
  openModalType: ModalType;
  openSignIn: () => void;
  openSignUp: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined,
);

interface AuthModalProviderProps {
  children: ReactNode;
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [openModalType, setOpenModalType] = useState<ModalType>(null);

  const openSignIn = () => {
    setOpenModalType("sign-in");
  };

  const openSignUp = () => {
    setOpenModalType("sign-up");
  };

  const closeModal = () => {
    setOpenModalType(null);
  };

  const value: AuthModalContextType = {
    openModalType,
    openSignIn,
    openSignUp,
    closeModal,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextType {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
