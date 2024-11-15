"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  ChevronDownIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import SectionHeader from "@/components/shared/ui/SectionHeader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TokenOption {
  symbol: string;
  address: string;
  decimals: number;
}

const tokens: TokenOption[] = [
  {
    symbol: "USDC",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
  },
  {
    symbol: "DAI",
    address: "0x552ceaDf3B47609897279F42D3B3309B604896f3",
    decimals: 18,
  },
];

interface VestingSchedule {
  cliffDuration: number; // in months
  vestingDuration: number; // in months
  initialRelease: number; // percentage
  recipient: string;
  amount: string;
}

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

// Helper function to validate Ethereum addresses
function isValidEthereumAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

// Add BackgroundGradient component
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

export default function CreateVestingClient() {
  const [selectedToken, setSelectedToken] = useState<TokenOption>(tokens[0]);
  const [schedule, setSchedule] = useState<VestingSchedule>({
    cliffDuration: 0,
    vestingDuration: 0,
    initialRelease: 0,
    recipient: "",
    amount: "",
  });
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Calculate vesting schedule points for visualization
  const calculateVestingPoints = () => {
    if (!schedule.amount) return [];

    const totalAmount = parseFloat(schedule.amount.replace(/,/g, ""));
    const initialAmount = (totalAmount * schedule.initialRelease) / 100;
    const vestingAmount = totalAmount - initialAmount;

    const points = [];
    const totalMonths = schedule.cliffDuration + schedule.vestingDuration;

    // Initial release point
    points.push({ x: 0, y: initialAmount });

    // Cliff period
    for (let i = 1; i <= schedule.cliffDuration; i++) {
      points.push({ x: i, y: initialAmount });
    }

    // Linear vesting period
    const monthlyVesting = vestingAmount / schedule.vestingDuration;
    for (let i = 1; i <= schedule.vestingDuration; i++) {
      const month = schedule.cliffDuration + i;
      points.push({ x: month, y: initialAmount + monthlyVesting * i });
    }

    return points;
  };

  const vestingPoints = calculateVestingPoints();

  // Chart data
  const chartData = {
    labels: vestingPoints.map((point) => `Month ${point.x}`),
    datasets: [
      {
        label: "Vested Amount",
        data: vestingPoints.map((point) => point.y),
        borderColor: "rgb(234, 88, 12)",
        backgroundColor: "rgba(234, 88, 12, 0.1)",
        tension: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.6)",
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            return `${context.parsed.y.toLocaleString()} ${
              selectedToken.symbol
            }`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          callback: (value: number) =>
            `${value.toLocaleString()} ${selectedToken.symbol}`,
        },
      },
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
      },
    },
  };

  const handleScheduleChange = (
    field: keyof VestingSchedule,
    value: string | number
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          {/* Title Section */}
          <motion.div className="space-y-3" variants={fadeInVariant} custom={2}>
            <motion.h1
              className="mt-4 text-5xl font-extrabold  tracking-tight text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Create Vesting Schedule
            </motion.h1>
            <motion.p
              className="text-white/60"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Set up a token vesting schedule with customizable parameters and
              linear distribution
            </motion.p>
          </motion.div>

          {/* Main Form Container */}
          <motion.div
            className="my-8"
            variants={fadeInVariant}
            custom={3}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 space-y-3">
              {/* Token Selection */}
              <motion.div
                className="p-6 bg-black/20 rounded-xl space-y-6 border border-white/5"
                variants={fadeInVariant}
                custom={5}
              >
                <div className="space-y-3">
                  <h1 className="text-white/60 font-semibold text-sm uppercase tracking-wider">
                    Select Token
                  </h1>
                  <div className="flex gap-3">
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => setSelectedToken(token)}
                        className={`inline-flex items-center text-base px-4 py-2 rounded-full font-semibold transition-all duration-200 border ${
                          selectedToken.symbol === token.symbol
                            ? "border-orange-600/20 bg-orange-600/[0.07] text-orange-600"
                            : "border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        <Image
                          src={`/tokens/${token.symbol}.png`}
                          width={24}
                          height={24}
                          alt={token.symbol}
                          className="rounded-full mr-2"
                        />
                        <span>{token.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Amount and Recipient Section */}
              <motion.div
                className="p-6 bg-black/20 rounded-xl space-y-6 border border-white/5"
                variants={fadeInVariant}
                custom={6}
              >
                <div className="space-y-3">
                  <h1 className="text-white/60 font-semibold text-sm uppercase tracking-wider">
                    Amount & Recipient
                  </h1>
                  <div className="space-y-4">
                    {/* Amount Input */}
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 px-1.5 bg-black text-[10px] font-medium text-white/50 tracking-wider">
                        Amount
                      </label>
                      <input
                        type="text"
                        value={schedule.amount}
                        onChange={(e) =>
                          handleScheduleChange(
                            "amount",
                            formatAmount(e.target.value)
                          )
                        }
                        className="w-full px-4 pt-3 pb-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/90 focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20 transition-all duration-200"
                        placeholder={`Enter amount in ${selectedToken.symbol}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                        {selectedToken.symbol}
                      </div>
                    </div>

                    {/* Recipient Address */}
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 px-1.5 bg-black text-[10px] font-medium text-white/50 tracking-wider">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={schedule.recipient}
                        onChange={(e) =>
                          handleScheduleChange("recipient", e.target.value)
                        }
                        className={`w-full px-4 pt-3 pb-2 rounded-lg border bg-white/[0.02] text-white/90 transition-all duration-200
                          ${
                            schedule.recipient &&
                            !isValidEthereumAddress(schedule.recipient)
                              ? "border-red-500/50 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                              : "border-white/[0.08] focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20"
                          }`}
                        placeholder="Enter recipient's address"
                      />
                      {schedule.recipient &&
                        !isValidEthereumAddress(schedule.recipient) && (
                          <p className="mt-1 text-xs text-red-400">
                            Please enter a valid Ethereum address
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Vesting Parameters */}
              <motion.div
                className="p-6 bg-black/20 rounded-xl space-y-6 border border-white/5"
                variants={fadeInVariant}
                custom={7}
              >
                <div className="space-y-3">
                  <h1 className="text-white/60 font-semibold text-sm uppercase tracking-wider">
                    Vesting Parameters
                  </h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 px-1.5 bg-black text-[10px] font-medium text-white/50 tracking-wider">
                        Cliff Duration
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={schedule.cliffDuration}
                        onChange={(e) =>
                          handleScheduleChange(
                            "cliffDuration",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 pt-3 pb-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/90 focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20 transition-all duration-200"
                        placeholder="Enter cliff duration"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                        months
                      </div>
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 px-1.5 bg-black text-[10px] font-medium text-white/50 tracking-wider">
                        Vesting Duration
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={schedule.vestingDuration}
                        onChange={(e) =>
                          handleScheduleChange(
                            "vestingDuration",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 pt-3 pb-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/90 focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20 transition-all duration-200"
                        placeholder="Enter vesting duration"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                        months
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 px-1.5 bg-black text-[10px] font-medium text-white/50 tracking-wider">
                      Initial Release
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={schedule.initialRelease}
                      onChange={(e) =>
                        handleScheduleChange(
                          "initialRelease",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 pt-3 pb-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/90 focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20 transition-all duration-200"
                      placeholder="Enter initial release percentage"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                      %
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Start Date */}
              <motion.div
                className="p-6 bg-black/20 rounded-xl space-y-6 border border-white/5"
                variants={fadeInVariant}
                custom={8}
              >
                <div className="space-y-3">
                  <h1 className="text-white/60 font-semibold text-sm uppercase tracking-wider">
                    Start Date
                  </h1>
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 px-1.5 bg-black text-[10px] font-medium text-white/50 tracking-wider">
                      Start Date
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => {
                        if (date) setStartDate(date);
                      }}
                      minDate={new Date()}
                      dateFormat="MMMM d, yyyy"
                      className="w-full px-4 pt-3 pb-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/90 focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20 transition-all duration-200"
                      placeholderText="Select start date"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Graph Section */}
              {schedule.amount && (
                <motion.div
                  className="p-6 bg-black/20 rounded-xl border border-white/5"
                  variants={fadeInVariant}
                  custom={9}
                >
                  <h2 className="text-lg font-medium text-white mb-6">
                    Vesting Schedule Visualization
                  </h2>
                  <div className="h-[300px]">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Create Button */}
            <motion.button
              className="w-full mt-4 text-center place-items-center flex items-center justify-center gap-x-2 rounded-lg text-white bg-white/10 px-4 py-3 text-md font-medium shadow-lg hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed h-12 transition-all duration-200"
              variants={fadeInVariant}
              custom={10}
            >
              Create Vesting Schedule
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
