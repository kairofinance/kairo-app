import { UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface AvatarProps {
  address: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({
  address,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const avatarUrl = address
    ? `https://cdn.stamp.fyi/avatar/${address}?s=50`
    : "";

  return (
    <div
      className={`rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.05] overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {address ? (
        <Image
          src={avatarUrl}
          alt={`${address} avatar`}
          width={size === "lg" ? 48 : size === "md" ? 40 : 32}
          height={size === "lg" ? 48 : size === "md" ? 40 : 32}
          className="w-full h-full"
        />
      ) : (
        <UserCircleIcon className="w-6 h-6 text-white/60" />
      )}
    </div>
  );
}
