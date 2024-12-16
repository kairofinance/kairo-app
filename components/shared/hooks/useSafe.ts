import { useEffect, useState } from "react";
import { safe, safeAdapter } from "../Context";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";

export function useSafe() {
  const [isSafeApp, setIsSafeApp] = useState(false);
  const [safeInfo, setSafeInfo] = useState<any>(null);

  useEffect(() => {
    const checkSafe = async () => {
      try {
        const info = await safe.safe.getInfo();
        setIsSafeApp(true);
        setSafeInfo(info);
      } catch (err) {
        setIsSafeApp(false);
      }
    };

    checkSafe();
  }, []);

  const createSafe = async (owners: string[], threshold: number) => {
    return await safeAdapter.createSafe(owners, threshold);
  };

  const proposeTx = async (transaction: SafeTransactionDataPartial) => {
    return await safeAdapter.proposeTx(transaction);
  };

  const executeTx = async (safeTxHash: string) => {
    return await safeAdapter.executeTx(safeTxHash);
  };

  return {
    isSafeApp,
    safeInfo,
    createSafe,
    proposeTx,
    executeTx,
  };
}
