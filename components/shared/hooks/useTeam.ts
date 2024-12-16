import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Team } from "@/types/team";
import { TeamInvite } from "@/types/team";
import { useAppKitAccount } from "@reown/appkit/react";

const TEAM_QUERY_KEY = "team";

interface TeamMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    address: string;
    profilePicture?: string;
  };
  joinedAt: string;
}

interface TeamDetails extends Team {
  members: TeamMember[];
  owner: {
    id: string;
    address: string;
  };
}

interface UpdateTeamInput {
  name?: string;
  description?: string;
  website?: string;
  treasuryAddress?: string;
}

interface AddMemberInput {
  address: string;
  role?: "ADMIN" | "MEMBER";
}

async function fetchTeam(id: string): Promise<TeamDetails> {
  const response = await fetch(`/api/teams/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch team");
  }
  const data = await response.json();
  return data.team;
}

async function updateTeam(
  id: string,
  data: UpdateTeamInput
): Promise<TeamDetails> {
  const response = await fetch(`/api/teams/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update team");
  }

  return response.json();
}

async function addMember(
  teamId: string,
  data: AddMemberInput
): Promise<TeamMember> {
  const response = await fetch(`/api/teams/${teamId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add member");
  }

  return response.json();
}

async function updateMember(
  teamId: string,
  memberId: string,
  role: string
): Promise<TeamMember> {
  const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update member");
  }

  return response.json();
}

async function removeMember(teamId: string, memberId: string): Promise<void> {
  const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to remove member");
  }
}

export function useTeam(teamId: string) {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();

  const {
    data: team,
    isLoading,
    error,
  } = useQuery({
    queryKey: [TEAM_QUERY_KEY, teamId],
    queryFn: () => fetchTeam(teamId),
  });

  const updateTeamMutation = useMutation({
    mutationFn: (data: UpdateTeamInput) => updateTeam(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, teamId] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: AddMemberInput) => addMember(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, teamId] });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      updateMember(teamId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, teamId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, teamId] });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: AddMemberInput) => {
      const response = await fetch(`/api/teams/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          inviteeAddress: data.address,
          inviterAddress: address, // You'll need to get this from your auth context
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to invite member");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, teamId] });
    },
  });

  return {
    team,
    isLoading,
    error,
    updateTeam: updateTeamMutation.mutate,
    isUpdating: updateTeamMutation.isPending,
    updateError: updateTeamMutation.error,
    addMember: addMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    addMemberError: addMemberMutation.error,
    updateMember: updateMemberMutation.mutate,
    isUpdatingMember: updateMemberMutation.isPending,
    updateMemberError: updateMemberMutation.error,
    removeMember: removeMemberMutation.mutate,
    isRemovingMember: removeMemberMutation.isPending,
    removeMemberError: removeMemberMutation.error,
    inviteMember: inviteMemberMutation.mutate,
    isInvitingMember: inviteMemberMutation.isPending,
    inviteMemberError: inviteMemberMutation.error,
  };
}
