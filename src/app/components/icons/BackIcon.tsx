import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const BackIcon: React.FC<IconProps> = ({
  width = 14,
  height = 17,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 12 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M9.1248 19.0999L0.699804 10.6999C0.599804 10.5999 0.529138 10.4916 0.487804 10.3749C0.445804 10.2582 0.424805 10.1332 0.424805 9.9999C0.424805 9.86657 0.445804 9.74157 0.487804 9.6249C0.529138 9.50824 0.599804 9.3999 0.699804 9.2999L9.1248 0.874902C9.35814 0.641569 9.6498 0.524902 9.9998 0.524902C10.3498 0.524902 10.6498 0.649902 10.8998 0.899902C11.1498 1.1499 11.2748 1.44157 11.2748 1.7749C11.2748 2.10824 11.1498 2.3999 10.8998 2.6499L3.5498 9.9999L10.8998 17.3499C11.1331 17.5832 11.2498 17.8706 11.2498 18.2119C11.2498 18.5539 11.1248 18.8499 10.8748 19.0999C10.6248 19.3499 10.3331 19.4749 9.9998 19.4749C9.66647 19.4749 9.3748 19.3499 9.1248 19.0999Z" />
  </svg>
);

export default BackIcon;
