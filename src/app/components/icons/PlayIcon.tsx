import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const PlayIcon: React.FC<IconProps> = ({
  width = 22,
  height = 22,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 12 12"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M11.2998 5.14319L1.87308 0.459034C1.07537 0.0626542 0.139088 0.642918 0.139088 1.53368V10.5438C0.139088 11.4345 1.07537 12.0148 1.87308 11.6184L11.2998 6.93426C12.0398 6.56655 12.0398 5.5109 11.2998 5.14319Z" />
  </svg>
);

export default PlayIcon;
