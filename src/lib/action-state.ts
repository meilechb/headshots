/** Result of a form server action, consumed by ActionForm. */
export type ActionState = {
  ok?: boolean;
  error?: string;
  /** Timestamp of the last success, so repeated saves re-trigger the "Saved" note. */
  at?: number;
};
