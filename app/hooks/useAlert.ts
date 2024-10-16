import { useState, useCallback } from "react";

type AlertType = "success" | "error";

export const useAlert = () => {
  const [alertState, setAlertState] = useState<{
    message: string;
    type: AlertType;
  } | null>(null);

  const showAlert = useCallback((message: string, type: AlertType) => {
    setAlertState({ message, type });
    setTimeout(() => {
      setAlertState(null);
    }, 10000);
  }, []);

  const dismissAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  return { alertState, showAlert, dismissAlert };
};
