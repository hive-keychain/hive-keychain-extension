import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';

interface Props {
  address: string;
  chainId: string;
}

export const EvmAddressComponent = ({ address, chainId }: Props) => {
  const [avatar, setAvatar] = useState<string | undefined | null>();
  const [label, setLabel] = useState<string | undefined | null>();
  const [formattedAddress, setFormattedAddress] = useState<
    string | undefined
  >();
  const [fullAddress, setFullAddress] = useState<string>(address);

  useEffect(() => {
    initComponent();
  }, []);

  const initComponent = async () => {
    const isAddress = ethers.isAddress(address);

    if (isAddress === false) {
      const resolveData = await EvmRequestsUtils.getResolveData(address);

      const foundAddress = resolveData?.address;
      setAvatar(resolveData?.avatar);
      setLabel(address);
      if (foundAddress) {
        setFullAddress(foundAddress);
      }
    } else {
      const ensFound = await EvmRequestsUtils.lookupEns(address);
      if (ensFound) {
        const resolveData = await EvmRequestsUtils.getResolveData(address);

        const foundAddress = resolveData?.address;
        setAvatar(resolveData?.avatar);
        setLabel(address);
        if (foundAddress) {
          setFullAddress(foundAddress);
        }
      } else {
        let label = await EvmAddressesUtils.getAddressLabel(address, chainId);

        if (!label || label.length === 0)
          label = EvmFormatUtils.formatAddress(address);

        setLabel(label);
        setFormattedAddress(label);
      }
    }
  };

  return (
    <div className="value-content-horizontal">
      <EvmAccountImage address={fullAddress} avatar={avatar} />
      <CustomTooltip message={fullAddress} skipTranslation>
        <span>{label ?? formattedAddress}</span>
      </CustomTooltip>
    </div>
  );
};
