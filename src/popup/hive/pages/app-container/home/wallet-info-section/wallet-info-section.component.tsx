import { Asset } from '@hiveio/dhive';
import { Conversion } from '@interfaces/conversion.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import {
  loadTokens,
  loadTokensMarket,
  loadUserTokens,
} from '@popup/hive/actions/token.actions';
import { WalletInfoSectionItemComponent } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item.component';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { fetchConversionRequests } from 'src/popup/hive/actions/conversion.actions';
import { RootState } from 'src/popup/hive/store';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './wallet-info-section.component.scss';

const WalletInfoSection = ({
  activeAccount,
  currencyLabels,
  globalProperties,
  conversions,
  userTokens,
  market,
  allTokens,
  fetchConversionRequests,
  loadTokensMarket,
  loadUserTokens,
  loadTokens,
}: PropsFromRedux) => {
  const [delegationAmount, setDelegationAmount] = useState<string | number>(
    '...',
  );

  // const [hiveRowInfoContent, setHiveRowInfoContent] = useState<
  //   string | undefined
  // >(undefined);
  // const [hbdRowInfoContent, setHbdRowInfoContent] = useState<
  //   string | undefined
  // >(undefined);

  const [filteredTokenList, setFilteredTokenList] = useState<TokenBalance[]>();
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);
  const loadHiddenTokens = async () => {
    setHiddenTokens(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      )) ?? [],
    );
  };

  useEffect(() => {
    if (activeAccount && !ActiveAccountUtils.isEmpty(activeAccount)) {
      loadHiddenTokens();
      loadTokens();
      loadTokensMarket();
      loadUserTokens(activeAccount.name!);
      fetchConversionRequests(activeAccount.name!);

      const delegatedVestingShares = parseFloat(
        activeAccount.account.delegated_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const receivedVestingShares = parseFloat(
        activeAccount.account.received_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const delegationVestingShares = (
        receivedVestingShares - delegatedVestingShares
      ).toFixed(3);

      const delegation = FormatUtils.toHP(
        delegationVestingShares,
        globalProperties.globals,
      );
      setDelegationAmount(delegation);
    }
  }, [activeAccount]);

  useEffect(() => {
    if (userTokens.loading) {
      // addToLoadingList('html_popup_loading_tokens_operation');
    } else if (userTokens.list && market.length) {
      // removeFromLoadingList('html_popup_loading_tokens_operation');
      const orderedFiltered = userTokens.list
        .filter((token) => !hiddenTokens.includes(token.symbol))
        .sort(
          (a, b) =>
            TokensUtils.getHiveEngineTokenValue(b, market) -
            TokensUtils.getHiveEngineTokenValue(a, market),
        );
      setFilteredTokenList(orderedFiltered);
    }
  }, [userTokens, market]);

  useEffect(() => {
    const pendingHbdConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HBD';
    });
    if (pendingHbdConversions.length > 0) {
      // setHbdRowInfoContent(
      //   chrome.i18n.getMessage('popup_html_pending_conversions', [
      //     pendingHbdConversions.length.toString(),
      //     'HIVE',
      //   ]),
      // );
    }

    const pendingHiveConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HIVE';
    });

    if (pendingHiveConversions.length > 0) {
      // setHiveRowInfoContent(
      //   chrome.i18n.getMessage('popup_html_pending_conversions', [
      //     pendingHiveConversions.length.toString(),
      //     'HIVE',
      //   ]),
      // );
    }
  }, [conversions]);

  return (
    <div className="wallet-info-section">
      <WalletInfoSectionItemComponent
        tokenSymbol="HIVE"
        icon={NewIcons.HIVE}
        iconColor="red"
        mainValue={activeAccount.account.balance}
        mainValueLabel={currencyLabels.hive}
        subValue={activeAccount.account.savings_balance}
        subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
      />

      <WalletInfoSectionItemComponent
        tokenSymbol="HBD"
        icon={NewIcons.HBD}
        iconColor="green"
        mainValue={activeAccount.account.hbd_balance}
        mainValueLabel={currencyLabels.hbd}
        subValue={activeAccount.account.savings_hbd_balance}
        subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
      />
      <WalletInfoSectionItemComponent
        tokenSymbol="HP"
        icon={NewIcons.HIVE}
        iconColor="red"
        mainValue={FormatUtils.toHP(
          activeAccount.account.vesting_shares as string,
          globalProperties.globals,
        )}
        mainValueLabel={currencyLabels.hp}
        subValue={delegationAmount}
        subValueLabel={
          chrome.i18n.getMessage('popup_html_delegations').length <= 5
            ? chrome.i18n.getMessage('popup_html_delegations')
            : chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) + '.'
        }
      />
      {allTokens?.length > 0 &&
        filteredTokenList &&
        filteredTokenList.length > 0 && (
          <>
            <Separator type={'horizontal'} />
            {filteredTokenList.map((token) => (
              <WalletInfoSectionItemComponent
                key={`token-${token.symbol}`}
                tokenSymbol={token.symbol}
                tokenBalance={token}
                tokenInfo={allTokens.find((t) => t.symbol === token.symbol)}
                tokenMarket={market}
                icon={NewIcons.HIVE_ENGINE}
                mainValue={token.balance}
                mainValueLabel={token.symbol}
              />
            ))}
          </>
        )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    globalProperties: state.globalProperties,
    delegations: state.delegations,
    conversions: state.conversions,
    userTokens: state.userTokens,
    market: state.tokenMarket,
    allTokens: state.tokens,
  };
};

const connector = connect(mapStateToProps, {
  fetchConversionRequests,
  loadTokensMarket,
  loadUserTokens,
  loadTokens,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionComponent = connector(WalletInfoSection);
