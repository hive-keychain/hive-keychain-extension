import React, { useEffect, useState } from 'react';
import { EvmNftMedia } from 'src/common-ui/evm/nft-media/nft-media.component';

interface SmallImageCardProps {
  name?: string;
  value?: string | Promise<string | undefined>;
  valueOnClickAction?: (...params: any[]) => any;
  extraInfo?: string;
  extraInfoAdditionalClass?: string;
}

export const SmallImageCardComponent = ({
  name,
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

  return (
    <div className="small-data-card image">
      <div
        className={`value ${valueOnClickAction ? 'clickable' : ''}`}
        onClick={handleOnValueClick}>
        <EvmNftMedia className="image" src={image} />
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
