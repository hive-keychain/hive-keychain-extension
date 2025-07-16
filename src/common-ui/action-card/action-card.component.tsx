import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  key: string;
  title: string;
  subtitle: string;
  icon: SVGIcons;
  onClickIcon: () => void;
};
export const ActionCardComponent = ({
  key,
  title,
  subtitle,
  icon,
  onClickIcon,
}: Props) => {
  return (
    <div data-testid={'operation-item'} className="operation" key={key}>
      <div className="left-panel">
        <div className="title">{title}</div>
        <div className="subtitle">{subtitle}</div>
      </div>
      <SVGIcon
        dataTestId={`icon-action-${title}-${subtitle}`}
        onClick={onClickIcon}
        icon={icon}
        className="operation-action"></SVGIcon>
    </div>
  );
};
