// Contract ABIs
export const VestingManagerABI = [
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "cliffDuration", type: "uint256" },
      { name: "vestingDuration", type: "uint256" },
      { name: "initialRelease", type: "uint256" },
      { name: "tokenAddress", type: "address" },
    ],
    name: "createVesting",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const InvoiceManagerABI = [] as const; // Add your invoice ABI
export const StreamManagerABI = [] as const; // Add your stream ABI
