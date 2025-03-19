import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const PlusIcon: React.FC<IconProps> = ({
  width = 22,
  height = 22,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 22 22"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M11 21.5C10.575 21.5 10.219 21.356 9.932 21.068C9.644 20.781 9.5 20.425 9.5 20V12.5H2C1.575 12.5 1.2185 12.356 0.9305 12.068C0.6435 11.781 0.5 11.425 0.5 11C0.5 10.575 0.6435 10.2185 0.9305 9.9305C1.2185 9.6435 1.575 9.5 2 9.5H9.5V2C9.5 1.575 9.644 1.2185 9.932 0.9305C10.219 0.6435 10.575 0.5 11 0.5C11.425 0.5 11.7815 0.6435 12.0695 0.9305C12.3565 1.2185 12.5 1.575 12.5 2V9.5H20C20.425 9.5 20.781 9.6435 21.068 9.9305C21.356 10.2185 21.5 10.575 21.5 11C21.5 11.425 21.356 11.781 21.068 12.068C20.781 12.356 20.425 12.5 20 12.5H12.5V20C12.5 20.425 12.3565 20.781 12.0695 21.068C11.7815 21.356 11.425 21.5 11 21.5Z" />
  </svg>
);

export default PlusIcon;
