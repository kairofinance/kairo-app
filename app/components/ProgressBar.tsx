import React from "react";

interface ProgressBarProps {
  step: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step }) => {
  const steps = ["Submitting", "Finishing up", "Done"];

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {steps.map((stepName, index) => (
          <div
            key={index}
            className={`text-sm font-medium ${
              index <= step ? "text-red-600" : "text-gray-500"
            }`}
          >
            {stepName}
          </div>
        ))}
      </div>
      <div className="w-full bg-zinc-200 rounded-full h-2.5">
        <div
          className="bg-red-800/90 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
