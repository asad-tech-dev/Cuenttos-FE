import React from "react";
import Spinner from "../ui/Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const GoogleButton: React.FC<ButtonProps> = ({ text, className = "", loading = false, onClick, icon, ...props }) => {
  return (
    <button
      className={`w-[211px] h-[40px] text-black bg-white text-[14px] rounded-[8px] font-medium flex gap-4 justify-center items-center cursor-pointer ${className}`}
      onClick={onClick}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Spinner size="w-6 h-6" color="border-white" borderSize="border-3" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {text}
        </>
      )}
    </button>
  );
};

export default GoogleButton;