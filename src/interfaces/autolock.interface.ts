export enum AutoLockType {
  DEFAULT = 'default',
  DEVICE_LOCK = 'locked',
  IDLE_LOCK = 'idle',
}

export interface Autolock {
  type: AutoLockType;
  mn: number;
}
