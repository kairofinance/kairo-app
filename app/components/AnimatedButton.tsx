import React, { useState, useEffect } from "react";
import { PlusSmallIcon } from "@heroicons/react/24/solid";

const AnimatedButton: React.FC = () => {
  const [isStream, setIsStream] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsStream((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button className="ml-auto flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-kairo-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
      <PlusSmallIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

export default AnimatedButton;
