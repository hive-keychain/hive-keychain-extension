import React from 'react';
import { Controller, FieldValues } from 'react-hook-form';
import { InputProps } from 'src/common-ui/input/input.component';
import { TextAreaComponent } from 'src/common-ui/text-area/textarea.component';

interface FormTextAreaProps<T extends FieldValues = FieldValues, TContext = any>
  extends Omit<InputProps, 'onChange' | 'value'> {
  name: string;
  control: any;
  customOnChange?: (...params: any) => void;
}

export const FormInputComponent = (props: FormTextAreaProps) => (
  <Controller
    name={props.name}
    control={props.control}
    render={({ field: { onChange, value }, fieldState: { error } }) => {
      return (
        <TextAreaComponent
          {...props}
          value={value}
          onChange={props.customOnChange ?? onChange}
          error={error}
        />
      );
    }}
  />
);
