"use client";

import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  ArrowDownIcon,
  ChevronDownIcon,
  UserPlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
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
import Spinner from "./Spinner";
import AlertMessage from "./AlertMessage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CONTRACT_ADDRESS = getAddress(INVOICE_MANAGER_ADDRESS, sepolia.id);

const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.15,
      ease: [0.42, 0, 0.58, 1],
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

const Bubble = ({
  size,
  position,
  delay,
}: {
  size: number;
  position: { x: number; y: number };
  delay: number;
}) => {
  const randomMovement = 15; // Maximum distance the bubble can move in any direction

  return (
    <motion.div
      className="absolute rounded-full bg-kairo-green/10 cursor-pointer backdrop-blur-sm"
      style={{
        width: size,
        height: size,
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1],
        x: [0, randomMovement, -randomMovement, 0],
        y: [0, -randomMovement, randomMovement, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      whileHover={{
        scale: 1.5,
        opacity: 0.3,
        transition: { duration: 0.3 },
      }}
      whileTap={{
        scale: 0.8,
        opacity: 0.4,
      }}
      drag
      dragConstraints={{
        left: -50,
        right: 50,
        top: -50,
        bottom: 50,
      }}
      dragElastic={0.1}
    />
  );
};

const BackgroundGradient = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient based on mouse position
      const gradient = ctx.createRadialGradient(
        mousePosition.current.x,
        mousePosition.current.y,
        0,
        mousePosition.current.x,
        mousePosition.current.y,
        300
      );

      // Using kairo-green with different opacity levels
      gradient.addColorStop(0, "rgba(137, 249, 94, 0.03)");
      gradient.addColorStop(0.5, "rgba(137, 249, 94, 0.02)");
      gradient.addColorStop(1, "rgba(137, 249, 94, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

const getCreateButtonText = (
  isConnected: boolean,
  isLoading: boolean,
  isPending: boolean,
  progressStep: number
) => {
  if (!isConnected) {
    return isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <Spinner inline size={15} />
        <span>Connecting...</span>
      </span>
    ) : (
      "Connect Wallet"
    );
  }

  switch (progressStep) {
    case 0:
      return (
        <span className="flex items-center justify-center gap-2">
          <Spinner inline size={15} />
          <span>Creating Invoice...</span>
        </span>
      );
    case 1:
      return (
        <span className="flex items-center justify-center gap-2">
          <Spinner inline size={15} />
          <span>Confirming Transaction...</span>
        </span>
      );
    case 2:
      return (
        <span className="flex items-center justify-center gap-2">
          <Spinner inline size={15} />
          <span>Finalizing...</span>
        </span>
      );
    default:
      return isPending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner inline size={15} />
          <span>Creating Invoice...</span>
        </span>
      ) : (
        "Create Invoice"
      );
  }
};

interface MenuItemProps {
  active: boolean;
}

interface Contact {
  id: string;
  name: string;
  address: string;
}

// Add this helper function at the top level
const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Update the CustomInput component to use the imported forwardRef
const CustomInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ value, onClick, onChange, placeholder }, ref) => (
  <input
    ref={ref}
    value={value}
    onChange={onChange}
    onClick={onClick}
    placeholder={placeholder}
    className="text-kairo-white text-4xl font-medium bg-transparent w-full outline-none cursor-pointer focus:text-kairo-green transition-colors duration-200 placeholder-kairo-white/40 focus:placeholder-kairo-white/20"
  />
));

