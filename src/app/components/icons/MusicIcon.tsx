import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const MusicIcon: React.FC<IconProps> = ({
  width = 14,
  height = 17,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 10 14"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M3.5375 13.75C2.6999 13.75 1.9844 13.453 1.391 12.859C0.797 12.2656 0.5 11.5501 0.5 10.7125C0.5 9.8749 0.797 9.1594 1.391 8.566C1.9844 7.972 2.6999 7.675 3.5375 7.675C3.8249 7.675 4.0844 7.7062 4.316 7.7686C4.547 7.831 4.775 7.9186 5 8.0314V1.825C5 1.3876 5.153 1.0156 5.459 0.709C5.7656 0.403 6.1376 0.25 6.575 0.25H7.9439C8.3813 0.25 8.75 0.4 9.05 0.7C9.35 1 9.5 1.3687 9.5 1.8061C9.5 2.2435 9.35 2.6122 9.05 2.9122C8.75 3.2122 8.3813 3.3622 7.9439 3.3622H6.575V10.7125C6.575 11.5501 6.278 12.2656 5.684 12.859C5.0906 13.453 4.3751 13.75 3.5375 13.75Z" />
  </svg>
);

export default MusicIcon;
