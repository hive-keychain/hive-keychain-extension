import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

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
      <SVGIcon icon={SVGIcons.WALLET_HISTORY_TOP} />
    </div>
  );
};
