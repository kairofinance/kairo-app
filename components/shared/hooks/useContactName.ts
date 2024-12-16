import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEnsName } from "wagmi";

interface Contact {
  id: string;
  name: string;
  address: string;
}

export function useContactName(address: string) {
  const { address: currentUserAddress } = useAppKitAccount();
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading: isContactLoading,
    refetch: refetchContacts,
  } = useQuery<Contact[]>({
    queryKey: ["contacts", currentUserAddress],
    queryFn: async () => {
      if (!currentUserAddress) return [];
      const response = await fetch(
        `/api/contacts?address=${currentUserAddress}`
      );
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      return data.contacts || [];
    },
    enabled: !!currentUserAddress,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  const contact = contacts.find(
    (c) => c.address.toLowerCase() === address.toLowerCase()
  );

  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address: address as `0x${string}`,
  });

  const invalidateContacts = () => {
    queryClient.invalidateQueries({
      queryKey: ["contacts", currentUserAddress],
    });
  };

  const displayName =
    contact?.name || ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;

  return {
    name: displayName,
    isContact: !!contact,
    ensName,
    isLoading: isContactLoading || isEnsLoading,
    refetchContacts,
    invalidateContacts,
  };
}
