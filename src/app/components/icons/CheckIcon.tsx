import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const CheckIcon: React.FC<IconProps> = ({
  width = 14,
  height = 11,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 14 11"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M4.25012 8.12738L1.12262 4.99988L0.0576172 6.05738L4.25012 10.2499L13.2501 1.24988L12.1926 0.192383L4.25012 8.12738Z" />
  </svg>
);

export default CheckIcon;
