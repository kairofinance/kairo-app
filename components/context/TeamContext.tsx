"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTeams } from "@/components/shared/hooks/useTeams";
import { Team } from "@/types/team";
import { useAppKitAccount } from "@reown/appkit/react";

interface TeamContextType {
  selectedTeamId: string | null;
  selectedTeam: Team | null;
  setSelectedTeamId: (id: string | null) => void;
  teams: Team[];
  isLoading: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAppKitAccount();
  const { teams = [], isLoading } = useTeams(address ?? "");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(() => {
    // Try to get from localStorage on initial load
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTeamId");
    }
    return null;
  });

  // Persist team selection to localStorage
  useEffect(() => {
    if (selectedTeamId) {
      localStorage.setItem("selectedTeamId", selectedTeamId);
    } else {
      localStorage.removeItem("selectedTeamId");
    }
  }, [selectedTeamId]);

  // Clear selection if selected team no longer exists
  useEffect(() => {
    if (
      selectedTeamId &&
      teams.length > 0 &&
      !teams.find((t) => t.id === selectedTeamId)
    ) {
      setSelectedTeamId(null);
    }
  }, [teams, selectedTeamId]);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  const value = {
    selectedTeamId,
    selectedTeam,
    setSelectedTeamId,
    teams,
    isLoading,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeamContext() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
}
