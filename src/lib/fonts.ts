import { DM_Sans } from "next/font/google";

// Scoped to the Write flow only (applied via dmSans.className on that
// flow's page wrappers) so it matches the mobile app's typography there
// without changing the font for the rest of the site, which stays on Inter.
export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
