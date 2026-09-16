import React from "react";
import IconBase, { type IconProps } from "./IconBase";

// Same geometry as FavouriteIcon so the outline and solid states sit on
// exactly the same silhouette when a bookmark toggles.
const FavouriteActive: React.FC<IconProps> = (props) => (
  <IconBase {...props} filled>
    <path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
  </IconBase>
);

export default FavouriteActive;
