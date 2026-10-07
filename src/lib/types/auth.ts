export type AuthMode = "signin" | "signup";

export type AuthState = {
  error: string | null;
  /** Changes on each failed submit so the UI can dismiss stale messages. */
  errorId?: number;
};
