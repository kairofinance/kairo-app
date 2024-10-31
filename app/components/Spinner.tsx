import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

const Spinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-15">
      <ScaleLoader color="#99fa72" />
    </div>
  );
};

export default Spinner;
