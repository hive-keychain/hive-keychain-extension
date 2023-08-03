import React from 'react';
import { Controller, FieldValues } from 'react-hook-form';
import InputComponent, {
  InputProps,
} from 'src/common-ui/input/input.component';

interface FormInputProps<T extends FieldValues = FieldValues, TContext = any>
  extends Omit<InputProps, 'onChange' | 'value'> {
  name: string;
  control: any;
}

export const FormInputComponent = (props: FormInputProps) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { onChange, value }, fieldState: { error } }) => {
      return (
        <InputComponent
          {...props}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    }}
  />
);
