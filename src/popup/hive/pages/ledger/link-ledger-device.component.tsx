import { Screen } from '@interfaces/screen.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import LinkLedgerDevice from 'src/ledger/link-device/link-device.component';

const LinkLedgerDevicePage = ({
  setTitleContainerProperties,
  navigateTo,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const loadingOperation = 'ledger_link_device';

  useEffect(() => {
    setTitleContainerProperties({
      title: 'ledger_link_device',
      isBackButtonEnabled: true,
      onBackAdditional: () => {
        navigateTo(HiveScreen.SETTINGS_ADVANCED, true);
      },
    });
    return () => {
      removeFromLoadingList(loadingOperation);
    };
  }, []);

  const handleLinkSuccess = () => {
    setSuccessMessage('ledger_link_device_linked');
    navigateTo(HiveScreen.SETTINGS_ADVANCED, true);
  };

  const handleClose = () => {
    navigateTo(HiveScreen.SETTINGS_ADVANCED, true);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    if (isLoading) {
      addToLoadingList(loadingOperation);
    } else {
      removeFromLoadingList(loadingOperation);
    }
  };

  return (
    <div
      className="ledger-page"
      data-testid={`${Screen.SETTINGS_LINK_LEDGER_DEVICE}-page`}>
      <LinkLedgerDevice
        embedded
        onClose={handleClose}
        onLinked={handleLinkSuccess}
        onLoadingChange={handleLoadingChange}
      />
    </div>
  );
};

const connector = connect(null, {
  setTitleContainerProperties,
  navigateTo,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const LinkLedgerDeviceComponent = connector(LinkLedgerDevicePage);
