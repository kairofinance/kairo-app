import { sepolia } from "viem/chains";

type AddressMap = {
  [chainId: number]: `0x${string}`;
};

export const VERIFIER_ADDRESS: AddressMap = {
  [sepolia.id]: "0x5d3245eeca5825883ac25fb52dd52a880eae114c",
};

export const INVOICE_MANAGER_ADDRESS: AddressMap = {
  [sepolia.id]: "0x6d4cacdce4ee6b0f9a869c88eabcc3f34dcae69f",
};

// Helper function to get the address for the current chain
export function getAddress(
  addressMap: AddressMap,
  chainId: number
): `0x${string}` {
  const address = addressMap[chainId];
  if (!address) {
    throw new Error(`Address not found for chain ID: ${chainId}`);
  }
  return address;
}
