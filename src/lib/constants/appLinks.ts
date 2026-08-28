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

// The app dropped id-addressed cuentto links — a slug is only unique per
// author, so both username and slug are required to resolve one. Prompt
// links carry the question id too (?q=), since a group's default question
// can change and the exact one that was shared must survive the round trip.
export type OpenInAppTarget =
  | { kind: "cuentto"; username: string; slug: string }
  | { kind: "prompt"; slug: string; questionId: number };

function getDeepLinkPath(target: OpenInAppTarget): string {
  return target.kind === "cuentto"
    ? `cuentto/${target.username}/${target.slug}`
    : `prompt/${target.slug}?q=${target.questionId}`;
}

export function getAppDeepLink(target: OpenInAppTarget): string {
  return `${APP_SCHEME}://${getDeepLinkPath(target)}`;
}

export function getAndroidIntentUrl(target: OpenInAppTarget): string {
  const fallback = encodeURIComponent(PLAY_STORE_URL);
  return `intent://${getDeepLinkPath(target)}#Intent;scheme=${APP_SCHEME};package=${ANDROID_PACKAGE_NAME};S.browser_fallback_url=${fallback};end`;
}
