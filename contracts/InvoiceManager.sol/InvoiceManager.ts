export const InvoiceManagerABI = {
  abi: [
    {
      type: "function",
      name: "addWhitelistedToken",
      inputs: [{ name: "_token", type: "address", internalType: "address" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "createInvoice",
      inputs: [
        { name: "issuer", type: "address", internalType: "address" },
        { name: "client", type: "address", internalType: "address" },
        { name: "amount", type: "uint256", internalType: "uint256" },
        { name: "dueDate", type: "uint256", internalType: "uint256" },
        { name: "token", type: "address", internalType: "address" },
      ],
      outputs: [
        { name: "invoiceId", type: "uint256", internalType: "uint256" },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getFeeCollector",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "initialize",
      inputs: [
        {
          name: "_initialTokens",
          type: "address[]",
          internalType: "address[]",
        },
        {
          name: "_minimumDueDatePeriod",
          type: "uint256",
          internalType: "uint256",
        },
        { name: "_feeCollector", type: "address", internalType: "address" },
        {
          name: "_initialFeePercentage",
          type: "uint256",
          internalType: "uint256",
        },
        { name: "_feeController", type: "address", internalType: "address" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "payInvoice",
      inputs: [{ name: "invoiceId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "removeWhitelistedToken",
      inputs: [{ name: "_token", type: "address", internalType: "address" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "setFeeCollector",
      inputs: [
        { name: "_feeCollector", type: "address", internalType: "address" },
      ],
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
      name: "FeeCollected",
      inputs: [
        {
          name: "invoiceId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "feeAmount",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "feeCollector",
          type: "address",
          indexed: true,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "FeePercentageChanged",
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
      name: "FeesWithdrawn",
      inputs: [
        {
          name: "feeCollector",
          type: "address",
          indexed: true,
          internalType: "address",
        },
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
      name: "InvoiceCreated",
      inputs: [
        {
          name: "invoiceId",
          type: "uint256",
          indexed: true,
          internalType: "uint256",
        },
        {
          name: "issuer",
          type: "address",
          indexed: true,
          internalType: "address",
        },
        {
          name: "client",
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
        {
          name: "dueDate",
          type: "uint256",
          indexed: false,
          internalType: "uint256",
        },
        {
          name: "token",
          type: "address",
          indexed: false,
          internalType: "address",
        },
      ],
      anonymous: false,
    },
    {
      type: "event",
      name: "InvoicePaid",
      inputs: [
        {
          name: "invoiceId",
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
    { type: "error", name: "InvalidAddress", inputs: [] },
    { type: "error", name: "InvalidAmount", inputs: [] },
    { type: "error", name: "InvalidDueDate", inputs: [] },
    { type: "error", name: "InvalidFeePercentage", inputs: [] },
    { type: "error", name: "InvoiceAlreadyPaid", inputs: [] },
    { type: "error", name: "InvoiceDoesNotExist", inputs: [] },
    { type: "error", name: "NoFeesToWithdraw", inputs: [] },
    { type: "error", name: "NotFeeCollector", inputs: [] },
    {
      type: "error",
      name: "TokenNotWhitelisted",
      inputs: [{ name: "token", type: "address", internalType: "address" }],
    },
    { type: "error", name: "UnauthorizedPayment", inputs: [] },
    { type: "error", name: "ZeroAddress", inputs: [] },
  ],
  bytecode: { object: "0x", sourceMap: "", linkReferences: {} },
  deployedBytecode: { object: "0x", sourceMap: "", linkReferences: {} },
  methodIdentifiers: {
    "addWhitelistedToken(address)": "363cb34d",
    "createInvoice(address,address,uint256,uint256,address)": "58fd3d06",
    "getFeeCollector()": "12fde4b7",
    "initialize(address[],uint256,address,uint256,address)": "0f3c80b2",
    "payInvoice(uint256)": "ac60a6cd",
    "removeWhitelistedToken(address)": "1c88705d",
    "setFeeCollector(address)": "a42dce80",
    "setfeeController(address)": "7ebea301",
  },
  rawMetadata:
    '{"compiler":{"version":"0.8.28+commit.7893614a"},"language":"Solidity","output":{"abi":[{"inputs":[],"name":"InvalidAddress","type":"error"},{"inputs":[],"name":"InvalidAmount","type":"error"},{"inputs":[],"name":"InvalidDueDate","type":"error"},{"inputs":[],"name":"InvalidFeePercentage","type":"error"},{"inputs":[],"name":"InvoiceAlreadyPaid","type":"error"},{"inputs":[],"name":"InvoiceDoesNotExist","type":"error"},{"inputs":[],"name":"NoFeesToWithdraw","type":"error"},{"inputs":[],"name":"NotFeeCollector","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"TokenNotWhitelisted","type":"error"},{"inputs":[],"name":"UnauthorizedPayment","type":"error"},{"inputs":[],"name":"ZeroAddress","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"invoiceId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"feeAmount","type":"uint256"},{"indexed":true,"internalType":"address","name":"feeCollector","type":"address"}],"name":"FeeCollected","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFeePercentage","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFeePercentage","type":"uint256"}],"name":"FeePercentageChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"feeCollector","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"FeesWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"invoiceId","type":"uint256"},{"indexed":true,"internalType":"address","name":"issuer","type":"address"},{"indexed":true,"internalType":"address","name":"client","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"dueDate","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"InvoiceCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"invoiceId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"InvoicePaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"TokenRemovedFromWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"TokenWhitelisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldfeeController","type":"address"},{"indexed":true,"internalType":"address","name":"newfeeController","type":"address"}],"name":"feeControllerUpdated","type":"event"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"addWhitelistedToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"issuer","type":"address"},{"internalType":"address","name":"client","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"dueDate","type":"uint256"},{"internalType":"address","name":"token","type":"address"}],"name":"createInvoice","outputs":[{"internalType":"uint256","name":"invoiceId","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getFeeCollector","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"_initialTokens","type":"address[]"},{"internalType":"uint256","name":"_minimumDueDatePeriod","type":"uint256"},{"internalType":"address","name":"_feeCollector","type":"address"},{"internalType":"uint256","name":"_initialFeePercentage","type":"uint256"},{"internalType":"address","name":"_feeController","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"invoiceId","type":"uint256"}],"name":"payInvoice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"removeWhitelistedToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeCollector","type":"address"}],"name":"setFeeCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newfeeController","type":"address"}],"name":"setfeeController","outputs":[],"stateMutability":"nonpayable","type":"function"}],"devdoc":{"details":"Interface for the InvoiceManager contract, which manages invoice creation and payment.","errors":{"InvalidAmount()":[{"details":"Error thrown when the amount is invalid"}],"InvalidDueDate()":[{"details":"Error thrown when the due date is invalid"}],"InvalidFeePercentage()":[{"details":"Error thrown when setting an invalid fee percentage"}],"InvoiceAlreadyPaid()":[{"details":"Error thrown when the invoice is already paid"}],"InvoiceDoesNotExist()":[{"details":"Error thrown when an invoice does not exist"}],"NoFeesToWithdraw()":[{"details":"Error thrown when there are no fees to withdraw"}],"NotFeeCollector()":[{"details":"Error thrown when not the fee collector"}],"TokenNotWhitelisted(address)":[{"details":"Error thrown when a token is not whitelisted"}],"UnauthorizedPayment()":[{"details":"Error thrown when the payment is unauthorized"}],"ZeroAddress()":[{"details":"Error thrown when the address is zero"}]},"events":{"FeeCollected(uint256,uint256,address)":{"details":"Emitted when a fee is collected","params":{"feeAmount":"The amount of fee collected","feeCollector":"The address receiving the fee","invoiceId":"The unique identifier of the invoice"}},"FeePercentageChanged(uint256,uint256)":{"details":"Emitted when the fee percentage is changed","params":{"newFeePercentage":"The new fee percentage","oldFeePercentage":"The previous fee percentage"}},"FeesWithdrawn(address,address,uint256)":{"details":"Emitted when fees are withdrawn","params":{"amount":"The amount of fees withdrawn","feeCollector":"The address that withdrew the fees","token":"The token address of the withdrawn fees"}},"InvoiceCreated(uint256,address,address,uint256,uint256,address)":{"details":"Emitted when a new invoice is created","params":{"amount":"The amount of the invoice","client":"The client of the invoice","dueDate":"The due date of the invoice","invoiceId":"The unique identifier of the created invoice","issuer":"The issuer of the invoice","token":"The token associated with the invoice"}},"InvoicePaid(uint256,uint256,address)":{"details":"Emitted when an invoice is paid","params":{"amount":"The amount paid for the invoice","invoiceId":"The unique identifier of the paid invoice","token":"The token associated with the invoice"}},"TokenRemovedFromWhitelist(address)":{"details":"Emitted when a token is removed from the whitelist","params":{"token":"The removed token"}},"TokenWhitelisted(address)":{"details":"Emitted when a token is whitelisted","params":{"token":"The whitelisted token"}},"feeControllerUpdated(address,address)":{"details":"Emitted when the fee handler contract address is updated","params":{"newfeeController":"The address of the new fee handler contract","oldfeeController":"The address of the old fee handler contract"}}},"kind":"dev","methods":{"addWhitelistedToken(address)":{"details":"Adds a token to the whitelist","params":{"_token":"The token to add"}},"createInvoice(address,address,uint256,uint256,address)":{"details":"Creates a new invoice","params":{"amount":"The amount of the invoice","client":"The client of the invoice","dueDate":"The due date of the invoice","issuer":"The issuer of the invoice","token":"The token associated with the invoice"}},"getFeeCollector()":{"details":"Gets the current fee collector address","returns":{"_0":"The address of the current fee collector"}},"initialize(address[],uint256,address,uint256,address)":{"details":"Initializes the contract","params":{"_feeCollector":"The address to collect fees","_feeController":"The address of the fee handler contract","_initialFeePercentage":"The initial fee percentage (in basis points, e.g., 100 = 1%)","_initialTokens":"Array of initial tokens to whitelist","_minimumDueDatePeriod":"Minimum due date period in seconds"}},"payInvoice(uint256)":{"details":"Pays an existing invoice","params":{"invoiceId":"The unique identifier of the invoice to pay"}},"removeWhitelistedToken(address)":{"details":"Removes a token from the whitelist","params":{"_token":"The token to remove"}},"setFeeCollector(address)":{"details":"Sets the fee collector address","params":{"_feeCollector":"The address to collect fees"}},"setfeeController(address)":{"details":"Sets the fee handler contract address","params":{"_newfeeController":"The address of the new fee handler contract"}}},"title":"IInvoiceManager","version":1},"userdoc":{"kind":"user","methods":{},"version":1}},"settings":{"compilationTarget":{"src/interface/IInvoiceManager.sol":"IInvoiceManager"},"evmVersion":"paris","libraries":{},"metadata":{"bytecodeHash":"ipfs"},"optimizer":{"enabled":true,"runs":200},"remappings":[":@openzeppelin/=lib/openzeppelin-contracts/",":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",":@uniswap/v2-periphery/=lib/v2-periphery/",":@uniswap/v3-core/=lib/v3-core/",":@uniswap/v3-periphery/=lib/v3-periphery/",":ds-test/=lib/openzeppelin-contracts/lib/forge-std/lib/ds-test/src/",":erc4626-tests/=lib/openzeppelin-contracts/lib/erc4626-tests/",":forge-std/=lib/forge-std/src/",":openzeppelin-contracts/=lib/openzeppelin-contracts/",":prb-math/=lib/prb-math/src/",":solady/=lib/solady/src/",":v2-core/=lib/v2-core/contracts/",":v2-periphery/=lib/v2-periphery/contracts/",":v3-core/=lib/v3-core/",":v3-periphery/=lib/v3-periphery/contracts/"]},"sources":{"src/interface/IInvoiceManager.sol":{"keccak256":"0x43ed524f7669cf9f248d0fff0642ebdbda1869f4935c8b4839315d782d8c4ca7","license":"MIT","urls":["bzz-raw://b61af7c8e4d53d3313ae063e40c5ad25bc6a50cb84bc551955f6e45c34e2efeb","dweb:/ipfs/QmX9JaFkPQHp2o3QVDWg1BhG2oUDeWDq91hAKgH6jwctcF"]}},"version":1}',
  metadata: {
    compiler: { version: "0.8.28+commit.7893614a" },
    language: "Solidity",
    output: {
      abi: [
        { inputs: [], type: "error", name: "InvalidAddress" },
        { inputs: [], type: "error", name: "InvalidAmount" },
        { inputs: [], type: "error", name: "InvalidDueDate" },
        { inputs: [], type: "error", name: "InvalidFeePercentage" },
        { inputs: [], type: "error", name: "InvoiceAlreadyPaid" },
        { inputs: [], type: "error", name: "InvoiceDoesNotExist" },
        { inputs: [], type: "error", name: "NoFeesToWithdraw" },
        { inputs: [], type: "error", name: "NotFeeCollector" },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          type: "error",
          name: "TokenNotWhitelisted",
        },
        { inputs: [], type: "error", name: "UnauthorizedPayment" },
        { inputs: [], type: "error", name: "ZeroAddress" },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "invoiceId",
              type: "uint256",
              indexed: true,
            },
            {
              internalType: "uint256",
              name: "feeAmount",
              type: "uint256",
              indexed: false,
            },
            {
              internalType: "address",
              name: "feeCollector",
              type: "address",
              indexed: true,
            },
          ],
          type: "event",
          name: "FeeCollected",
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
          name: "FeePercentageChanged",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "feeCollector",
              type: "address",
              indexed: true,
            },
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
              internalType: "uint256",
              name: "invoiceId",
              type: "uint256",
              indexed: true,
            },
            {
              internalType: "address",
              name: "issuer",
              type: "address",
              indexed: true,
            },
            {
              internalType: "address",
              name: "client",
              type: "address",
              indexed: true,
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
              indexed: false,
            },
            {
              internalType: "uint256",
              name: "dueDate",
              type: "uint256",
              indexed: false,
            },
            {
              internalType: "address",
              name: "token",
              type: "address",
              indexed: false,
            },
          ],
          type: "event",
          name: "InvoiceCreated",
          anonymous: false,
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "invoiceId",
              type: "uint256",
              indexed: true,
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
              indexed: false,
            },
            {
              internalType: "address",
              name: "token",
              type: "address",
              indexed: true,
            },
          ],
          type: "event",
          name: "InvoicePaid",
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
          inputs: [
            { internalType: "address", name: "_token", type: "address" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "addWhitelistedToken",
        },
        {
          inputs: [
            { internalType: "address", name: "issuer", type: "address" },
            { internalType: "address", name: "client", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "uint256", name: "dueDate", type: "uint256" },
            { internalType: "address", name: "token", type: "address" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "createInvoice",
          outputs: [
            { internalType: "uint256", name: "invoiceId", type: "uint256" },
          ],
        },
        {
          inputs: [],
          stateMutability: "view",
          type: "function",
          name: "getFeeCollector",
          outputs: [{ internalType: "address", name: "", type: "address" }],
        },
        {
          inputs: [
            {
              internalType: "address[]",
              name: "_initialTokens",
              type: "address[]",
            },
            {
              internalType: "uint256",
              name: "_minimumDueDatePeriod",
              type: "uint256",
            },
            { internalType: "address", name: "_feeCollector", type: "address" },
            {
              internalType: "uint256",
              name: "_initialFeePercentage",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "_feeController",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "initialize",
        },
        {
          inputs: [
            { internalType: "uint256", name: "invoiceId", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "payInvoice",
        },
        {
          inputs: [
            { internalType: "address", name: "_token", type: "address" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "removeWhitelistedToken",
        },
        {
          inputs: [
            { internalType: "address", name: "_feeCollector", type: "address" },
          ],
          stateMutability: "nonpayable",
          type: "function",
          name: "setFeeCollector",
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
            params: { _token: "The token to add" },
          },
          "createInvoice(address,address,uint256,uint256,address)": {
            details: "Creates a new invoice",
            params: {
              amount: "The amount of the invoice",
              client: "The client of the invoice",
              dueDate: "The due date of the invoice",
              issuer: "The issuer of the invoice",
              token: "The token associated with the invoice",
            },
          },
          "getFeeCollector()": {
            details: "Gets the current fee collector address",
            returns: { _0: "The address of the current fee collector" },
          },
          "initialize(address[],uint256,address,uint256,address)": {
            details: "Initializes the contract",
            params: {
              _feeCollector: "The address to collect fees",
              _feeController: "The address of the fee handler contract",
              _initialFeePercentage:
                "The initial fee percentage (in basis points, e.g., 100 = 1%)",
              _initialTokens: "Array of initial tokens to whitelist",
              _minimumDueDatePeriod: "Minimum due date period in seconds",
            },
          },
          "payInvoice(uint256)": {
            details: "Pays an existing invoice",
            params: {
              invoiceId: "The unique identifier of the invoice to pay",
            },
          },
          "removeWhitelistedToken(address)": {
            details: "Removes a token from the whitelist",
            params: { _token: "The token to remove" },
          },
          "setFeeCollector(address)": {
            details: "Sets the fee collector address",
            params: { _feeCollector: "The address to collect fees" },
          },
          "setfeeController(address)": {
            details: "Sets the fee handler contract address",
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
      compilationTarget: {
        "src/interface/IInvoiceManager.sol": "IInvoiceManager",
      },
      evmVersion: "paris",
      libraries: {},
    },
    sources: {
      "src/interface/IInvoiceManager.sol": {
        keccak256:
          "0x43ed524f7669cf9f248d0fff0642ebdbda1869f4935c8b4839315d782d8c4ca7",
        urls: [
          "bzz-raw://b61af7c8e4d53d3313ae063e40c5ad25bc6a50cb84bc551955f6e45c34e2efeb",
          "dweb:/ipfs/QmX9JaFkPQHp2o3QVDWg1BhG2oUDeWDq91hAKgH6jwctcF",
        ],
        license: "MIT",
      },
    },
    version: 1,
  },
  id: 30,
};
