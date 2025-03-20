import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const FavouriteActive: React.FC<IconProps> = ({
  width = 14,
  height = 17,

  className = "",
  onClick,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 14 18"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    onClick={onClick}
  >
    <path d="M1.4752 17.8748C1.1248 18.0252 0.791197 17.996 0.474397 17.7872C0.158397 17.5792 0.000396729 17.2836 0.000396729 16.9004V2.6C0.000396729 2.0168 0.204397 1.5208 0.612397 1.112C1.0212 0.704 1.5172 0.5 2.1004 0.5H11.8996C12.4828 0.5 12.9788 0.704 13.3876 1.112C13.7956 1.5208 13.9996 2.0168 13.9996 2.6V16.9004C13.9996 17.2836 13.8416 17.5792 13.5256 17.7872C13.2088 17.996 12.8752 18.0252 12.5248 17.8748L7 15.4748L1.4752 17.8748Z" />
  </svg>
);

export default FavouriteActive;