CustomInput.displayName = "CustomInput";

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDate] = useState(new Date());
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [progressStep, setProgressStep] = useState(-1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const { alertState, showAlert, dismissAlert } = useAlert();
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);

  const appKit = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: nextInvoiceId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: InvoiceManagerABI,
    functionName: "nextInvoiceId",
  });

  useEffect(() => {
    const fetchInvoiceCount = async () => {
      try {
        const response = await fetch("/api/invoices/count?period=last24hours");
        if (!response.ok) {
          throw new Error("Failed to fetch invoice count");
        }
        const data = await response.json();
        setInvoiceCount(data.count);
      } catch (error) {
        console.error("Error fetching invoice count:", error);
      }
    };

    fetchInvoiceCount();
  }, []);

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

  const router = useRouter();

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

      const invoiceId = nextInvoiceId
        ? (Number(nextInvoiceId) - 1).toString()
        : undefined;

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
          invoiceId,
        }),
      });

      if (!invoiceResponse.ok) {
        throw new Error("Failed to create invoice in database");
      }

      showAlert(`Invoice created successfully!`, "success");
      setProgressStep(2);

      // Reset form and redirect after a short delay
      setTimeout(() => {
        setAmount("");
        setDueDate("");
        setClientAddress("");
        setProgressStep(-1);
        // Redirect to the invoice page
        router.push(`/invoice/${invoiceId}`);
      }, 1500); // Reduced to 1.5 seconds for better UX
    } catch (error: any) {
      console.error("Error creating invoice:", error);

      if (
        error.message.includes("User rejected") ||
        error.message.includes("User denied") ||
        error.message.includes("rejected the request")
      ) {
        showAlert("Transaction cancelled", "error");
        setProgressStep(-1);
        return;
      }

      let errorMessage = "Failed to create invoice. Please try again.";

      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds to create invoice";
      }

      showAlert(errorMessage, "error");
      setProgressStep(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const minDate = currentDate.toISOString().split("T")[0];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!address) return;

      setIsLoadingContacts(true);
      try {
        const response = await fetch(`/api/contacts?address=${address}`);
        if (!response.ok) throw new Error("Failed to fetch contacts");
        const data = await response.json();
        setContacts(data.contacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    if (isConnected) {
      fetchContacts();
    }
  }, [address, isConnected]);

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="mx-auto flex flex-col justify-center items-center relative overflow-hidden">
      <BackgroundGradient />
      <motion.div
        className="relative isolate pt-8 sm:pt-14"
        initial="hidden"
        animate="visible"
        variants={fadeInVariant}
        custom={0}
      >
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <motion.div className="flex" variants={fadeInVariant} custom={1}>
              <div className="relative flex items-center gap-x-4 px-4 py-2 text-sm leading-6 text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-full">
                <span className="font-semibold text-kairo-green">Testnet</span>
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-kairo-green/40"
                />
                <span className="text-kairo-green/80 flex items-center gap-x-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kairo-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-kairo-green"></span>
                  </span>
                  Live
                </span>
              </div>
            </motion.div>

            <motion.div
              className="space-y-3"
              variants={fadeInVariant}
              custom={2}
            >
              <motion.h1
                className="mt-4 max-w-lg text-3xl font-bold tracking-tight text-kairo-white sm:text-6xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Create an instant invoice
              </motion.h1>
              <motion.div
                className="flex gap-2 place-items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ArrowTrendingUpIcon className="w-4 h-4 text-kairo-green" />
                <motion.p
                  className="text-kairo-green font-medium"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {invoiceCount !== null
                    ? `${invoiceCount} created in the last 24 hours`
                    : "Loading..."}
                </motion.p>
              </motion.div>
            </motion.div>

            <motion.div
              className="my-8"
              variants={fadeInVariant}
              custom={3}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="rounded-xl bg-kairo-black-a20/40 p-3 space-y-3 backdrop-blur-sm">
                <div className="p-6 bg-kairo-black-a20/60 rounded-lg space-y-6">
                  {/* Amount Input Section */}
                  <motion.div
                    className="flex place-content-between"
                    variants={fadeInVariant}
                    custom={4}
                  >
                    <div className="space-y-3">
                      <h1 className="text-kairo-white/90 font-medium text-lg flex items-center gap-2">
                        Amount
                        {!isValidAmount() && (
                          <span className="text-kairo-green text-sm">*</span>
                        )}
                      </h1>
                      <input
                        placeholder="0"
                        value={amount}
                        onChange={handleAmountChange}
                        className="text-kairo-white text-4xl font-medium w-full bg-transparent outline-none placeholder-kairo-white/40 focus:placeholder-kairo-white/20"
                      />
                    </div>
                    <Menu
                      as="div"
                      className="relative inline-block text-left my-auto"
                    >
                      <Menu.Button className="p-3 cursor-pointer w-[9rem] bg-kairo-black/40 rounded-full my-auto flex text-lg place-items-center gap-2 text-kairo-white font-medium hover:bg-kairo-black/60 transition-colors duration-200">
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
                        <Menu.Items className="absolute z-50 right-0 mt-2 w-[10rem] origin-top-right divide-y divide-kairo-black-a40 rounded-lg text-kairo-white bg-kairo-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-1 py-1">
                            {tokens.map((token) => (
                              <Menu.Item key={token.name}>
                                {({ active }: MenuItemProps) => (
                                  <button
                                    className={`${
                                      active
                                        ? "bg-kairo-black-a20/60 text-kairo-white"
                                        : "text-kairo-white/90"
                                    } group flex w-full items-center rounded-md px-3 py-2.5 font-bold text-lg transition-colors duration-200`}
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
                  </motion.div>

                  {/* Due Date Section */}
                  <motion.div
                    className="border-t border-kairo-black-a40/50 py-6 relative"
                    variants={fadeInVariant}
                    custom={5}
                  >
                    <h1 className="text-kairo-white/90 font-medium text-lg flex items-center gap-2">
                      Due Date
                      {!isValidDueDate() && (
                        <span className="text-kairo-green text-sm">*</span>
                      )}
                    </h1>
                    <div className="relative rounded-lg mt-3">
                      <DatePicker
                        selected={dueDate ? new Date(dueDate) : null}
                        onChange={(
                          date: Date | null,
                          event?: React.SyntheticEvent
                        ) => {
                          if (date) {
                            setDueDate(date.toISOString().split("T")[0]);
                          }
                        }}
                        dateFormat="MMMM d, yyyy"
                        minDate={new Date()}
                        placeholderText="Select due date"
                        className="w-full"
                        calendarClassName="bg-kairo-black border border-kairo-black-a40 rounded-lg shadow-xl"
                        wrapperClassName="w-full"
                        popperClassName="react-datepicker-popper"
                        popperPlacement="bottom-start"
                        customInput={<CustomInput />}
                        isClearable={false}
                        showPopperArrow={false}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="h-6 w-6 text-kairo-white/60"
                        >
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM19 20H5V10h14v10zM5 8V6h14v2H5z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Client Address Section */}
                <motion.div
                  className="p-6 bg-kairo-black-a20/60 rounded-lg relative"
                  variants={fadeInVariant}
                  custom={6}
                >
                  <h1 className="text-kairo-white/90 font-medium text-lg flex items-center gap-2">
                    Recipient
                    {!isValidClientAddress() && (
                      <span className="text-kairo-green text-sm">*</span>
                    )}
                  </h1>
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1 relative">
                      <input
                        placeholder="0x... or ENS"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="text-kairo-white text-4xl font-medium bg-transparent outline-none w-full placeholder-kairo-white/40 focus:placeholder-kairo-white/20"
                      />
                      {/* Add contact verification indicator */}
                      {/* 
                      {clientAddress &&
                        contacts.some(
                          (contact) =>
                            contact.address.toLowerCase() ===
                            clientAddress.toLowerCase()
                        ) && (
                          <div className="absolute -top-6 left-0 flex items-center gap-2 text-sm text-kairo-green">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Verified Contact</span>
                          </div>
                        )}
                        */}
                      {/* Show contact name if address matches */}
                      {clientAddress &&
                        contacts.find(
                          (contact) =>
                            contact.address.toLowerCase() ===
                            clientAddress.toLowerCase()
                        ) && (
                          <div className="mt-2 text-sm text-kairo-white/60">
                            Contact:{" "}
                            {
                              contacts.find(
                                (contact) =>
                                  contact.address.toLowerCase() ===
                                  clientAddress.toLowerCase()
                              )?.name
                            }
                          </div>
                        )}
                    </div>
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-kairo-black/40 text-kairo-white hover:bg-kairo-black/60 transition-all duration-200">
                        <UserIcon className="w-5 h-5" />
                        <span className="text-sm">Contacts</span>
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
                        <Menu.Items className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-lg bg-kairo-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-1 py-1">
                            {isLoadingContacts ? (
                              <div className="px-4 py-3 text-sm text-kairo-white/70">
                                Loading contacts...
                              </div>
                            ) : contacts.length > 0 ? (
                              contacts.map((contact) => (
                                <Menu.Item key={contact.id}>
                                  {({ active }) => (
                                    <button
                                      className={`${
                                        active
                                          ? "bg-kairo-black-a20/60 text-kairo-white"
                                          : "text-kairo-white/90"
                                      } group flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors duration-200 ${
                                        clientAddress.toLowerCase() ===
                                        contact.address.toLowerCase()
                                          ? "bg-kairo-green/10"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        setClientAddress(contact.address)
                                      }
                                    >
                                      <div className="flex-shrink-0 rounded-full bg-kairo-black-a20/40 p-2">
                                        <UserIcon className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">
                                          {contact.name}
                                        </p>
                                        <p className="text-xs text-kairo-white/70">
                                          {truncateAddress(contact.address)}
                                        </p>
                                      </div>
                                      {clientAddress.toLowerCase() ===
                                        contact.address.toLowerCase() && (
                                        <div className="ml-auto text-kairo-green">
                                          <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        </div>
                                      )}
                                    </button>
                                  )}
                                </Menu.Item>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-kairo-white/70">
                                No contacts found
                              </div>
                            )}
                            <div className="border-t border-kairo-black-a40/50 mt-1 pt-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/contacts"
                                    className={`${
                                      active
                                        ? "bg-kairo-black-a20/60 text-kairo-white"
                                        : "text-kairo-white/90"
                                    } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200`}
                                  >
                                    <UserPlusIcon className="h-5 w-5" />
                                    Manage Contacts
                                  </Link>
                                )}
                              </Menu.Item>
                            </div>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <ArrowDownIcon className="w-8 h-8 text-kairo-white absolute bg-[#141416] p-2 -top-7 right-1/2 rounded-full shadow-lg" />
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={isConnected ? handleSubmit : handleConnect}
                disabled={isLoading || isPending}
                className="w-full mt-4 text-center place-items-center flex items-center justify-center gap-x-2 rounded-lg text-kairo-green bg-kairo-green-a20 bg-opacity-30 px-4 py-3 text-md font-medium shadow-lg hover:bg-kairo-green/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kairo-green disabled:opacity-50 disabled:cursor-not-allowed h-12 transition-all duration-200"
                variants={fadeInVariant}
                custom={7}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                {getCreateButtonText(
                  isConnected,
                  isLoading,
                  isPending,
                  progressStep
                )}
              </motion.button>

              {/* Progress Bar */}
              {progressStep >= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="z-50 mt-12"
                  variants={fadeInVariant}
                  custom={8}
                >
                  <div className="bg-zinc-800/50 p-6 rounded-md shadow-lg max-w-2xl mx-auto">
                    <ProgressBar step={progressStep} />
                  </div>
                </motion.div>
              )}

              {/* Alert */}
              {alertState && (
                <AlertMessage
                  message={alertState.message}
                  type={alertState.type}
                  onDismiss={dismissAlert}
                />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
