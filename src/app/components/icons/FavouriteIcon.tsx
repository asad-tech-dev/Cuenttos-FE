import React from "react";
import IconBase, { type IconProps } from "./IconBase";

const FavouriteIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
  </IconBase>
);

export default FavouriteIcon;
