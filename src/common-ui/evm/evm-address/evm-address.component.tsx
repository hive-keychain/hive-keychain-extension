import {
  EvmAddressDetail,
  EvmAddressesUtils,
} from '@popup/evm/utils/evm-addresses.utils';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

interface Props {
  address: string;
  chainId: string;
  canCopy?: boolean;
  prefix?: React.ReactNode;
  forceFormattedAddress?: boolean;
}

export const EvmAddressComponent = ({
  address,
  chainId,
  canCopy,
  prefix,
  forceFormattedAddress,
}: Props) => {
  const [addressDetail, setAddressDetail] = useState<EvmAddressDetail>();

  useEffect(() => {
    initComponent();
  }, [address, chainId]);

  const initComponent = async () => {
    const details = await EvmAddressesUtils.getAddressDetails(address, chainId);
    setAddressDetail(details);
  };

  const handleCopyAddress = () => {
    if (canCopy) {
      void copyTextWithToast(address, COPY_GENERIC_MESSAGE_KEY);
    }
  };

  const renderAddressContent = () => {
    if (!addressDetail) return null;
    const resolvedAddress = forceFormattedAddress
      ? addressDetail.formattedAddress
      : addressDetail.label ?? addressDetail.formattedAddress;
    const visibleAddress =
      resolvedAddress.trim().toLowerCase() ===
      addressDetail.fullAddress.trim().toLowerCase()
        ? addressDetail.formattedAddress
        : resolvedAddress;
    const shouldShowAddressTooltip =
      visibleAddress.trim().toLowerCase() !==
      addressDetail.fullAddress.trim().toLowerCase();
    const content = (
      <span
        className={`value-content evm-address-content ${
          canCopy ? 'address-content' : ''
        }`}
        onClick={handleCopyAddress}>
        {visibleAddress}
      </span>
    );

    if (!shouldShowAddressTooltip) return content;

    return (
      <CustomTooltip
        message={addressDetail.fullAddress}
        skipTranslation
        additionalClassName="evm-address-tooltip">
        {content}
      </CustomTooltip>
    );
  };

  return (
    <>
      {addressDetail && (
        <div className="value-content-horizontal">
          {prefix ?? (
            <EvmAccountImage
              address={addressDetail.fullAddress}
              avatar={addressDetail.avatar}
              small
            />
          )}
          {renderAddressContent()}
        </div>
      )}
    </>
  );
};
