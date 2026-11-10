import React from "react";
import Spinner from "../ui/Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

const VioletButton: React.FC<ButtonProps> = ({
  text,
  className = "",
  loading = false,
  onClick,
  disabled = false,
  ...props
}) => {
  // Only an explicit `disabled` greys the button out; while loading it keeps
  // its violet look (with the spinner) and just ignores clicks.
  const stateClass = disabled
    ? "bg-disabled-button text-disabled-text cursor-not-allowed"
    : "bg-violet text-white cursor-pointer";
  return (
    <button
      className={`${stateClass} rounded-[8px] font-medium h-[40px] transition-colors duration-200 ${className}`}
      onClick={onClick}
      disabled={loading || disabled}
      aria-disabled={loading || disabled || undefined}
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
