"use client";
import { motion } from "framer-motion";

interface SpinningLogoProps {
  className?: string;
}

const SpinningLogo = ({ className = "" }: SpinningLogoProps) => {
  return (
    <motion.h1
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className={`font-jetbrains text-white font-bold text-4xl select-none ${className}`}
    >
      *
    </motion.h1>
  );
};

export default SpinningLogo;
