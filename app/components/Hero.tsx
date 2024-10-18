"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  ArrowDownIcon,
  ChartBarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useTypingEffect } from "../hooks/useTypingEffect";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { parseEther } from "viem";
import { InvoiceManagerABI } from "contracts/InvoiceManager.sol/InvoiceManager";
import { INVOICE_MANAGER_ADDRESS, getAddress } from "contracts/addresses";
import { sepolia } from "viem/chains";
import { useAlert } from "../hooks/useAlert";
import { isAddress } from "viem";

const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

interface HeroProps {
  lang: string;
  dictionary: any;
}

interface Token {
  name: string;
  image: string;
  address: string;
}

const tokens: Token[] = [
  {
    name: "USDC",
    image: "/tokens/USDC.png",
    address: "0x68194a729C2450ad26072b3D33ADaCbcef39D574",
  },
  {
    name: "DAI",
    image: "/tokens/DAI.png",
    address: "0xda9d4f9b69ac6C22e444eD9aF0CfC043b7a7f53f",
  },
];

export default function Hero({ lang, dictionary }: HeroProps) {
  const [isClient, setIsClient] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const { alertState, showAlert, dismissAlert } = useAlert();

  const animatedText = useTypingEffect(
    ["vitalik.eth", "0x6af23"],
    200,
    4000,
    150
  );

  const appKit = useAppKit();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useContractWrite();

  const { data: nextInvoiceId } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: InvoiceManagerABI,
    functionName: "nextInvoiceId",
  });

  useEffect(() => {
    setIsClient(true);
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const handleConnect = useCallback(async () => {
    if (!isConnected) {
      setIsLoading(true);
      try {
        await appKit.open();
      } catch (error) {
        console.error("Connection error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [appKit, isConnected]);

  const isValidAmount = useCallback(() => {
    if (amount === "") return false;
    const numericAmount = parseInt(amount.replace(/,/g, ""), 10);
    return numericAmount > 0 && numericAmount <= 100000000;
  }, [amount]);

  const isValidDueDate = useCallback(() => {
    if (!dueDate) return false;
    const selectedDate = new Date(dueDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return selectedDate >= currentDate;
  }, [dueDate]);

  const isValidClientAddress = useCallback(() => {
    return (
      clientAddress !== "" &&
      (isAddress(clientAddress) || clientAddress.endsWith(".eth"))
    );
  }, [clientAddress]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    if (value === "") {
      setAmount("");
    } else {
      const numericValue = parseInt(value, 10);

      if (numericValue > 100000000) {
        setAmount("100,000,000");
      } else {
        const formattedValue = numericValue.toLocaleString("en-US");
        setAmount(formattedValue);
      }
    }
  };

  const handleSubmit = async () => {
    if (!isValidAmount() || !isValidDueDate() || !isValidClientAddress()) {
      showAlert("Please fill out all fields correctly.", "error");
      return;
    }

    if (!address || !nextInvoiceId) {
      showAlert("Please connect your wallet first.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const parsedAmount = parseEther(amount.replace(/,/g, ""));
      const dueDateTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);

      console.log("Generating ZK proof");
      const proofResponse = await fetch("/api/createInvoiceHash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: selectedToken.address,
          issuer: address,
          client: clientAddress,
          amount: parsedAmount.toString(),
          dueDate: dueDateTimestamp.toString(),
          nextInvoiceId: nextInvoiceId.toString(),
        }),
      });

      if (!proofResponse.ok) {
        const errorData = await proofResponse.json();
        throw new Error(`Failed to generate proof: ${errorData.error}`);
      }

      const proofData = await proofResponse.json();

      // Call the smart contract
      console.log("Calling smart contract");
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: InvoiceManagerABI,
        functionName: "createInvoice",
        args: [
          {
            zkProof: {
              a: proofData.proof.a,
              b: proofData.proof.b,
              c: proofData.proof.c,
              input: proofData.proof.input,
            },
            token: selectedToken.address,
            dataIdentifier: nextInvoiceId.toString(),
          },
        ],
      });

      console.log("Smart contract call result:", txHash);

      // Create the invoice in the database
      console.log("Creating invoice in database");
      const invoiceResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: address,
          clientAddress: clientAddress,
          tokenAddress: selectedToken.address,
          amount: parsedAmount.toString(),
          dueDate: new Date(dueDate).toISOString(),
          invoiceHash: proofData.output[0],
          status: "Pending",
          nonce: nextInvoiceId.toString(),
          transactionHash: txHash,
        }),
      });

      if (!invoiceResponse.ok) {
        const errorData = await invoiceResponse.json();
        throw new Error(`Failed to create invoice: ${errorData.error}`);
      }

      const invoiceData = await invoiceResponse.json();

      showAlert(
        `Invoice created successfully. Transaction hash: ${txHash}`,
        "success"
      );
    } catch (error) {
      console.error("Error creating invoice:", error);
      showAlert(
        `Failed to create invoice: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const animatedPlaceholder = `${animatedText}${showCursor ? "|" : ""}`;

  // Use dictionary.hero instead of t
  const t = dictionary.hero || {};

  if (!isClient) {
    return <div></div>;
  }

  return (
    <div className="mx-auto flex justify-center">
      <div className="relative isolate pt-14">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 px-4 py-2 text-sm leading-6 dark:text-red-500 bg-red-800 bg-opacity-30 rounded-full text-zinc-600">
                <span className="font-semibold  dark:text-red-500 ">
                  {t.beta || "Testnet"}
                </span>
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-zinc-900/10 dark:bg-red-500"
                />
                <a href="/dashboard" className="flex items-center gap-x-1">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {t.liveNow || "Live Now"}
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="-mr-2 h-5 w-5 text-zinc-400 dark:text-red-500"
                  />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="mt-4 max-w-lg text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
                {t.title || "Create an Invoice"}
              </h1>
              <div className="flex gap-2 place-items-center">
                <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
                <p className="text-red-500">
                  1200 created in the last 24 hours
                </p>
              </div>
            </div>
            <div className="my-8">
              <div className="rounded-lg bg-zinc-800/30 p-2 space-y-2">
                <div className="p-5 bg-zinc-800/60 rounded-lg space-y-5">
                  <div className="flex place-content-between">
                    <div className="space-y-2">
                      <h1 className="text-zinc-500 text-lg">
                        Amount
                        {!isValidAmount() && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h1>
                      <input
                        placeholder="1,000"
                        value={amount}
                        onChange={handleAmountChange}
                        className="text-zinc-200 text-4xl w-1/2 bg-transparent outline-none"
                      />
                    </div>
                    <Menu
                      as="div"
                      className="relative inline-block text-left my-auto"
                    >
                      <div>
                        <Menu.Button className="p-3 cursor-pointer bg-zinc-800 rounded-full my-auto flex text-lg place-items-center gap-2 text-zinc-100 font-bold">
                          <Image
                            src={selectedToken.image}
                            width={30}
                            height={30}
                            alt={selectedToken.name}
                            className="rounded-full"
                          />
                          <span>{selectedToken.name}</span>
                          <ChevronDownIcon className="w-8 h-8 text-zinc-100 bg-zinc-800" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute z-50 right-0 mt-2 w-[10rem] origin-top-right divide-y divide-zinc-100 rounded-md bg-white dark:text-zinc-100 dark:bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-1 py-1">
                            {tokens.map((token) => (
                              <Menu.Item key={token.name}>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active
                                        ? "bg-zinc-500 dark:bg-zinc-700 text-white"
                                        : "text-zinc-900 dark:text-zinc-100"
                                    } group flex w-full items-center rounded-md px-2 py-2 font-bold text-xl`}
                                    onClick={() => setSelectedToken(token)}
                                  >
                                    <Image
                                      src={token.image}
                                      width={32}
                                      height={32}
                                      alt={token.name}
                                      className="mr-2 rounded-full"
                                    />
                                    {token.name}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="border-t-[1px] border-zinc-700 py-4 relative">
                    <h1 className="text-zinc-500 text-lg">
                      Due
                      {!isValidDueDate() && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h1>
                    <div className="relative rounded-lg">
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-zinc-200 text-4xl bg-transparent w-full outline-none cursor-pointer"
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="gray"
                          viewBox="0 0 24 24"
                          className="h-6 w-6"
                        >
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM19 20H5V10h14v10zM5 8V6h14v2H5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-zinc-800/60 rounded-lg relative space-y-2">
                  <h1 className="text-zinc-500 text-lg">
                    For
                    {!isValidClientAddress() && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h1>
                  <div className="rounded-lg">
                    <input
                      placeholder={animatedPlaceholder}
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="text-zinc-200 text-4xl bg-transparent outline-none w-full placeholder-zinc-200/60"
                      onFocus={(e) => (e.target.placeholder = "")}
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          e.target.placeholder = animatedPlaceholder;
                        }
                      }}
                    />
                  </div>
                  <ArrowDownIcon className="w-8 h-8 text-zinc-100 absolute bg-[#141416] p-2 -top-7 right-1/2 rounded-full" />
                </div>
              </div>
              {isConnected ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full mt-4 text-center place-items-center flex items-center gap-x-1 rounded-md text-red-500 bg-red-800 bg-opacity-30 px-3 py-3 text-sm font-semibold shadow-lg hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <p className="mx-auto text-xl">
                    {isLoading ? "Creating Invoice..." : "Create Invoice"}
                  </p>
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full mt-4 text-center place-items-center flex items-center gap-x-1 rounded-md text-red-500 bg-red-800 bg-opacity-30 px-3 py-3 text-sm font-semibold shadow-lg hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <p className="mx-auto text-xl">
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {alertState && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md ${
            alertState.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {alertState.message}
          <button onClick={dismissAlert} className="ml-2 font-bold">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
