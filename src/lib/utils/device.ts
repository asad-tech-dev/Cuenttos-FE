export function isIOSDevice(ua: string): boolean {
  if (!ua) return false;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports as "Macintosh" — distinguish from a real Mac via touch support.
  return (
    ua.includes("Macintosh") &&
    typeof navigator !== "undefined" &&
    navigator.maxTouchPoints > 1
  );
}

export function isAndroidDevice(ua: string): boolean {
  return /Android/.test(ua);
}

export function isChromeOnAndroid(ua: string): boolean {
  return (
    isAndroidDevice(ua) &&
    /Chrome\//.test(ua) &&
    !/SamsungBrowser|Firefox|OPR|EdgA/.test(ua)
  );
}

// Instagram/Facebook/TikTok/etc. in-app browsers block custom schemes and
// intent:// silently — no error, the tap just does nothing.
export function isInAppBrowser(ua: string): boolean {
  return /FBAN|FBAV|Instagram|Line\/|TikTok|MicroMessenger|LinkedInApp|Snapchat|Twitter/i.test(
    ua,
  );
}
