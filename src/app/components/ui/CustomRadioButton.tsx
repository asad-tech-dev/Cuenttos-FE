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
      title={label}
      // Long names (even with no spaces) wrap to at most two lines inside the
      // row instead of pushing past the drawer; the radio stays full-size and
      // lines up with the first line, so short names look exactly as before.
      className={`flex items-start gap-4 w-full min-w-0 text-left cursor-pointer ${className} p-2 rounded`}
    >
      <div
        className={`w-5 h-5 mt-0.5 shrink-0 rounded-full border flex items-center justify-center ${
          isSelected ? "border-dark-violet" : "border-dark-violet"
        }`}
      >
        {isSelected && (
          <div className="w-3 h-3 rounded-full bg-violet"></div>
        )}
      </div>
      <span className="min-w-0 flex-1 line-clamp-2 [overflow-wrap:anywhere] text-dark-violet text-[16px] leading-6 font-medium">
        {label}
      </span>
    </button>
  );
};

export default CustomRadioButton;