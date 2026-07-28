/** Turns raw backend auth errors into calm, human-readable copy. */
export function friendlyAuthError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();

  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return "Your email hasn't been verified yet. Please verify your email before signing in.";
  if (m.includes("invalid login credentials"))
    return "That email or password doesn't look right. Please try again.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("password should be at least"))
    return "Your password is too short — use at least 8 characters.";
  if (m.includes("should be different from the old password"))
    return "Please choose a password different from your current one.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "That email address doesn't look valid.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("expired") || m.includes("invalid token") || m.includes("otp"))
    return "This link has expired. Please request a new one.";
  if (m.includes("network") || m.includes("fetch"))
    return "We couldn't reach the server. Check your connection and try again.";
  if (m.includes("popup") || m.includes("cancel"))
    return "Sign-in was cancelled. Please try again.";

  return "Something went wrong. Please try again.";
}

export function isUnverifiedEmailError(message: string | undefined): boolean {
  const m = (message ?? "").toLowerCase();
  return m.includes("email not confirmed") || m.includes("not confirmed");
}
