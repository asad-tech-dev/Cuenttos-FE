import React from "react";
import Spinner from "../ui/Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

const VioletButton: React.FC<ButtonProps> = ({ text, className = "", loading = false, onClick, ...props }) => {
  return (
    <button
      className={`bg-violet cursor-pointer rounded-[8px] text-white ${className}`}
      onClick={onClick}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Spinner size="w-6 h-6" color="border-white" borderSize="border-3" />
      ) : (
        text
      )}
    </button>
  );
};

export default VioletButton;
