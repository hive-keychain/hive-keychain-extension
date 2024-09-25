import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';

const EvmAccountsComponent = ({
  accounts,
  setTitleContainerProperties,
}: PropsType) => {
  const options = Array.from(
    new Set(
      accounts.map(
        (a) =>
          a.seedNickname ||
          `${chrome.i18n.getMessage('common_seed')} #${a.seedId}`,
      ),
    ),
  ).map((e) => ({ value: e, label: e }));
  const [selectedSeed, setSelectedSeed] = useState<OptionItem>(
    options[0] as OptionItem,
  );
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_accounts',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, []);
  return (
    <>
      <div className="seeds">
        <ComplexeCustomSelect
          options={options}
          selectedItem={selectedSeed}
          setSelectedItem={setSelectedSeed}
          label="common_seed"
        />
      </div>
      {accounts.map((account: EvmAccount) => (
        <div className="account-panel">
          <EvmAccountDisplayComponent
            account={
              {
                id: account.id,
                wallet: { address: account.wallet.address },
              } as EvmAccount
            }
            editable
            copiable
          />
        </div>
      ))}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
  };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});

type PropsType = ConnectedProps<typeof connector>;

export default connector(EvmAccountsComponent);
