import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import React, { useEffect, useState } from 'react';
import { ColorsUtils } from 'src/utils/colors.utils';

interface TokenLogoProps {
  tokenInfo: Pick<EvmSmartContractInfo, 'logo' | 'name' | 'symbol'>;
  className?: string;
}

export const EvmTokenLogo = ({ tokenInfo, className }: TokenLogoProps) => {
  const [color, setColor] = useState<string>();
  const [logoFailed, setLogoFailed] = useState(false);
  const logo = tokenInfo.logo?.trim();
  const displayName = tokenInfo.name || tokenInfo.symbol || '?';
  const displaySymbol = tokenInfo.symbol || tokenInfo.name || '?';
  const tokenLogoClassName = className ?? 'currency-icon';

  useEffect(() => {
    setColor(ColorsUtils.stringToColor(displayName));
  }, [displayName]);

  useEffect(() => {
    setLogoFailed(false);
  }, [logo]);

  return (
    <>
      {color !== undefined && logo && !logoFailed && (
        <img
          src={logo}
          className={tokenLogoClassName}
          alt=""
          onError={() => setLogoFailed(true)}
        />
      )}
      {color !== undefined && (!logo || logoFailed) && (
        <div
          className={`${tokenLogoClassName} add-background`}
          style={{
            backgroundColor: `${color}2b`,
            color: `${color}`,
          }}>
          {displaySymbol.slice(0, 2).toUpperCase()}
        </div>
      )}
    </>
  );
};
