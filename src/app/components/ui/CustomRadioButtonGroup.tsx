import React, { useState } from "react";
import CustomRadioButton from "./CustomRadioButton";

interface CustomRadioButtonGroupProps {
  options: { value: string | number; label: string }[];
  onChange: (values: (string | number)[]) => void;
  defaultValue?: (string | number)[];
  className?: string;
  exclusiveValues?: (string | number)[];
}

const CustomRadioButtonGroup: React.FC<CustomRadioButtonGroupProps> = ({
  options,
  onChange,
  defaultValue = ["all"],
  className,
  exclusiveValues = ["all"],
}) => {
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
    defaultValue
  );

  const handleClick = (value: string | number) => {
    if (exclusiveValues.includes(value)) {
      setSelectedValues([value]);
      onChange([value]);
    } else {
      let newValues = selectedValues.filter(
        (v) => !exclusiveValues.includes(v)
      );
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