import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const FavouriteIcon: React.FC<IconProps> = ({
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
    <path d="M2.10049 15.2744L7.00009 13.1996L11.8997 15.2744V2.6H2.10049V15.2744ZM1.47529 17.8748C1.12489 18.0252 0.791288 17.996 0.474488 17.7872C0.158488 17.5792 0.000488281 17.2836 0.000488281 16.9004V2.6C0.000488281 2.0168 0.204489 1.5208 0.612489 1.112C1.02129 0.704 1.51729 0.5 2.10049 0.5H11.8997C12.4829 0.5 12.9789 0.704 13.3877 1.112C13.7957 1.5208 13.9997 2.0168 13.9997 2.6V16.9004C13.9997 17.2836 13.8417 17.5792 13.5257 17.7872C13.2089 17.996 12.8753 18.0252 12.5249 17.8748L7.00009 15.4748L1.47529 17.8748Z" />
  </svg>
);

export default FavouriteIcon;
