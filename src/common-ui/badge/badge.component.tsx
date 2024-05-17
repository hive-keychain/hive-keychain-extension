import React from 'react';

export enum BadgeType {
  EXPERIMENTAL = 'experimental',
  TESTNET = 'testnet',
}
type Props = {
  label: string;
  badgeType: BadgeType;
};
export const Badge = ({ label, badgeType }: Props) => {
  return (
    <div className={`badge ${badgeType}`}>{chrome.i18n.getMessage(label)}</div>
  );
};
