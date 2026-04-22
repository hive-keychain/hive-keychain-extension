/** How long the dialog success feedback stays on screen before auto-dismiss (RequestResponse). */
export const DIALOG_FEEDBACK_DISPLAY_MS = 5000;

export const delayMs = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
