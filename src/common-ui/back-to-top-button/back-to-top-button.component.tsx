import { Icons } from '@popup/icons.enum';
import React from 'react';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import './back-to-top-button.component.scss';

export const BackToTopButton = () => {
  return (
    <div className="back-to-top">
      <Icon type={IconType.OUTLINED} name={Icons.ARROW_UPWARDS} />
    </div>
  );
};
