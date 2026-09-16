import React from "react";
import IconBase, { type IconProps } from "./IconBase";

const ProfileIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="7.5" r="4" />
    <path d="M3.5 20.5v-1.25c0-1.1.63-2.1 1.63-2.58C7.27 15.57 9.57 15 12 15s4.73.57 6.87 1.67c1 .48 1.63 1.48 1.63 2.58v1.25Z" />
  </IconBase>
);

export default ProfileIcon;
