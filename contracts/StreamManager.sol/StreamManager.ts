export const StreamManagerABI = [
  {
    type: "function",
    name: "addWhitelistedToken",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelStream",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimStream",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createStream",
    inputs: [
      {
        name: "params",
        type: "tuple",
        internalType: "struct IStreamManager.StreamParams",
        components: [
          { name: "recipient", type: "address", internalType: "address" },
          { name: "token", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "duration", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    outputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createStreams",
    inputs: [
      {
        name: "params",
        type: "tuple[]",
        internalType: "struct IStreamManager.StreamParams[]",
        components: [
          { name: "recipient", type: "address", internalType: "address" },
          { name: "token", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "duration", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    outputs: [
      { name: "streamIds", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getClaimableAmount",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pauseStream",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeWhitelistedToken",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resumeStream",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setfeeController",
    inputs: [
      {
        name: "_newfeeController",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "StreamCancelled",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "refundedAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamClaimed",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamCreated",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "stream",
        type: "tuple",
        indexed: false,
        internalType: "struct IStreamManager.Stream",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "recipient", type: "address", internalType: "address" },
          { name: "token", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "startTime", type: "uint256", internalType: "uint256" },
          { name: "endTime", type: "uint256", internalType: "uint256" },
          { name: "lastClaim", type: "uint256", internalType: "uint256" },
          { name: "isPaused", type: "bool", internalType: "bool" },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamPaused",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamResumed",
    inputs: [
      {
        name: "streamId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenRemovedFromWhitelist",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenWhitelisted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "feeControllerSet",
    inputs: [
      {
        name: "feeController",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "feeControllerUpdated",
    inputs: [
      {
        name: "oldfeeController",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newfeeController",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "BatchTooLarge", inputs: [] },
  { type: "error", name: "InvalidAddress", inputs: [] },
  { type: "error", name: "InvalidAmount", inputs: [] },
  { type: "error", name: "InvalidDuration", inputs: [] },
  { type: "error", name: "InvalidInput", inputs: [] },
  { type: "error", name: "NotAuthorized", inputs: [] },
  { type: "error", name: "NothingToClaim", inputs: [] },
  {
    type: "error",
    name: "StreamExpired",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
  },
  { type: "error", name: "StreamIsPaused", inputs: [] },
  {
    type: "error",
    name: "StreamNotFound",
    inputs: [{ name: "streamId", type: "uint256", internalType: "uint256" }],
  },
  { type: "error", name: "StreamNotPaused", inputs: [] },
  {
    type: "error",
    name: "TokenNotWhitelisted",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
] as const;
