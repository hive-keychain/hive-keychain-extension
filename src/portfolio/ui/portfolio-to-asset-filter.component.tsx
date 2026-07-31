import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PortfolioAssetChainFilterOption } from 'src/portfolio/portfolio-flow.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

import './portfolio-to-asset-filter.component.scss';

const QUICK_NETWORK_CHIP_COUNT = 8;

type Props = {
  textFilter: string;
  onTextFilterChange: (value: string) => void;
  chainFilter: string;
  onChainFilterChange: (value: string) => void;
  chainOptions: PortfolioAssetChainFilterOption[];
  networkSelectOptions: OptionItem[];
  selectedNetworkOption: OptionItem;
};

const stopPanelEvent = (event: React.MouseEvent) => {
  event.stopPropagation();
};

export const PortfolioToAssetFilter = ({
  textFilter,
  onTextFilterChange,
  chainFilter,
  onChainFilterChange,
  chainOptions,
  networkSelectOptions,
  selectedNetworkOption,
}: Props) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showMoreNetworks, setShowMoreNetworks] = useState(false);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const quickNetworkOptions = useMemo(
    () => chainOptions.slice(0, QUICK_NETWORK_CHIP_COUNT),
    [chainOptions],
  );

  const hasMoreNetworks = chainOptions.length > QUICK_NETWORK_CHIP_COUNT;
  const selectedQuickNetwork = chainOptions.find(
    (option) => option.value === chainFilter,
  );
  const isSelectedInQuickChips =
    !chainFilter ||
    quickNetworkOptions.some((option) => option.value === chainFilter);

  const handleChainFilterChange = (value: string) => {
    onChainFilterChange(value);
    setShowMoreNetworks(false);
  };

  return (
    <div
      className="portfolio-to-asset-filter"
      onMouseDown={stopPanelEvent}
      onClick={stopPanelEvent}>
      <div className="portfolio-to-asset-filter__search">
        <SVGIcon
          icon={SVGIcons.WALLET_SEARCH}
          className="portfolio-to-asset-filter__search-icon"
        />
        <input
          ref={searchInputRef}
          id="portfolio-to-asset-filter"
          type="text"
          placeholder={I18nUtils.getMessage('portfolio_to_asset_search')}
          aria-label={I18nUtils.getMessage('portfolio_to_asset_search')}
          value={textFilter}
          onChange={(event) => onTextFilterChange(event.target.value)}
        />
        {textFilter ? (
          <button
            type="button"
            className="portfolio-to-asset-filter__clear"
            aria-label={I18nUtils.getMessage('popup_html_clear')}
            onClick={() => onTextFilterChange('')}>
            <SVGIcon icon={SVGIcons.INPUT_CLEAR} />
          </button>
        ) : null}
      </div>

      {chainOptions.length > 0 ? (
        <div
          className="portfolio-to-asset-filter__chips"
          role="group"
          aria-label={I18nUtils.getMessage('portfolio_network')}>
          <button
            type="button"
            className={[
              'portfolio-to-asset-filter__chip',
              !chainFilter ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleChainFilterChange('')}>
            {I18nUtils.getMessage('portfolio_all_networks_short')}
          </button>

          {quickNetworkOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              title={option.label}
              aria-label={`${option.chipLabel} (${option.label})`}
              className={[
                'portfolio-to-asset-filter__chip',
                chainFilter === option.value ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleChainFilterChange(option.value)}>
              {option.img ? (
                <img
                  src={option.img}
                  alt=""
                  className="portfolio-to-asset-filter__chip-logo"
                />
              ) : null}
              <span className="portfolio-to-asset-filter__chip-label">
                {option.chipLabel}
              </span>
            </button>
          ))}

          {!isSelectedInQuickChips && selectedQuickNetwork ? (
            <button
              type="button"
              title={selectedQuickNetwork.label}
              aria-label={`${selectedQuickNetwork.chipLabel} (${selectedQuickNetwork.label})`}
              className="portfolio-to-asset-filter__chip is-active"
              onClick={() => handleChainFilterChange(selectedQuickNetwork.value)}>
              {selectedQuickNetwork.img ? (
                <img
                  src={selectedQuickNetwork.img}
                  alt=""
                  className="portfolio-to-asset-filter__chip-logo"
                />
              ) : null}
              <span className="portfolio-to-asset-filter__chip-label">
                {selectedQuickNetwork.chipLabel}
              </span>
            </button>
          ) : null}

          {hasMoreNetworks ? (
            <button
              type="button"
              className={[
                'portfolio-to-asset-filter__chip',
                'portfolio-to-asset-filter__chip--more',
                showMoreNetworks ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setShowMoreNetworks((current) => !current)}>
              {I18nUtils.getMessage('portfolio_more_networks')}
            </button>
          ) : null}
        </div>
      ) : null}

      {showMoreNetworks && hasMoreNetworks ? (
        <div className="portfolio-to-asset-filter__more-networks">
          <ComplexeCustomSelect
            options={networkSelectOptions}
            selectedItem={selectedNetworkOption}
            setSelectedItem={(item) => handleChainFilterChange(item.value)}
            filterable
            generateImageIfNull
            skipImageGenerationForFirstItem
            showOverlay
            ariaLabel={I18nUtils.getMessage('portfolio_network')}
          />
        </div>
      ) : null}
    </div>
  );
};
