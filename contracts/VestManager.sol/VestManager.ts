export const VestManagerABI = {
  abi: [
    {
      type: "function",
      name: "addWhitelistedToken",
      inputs: [{ name: "token", type: "address", internalType: "address" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "claim",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "createVestingSchedule",
      inputs: [
        { name: "beneficiary", type: "address", internalType: "address" },
        { name: "token", type: "address", internalType: "address" },
        { name: "amount", type: "uint256", internalType: "uint256" },
        { name: "cliffDuration", type: "uint256", internalType: "uint256" },
        { name: "vestingDuration", type: "uint256", internalType: "uint256" },
        {
          name: "initialReleasePercentage",
          type: "uint256",
          internalType: "uint256",
        },
      ],
      outputs: [
        { name: "vestingId", type: "uint256", internalType: "uint256" },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getClaimableAmount",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "initialize",
      inputs: [
        { name: "initialOwner", type: "address", internalType: "address" },
        { name: "_feeController", type: "address", internalType: "address" },
        {
          name: "_initialTokens",
          type: "address[]",
          internalType: "address[]",
        },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "pauseVesting",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
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
      name: "resumeVesting",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "revokeVesting",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setfeeController",
      inputs: [
        { name: "_newfeeController", type: "address", internalType: "address" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "InitialAmountReleased",
      inputs: [
        {
          name: "vestingId",
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
      name: "TokensVested",
      inputs: [
        {
          name: "vestingId",
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
      name: "VestingPaused",
      inputs: [
        {
          name: "vestingId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VestingResumed",
      inputs: [
        {
          name: "vestingId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VestingRevoked",
      inputs: [
        {
          name: "vestingId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "refundAmount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "VestingScheduleCreated",
      inputs: [
        {
          name: "vestingId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "schedule",
          type: "tuple",
          indexed: false,
          internalType: "struct IVestManager.VestingSchedule",
          components: [
            { name: "grantor", type: "address", internalType: "address" },
            { name: "beneficiary", type: "address", internalType: "address" },
            { name: "token", type: "address", internalType: "address" },
            { name: "totalAmount", type: "uint96", internalType: "uint96" },
            { name: "startTime", type: "uint48", internalType: "uint48" },
            { name: "cliffDuration", type: "uint48", internalType: "uint48" },
            { name: "vestingDuration", type: "uint48", internalType: "uint48" },
            { name: "releasedAmount", type: "uint96", internalType: "uint96" },
            { name: "initialAmount", type: "uint96", internalType: "uint96" },
            { name: "initialReleased", type: "bool", internalType: "bool" },
            { name: "isPaused", type: "bool", internalType: "bool" },
            { name: "isRevoked", type: "bool", internalType: "bool" },
          ],
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
    { type: "error", name: "AmountTooLarge", inputs: [] },
    {
      type: "error",
      name: "CliffNotReached",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
    },
    { type: "error", name: "DurationTooLarge", inputs: [] },
    { type: "error", name: "InvalidAddress", inputs: [] },
    { type: "error", name: "InvalidInitialRelease", inputs: [] },
    { type: "error", name: "InvalidSchedule", inputs: [] },
    { type: "error", name: "NotAuthorized", inputs: [] },
    { type: "error", name: "NothingToClaim", inputs: [] },
    {
      type: "error",
      name: "ScheduleNotFound",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
    },
    {
      type: "error",
      name: "ScheduleNotPaused",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
    },
    {
      type: "error",
      name: "SchedulePaused",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
    },
    {
      type: "error",
      name: "ScheduleRevoked",
      inputs: [{ name: "vestingId", type: "uint256", internalType: "uint256" }],
    },
    {
      type: "error",
      name: "TokenNotWhitelisted",
      inputs: [{ name: "token", type: "address", internalType: "address" }],
    },
  ],
  bytecode: { object: "0x", sourceMap: "", linkReferences: {} },
  deployedBytecode: { object: "0x", sourceMap: "", linkReferences: {} },
  methodIdentifiers: {
    "addWhitelistedToken(address)": "363cb34d",
    "claim(uint256)": "379607f5",
    "createVestingSchedule(address,address,uint256,uint256,uint256,uint256)":
      "f9d22402",
    "getClaimableAmount(uint256)": "7d8ca242",
    "initialize(address,address,address[])": "77a24f36",
    "pauseVesting(uint256)": "df1770ca",
    "removeWhitelistedToken(address)": "1c88705d",
    "resumeVesting(uint256)": "3b270631",
    "revokeVesting(uint256)": "dd128200",
    "setfeeController(address)": "7ebea301",
  },
  rawMetadata:
    '{"compiler":{"version":"0.8.28+commit.7893614a"},"language":"Solidity","output":{"abi":[{"inputs":[],"name":"AmountTooLarge","type":"error"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"CliffNotReached","type":"error"},{"inputs":[],"name":"DurationTooLarge","type":"error"},{"inputs":[],"name":"InvalidAddress","type":"error"},{"inputs":[],"name":"InvalidInitialRelease","type":"error"},{"inputs":[],"name":"InvalidSchedule","type":"error"},{"inputs":[],"name":"NotAuthorized","type":"error"},{"inputs":[],"name":"NothingToClaim","type":"error"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"ScheduleNotFound","type":"error"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"ScheduleNotPaused","type":"error"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"SchedulePaused","type":"error"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"ScheduleRevoked","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"TokenNotWhitelisted","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"vestingId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"InitialAmountReleased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"TokenRemovedFromWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"TokenWhitelisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"vestingId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensVested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"VestingPaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"VestingResumed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"vestingId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"refundAmount","type":"uint256"}],"name":"VestingRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"vestingId","type":"uint256"},{"components":[{"internalType":"address","name":"grantor","type":"address"},{"internalType":"address","name":"beneficiary","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint96","name":"totalAmount","type":"uint96"},{"internalType":"uint48","name":"startTime","type":"uint48"},{"internalType":"uint48","name":"cliffDuration","type":"uint48"},{"internalType":"uint48","name":"vestingDuration","type":"uint48"},{"internalType":"uint96","name":"releasedAmount","type":"uint96"},{"internalType":"uint96","name":"initialAmount","type":"uint96"},{"internalType":"bool","name":"initialReleased","type":"bool"},{"internalType":"bool","name":"isPaused","type":"bool"},{"internalType":"bool","name":"isRevoked","type":"bool"}],"indexed":false,"internalType":"struct IVestManager.VestingSchedule","name":"schedule","type":"tuple"}],"name":"VestingScheduleCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldfeeController","type":"address"},{"indexed":true,"internalType":"address","name":"newfeeController","type":"address"}],"name":"feeControllerUpdated","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"addWhitelistedToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"beneficiary","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"cliffDuration","type":"uint256"},{"internalType":"uint256","name":"vestingDuration","type":"uint256"},{"internalType":"uint256","name":"initialReleasePercentage","type":"uint256"}],"name":"createVestingSchedule","outputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"getClaimableAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address","name":"_feeController","type":"address"},{"internalType":"address[]","name":"_initialTokens","type":"address[]"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"pauseVesting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"removeWhitelistedToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"resumeVesting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"vestingId","type":"uint256"}],"name":"revokeVesting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newfeeController","type":"address"}],"name":"setfeeController","outputs":[],"stateMutability":"nonpayable","type":"function"}],"devdoc":{"details":"Interface for the VestManager contract, which manages token vesting schedules.","kind":"dev","methods":{"addWhitelistedToken(address)":{"details":"Adds a token to the whitelist","params":{"token":"The token to add to the whitelist"}},"claim(uint256)":{"details":"Claims vested tokens for a given vesting schedule","params":{"vestingId":"The ID of the vesting schedule"}},"createVestingSchedule(address,address,uint256,uint256,uint256,uint256)":{"details":"Creates a new vesting schedule","params":{"amount":"The total amount to be vested","beneficiary":"The beneficiary of the vesting schedule","cliffDuration":"The duration of the cliff period in seconds","initialReleasePercentage":"The percentage of tokens to release initially","token":"The token to be vested","vestingDuration":"The total duration of the vesting period in seconds"},"returns":{"vestingId":"The ID of the created vesting schedule"}},"getClaimableAmount(uint256)":{"details":"Gets the amount of tokens that can be claimed from a vesting schedule","params":{"vestingId":"The ID of the vesting schedule"},"returns":{"_0":"The amount of tokens that can be claimed"}},"initialize(address,address,address[])":{"details":"Initializes the contract","params":{"_feeController":"The address of the fee handler contract","_initialTokens":"Array of initial whitelisted token addresses","initialOwner":"The initial owner of the contract"}},"pauseVesting(uint256)":{"details":"Pauses a vesting schedule","params":{"vestingId":"The ID of the vesting schedule to pause"}},"removeWhitelistedToken(address)":{"details":"Removes a token from the whitelist","params":{"token":"The token to remove from the whitelist"}},"resumeVesting(uint256)":{"details":"Resumes a paused vesting schedule","params":{"vestingId":"The ID of the vesting schedule to resume"}},"revokeVesting(uint256)":{"details":"Revokes a vesting schedule","params":{"vestingId":"The ID of the vesting schedule to revoke"}},"setfeeController(address)":{"details":"Updates the fee handler contract address","params":{"_newfeeController":"The address of the new fee handler contract"}}},"title":"IVestManager","version":1},"userdoc":{"kind":"user","methods":{},"version":1}},"settings":{"compilationTarget":{"src/interface/IVestManager.sol":"IVestManager"},"evmVersion":"paris","libraries":{},"metadata":{"bytecodeHash":"ipfs"},"optimizer":{"enabled":true,"runs":200},"remappings":[":@openzeppelin/=lib/openzeppelin-contracts/",":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",":@uniswap/v2-periphery/=lib/v2-periphery/",":@uniswap/v3-core/=lib/v3-core/",":@uniswap/v3-periphery/=lib/v3-periphery/",":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/",":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/",":forge-std/=lib/forge-std/src/",":openzeppelin-contracts/=lib/openzeppelin-contracts/",":prb-math/=lib/prb-math/src/",":solady/=lib/solady/src/",":v2-core/=lib/v2-core/contracts/",":v2-periphery/=lib/v2-periphery/contracts/",":v3-core/=lib/v3-core/",":v3-periphery/=lib/v3-periphery/contracts/"]},"sources":{"src/interface/IVestManager.sol":{"keccak256":"0xae4680b60be7450ec5de62641d379eead7ec244bd2bd21f05d7ad63ff104edd3","license":"MIT","urls":["bzz-raw://affcb3140073e25ecc0a428760f66b5b07979369b3deb7f3797acd14a452a24b","dweb:/ipfs/QmRn31KAd465iUvj54348t25J2fReN1DtDcvz5aAKN6PtP"]}},"version":1}',
  metadata: {
    compiler: { version: "0.8.28+commit.7893614a" },
    language: "Solidity",
    output: {
      abi: [
        { inputs: [], type: "error", name: "AmountTooLarge" },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          type: "error",
          name: "CliffNotReached",
        },
        { inputs: [], type: "error", name: "DurationTooLarge" },
        { inputs: [], type: "error", name: "InvalidAddress" },
        { inputs: [], type: "error", name: "InvalidInitialRelease" },
        { inputs: [], type: "error", name: "InvalidSchedule" },
        { inputs: [], type: "error", name: "NotAuthorized" },
        { inputs: [], type: "error", name: "NothingToClaim" },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          type: "error",
          name: "ScheduleNotFound",
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          type: "error",
          name: "ScheduleNotPaused",
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          type: "error",
          name: "SchedulePaused",
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          type: "error",
          name: "ScheduleRevoked",
        },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          type: "error",
          name: "TokenNotWhitelisted",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "vestingId",
              type: "uint256",
              indexed: true,
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
              indexed: false,
            },
          ],
          type: "event",
          name: "InitialAmountReleased",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "token",
              type: "address",
              indexed: true,
            },
          ],
          type: "event",
          name: "TokenRemovedFromWhitelist",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "token",
              type: "address",
              indexed: true,
            },
          ],
          type: "event",
          name: "TokenWhitelisted",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "vestingId",
              type: "uint256",
              indexed: true,
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
              indexed: false,
            },
          ],
          type: "event",
          name: "TokensVested",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "vestingId",
              type: "uint256",
              indexed: true,
            },
          ],
          type: "event",
          name: "VestingPaused",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "vestingId",
              type: "uint256",
              indexed: true,
            },
          ],
          type: "event",
          name: "VestingResumed",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "vestingId",
              type: "uint256",
              indexed: true,
            },
            {
              internalType: "uint256",
              name: "refundAmount",
              type: "uint256",
              indexed: false,
            },
          ],
          type: "event",
          name: "VestingRevoked",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "vestingId",
              type: "uint256",
              indexed: true,
            },
            {
              internalType: "struct IVestManager.VestingSchedule",
              name: "schedule",
              type: "tuple",
              components: [
                { internalType: "address", name: "grantor", type: "address" },
                {
                  internalType: "address",
                  name: "beneficiary",
                  type: "address",
                },
                { internalType: "address", name: "token", type: "address" },
                { internalType: "uint96", name: "totalAmount", type: "uint96" },
                { internalType: "uint48", name: "startTime", type: "uint48" },
                {
                  internalType: "uint48",
                  name: "cliffDuration",
                  type: "uint48",
                },
                {
                  internalType: "uint48",
                  name: "vestingDuration",
                  type: "uint48",
                },
                {
                  internalType: "uint96",
                  name: "releasedAmount",
                  type: "uint96",
                },
                {
                  internalType: "uint96",
                  name: "initialAmount",
                  type: "uint96",
                },
                { internalType: "bool", name: "initialReleased", type: "bool" },
                { internalType: "bool", name: "isPaused", type: "bool" },
                { internalType: "bool", name: "isRevoked", type: "bool" },
              ],
              indexed: false,
            },
          ],
          type: "event",
          name: "VestingScheduleCreated",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "oldfeeController",
              type: "address",
              indexed: true,
            },
            {
              internalType: "address",
              name: "newfeeController",
              type: "address",
              indexed: true,
            },
          ],
          type: "event",
          name: "feeControllerUpdated",
          anonymous: false,
        },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          stateMutability: "nonpayable",
          type: "function",
          name: "addWhitelistedToken",
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "claim",
        },
        {
          inputs: [
            { internalType: "address", name: "beneficiary", type: "address" },
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "uint256", name: "cliffDuration", type: "uint256" },
            {
              internalType: "uint256",
              name: "vestingDuration",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "initialReleasePercentage",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "createVestingSchedule",
          outputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          stateMutability: "view",
          type: "function",
          name: "getClaimableAmount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        },
        {
          inputs: [
            { internalType: "address", name: "initialOwner", type: "address" },
            {
              internalType: "address",
              name: "_feeController",
              type: "address",
            },
            {
              internalType: "address[]",
              name: "_initialTokens",
              type: "address[]",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "initialize",
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "pauseVesting",
        },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          stateMutability: "nonpayable",
          type: "function",
          name: "removeWhitelistedToken",
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "resumeVesting",
        },
        {
          inputs: [
            { internalType: "uint256", name: "vestingId", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "revokeVesting",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_newfeeController",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "setfeeController",
        },
      ],
      devdoc: {
        kind: "dev",
        methods: {
          "addWhitelistedToken(address)": {
            details: "Adds a token to the whitelist",
            params: { token: "The token to add to the whitelist" },
          },
          "claim(uint256)": {
            details: "Claims vested tokens for a given vesting schedule",
            params: { vestingId: "The ID of the vesting schedule" },
          },
          "createVestingSchedule(address,address,uint256,uint256,uint256,uint256)":
            {
              details: "Creates a new vesting schedule",
              params: {
                amount: "The total amount to be vested",
                beneficiary: "The beneficiary of the vesting schedule",
                cliffDuration: "The duration of the cliff period in seconds",
                initialReleasePercentage:
                  "The percentage of tokens to release initially",
                token: "The token to be vested",
                vestingDuration:
                  "The total duration of the vesting period in seconds",
              },
              returns: { vestingId: "The ID of the created vesting schedule" },
            },
          "getClaimableAmount(uint256)": {
            details:
              "Gets the amount of tokens that can be claimed from a vesting schedule",
            params: { vestingId: "The ID of the vesting schedule" },
            returns: { _0: "The amount of tokens that can be claimed" },
          },
          "initialize(address,address,address[])": {
            details: "Initializes the contract",
            params: {
              _feeController: "The address of the fee handler contract",
              _initialTokens: "Array of initial whitelisted token addresses",
              initialOwner: "The initial owner of the contract",
            },
          },
          "pauseVesting(uint256)": {
            details: "Pauses a vesting schedule",
            params: { vestingId: "The ID of the vesting schedule to pause" },
          },
          "removeWhitelistedToken(address)": {
            details: "Removes a token from the whitelist",
            params: { token: "The token to remove from the whitelist" },
          },
          "resumeVesting(uint256)": {
            details: "Resumes a paused vesting schedule",
            params: { vestingId: "The ID of the vesting schedule to resume" },
          },
          "revokeVesting(uint256)": {
            details: "Revokes a vesting schedule",
            params: { vestingId: "The ID of the vesting schedule to revoke" },
          },
          "setfeeController(address)": {
            details: "Updates the fee handler contract address",
            params: {
              _newfeeController: "The address of the new fee handler contract",
            },
          },
        },
        version: 1,
      },
      userdoc: { kind: "user", methods: {}, version: 1 },
    },
    settings: {
      remappings: [
        "@openzeppelin/=lib/openzeppelin-contracts/",
        "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",
        "@uniswap/v2-periphery/=lib/v2-periphery/",
        "@uniswap/v3-core/=lib/v3-core/",
        "@uniswap/v3-periphery/=lib/v3-periphery/",
        "ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/",
        "erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/",
        "forge-std/=lib/forge-std/src/",
        "openzeppelin-contracts/=lib/openzeppelin-contracts/",
        "prb-math/=lib/prb-math/src/",
        "solady/=lib/solady/src/",
        "v2-core/=lib/v2-core/contracts/",
        "v2-periphery/=lib/v2-periphery/contracts/",
        "v3-core/=lib/v3-core/",
        "v3-periphery/=lib/v3-periphery/contracts/",
      ],
      optimizer: { enabled: true, runs: 200 },
      metadata: { bytecodeHash: "ipfs" },
      compilationTarget: { "src/interface/IVestManager.sol": "IVestManager" },
      evmVersion: "paris",
      libraries: {},
    },
    sources: {
      "src/interface/IVestManager.sol": {
        keccak256:
          "0xae4680b60be7450ec5de62641d379eead7ec244bd2bd21f05d7ad63ff104edd3",
        urls: [
          "bzz-raw://affcb3140073e25ecc0a428760f66b5b07979369b3deb7f3797acd14a452a24b",
          "dweb:/ipfs/QmRn31KAd465iUvj54348t25J2fReN1DtDcvz5aAKN6PtP",
        ],
        license: "MIT",
      },
    },
    version: 1,
  },
  id: 32,
};