import { useState, useCallback } from "react";

export type AlertType = "success" | "error" | "info" | "warning";

interface AlertState {
  message: string;
  type: AlertType;
  details?: string;
  txHash?: string;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const parseWeb3Error = (error: any): { message: string; type: AlertType } => {
    const errorMessage = error?.message?.toLowerCase() || "";

    // User rejected/cancelled cases
    if (
      errorMessage.includes("user rejected") ||
      errorMessage.includes("user denied") ||
      errorMessage.includes("rejected transaction") ||
      errorMessage.includes("cancelled")
    ) {
      return {
        message: "Transaction cancelled by user",
        type: "info",
      };
    }

    // Insufficient balance cases
    if (
      errorMessage.includes("insufficient") ||
      errorMessage.includes("not enough") ||
      errorMessage.includes("exceeds balance")
    ) {
      return {
        message: "Insufficient balance",
        type: "error",
      };
    }

    // Gas estimation/limit cases
    if (
      errorMessage.includes("gas") &&
      (errorMessage.includes("limit") || errorMessage.includes("estimation"))
    ) {
      return {
        message: "Transaction failed - Gas estimation error",
        type: "error",
      };
    }

    // Network/RPC errors
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("disconnected") ||
      errorMessage.includes("connection")
    ) {
      return {
        message: "Network error - Please check your connection",
        type: "warning",
      };
    }

    // Contract-specific errors
    if (errorMessage.includes("execution reverted")) {
      if (errorMessage.includes("invalid parameters")) {
        return {
          message: "Invalid parameters provided",
          type: "error",
        };
      }
      if (errorMessage.includes("not whitelisted")) {
        return {
          message: "Token not supported",
          type: "error",
        };
      }
      return {
        message: "Transaction failed - Contract error",
        type: "error",
      };
    }

    // Default error case
    return {
      message: "Operation failed",
      type: "error",
    };
  };

  const showAlert = useCallback(
    (
      messageOrError: string | Error | unknown,
      type?: AlertType,
      options?: {
        details?: string;
        txHash?: string;
        duration?: number;
      }
    ) => {
      let alertData: AlertState;

      if (
        messageOrError instanceof Error ||
        (messageOrError && typeof messageOrError === "object")
      ) {
        const { message, type: parsedType } = parseWeb3Error(messageOrError);
        alertData = {
          message,
          type: type || parsedType,
          details: options?.details || (messageOrError as Error)?.message,
          txHash: options?.txHash,
        };
      } else {
        alertData = {
          message: messageOrError as string,
          type: type || "info",
          details: options?.details,
          txHash: options?.txHash,
        };
      }

      setAlertState(alertData);

      // Auto-dismiss after duration (default 10 seconds)
      const duration = options?.duration || 10000;
      if (duration > 0) {
        setTimeout(() => {
          setAlertState((current) =>
            current?.message === alertData.message ? null : current
          );
        }, duration);
      }
    },
    []
  );

  const dismissAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  return {
    alertState,
    showAlert,
    dismissAlert,
  };
};
