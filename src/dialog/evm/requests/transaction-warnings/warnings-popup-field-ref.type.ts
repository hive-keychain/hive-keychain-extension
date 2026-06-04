export type WarningsPopupFieldRef =
  | { type: 'dialog-other'; index: number }
  | { type: 'duplicate' }
  | { type: 'pending' }
  | { type: 'eip7702' }
  | { type: 'confirmation'; index: number };
