import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import React, { useEffect, useState } from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { ColorsUtils } from 'src/utils/colors.utils';

interface TokenLogoProps {
  tokenInfo: EvmSmartContractInfo;
}

export const EvmTokenLogo = ({ tokenInfo }: TokenLogoProps) => {
  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(ColorsUtils.stringToColor(tokenInfo.name));
  }, []);

  return (
    <>
      {color !== undefined && tokenInfo.logo && (
        <PreloadedImage
          src={tokenInfo?.logo}
          className="currency-icon"
          addBackground
        />
      )}
      {color !== undefined && !tokenInfo.logo && (
        <div
          className="currency-icon add-background"
          style={{
            backgroundColor: `${color}2b`,
            color: `${color}`,
          }}>
          {tokenInfo.symbol
            ? tokenInfo.symbol.slice(0, 2)
            : tokenInfo.name.slice(0, 2)}
        </div>
      )}
    </>
  );
};
