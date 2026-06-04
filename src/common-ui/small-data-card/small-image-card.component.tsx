import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmNftMedia } from 'src/common-ui/evm/nft-media/nft-media.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

interface SmallImageCardProps {
  name?: string;
  contractAddress?: string;
  value?: string | Promise<string | undefined>;
  valueOnClickAction?: (...params: any[]) => any;
  extraInfo?: string;
  extraInfoAdditionalClass?: string;
}

export const SmallImageCardComponent = ({
  name,
  contractAddress,
  value,
  valueOnClickAction,
  extraInfo,
  extraInfoAdditionalClass,
}: SmallImageCardProps) => {
  const [image, setImage] = useState<string>();

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (typeof value === 'string') {
        setImage(value);
      } else if (value) {
        const resolvedImage = await value;
        if (isMounted) {
          setImage(resolvedImage);
        }
      } else {
        setImage(undefined);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [value]);

  const handleOnValueClick = () => {
    if (valueOnClickAction) {
      valueOnClickAction();
    }
  };

  const handleImageClick = (event: React.MouseEvent) => {
    if (contractAddress) {
      event.stopPropagation();
      void copyTextWithToast(contractAddress, COPY_GENERIC_MESSAGE_KEY);
      return;
    }
    handleOnValueClick();
  };

  const imageMedia = <EvmNftMedia className="image" src={image} />;

  return (
    <div className="small-data-card image">
      <div
        className={`value ${contractAddress ? 'address-content' : ''} ${
          valueOnClickAction && !contractAddress ? 'clickable' : ''
        }`}
        onClick={handleImageClick}>
        {contractAddress ? (
          <CustomTooltip
            message={contractAddress}
            skipTranslation
            additionalClassName="evm-address-tooltip">
            {imageMedia}
          </CustomTooltip>
        ) : (
          imageMedia
        )}
      </div>
      {name && <div className="label">{name}</div>}
      {extraInfo && (
        <div className={`extra-info ${extraInfoAdditionalClass ?? ''}`}>
          {extraInfo}
        </div>
      )}
    </div>
  );
};
