import { useContactName } from "@/hooks/useContactName";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

interface AddressDisplayProps {
  address: string;
  className?: string;
  showFull?: boolean;
}

export default function AddressDisplay({
  address,
  className = "",
  showFull = false,
}: AddressDisplayProps) {
  const { name, isContact, isLoading } = useContactName(address);
  const [displayName, setDisplayName] = useState(
    showFull ? address : `${address.slice(0, 6)}...${address.slice(-4)}`
  );

  useEffect(() => {
    if (!isLoading && name) {
      setDisplayName(showFull ? address : name);
    }
  }, [name, isLoading, showFull, address]);

  return (
    <span
      className={`${className} inline-flex items-center gap-1.5 ${
        isContact ? "text-kairo-green" : ""
      }`}
    >
      {isContact && (
        <UserCircleIcon
          className="h-4 w-4 text-kairo-green/70"
          title="Saved Contact"
        />
      )}
      <span title={address}>{displayName}</span>
    </span>
  );
}
