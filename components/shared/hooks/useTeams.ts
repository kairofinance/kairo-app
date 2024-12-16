import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Team, CreateTeamInput } from "@/types/team";

const TEAMS_QUERY_KEY = "teams";

async function fetchTeams(address: string): Promise<Team[]> {
  const response = await fetch(`/api/teams?address=${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch teams");
  }
  const data = await response.json();
  return data.teams;
}

async function createTeam(input: CreateTeamInput): Promise<Team> {
  const response = await fetch("/api/teams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create team");
  }

  const data = await response.json();
  return data.team;
}

export function useTeams(address?: string) {
  const queryClient = useQueryClient();

  const {
    data: teams,
    isLoading,
    error,
  } = useQuery({
    queryKey: [TEAMS_QUERY_KEY, address],
    queryFn: () => (address ? fetchTeams(address) : Promise.resolve([])),
    enabled: !!address,
  });

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      // Invalidate and refetch teams after successful creation
      queryClient.invalidateQueries({ queryKey: [TEAMS_QUERY_KEY] });
      return data; // Return the created team data
    },
  });

  return {
    teams,
    isLoading,
    error,
    createTeam: createTeamMutation.mutateAsync, // Changed to mutateAsync to get the result
    isCreating: createTeamMutation.isPending,
    createError: createTeamMutation.error,
  };
}
