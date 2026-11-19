/**
 * Emails are case-insensitive in practice ("John@Mail.com" and
 * "john@mail.com" are the same inbox), so every email the app sends to the
 * auth API goes in one canonical form: trimmed and lowercase. Typing it in
 * capitals (or with a stray space from autofill/paste) then can't make login
 * fail.
 */
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();
