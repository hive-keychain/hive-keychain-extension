import { SwapCryptosCurrencyInfo } from '@interfaces/swap-cryptos.interface';
import { RootState } from '@popup/multichain/store';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import Logger from 'src/utils/logger.utils';

const SwapCryptos = ({ price }: PropsFromRedux) => {
  const [currencies, setCurrencies] = useState<SwapCryptosCurrencyInfo[]>([]);
  const [amount, setAmount] = useState('');
  const [fromCrypto, setFromCrypto] =
    useState<OptionItem<SwapCryptosCurrencyInfo>>();
  const [toCrypto, setToCrypto] =
    useState<OptionItem<SwapCryptosCurrencyInfo>>();
  useEffect(() => {
    testInit();
  }, []);

  //TODO important
  //    - use swap as example.
  //        -> create from, to lists.
  //    - get estimate after amount is set.
  //    - after getting that working, implement in classes.
  const testInit = async () => {
    try {
      const baseUrl = Config.swapCryptos.stealthex.baseUrl;
      let headers: { [key: string]: string } = {};
      headers[`${Config.swapCryptos.stealthex.headerKey}`] =
        Config.swapCryptos.stealthex.apiKey;
      const hiveAvailablePairList = await axios.get(baseUrl + 'pairs/HIVE', {
        headers,
      });
      console.log({ hiveAvailablePairList }); //TODO remove line
      //Fetch info of only 10 while testing
      //TODo bellow create interface of currencyInfo
      let currencyOptions: SwapCryptosCurrencyInfo[] = [];
      const tempHivePairsList = (hiveAvailablePairList.data as string[]).slice(
        0,
        10,
      );
      for (const pairedSymbol of tempHivePairsList) {
        const { data } = await axios.get(baseUrl + `currency/${pairedSymbol}`, {
          headers,
        });
        if (data) {
          const { symbol, image, name, network } = data;
          currencyOptions.push({
            symbol,
            iconUrl: image,
            name,
            network,
          });
        }
      }
      setCurrencies(currencyOptions);
      console.log({ currencyOptions }); //TODO remove line
      setFromCrypto({
        value: currencyOptions[0],
        label: currencyOptions[0].name,
        subLabel: currencyOptions[0].symbol,
        img: currencyOptions[0].iconUrl,
      });
    } catch (error) {
      Logger.log({ error });
    }
  };

  return (
    <div className="swap-cryptos">
      {currencies.length !== 0 && fromCrypto ? (
        <FormContainer>
          <div className="form-fields">
            <div className="fiat-token">
              <div className="inputs">
                <ComplexeCustomSelect
                  //@ts-ignore
                  selectedItem={fromCrypto}
                  options={currencies.map((e) => ({
                    label: e.name,
                    value: e,
                    img: e.iconUrl,
                    subLabel: e.symbol,
                  }))}
                  setSelectedItem={setFromCrypto}
                  label="crypto"
                  filterable
                />
                <InputComponent
                  type={InputType.NUMBER}
                  value={amount}
                  onChange={setAmount}
                  label="popup_html_transfer_amount"
                  placeholder="popup_html_transfer_amount"
                  min={0}
                />
              </div>
            </div>
            <SVGIcon icon={SVGIcons.SWAPS_SWITCH} className="swap-icon" />
            <div className="end-token">
              <div className="inputs">
                <ComplexeCustomSelect
                  selectedItem={{
                    label: 'HIVE',
                    value: 'HIVE',
                    img: `/assets/images/wallet/hive-logo.svg`,
                  }}
                  options={[
                    {
                      label: 'HIVE',
                      value: 'HIVE',
                      img: `/assets/images/wallet/hive-logo.svg`,
                    },
                  ]}
                  setSelectedItem={() => {}}
                  label="token"
                />
              </div>
            </div>
            {/* <div className="estimations">
              <div className="quote-label-wrapper">
                {estimations.length !== 0 && (
                  <span className="quote-label">
                    {chrome.i18n.getMessage('quotes')}
                  </span>
                )}
                {!!countdown && (
                  <span className="countdown">
                    {chrome.i18n.getMessage('swap_autorefresh', countdown + '')}
                  </span>
                )}
              </div>
              <div className="quotes">
                {estimations.map((estimation) => {
                  const key =
                    estimation.name +
                    estimation.paymentMethod.method +
                    estimation.fiat +
                    estimation.amount +
                    estimation.crypto;
                  return (
                    <div
                      className="quote"
                      key={key}
                      onClick={() => {
                        window.open(estimation.link, '__blank');
                      }}>
                      <SVGIcon icon={estimation.logo} />
                      <span className="method">
                        <SVGIcon
                          key={key}
                          icon={estimation.paymentMethod.icon}
                          skipTooltipTranslation
                          tooltipPosition="bottom"
                          tooltipDelayShow={1000}
                          tooltipMessage={estimation.paymentMethod.title}
                        />
                      </span>
                      <div className="receive">
                        <span>{estimation.estimation}</span>
                        <span className="amount">
                          {CurrencyPricesUtils.getTokenUSDPrice(
                            estimation.estimation + '',
                            'HIVE',
                            price,
                            [],
                          )}
                        </span>
                      </div>
                      <span className="chevron">
                        <SVGIcon icon={SVGIcons.SELECT_ARROW_RIGHT} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div> */}
          </div>
        </FormContainer>
      ) : (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    price: state.hive.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SwapCryptosComponent = connector(SwapCryptos);
