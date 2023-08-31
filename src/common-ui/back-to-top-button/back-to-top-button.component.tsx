import React from 'react';
import { NewIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import './back-to-top-button.component.scss';

interface BackToTopButtonProps {
  element: any;
}

export const BackToTopButton = (props: BackToTopButtonProps) => {
  const scrollToTop = () => {
    if (props.element && props.element.current) {
      props.element.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="back-to-top" onClick={scrollToTop}>
      <SVGIcon icon={NewIcons.WALLET_HISTORY_TOP} />
    </div>
  );
};
