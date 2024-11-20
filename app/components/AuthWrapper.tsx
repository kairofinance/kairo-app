"use client";
import { useAppKitAccount } from "@reown/appkit/react";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isConnected } = useAppKitAccount();

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isConnected ? "ml-64" : "ml-0"
      }`}
    >
      {children}
    </div>
  );
};

export default AuthWrapper;
