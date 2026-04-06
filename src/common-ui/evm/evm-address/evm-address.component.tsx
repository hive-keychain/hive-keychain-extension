import {
  EvmAddressDetail,
  EvmAddressesUtils,
} from '@popup/evm/utils/evm-addresses.utils';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';

interface Props {
  address: string;
  chainId: string;
  canCopy?: boolean;
}

export const EvmAddressComponent = ({ address, chainId, canCopy }: Props) => {
  const [addressDetail, setAddressDetail] = useState<EvmAddressDetail>();

  useEffect(() => {
    initComponent();
  }, []);

  const initComponent = async () => {
    const details = await EvmAddressesUtils.getAddressDetails(address, chainId);
    setAddressDetail(details);
  };

  const handleCopyAddress = () => {
    if (canCopy) {
      navigator.clipboard.writeText(address);
    }
  };

  return (
    <>
      {addressDetail && (
        <div className="value-content-horizontal">
          <EvmAccountImage
            address={addressDetail.fullAddress}
            avatar={addressDetail.avatar}
            small
          />
          <CustomTooltip message={addressDetail.fullAddress} skipTranslation>
            <span
              className={`value-content ${canCopy ? 'address-content' : ''}`}
              onClick={handleCopyAddress}>
              {addressDetail.label ?? addressDetail.formattedAddress}
            </span>
          </CustomTooltip>
        </div>
      )}
    </>
  );
};
