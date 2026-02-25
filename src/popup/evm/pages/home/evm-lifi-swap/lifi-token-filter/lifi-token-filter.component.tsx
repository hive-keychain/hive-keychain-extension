import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import React, { useEffect, useRef, useState } from 'react';

interface Props<T> {
  options: T[];
  selectedItem: T;
  setSelectedItem: (item: T) => void;
  onQueryChanged: (query: string) => void;
}

export const LiFiTokenFilter = <T extends OptionItem>({
  options,
  selectedItem,
  setSelectedItem,
  onQueryChanged,
}: Props<T>) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onQueryChanged(query);
  }, [query]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  return (
    <div className="lifi-token-filter">
      <ComplexeCustomSelect
        options={options}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      <InputComponent
        type={InputType.TEXT}
        value={query}
        onChange={setQuery}
        ref={inputRef}
      />
    </div>
  );
};
