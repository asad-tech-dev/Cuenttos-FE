import React from "react";

interface CustomRadioButtonProps {
  value: string | number;
  label: string;
  isSelected: boolean;
  onClick: (value: string | number) => void;
  className?: string;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  value,
  label,
  isSelected,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex items-center gap-4 cursor-pointer ${className} p-2 rounded`}
    >
      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
          isSelected ? "border-dark-violet" : "border-dark-violet"
        }`}
      >
        {isSelected && (
          <div className="w-3 h-3 rounded-full bg-violet"></div>
        )}
      </div>
      <span className="text-dark-violet text-[16px] font-medium">{label}</span>
    </button>
  );
};

export default CustomRadioButton;