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
  ChevronLeftIcon,
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

      // Updated gradient with more subtle white colors
      const gradient = ctx.createRadialGradient(
        mousePosition.current.x,
        mousePosition.current.y,
        0,
        mousePosition.current.x,
        mousePosition.current.y,
        300
      );

      gradient.addColorStop(0, "rgba(255, 255, 255, 0.03)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.015)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

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
      className="fixed inset-0 pointer-events-none opacity-80"
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
    className="text-white text-4xl font-light bg-transparent w-full outline-none cursor-pointer focus:text-white transition-colors duration-200 placeholder-white/20 focus:placeholder-white/40"
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
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <motion.div className="flex" variants={fadeInVariant} custom={1}>
              <div className="relative flex items-center gap-x-4 px-4 py-2 text-sm leading-6 text-white bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <span className="font-medium text-white">Testnet</span>
                <span aria-hidden="true" className="h-4 w-px bg-white/10" />
                <span className="text-white/60 flex items-center gap-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
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
                className="mt-4 text-5xl font-extrabold font-garet tracking-tight text-white"
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
                <ArrowTrendingUpIcon className="w-4 h-4 text-orange-600" />
                <motion.p
                  className="text-orange-600 font-medium"
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
              <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 space-y-3">
                <div className="p-6 bg-black/20 rounded-xl space-y-6 border border-white/5">
                  {/* Amount Input Section */}
                  <motion.div
                    className="flex place-content-between"
                    variants={fadeInVariant}
                    custom={4}
                  >
                    <div className="space-y-3">
                      <h1 className="text-white/60 font-semibold text-sm uppercase tracking-wider">
                        Amount
                        {!isValidAmount() && (
                          <span className="text-orange-600 ml-1">*</span>
                        )}
                      </h1>
                      <input
                        placeholder="0"
                        value={amount}
                        onChange={handleAmountChange}
                        className="text-white text-5xl font-light bg-transparent outline-none w-full placeholder-white/20 focus:placeholder-white/40"
                      />
                    </div>
                    <Menu
                      as="div"
                      className="relative inline-block text-left my-auto"
                    >
                      {({ open }) => (
                        <>
                          <Menu.Button className="inline-flex items-center text-base px-4 py-2 rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10">
                            <Image
                              src={selectedToken.image}
                              width={24}
                              height={24}
                              alt={selectedToken.name}
                              className="rounded-full mr-2"
                            />
                            <span>{selectedToken.name}</span>
                            <ChevronDownIcon
                              className={`w-5 h-5 ml-2 transition ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute z-50 right-0 mt-2 w-48 origin-top-right rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                              <div className="px-1 py-1">
                                {tokens.map((token) => (
                                  <Menu.Item key={token.name}>
                                    {({ active }) => (
                                      <button
                                        className={`${
                                          active ? "bg-white/10" : ""
                                        } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-white/80 transition-all duration-200 ${
                                          selectedToken.name === token.name
                                            ? "text-orange-600"
                                            : "text-white/80"
                                        }`}
                                        onClick={() => setSelectedToken(token)}
                                      >
                                        <Image
                                          src={token.image}
                                          width={24}
                                          height={24}
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
                        </>
                      )}
                    </Menu>
                  </motion.div>

                  {/* Due Date Section */}
                  <motion.div
                    className="border-t border-white/5 pt-6"
                    variants={fadeInVariant}
                    custom={5}
                  >
                    <h1 className="text-white/60 font-semibold text-sm uppercase tracking-wider">
                      Due Date
                      {!isValidDueDate() && (
                        <span className="text-orange-600 ml-1">*</span>
                      )}
                    </h1>
                    <div className="relative rounded-lg mt-3">
                      <DatePicker
                        selected={dueDate ? new Date(dueDate) : null}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setDueDate(date.toISOString().split("T")[0]);
                          }
                        }}
                        dateFormat="MMMM d, yyyy"
                        minDate={new Date()}
                        placeholderText="Select due date"
                        className="w-full"
                        calendarClassName="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl p-2"
                        wrapperClassName="w-full"
                        popperClassName="react-datepicker-popper"
                        popperPlacement="bottom-start"
                        customInput={<CustomInput />}
                        isClearable={false}
                        showPopperArrow={false}
                        dayClassName={(date: Date) => {
                          return date.toDateString() ===
                            new Date().toDateString()
                            ? "text-orange-600"
                            : "text-white/80";
                        }}
                        calendarContainer={({ className, children }) => (
                          <div className={`${className} !font-sans`}>
                            {children}
                          </div>
                        )}
                        renderCustomHeader={({
                          date,
                          decreaseMonth,
                          increaseMonth,
                          prevMonthButtonDisabled,
                          nextMonthButtonDisabled,
                        }) => (
                          <div className="flex justify-between px-2 py-2">
                            <button
                              onClick={decreaseMonth}
                              disabled={prevMonthButtonDisabled}
                              className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                            >
                              <ChevronLeftIcon className="h-5 w-5 text-white" />
                            </button>
                            <div className="text-white font-medium">
                              {date.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <button
                              onClick={increaseMonth}
                              disabled={nextMonthButtonDisabled}
                              className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                            >
                              <ChevronRightIcon className="h-5 w-5 text-white" />
                            </button>
                          </div>
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="h-6 w-6 text-white/60"
                        >
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM19 20H5V10h14v10zM5 8V6h14v2H5z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Client Address Section */}
                <motion.div
                  className="p-6 bg-black/20 rounded-xl border border-white/5 relative"
                  variants={fadeInVariant}
                  custom={6}
                >
                  <h1 className="text-white/60 font-semibold text-sm uppercase tracking-wider">
                    Recipient
                    {!isValidClientAddress() && (
                      <span className="text-orange-600 ml-1">*</span>
                    )}
                  </h1>
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1 relative mt-5">
                      <input
                        placeholder="0x... or ENS"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="text-white text-4xl font-light bg-transparent outline-none w-full placeholder-white/20 focus:placeholder-white/40 transition-all duration-200"
                      />
                      {/* Contact verification indicator */}
                      {clientAddress &&
                        contacts.some(
                          (contact) =>
                            contact.address.toLowerCase() ===
                            clientAddress.toLowerCase()
                        ) && (
                          <div className="absolute -top-6 left-0 flex items-center gap-2 text-sm text-orange-600">
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
                      {/* Contact name display */}
                      {clientAddress &&
                        contacts.find(
                          (contact) =>
                            contact.address.toLowerCase() ===
                            clientAddress.toLowerCase()
                        ) && (
                          <div className="mt-2 text-sm text-white/40">
                            Contact:{" "}
                            <span className="text-white/60">
                              {
                                contacts.find(
                                  (contact) =>
                                    contact.address.toLowerCase() ===
                                    clientAddress.toLowerCase()
                                )?.name
                              }
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Contacts Menu */}
                    <Menu as="div" className="relative inline-block text-left">
                      {({ open }) => (
                        <>
                          <Menu.Button className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10">
                            <UserIcon className="w-5 h-5 text-white/60 mr-2" />
                            <span>Contacts</span>
                            <ChevronDownIcon
                              className={`w-4 h-4 ml-2 transition ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 shadow-2xl">
                              <div className="px-1 py-1">
                                {isLoadingContacts ? (
                                  <div className="px-4 py-3 text-sm text-white/40">
                                    Loading contacts...
                                  </div>
                                ) : contacts.length > 0 ? (
                                  contacts.map((contact) => (
                                    <Menu.Item key={contact.id}>
                                      {({ active }) => (
                                        <button
                                          className={`${
                                            active ? "bg-white/10" : ""
                                          } group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 ${
                                            clientAddress.toLowerCase() ===
                                            contact.address.toLowerCase()
                                              ? "text-orange-600 bg-white/5"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            setClientAddress(contact.address)
                                          }
                                        >
                                          <div className="flex-shrink-0 rounded-full bg-black/40 p-2">
                                            <UserIcon className="h-5 w-5 text-white/60" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-white/80">
                                              {contact.name}
                                            </p>
                                            <p className="text-xs text-white/40">
                                              {truncateAddress(contact.address)}
                                            </p>
                                          </div>
                                          {clientAddress.toLowerCase() ===
                                            contact.address.toLowerCase() && (
                                            <div className="ml-auto text-white/60">
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
                                  <div className="px-4 py-3 text-sm text-white/40">
                                    No contacts found
                                  </div>
                                )}
                                <div className="border-t border-white/5 mt-1 pt-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <Link
                                        href="/contacts"
                                        className={`${
                                          active ? "bg-white/10" : ""
                                        } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-all duration-200`}
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
                        </>
                      )}
                    </Menu>
                  </div>
                  <ArrowDownIcon className="w-8 h-8 text-orange-600 absolute bg-black/40 p-2 -top-6 right-1/2 rounded-full border border-white/10 shadow-xl" />
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={isConnected ? handleSubmit : handleConnect}
                disabled={isLoading || isPending}
                className="w-full mt-4 text-center place-items-center flex items-center justify-center gap-x-2 rounded-lg text-white bg-white/10 px-4 py-3 text-md font-medium shadow-lg hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed h-12 transition-all duration-200"
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
