export const FeeControllerABI = [
  {
    abi: [
      {
        type: "function",
        name: "getFeeStats",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [{ name: "fees", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "initialize",
        inputs: [
          { name: "initialOwner", type: "address", internalType: "address" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "processFee",
        inputs: [
          { name: "token", type: "address", internalType: "address" },
          { name: "amount", type: "uint256", internalType: "uint256" },
        ],
        outputs: [
          { name: "feeAmount", type: "uint256", internalType: "uint256" },
        ],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "setAuthorizedCaller",
        inputs: [
          { name: "caller", type: "address", internalType: "address" },
          { name: "authorized", type: "bool", internalType: "bool" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "setFeePercentage",
        inputs: [
          {
            name: "newFeePercentage",
            type: "uint256",
            internalType: "uint256",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "setPaused",
        inputs: [{ name: "_paused", type: "bool", internalType: "bool" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "function",
        name: "withdrawFees",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "event",
        name: "AuthorizedCallerSet",
        inputs: [
          {
            name: "caller",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "authorized",
            type: "bool",
            indexed: false,
            internalType: "bool",
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "FeePercentageUpdated",
        inputs: [
          {
            name: "oldFeePercentage",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
          {
            name: "newFeePercentage",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "FeeProcessed",
        inputs: [
          {
            name: "token",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "feeAmount",
            type: "uint256",
            indexed: false,
            internalType: "uint256",
          },
        ],
        anonymous: false,
      },
      {
        type: "event",
        name: "FeesWithdrawn",
        inputs: [
          {
            name: "token",
            type: "address",
            indexed: true,
            internalType: "address",
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
        name: "PauseStateChanged",
        inputs: [
          {
            name: "paused",
            type: "bool",
            indexed: false,
            internalType: "bool",
          },
        ],
        anonymous: false,
      },
      { type: "error", name: "ContractPaused", inputs: [] },
      { type: "error", name: "InvalidAddress", inputs: [] },
      { type: "error", name: "InvalidFeePercentage", inputs: [] },
      { type: "error", name: "UnauthorizedCaller", inputs: [] },
    ],
    bytecode: { object: "0x", sourceMap: "", linkReferences: {} },
    deployedBytecode: { object: "0x", sourceMap: "", linkReferences: {} },
    methodIdentifiers: {
      "getFeeStats(address)": "2a1c5342",
      "initialize(address)": "c4d66de8",
      "processFee(address,uint256)": "28634b5d",
      "setAuthorizedCaller(address,bool)": "454bbd29",
      "setFeePercentage(uint256)": "ae06c1b7",
      "setPaused(bool)": "16c38b3c",
      "withdrawFees(address)": "164e68de",
    },
    rawMetadata:
      '{"compiler":{"version":"0.8.28+commit.7893614a"},"language":"Solidity","output":{"abi":[{"inputs":[],"name":"ContractPaused","type":"error"},{"inputs":[],"name":"InvalidAddress","type":"error"},{"inputs":[],"name":"InvalidFeePercentage","type":"error"},{"inputs":[],"name":"UnauthorizedCaller","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"bool","name":"authorized","type":"bool"}],"name":"AuthorizedCallerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFeePercentage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFeePercentage","type":"uint256"}],"name":"FeePercentageUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"feeAmount","type":"uint256"}],"name":"FeeProcessed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FeesWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"paused","type":"bool"}],"name":"PauseStateChanged","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"getFeeStats","outputs":[{"internalType":"uint256","name":"fees","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"processFee","outputs":[{"internalType":"uint256","name":"feeAmount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"caller","type":"address"},{"internalType":"bool","name":"authorized","type":"bool"}],"name":"setAuthorizedCaller","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFeePercentage","type":"uint256"}],"name":"setFeePercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_paused","type":"bool"}],"name":"setPaused","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"}],"devdoc":{"details":"Interface for the feeController contract, which manages protocol fees across multiple contracts and tokens.      Provides functionality for fee processing, withdrawal, and management.","events":{"AuthorizedCallerSet(address,bool)":{"details":"Emitted when a caller\'s authorization status is updated","params":{"authorized":"The new authorization status","caller":"The address of the caller being authorized/unauthorized"}},"FeePercentageUpdated(uint256,uint256)":{"details":"Emitted when the fee percentage is updated","params":{"newFeePercentage":"The new fee percentage","oldFeePercentage":"The previous fee percentage"}},"FeeProcessed(address,uint256)":{"details":"Emitted when a fee is processed","params":{"feeAmount":"Amount of fee collected","token":"The token the fee was paid in"}},"FeesWithdrawn(address,uint256)":{"details":"Emitted when fees are withdrawn by the owner","params":{"amount":"Amount withdrawn","token":"The token withdrawn"}},"PauseStateChanged(bool)":{"details":"Emitted when the contract\'s pause state is changed","params":{"paused":"The new pause state"}}},"kind":"dev","methods":{"getFeeStats(address)":{"details":"Gets total fees collected for a specific token","params":{"token":"The token to get stats for"},"returns":{"fees":"Total fees collected for the token"}},"initialize(address)":{"details":"Initializes the contract with an owner","params":{"initialOwner":"The address that will own the contract"}},"processFee(address,uint256)":{"details":"Processes protocol fees for a given token and amount","params":{"amount":"The amount to calculate fees from","token":"The token to process fees for"},"returns":{"feeAmount":"The calculated fee amount"}},"setAuthorizedCaller(address,bool)":{"details":"Sets whether an address is authorized to process fees","params":{"authorized":"The authorization status to set","caller":"The address to authorize/unauthorize"}},"setFeePercentage(uint256)":{"details":"Updates the fee percentage. Only callable by owner.","params":{"newFeePercentage":"The new fee percentage (in WAD)"}},"setPaused(bool)":{"details":"Sets the paused state of the contract","params":{"_paused":"The new pause state"}},"withdrawFees(address)":{"details":"Withdraws collected fees to the owner","params":{"token":"The token to withdraw fees for"}}},"title":"IFeeController","version":1},"userdoc":{"kind":"user","methods":{"processFee(address,uint256)":{"notice":"Only authorized callers can process fees"},"setFeePercentage(uint256)":{"notice":"Fee percentage cannot exceed MAX_FEE_PERCENTAGE (5%)"},"withdrawFees(address)":{"notice":"Only callable by owner"}},"version":1}},"settings":{"compilationTarget":{"src/interface/IFeeController.sol":"IFeeController"},"evmVersion":"paris","libraries":{},"metadata":{"bytecodeHash":"ipfs"},"optimizer":{"enabled":true,"runs":200},"remappings":[":@openzeppelin/=lib/openzeppelin-contracts/",":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",":@uniswap/v2-periphery/=lib/v2-periphery/",":@uniswap/v3-core/=lib/v3-core/",":@uniswap/v3-periphery/=lib/v3-periphery/",":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/",":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/",":forge-std/=lib/forge-std/src/",":openzeppelin-contracts/=lib/openzeppelin-contracts/",":prb-math/=lib/prb-math/src/",":solady/=lib/solady/src/",":v2-core/=lib/v2-core/contracts/",":v2-periphery/=lib/v2-periphery/contracts/",":v3-core/=lib/v3-core/",":v3-periphery/=lib/v3-periphery/contracts/"]},"sources":{"src/interface/IFeeController.sol":{"keccak256":"0xda4d7e38d0a7c6f9ae9662d57cf9259da75c26961cd10559ccf1b5eda7522ab0","license":"MIT","urls":["bzz-raw://df9bf994e690c53b8795650348100e9c6aa995ccd3769149adb05987a45fa090","dweb:/ipfs/QmZfkYmbsogboACLmevqgXc5qdpZ4xkww7WDM84tMF85wJ"]}},"version":1}',
    metadata: {
      compiler: { version: "0.8.28+commit.7893614a" },
      language: "Solidity",
      output: {
        abi: [
          { inputs: [], type: "error", name: "ContractPaused" },
          { inputs: [], type: "error", name: "InvalidAddress" },
          { inputs: [], type: "error", name: "InvalidFeePercentage" },
          { inputs: [], type: "error", name: "UnauthorizedCaller" },
          {
            inputs: [
              {
                internalType: "address",
                name: "caller",
                type: "address",
                indexed: true,
              },
              {
                internalType: "bool",
                name: "authorized",
                type: "bool",
                indexed: false,
              },
            ],
            type: "event",
            name: "AuthorizedCallerSet",
            anonymous: false,
          },
          {
            inputs: [
              {
                internalType: "uint256",
                name: "oldFeePercentage",
                type: "uint256",
                indexed: false,
              },
              {
                internalType: "uint256",
                name: "newFeePercentage",
                type: "uint256",
                indexed: false,
              },
            ],
            type: "event",
            name: "FeePercentageUpdated",
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
              {
                internalType: "uint256",
                name: "feeAmount",
                type: "uint256",
                indexed: false,
              },
            ],
            type: "event",
            name: "FeeProcessed",
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
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
                indexed: false,
              },
            ],
            type: "event",
            name: "FeesWithdrawn",
            anonymous: false,
          },
          {
            inputs: [
              {
                internalType: "bool",
                name: "paused",
                type: "bool",
                indexed: false,
              },
            ],
            type: "event",
            name: "PauseStateChanged",
            anonymous: false,
          },
          {
            inputs: [
              { internalType: "address", name: "token", type: "address" },
            ],
            stateMutability: "view",
            type: "function",
            name: "getFeeStats",
            outputs: [
              { internalType: "uint256", name: "fees", type: "uint256" },
            ],
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "initialOwner",
                type: "address",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
            name: "initialize",
          },
          {
            inputs: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            stateMutability: "nonpayable",
            type: "function",
            name: "processFee",
            outputs: [
              { internalType: "uint256", name: "feeAmount", type: "uint256" },
            ],
          },
          {
            inputs: [
              { internalType: "address", name: "caller", type: "address" },
              { internalType: "bool", name: "authorized", type: "bool" },
            ],
            stateMutability: "nonpayable",
            type: "function",
            name: "setAuthorizedCaller",
          },
          {
            inputs: [
              {
                internalType: "uint256",
                name: "newFeePercentage",
                type: "uint256",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
            name: "setFeePercentage",
          },
          {
            inputs: [{ internalType: "bool", name: "_paused", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function",
            name: "setPaused",
          },
          {
            inputs: [
              { internalType: "address", name: "token", type: "address" },
            ],
            stateMutability: "nonpayable",
            type: "function",
            name: "withdrawFees",
          },
        ],
        devdoc: {
          kind: "dev",
          methods: {
            "getFeeStats(address)": {
              details: "Gets total fees collected for a specific token",
              params: { token: "The token to get stats for" },
              returns: { fees: "Total fees collected for the token" },
            },
            "initialize(address)": {
              details: "Initializes the contract with an owner",
              params: {
                initialOwner: "The address that will own the contract",
              },
            },
            "processFee(address,uint256)": {
              details: "Processes protocol fees for a given token and amount",
              params: {
                amount: "The amount to calculate fees from",
                token: "The token to process fees for",
              },
              returns: { feeAmount: "The calculated fee amount" },
            },
            "setAuthorizedCaller(address,bool)": {
              details: "Sets whether an address is authorized to process fees",
              params: {
                authorized: "The authorization status to set",
                caller: "The address to authorize/unauthorize",
              },
            },
            "setFeePercentage(uint256)": {
              details: "Updates the fee percentage. Only callable by owner.",
              params: { newFeePercentage: "The new fee percentage (in WAD)" },
            },
            "setPaused(bool)": {
              details: "Sets the paused state of the contract",
              params: { _paused: "The new pause state" },
            },
            "withdrawFees(address)": {
              details: "Withdraws collected fees to the owner",
              params: { token: "The token to withdraw fees for" },
            },
          },
          version: 1,
        },
        userdoc: {
          kind: "user",
          methods: {
            "processFee(address,uint256)": {
              notice: "Only authorized callers can process fees",
            },
            "setFeePercentage(uint256)": {
              notice: "Fee percentage cannot exceed MAX_FEE_PERCENTAGE (5%)",
            },
            "withdrawFees(address)": { notice: "Only callable by owner" },
          },
          version: 1,
        },
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
        compilationTarget: {
          "src/interface/IFeeController.sol": "IFeeController",
        },
        evmVersion: "paris",
        libraries: {},
      },
      sources: {
        "src/interface/IFeeController.sol": {
          keccak256:
            "0xda4d7e38d0a7c6f9ae9662d57cf9259da75c26961cd10559ccf1b5eda7522ab0",
          urls: [
            "bzz-raw://df9bf994e690c53b8795650348100e9c6aa995ccd3769149adb05987a45fa090",
            "dweb:/ipfs/QmZfkYmbsogboACLmevqgXc5qdpZ4xkww7WDM84tMF85wJ",
          ],
          license: "MIT",
        },
      },
      version: 1,
    },
    id: 29,
  },
];
