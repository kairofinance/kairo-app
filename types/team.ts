export interface TeamMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  user: {
    address: string;
    profilePicture?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  profilePicture?: string;
  website?: string;
  treasuryAddress?: string;
  createdAt: string;
  lastNameChange?: string;
  memberCount: number;
  role: "OWNER" | "ADMIN" | "MEMBER";
  owner: {
    address: string;
  };
  members: TeamMember[];
  invites?: {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    invitee: {
      address: string;
    };
  }[];
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  ownerAddress: string;
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
