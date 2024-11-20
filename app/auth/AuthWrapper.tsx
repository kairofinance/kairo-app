"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const appKit = useAppKit();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Add your auth logic here

  return <>{children}</>;
}
