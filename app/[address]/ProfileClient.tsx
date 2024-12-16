import React from "react";
import ProfileOverview from "./components/ProfileOverview";
import Spinner from "@/components/Spinner";

interface ProfileClientProps {
  address: string;
}

export default function ProfileClient({ address }: ProfileClientProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Overview Section */}
        <div className="relative outline-2 outline outline-white/[0.2] p-7">
          <h2 className="text-base absolute z-20 -top-3 font-jetbrains left-6 px-2 bg-zinc-950 font-garet font-extrabold text-zinc-500">
            profile
          </h2>
          <ProfileOverview address={address} />
        </div>
      </div>
    </div>
  );
}
