import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  onClick: () => void;
}

export const AddContactButton = ({ onClick }: Props) => (
  <button type="button" className="add-contact-link" onClick={onClick}>
    <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE} className="add-icon" />
    {I18nUtils.getMessage('evm_addresses_add')}
  </button>
);
