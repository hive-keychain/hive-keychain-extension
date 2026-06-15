import React from 'react';
import { PortfolioAccountDisplayUtils } from 'src/portfolio/ui/portfolio-account-display.utils';

import './portfolio-account-avatar.component.scss';

type PortfolioAccountAvatarProps =
  | { kind: 'hive'; username: string; className?: string }
  | {
      kind: 'evm';
      address: string;
      avatarUrl?: string | null;
      className?: string;
    };

export const PortfolioAccountAvatar = (props: PortfolioAccountAvatarProps) => {
  const className = ['portfolio-account-avatar', props.className]
    .filter(Boolean)
    .join(' ');
  const src =
    props.kind === 'hive'
      ? PortfolioAccountDisplayUtils.hiveProfileImageUrl(props.username)
      : props.avatarUrl ||
        PortfolioAccountDisplayUtils.evmGravatarAvatarUrl(props.address);

  return (
    <img
      className={className}
      src={src}
      alt=""
      width={32}
      height={32}
      decoding="async"
    />
  );
};
