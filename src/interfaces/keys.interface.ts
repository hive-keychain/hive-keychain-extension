export type Key = string | null;

export interface Keys {
  memo?: Key;
  memoPubkey?: Key;
  posting?: Key;
  postingPubkey?: Key;
  active?: Key;
  activePubkey?: Key;
}
