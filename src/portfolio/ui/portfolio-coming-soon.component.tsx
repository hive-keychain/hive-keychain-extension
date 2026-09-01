import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { I18nUtils } from 'src/utils/i18n.utils';

import './portfolio-coming-soon.component.scss';

export interface PortfolioComingSoonAction {
  label: string;
  onClick: () => void;
}

interface Props {
  title: string;
  description: string;
  icon: SVGIcons;
  hint?: string;
  eta?: string;
  action?: PortfolioComingSoonAction;
}

export const PortfolioComingSoon = ({
  title,
  description,
  icon,
  hint,
  eta,
  action,
}: Props) => {
  const expectedLabel = eta
    ? I18nUtils.getMessage('portfolio_coming_soon_expected', [eta])
    : null;

  return (
    <div className="portfolio-coming-soon" data-testid="portfolio-coming-soon">
      <div className="portfolio-coming-soon__icon" aria-hidden="true">
        <SVGIcon icon={icon} />
      </div>
      <h2 className="portfolio-coming-soon__title">{title}</h2>
      <span className="portfolio-coming-soon__status">
        {I18nUtils.getMessage('coming_soon_panel_title')}
      </span>
      <p className="portfolio-coming-soon__description">{description}</p>
      {hint ? (
        <p className="portfolio-coming-soon__hint">{hint}</p>
      ) : null}
      {expectedLabel ? (
        <p className="portfolio-coming-soon__eta">{expectedLabel}</p>
      ) : null}
      {action ? (
        <ButtonComponent
          label={action.label}
          skipLabelTranslation
          type={ButtonType.IMPORTANT}
          additionalClass="portfolio-coming-soon__action"
          onClick={action.onClick}
        />
      ) : null}
    </div>
  );
};
