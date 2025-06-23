import React, { useEffect, useState } from 'react';

interface SmallImageCardProps {
  name?: string;
  value: string | Promise<string>;
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
    init();
  }, []);

  const init = async () => {
    if (typeof value === 'string') {
      setImage(value);
    } else if (typeof value === 'object') {
      setImage(await value);
    }
  };

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
        {image && <img className="image" src={image} />}
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
