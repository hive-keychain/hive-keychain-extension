import {
  EvmAddressDetail,
  EvmAddressesUtils,
} from '@popup/evm/utils/addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';

interface Props {
  address: string;
  chainId: string;
}

export const EvmAddressComponent = ({ address, chainId }: Props) => {
  const [addressDetail, setAddressDetail] = useState<EvmAddressDetail>({
    formattedAddress: EvmFormatUtils.formatAddress(address),
    fullAddress: address,
  });

  useEffect(() => {
    initComponent();
  }, []);

  const initComponent = async () => {
    // await sleep(5000);
    setAddressDetail(
      await EvmAddressesUtils.getAddressDetails(address, chainId),
    );
  };

  return (
    <>
      {addressDetail && (
        <div className="value-content-horizontal">
          <EvmAccountImage
            address={addressDetail.fullAddress}
            avatar={addressDetail.avatar}
          />
          <CustomTooltip message={addressDetail.fullAddress} skipTranslation>
            <span>{addressDetail.label ?? addressDetail.formattedAddress}</span>
          </CustomTooltip>
        </div>
      )}
    </>
  );
};
