import React from "react";
import IconBase, { type IconProps } from "./IconBase";

const ThinkIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 2v2" />
    <path d="M5.64 5.64 7.05 7.05" />
    <path d="M18.36 5.64 16.95 7.05" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M12 6.5a5 5 0 0 0-2.5 9.33c.31.18.5.51.5.87V18h4v-1.3c0-.36.19-.69.5-.87A5 5 0 0 0 12 6.5Z" />
    <path d="M10 21h4" />
  </IconBase>
);

export default ThinkIcon;
