import React from "react";
import { Check } from "lucide-react";

interface CustomRadioButtonProps {
  value: string | number;
  label: string;
  isSelected: boolean;
  onClick: (value: string | number) => void;
  className?: string;
}

// Checkbox-pill look (matches the mobile app's Share step) rather than a
// filled radio dot — selection/exclusivity logic lives in the parent group
// and is unchanged, this is a pure visual restyle.
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
      className={`flex items-center gap-2.5 cursor-pointer ${className} py-2 px-3 rounded-[100px] border ${
        isSelected ? "border-violet bg-light-violet" : "border-light-gray"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 ${
          isSelected ? "border-violet bg-violet" : "border-dark-violet"
        }`}
      >
        {isSelected && <Check size={13} strokeWidth={3} className="text-white" />}
      </div>
      <span className="text-dark-violet text-[14px] font-medium whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};

export default CustomRadioButton;