export const AUTH_PAGE = {
  brandTagline: "Organize your work, one task at a time.",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  passwordPlaceholderSignIn: "Your password",
  passwordPlaceholderSignUp: "At least 6 characters",
  passwordHintSignUp: "Use 6 or more characters.",
  signInLabel: "Sign in",
  signingIn: "Signing in…",
  createAccountLabel: "Create account",
  creatingAccount: "Creating account…",
  signOut: "Sign out",
  modeSignIn: "Sign in",
  modeSignUp: "Sign up",
  signIn: {
    headline: "Welcome back",
    description: "Sign in to open your task list, filters, and CSV imports.",
    panelHeadline: "Your tasks, ready when you are",
    panelLead:
      "Pick up where you left off—status, priority, and due dates stay in sync.",
    bullets: [
      "Search and filter by status or priority",
      "Mark tasks done or soft-delete without losing history",
      "Import batches from CSV with clear rejection feedback",
    ] as const,
  },
  signUp: {
    headline: "Create your account",
    description:
      "Set up a free workspace for due dates, priorities, and notes on every task.",
    panelHeadline: "Start with a clear list",
    panelLead:
      "A focused task board built for day-to-day work—not another bloated project tool.",
    bullets: [
      "Add tasks with due dates from 1 (low) to 5 (urgent)",
      "Track status from to-do through done",
      "Only you can access your tasks—secured to your account",
    ] as const,
  },
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
