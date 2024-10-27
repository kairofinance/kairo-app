import { sepolia } from "viem/chains";

type AddressMap = {
  [chainId: number]: `0x${string}`;
};

export const INVOICE_MANAGER_ADDRESS: AddressMap = {
  [sepolia.id]: "0x6ADd0aE245E14d7556DCca10b8aF0024D16620Fe" as `0x${string}`,
};

// Helper function to get the address for the current chain
export function getAddress(
  addressOrMap: `0x${string}` | AddressMap,
  chainId: number
): `0x${string}` {
  if (typeof addressOrMap === "string") return addressOrMap;
  if (!addressOrMap[chainId]) {
    throw new Error(`Contract address not found for chain ${chainId}`);
  }
  return addressOrMap[chainId];
}
