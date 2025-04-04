import React from "react";
import Spinner from "../ui/Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

const TextButton: React.FC<ButtonProps> = ({ text, className = "", loading = false, onClick, ...props }) => {
  return (
    <button
      className={`text-white text-[14px] font-medium cursor-pointer justify-center items-center ${className}`}
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

export default TextButton;
