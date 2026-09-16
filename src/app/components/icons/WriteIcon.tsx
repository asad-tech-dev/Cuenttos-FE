import React from "react";
import IconBase, { type IconProps } from "./IconBase";

const WriteIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M3 21h18" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L9 17l-4 1 1-4Z" />
  </IconBase>
);

export default WriteIcon;
