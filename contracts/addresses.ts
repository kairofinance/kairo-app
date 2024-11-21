import { sepolia } from "viem/chains";

type AddressMap = {
  [chainId: number]: `0x${string}`;
};

export const INVOICE_MANAGER_ADDRESS: AddressMap = {
  [sepolia.id]: "0x9b00f9103de3bdd8c3d3cb553ec516ab2646f54d" as `0x${string}`,
};

export const USDC_ADDRESS: AddressMap = {
  [sepolia.id]: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
};

export const DAI_ADDRESS: AddressMap = {
  [sepolia.id]: "0x552ceaDf3B47609897279F42D3B3309B604896f3" as `0x${string}`,
};

export const FEE_CONTROLLER_ADDRESS: AddressMap = {
  [sepolia.id]: "0x5Fe6130E39D0a825d94303bB2340062F953B8170" as `0x${string}`,
};

export const VEST_MANAGER_ADDRESS: AddressMap = {
  [sepolia.id]: "0x785a542680da89a19112efcfc157d704b0ea71f3" as `0x${string}`,
};

export const STREAM_MANAGER_ADDRESS: AddressMap = {
  [sepolia.id]: "0x449c7cb06305bbc081f0e7f3c63f68c6a18ec5b0" as `0x${string}`,
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
