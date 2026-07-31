const APP_SCHEME = "cuentto";
const ANDROID_PACKAGE_NAME = "com.storyco.cuentto";

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

// Set once the iOS app is published and we have a real App Store id —
// the bundle id (com.storycollc.cuentto) currently returns no App Store
// listing, so there is nothing real to link to yet.
const IOS_APP_STORE_ID = process.env.NEXT_PUBLIC_IOS_APP_STORE_ID?.trim();
export const APP_STORE_URL = IOS_APP_STORE_ID
  ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
  : null;

export function getCuenttoDeepLink(id: number | string): string {
  return `${APP_SCHEME}://cuentto/${id}`;
}

export function getAndroidIntentUrl(id: number | string): string {
  const fallback = encodeURIComponent(PLAY_STORE_URL);
  return `intent://cuentto/${id}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE_NAME};S.browser_fallback_url=${fallback};end`;
}
