"use client";
import { ScaleLoader } from "react-spinners";

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className = "" }: SpinnerProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ScaleLoader color="#FFFFFF" />
    </div>
  );
};

export default Spinner;
