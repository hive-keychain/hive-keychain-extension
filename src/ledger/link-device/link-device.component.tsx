import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
interface LinkLedgerDeviceProps {
  embedded?: boolean;
  onClose?: () => void;
  onLinked?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

const LinkLedgerDevice = ({
  embedded = false,
  onClose,
  onLinked,
  onLoadingChange,
}: LinkLedgerDeviceProps) => {
  const [done, setDone] = useState(false);

  const [theme, setTheme] = useState<Theme>();
  useEffect(() => {
    if (!embedded) {
      init();
    }
  }, [embedded]);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  const linkDevice = async () => {
    onLoadingChange?.(true);
    try {
      const linked = await LedgerUtils.init(true);
      setDone(linked);
      if (linked) {
        onLinked?.();
      }
    } finally {
      onLoadingChange?.(false);
    }
  };

  const closeTab = () => {
    if (onClose) {
      onClose();
      return;
    }
    window.close();
  };

  return (
    <div
      className={`${embedded ? 'embedded-ledger-page ' : `theme ${theme} `}link-ledger-device`}>
      {!embedded && (
        <div className="title-panel">
          <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
          <div className="title">
            {I18nUtils.getMessage('ledger_link_device')}
          </div>
        </div>
      )}

      <div className="link-device">
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: HtmlUtils.getSafeI18nHtml('ledger_link_device_caption'),
          }}></div>
        {done && (
          <div className="confirmation">
            {I18nUtils.getMessage('ledger_link_device_linked')}
          </div>
        )}
        <div className="fill-space"></div>

        <ButtonComponent
          label={done ? 'popup_html_close' : 'ledger_link_device'}
          onClick={done ? closeTab : linkDevice}
          height="small"
          type={ButtonType.IMPORTANT}
        />
      </div>
      {/* <LoadingComponent hide={!loading} /> */}
    </div>
  );
};

export default LinkLedgerDevice;
