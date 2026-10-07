export const AUTH_PAGE = {
  title: "Task List",
  subtitle: "Organize your work, one task at a time.",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  signIn: "Sign in",
  signingIn: "Signing in…",
  createAccount: "Create an account",
  creatingAccount: "Creating account…",
  noAccount: "Don't have an account?",
  hasAccount: "Already have an account?",
  signOut: "Sign out",
} as const;

/** Messages returned from the authenticate Server Action. */
export const AUTH_ERRORS = {
  missingFields: "Email and password are required.",
  wrongCredentials: "Wrong email or password.",
  alreadyRegistered:
    "An account with this email already exists. Sign in instead.",
  passwordTooShort: "Password must be at least 6 characters.",
  invalidEmail: "Please enter a valid email address.",
} as const;
