"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ArrowDownIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { InvoiceManagerABI } from "contracts/InvoiceManager.sol/InvoiceManager";
import { INVOICE_MANAGER_ADDRESS, getAddress } from "contracts/addresses";
import { sepolia } from "viem/chains";
import { useAlert } from "../hooks/useAlert";
import { isAddress } from "viem";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";

const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.2,
      ease: "easeOut",
    },
  }),
};

const tokens = [
  {
    name: "USDC",
    image: "/tokens/USDC.png",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
  },
  {
    name: "DAI",
    image: "/tokens/DAI.png",
    address: "0x552ceaDf3B47609897279F42D3B3309B604896f3",
    decimals: 18,
  },
];

export default function Hero() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [progressStep, setProgressStep] = useState(-1);
  const { alertState, showAlert, dismissAlert } = useAlert();

  const appKit = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: nextInvoiceId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: InvoiceManagerABI,
    functionName: "nextInvoiceId",
  });

  const handleConnect = async () => {
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
  };

  const formatAmount = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts[1]
      ? `.${parts[1].slice(0, selectedToken.decimals)}`
      : "";
    return integerPart + decimalPart;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, "");
    if (!inputValue) {
      setAmount("");
      return;
    }
    setAmount(formatAmount(inputValue));
  };

  const isValidAmount = () => {
    if (!amount) return false;
    const numericAmount = parseFloat(amount.replace(/,/g, ""));
    return numericAmount > 0 && numericAmount <= 100000000;
  };

  const isValidDueDate = () => {
    if (!dueDate) return false;
    const selectedDate = new Date(dueDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return selectedDate >= currentDate;
  };

  const isValidClientAddress = () => {
    return (
      clientAddress &&
      (isAddress(clientAddress) || clientAddress.endsWith(".eth"))
    );
  };

  const handleSubmit = async () => {
    if (!isValidAmount() || !isValidDueDate() || !isValidClientAddress()) {
      showAlert("Please fill out all fields correctly.", "error");
      return;
    }

    if (!address) {
      showAlert("Please connect your wallet first.", "error");
      return;
    }

    setIsLoading(true);
    setProgressStep(0);

    try {
      const parsedAmount = parseUnits(
        amount.replace(/,/g, ""),
        selectedToken.decimals
      );
      const dueDateTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);

      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: InvoiceManagerABI,
        functionName: "createInvoice",
        args: [
          address,
          clientAddress,
          parsedAmount,
          BigInt(dueDateTimestamp),
          selectedToken.address,
        ],
      });

      setProgressStep(1);

      // Create invoice in database
      const invoiceResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: address,
          clientAddress: clientAddress,
          tokenAddress: selectedToken.address,
          amount: parsedAmount.toString(),
          dueDate: new Date(dueDate).toISOString(),
          creationTransactionHash: result,
          invoiceId: nextInvoiceId
            ? (Number(nextInvoiceId) - 1).toString()
            : undefined,
        }),
      });

      if (!invoiceResponse.ok) {
        throw new Error("Failed to create invoice in database");
      }

      showAlert(`Invoice created successfully!`, "success");
      setProgressStep(2);
    } catch (error) {
      console.error("Error creating invoice:", error);
      showAlert(
        `Failed to create invoice: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "error"
      );
      setProgressStep(-1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex flex-col justify-center items-center relative">
      <motion.div className="relative isolate pt-14">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <motion.div className="flex" variants={fadeUpVariant} custom={1}>
              <div className="relative flex items-center gap-x-4 px-4 py-2 text-sm leading-6 text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-full">
                <span className="font-semibold text-kairo-green">Testnet</span>
                <span aria-hidden="true" className="h-4 w-px bg-kairo-green" />
                <a href="/dashboard" className="flex items-center gap-x-1">
                  <span aria-hidden="true" className="absolute inset-0" />
                  Live Now
                  <ChevronRightIcon className="-mr-2 h-5 w-5 text-kairo-green" />
                </a>
              </div>
            </motion.div>

            <motion.div
              className="space-y-3"
              variants={fadeUpVariant}
              custom={2}
            >
              <h1 className="mt-4 max-w-lg text-3xl font-bold tracking-tight text-kairo-white sm:text-6xl">
                Create an instant invoice
              </h1>
              <motion.div className="flex gap-2 place-items-center">
                <ArrowTrendingUpIcon className="w-4 h-4 text-kairo-green" />
                <p className="text-kairo-green">
                  1200 created in the last 24 hours
                </p>
              </motion.div>
            </motion.div>

            <motion.div className="my-8" variants={fadeUpVariant} custom={3}>
              <div className="rounded-lg bg-kairo-black-a20 bg-opacity-30 p-2 space-y-2">
                <div className="p-5 bg-kairo-black-a20 bg-opacity-60 rounded-lg space-y-5">
                  {/* Amount Input Section */}
                  <div className="flex place-content-between">
                    <div className="space-y-2">
                      <h1 className="text-kairo-white font-semibold text-lg">
                        Amount{" "}
                        {!isValidAmount() && (
                          <span className="text-kairo-green ml-1">*</span>
                        )}
                      </h1>
                      <input
                        placeholder="0"
                        value={amount}
                        onChange={handleAmountChange}
                        className="text-zinc-200 text-4xl w-full bg-transparent outline-none placeholder-zinc-200/60"
                      />
                    </div>
                    <Menu
                      as="div"
                      className="relative inline-block text-left my-auto"
                    >
                      <Menu.Button className="p-3 cursor-pointer w-[9rem] bg-kairo-black bg-opacity-40 rounded-full my-auto flex text-lg place-items-center gap-2 text-kairo-white font-bold">
                        <Image
                          src={selectedToken.image}
                          width={30}
                          height={30}
                          alt={selectedToken.name}
                          className="rounded-full"
                        />
                        <span>{selectedToken.name}</span>
                        <ChevronDownIcon className="w-6 h-6 text-kairo-white ml-auto" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute z-50 right-0 mt-2 w-[10rem] origin-top-right divide-y divide-kairo-white rounded-md text-kairo-white bg-kairo-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-1 py-1">
                            {tokens.map((token) => (
                              <Menu.Item key={token.name}>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active
                                        ? "bg-kairo-black-a20 bg-opacity-60 text-kairo-white"
                                        : "text-kairo-white bg-kairo-black bg-opacity-60"
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

                  {/* Due Date Section */}
                  <div className="border-t-[1px] border-zinc-700 py-4 relative">
                    <h1 className="text-kairo-white font-semibold text-lg">
                      Due{" "}
                      {!isValidDueDate() && (
                        <span className="text-kairo-green ml-1">*</span>
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

                {/* Client Address Section */}
                <div className="p-5 bg-kairo-black-a20 bg-opacity-60 rounded-lg relative space-y-2">
                  <h1 className="text-kairo-white font-semibold text-lg">
                    For{" "}
                    {!isValidClientAddress() && (
                      <span className="text-kairo-green ml-1">*</span>
                    )}
                  </h1>
                  <div className="rounded-lg">
                    <input
                      placeholder="0x... or ENS"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="text-zinc-200 text-4xl bg-transparent outline-none w-full placeholder-zinc-200/60"
                    />
                  </div>
                  <ArrowDownIcon className="w-8 h-8 text-kairo-white absolute bg-[#141416] p-2 -top-7 right-1/2 rounded-full" />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={isConnected ? handleSubmit : handleConnect}
                disabled={isLoading || isPending}
                className="w-full mt-4 text-center place-items-center flex items-center gap-x-1 rounded-md text-kairo-green bg-kairo-green-a20 bg-opacity-30 px-3 py-3 text-sm font-semibold shadow-lg hover:bg-kairo-green/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kairo-green disabled:opacity-50"
              >
                <p className="mx-auto text-xl">
                  {isConnected
                    ? isPending
                      ? "Creating Invoice..."
                      : "Create Invoice"
                    : isLoading
                    ? "Connecting..."
                    : "Connect Wallet"}
                </p>
              </motion.button>

              {/* Progress Bar */}
              {progressStep >= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="z-50 mt-12"
                >
                  <div className="bg-zinc-800/50 p-6 rounded-md shadow-lg max-w-2xl mx-auto">
                    <ProgressBar step={progressStep} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Alert */}
      {alertState && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md ${
            alertState.type === "success" ? "bg-green-500" : "bg-kairo-green"
          } text-kairo-white`}
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
