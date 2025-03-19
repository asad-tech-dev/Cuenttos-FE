import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const MicIcon: React.FC<IconProps> = ({
  width = 16,
  height = 21,
  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 14 19"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M6.99957 12C6.16624 12 5.4579 11.7083 4.87457 11.125C4.29124 10.5417 3.99957 9.83333 3.99957 9V3C3.99957 2.16667 4.29124 1.45833 4.87457 0.875C5.4579 0.291667 6.16624 0 6.99957 0C7.8329 0 8.54124 0.291667 9.12457 0.875C9.7079 1.45833 9.99957 2.16667 9.99957 3V9C9.99957 9.83333 9.7079 10.5417 9.12457 11.125C8.54124 11.7083 7.8329 12 6.99957 12ZM6.99957 19C6.71624 19 6.4789 18.904 6.28757 18.712C6.09557 18.5207 5.99957 18.2833 5.99957 18V15.925C4.44957 15.7083 3.1329 15.0583 2.04957 13.975C0.966237 12.8917 0.307904 11.5917 0.0745703 10.075C0.0245703 9.79167 0.0995706 9.54167 0.299571 9.325C0.499571 9.10833 0.766237 9 1.09957 9C1.3329 9 1.54124 9.08733 1.72457 9.262C1.9079 9.43733 2.02457 9.65 2.07457 9.9C2.29124 11.0667 2.8579 12.0417 3.77457 12.825C4.69124 13.6083 5.76624 14 6.99957 14C8.2329 14 9.3079 13.6083 10.2246 12.825C11.1412 12.0417 11.7079 11.0667 11.9246 9.9C11.9746 9.65 12.0956 9.43733 12.2876 9.262C12.4789 9.08733 12.6912 9 12.9246 9C13.2412 9 13.4996 9.10833 13.6996 9.325C13.8996 9.54167 13.9746 9.79167 13.9246 10.075C13.6912 11.5917 13.0329 12.8917 11.9496 13.975C10.8662 15.0583 9.54957 15.7083 7.99957 15.925V18C7.99957 18.2833 7.9039 18.5207 7.71257 18.712C7.52057 18.904 7.2829 19 6.99957 19ZM6.99957 10C7.2829 10 7.52057 9.904 7.71257 9.712C7.9039 9.52067 7.99957 9.28333 7.99957 9V3C7.99957 2.71667 7.9039 2.479 7.71257 2.287C7.52057 2.09567 7.2829 2 6.99957 2C6.71624 2 6.4789 2.09567 6.28757 2.287C6.09557 2.479 5.99957 2.71667 5.99957 3V9C5.99957 9.28333 6.09557 9.52067 6.28757 9.712C6.4789 9.904 6.71624 10 6.99957 10Z" />
  </svg>
);

export default MicIcon;
