import React from 'react';
import Icon from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
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
      <Icon name={Icons.ARROW_UPWARDS} />
    </div>
  );
};
