import React from "react";

interface SpinnerProps {
  size?: string;
  color?: string;
  borderSize?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "w-16 h-16",
  color = "border-white",
  borderSize = "border-8",
}) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${size} ${borderSize} border-solid border-t-transparent animate-spin rounded-full ${color}`}
      ></div>
    </div>
  );
};

export default Spinner;
