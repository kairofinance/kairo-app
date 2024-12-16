import React from "react";
import Link from "next/link";

interface AddressDisplayProps {
  address: string;
  className?: string;
}

export default function AddressDisplay({
  address,
  className = "",
}: AddressDisplayProps) {
  return (
    <Link href={`/${address}`} className={className}>
      {`${address.slice(0, 6)}...${address.slice(-4)}`}
    </Link>
  );
}
