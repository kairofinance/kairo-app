export interface Team {
  id: string;
  name: string;
  description?: string;
  profilePicture?: string;
  treasuryAddress?: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  ownerAddress: string;
}

export interface TeamMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    address: string;
    profilePicture?: string;
  };
  joinedAt: string;
}

export interface TeamDetails extends Team {
  members: TeamMember[];
  owner: {
    id: string;
    address: string;
  };
}

export interface TeamInvite {
  id: string;
  teamId: string;
  inviteeId: string;
  inviterId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
  invitee: {
    id: string;
    address: string;
    profilePicture?: string;
  };
  inviter: {
    id: string;
    address: string;
  };
  team: Team;
}
