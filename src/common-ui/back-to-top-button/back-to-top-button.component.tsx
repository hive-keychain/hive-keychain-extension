import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { I18nUtils } from 'src/utils/i18n.utils';

interface BackToTopButtonProps {
  element: React.RefObject<HTMLElement>;
}

export const BackToTopButton = (props: BackToTopButtonProps) => {
  const scrollToTop = () => {
    if (props.element && props.element.current) {
      props.element.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      className="back-to-top"
      aria-label={I18nUtils.getMessage('accessibility_back_to_top')}
      onClick={scrollToTop}>
      <SVGIcon icon={SVGIcons.WALLET_HISTORY_TOP} />
    </button>
  );
};
