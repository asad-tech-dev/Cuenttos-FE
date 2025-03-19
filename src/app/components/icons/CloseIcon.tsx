import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const CloseIcon: React.FC<IconProps> = ({
  width = 14,
  height = 11,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M11.998 0.827637C18.1723 0.827637 23.163 5.81839 23.163 11.9926C23.163 18.1669 18.1723 23.1576 11.998 23.1576C5.82376 23.1576 0.833008 18.1669 0.833008 11.9926C0.833008 5.81839 5.82376 0.827637 11.998 0.827637ZM16.0062 6.41014L11.998 10.4184L7.98977 6.41014L6.41551 7.9844L10.4237 11.9926L6.41551 16.0009L7.98977 17.5751L11.998 13.5669L16.0062 17.5751L17.5805 16.0009L13.5723 11.9926L17.5805 7.9844L16.0062 6.41014Z" />
  </svg>
);

export default CloseIcon;
