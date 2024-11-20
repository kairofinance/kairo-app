"use client";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import SpinningLogo from "./SpinningLogo";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const avatarUrl = address
    ? `https://cdn.stamp.fyi/avatar/${address}?s=50`
    : "";

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`h-16 flex items-center justify-between fixed top-0 right-0 left-0 bg-zinc-950 z-50 px-6`}
    >
      <Link href="/" className="flex items-center">
        {isLoading ? (
          <SpinningLogo />
        ) : (
          <h1 className="cursor-pointer font-jetbrains text-white font-bold text-xl select-none transition-colors duration-200 hover:text-orange-600">
            kairo*
          </h1>
        )}
      </Link>

      <div className="relative">
        {isConnected ? (
          <div>
            <button
              onMouseEnter={() => setShowModal(true)}
              className="flex items-center gap-x-2 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 h-10 hover:bg-zinc-800 rounded-lg"
            >
              <div className="h-6 w-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <Image
                  src={avatarUrl}
                  alt="Wallet Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <span className="inline-flex font-jetbrains items-center leading-none">
                {address
                  ? `${address.slice(0, 6)}-${address.slice(-4)}`
                  : "Account"}
              </span>
            </button>

            {/* Modal */}
            {showModal && (
              <div
                ref={modalRef}
                onMouseLeave={() => setShowModal(false)}
                className="absolute right-0 mt-2 p-2 w-48 rounded-lg backdrop-blur-sm border border-white/[0.08] bg-zinc-950 shadow-lg"
              >
                <Link
                  href="/profile"
                  className="flex items-center rounded-lg gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors duration-200"
                >
                  <UserCircleIcon className="h-4 w-4" />
                  View Profile
                </Link>
                <button
                  onClick={() => {
                    disconnect();
                    setShowModal(false);
                  }}
                  className="flex items-center rounded-lg gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors duration-200 w-full"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => open({ view: "Connect" })}
            className="px-4 py-2 text-sm font-semibold text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors duration-200 h-10"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
