import { useState, useEffect } from "react";

interface AccountStats {
  isLoading: boolean;
  totalInvoices?: number;
  totalPaidInvoices?: number;
  completedStreams?: number;
  unlockedVests?: number;
  grossIncome?: number;
  error?: Error;
}

export function useAccountStats(address: string | undefined) {
  const [stats, setStats] = useState<AccountStats>({
    isLoading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      if (!address) return;

      try {
        const response = await fetch(`/api/account/stats?address=${address}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setStats({
          totalInvoices: data.totalInvoices || 0,
          totalPaidInvoices: data.totalPaidInvoices || 0,
          completedStreams: data.completedStreams || 0,
          unlockedVests: data.unlockedVests || 0,
          grossIncome: data.grossIncome || 0,
          isLoading: false,
        });
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    }

    fetchStats();
  }, [address]);

  return stats;
}
