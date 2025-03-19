import React, { useState } from "react";
import CustomRadioButton from "./CustomRadioButton";

interface CustomRadioButtonGroupProps {
  options: { value: string | number; label: string }[];
  onChange: (values: (string | number)[]) => void;
  defaultValue?: (string | number)[];
  className?: string;
}

const CustomRadioButtonGroup: React.FC<CustomRadioButtonGroupProps> = ({
  options,
  onChange,
  defaultValue = ["all"],
  className,
}) => {
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
    defaultValue
  );

  const handleClick = (value: string | number) => {
    if (value === "all") {
      setSelectedValues(["all"]);
      onChange(["all"]);
    } else {
      let newValues = [...selectedValues];
      if (newValues.includes("all")) {
        newValues = newValues.filter((v) => v !== "all");
      }
      if (newValues.includes(value)) {
        newValues = newValues.filter((v) => v !== value);
      } else {
        newValues.push(value);
      }
      setSelectedValues(newValues);
      onChange(newValues);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {options.map((option) => (
        <CustomRadioButton
          key={option.value}
          value={option.value}
          label={option.label}
          isSelected={selectedValues.includes(option.value)}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};

export default CustomRadioButtonGroup;