import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const HomeActive: React.FC<IconProps> = ({
  width = 16,
  height = 17,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    fill="currentColor"
    viewBox="0 0 16 18"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M2 17.5C1.45 17.5 0.979333 17.3043 0.588 16.913C0.196 16.521 0 16.05 0 15.5V6.5C0 6.18333 0.0709998 5.88333 0.213 5.6C0.354333 5.31667 0.55 5.08333 0.8 4.9L6.8 0.4C6.98333 0.266667 7.175 0.166667 7.375 0.0999999C7.575 0.0333332 7.78333 0 8 0C8.21667 0 8.425 0.0333332 8.625 0.0999999C8.825 0.166667 9.01667 0.266667 9.2 0.4L15.2 4.9C15.45 5.08333 15.646 5.31667 15.788 5.6C15.9293 5.88333 16 6.18333 16 6.5V15.5C16 16.05 15.8043 16.521 15.413 16.913C15.021 17.3043 14.55 17.5 14 17.5H10V10.5H6V17.5H2Z" />
  </svg>
);

export default HomeActive;
